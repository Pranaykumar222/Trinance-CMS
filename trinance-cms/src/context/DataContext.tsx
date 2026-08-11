import * as React from "react";
import type { Newsletter, Subscriber, Plan, User, AuditEntry } from "@/types";
import {
  newsletters as seedNewsletters,
  subscribers as seedSubscribers,
  plans as seedPlans,
  users as seedUsers,
  auditLog as seedAudit,
} from "@/data/seed";
import { delay, genId } from "@/lib/api";

const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";
interface DataContextValue {
  loading: boolean;
  newsletters: Newsletter[];
  subscribers: Subscriber[];
  plans: Plan[];
  users: User[];
  audit: AuditEntry[];
  getNewsletter: (id: string) => Newsletter | undefined;
  saveNewsletter: (n: Newsletter) => Promise<Newsletter>;
  createNewsletter: (n: Newsletter) => Promise<Newsletter>;
  deleteNewsletter: (id: string) => Promise<void>;
  duplicateNewsletter: (id: string) => Promise<Newsletter | undefined>;
  updateNewsletterStatus: (id: string, status: Newsletter["status"], scheduledFor?: string | null) => Promise<void>;
  updateSubscriber: (s: Subscriber) => Promise<void>;
  setSubscriberStatus: (id: string, status: Subscriber["status"]) => Promise<void>;
  deleteSubscriber: (id: string) => Promise<void>;
  updatePlan: (p: Plan) => Promise<void>;
  inviteUser: (name: string, email: string, role: User["role"]) => Promise<void>;
  updateUser: (u: User) => Promise<void>;
  pushAudit: (entry: Omit<AuditEntry, "id" | "date">) => void;
}

const DataContext = React.createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true);
  const [newsletters, setNewsletters] = React.useState<Newsletter[]>([]);
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [audit, setAudit] = React.useState<AuditEntry[]>([]);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [newslettersRes, subscribersRes, plansRes, usersRes, auditRes] = await Promise.all([
          fetch(`${API_BASE}/api/newsletters?_t=${Date.now()}`),
          fetch(`${API_BASE}/api/subscribers?_t=${Date.now()}`),
          fetch(`${API_BASE}/api/plans?_t=${Date.now()}`),
          fetch(`${API_BASE}/api/users?_t=${Date.now()}`),
          fetch(`${API_BASE}/api/audit?_t=${Date.now()}`),
        ]);

        const [newslettersData, subscribersData, plansData, usersData, auditData] = await Promise.all([
          newslettersRes.json(),
          subscribersRes.json(),
          plansRes.json(),
          usersRes.json(),
          auditRes.json(),
        ]);

        setNewsletters(newslettersData);
        setSubscribers(subscribersData);
        setPlans(plansData);
        setUsers(usersData);
        setAudit(auditData);
      } catch (err) {
        console.error("Failed to load data from backend:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const pushAudit: DataContextValue["pushAudit"] = async (entry) => {
    const payload = { ...entry, id: genId("a"), date: new Date().toISOString() };
    try {
      const res = await fetch(`${API_BASE}/api/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saved = await res.json();
      setAudit((prev) => [saved, ...prev]);
    } catch (err) {
      console.error("Failed to push audit log:", err);
    }
  };

  const getNewsletter = React.useCallback(
    (id: string) => newsletters.find((n) => n.id === id),
    [newsletters]
  );

  const saveNewsletter: DataContextValue["saveNewsletter"] = async (n) => {
    const res = await fetch(`${API_BASE}/api/newsletters/${n.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n),
    });
    const updated = await res.json();
    const parsed: Newsletter = {
      id: updated.id,
      title: updated.title,
      subtitle: updated.subtitle,
      slug: updated.slug,
      category: updated.category,
      template: updated.template,
      authorId: updated.author_id,
      coverImage: updated.cover_image,
      readingTime: updated.reading_time,
      status: updated.status,
      visibility: updated.visibility,
      blocks: updated.blocks,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      publishDate: updated.publish_date,
      scheduledFor: updated.scheduled_for,
      stats: updated.stats,
    };
    setNewsletters((prev) => prev.map((x) => (x.id === n.id ? parsed : x)));
    return parsed;
  };

  const createNewsletter: DataContextValue["createNewsletter"] = async (n) => {
    const res = await fetch(`${API_BASE}/api/newsletters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n),
    });
    const created = await res.json();
    const parsed: Newsletter = {
      id: created.id,
      title: created.title,
      subtitle: created.subtitle,
      slug: created.slug,
      category: created.category,
      template: created.template,
      authorId: created.author_id,
      coverImage: created.cover_image,
      readingTime: created.reading_time,
      status: created.status,
      visibility: created.visibility,
      blocks: created.blocks,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
      publishDate: created.publish_date,
      scheduledFor: created.scheduled_for,
      stats: created.stats,
    };
    setNewsletters((prev) => [parsed, ...prev]);
    return parsed;
  };

  const deleteNewsletter: DataContextValue["deleteNewsletter"] = async (id) => {
    await fetch(`${API_BASE}/api/newsletters/${id}`, {
      method: "DELETE",
    });
    setNewsletters((prev) => prev.filter((n) => n.id !== id));
  };

  const duplicateNewsletter: DataContextValue["duplicateNewsletter"] = async (id) => {
    const src = newsletters.find((n) => n.id === id);
    if (!src) return undefined;
    const copy: Newsletter = {
      ...src,
      id: genId("n"),
      title: `${src.title} (copy)`,
      slug: `${src.slug}-copy`,
      status: "draft",
      publishDate: null,
      scheduledFor: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { opens: 0, clicks: 0, openRate: 0, clickRate: 0, reads: 0 },
    };
    const res = await fetch(`${API_BASE}/api/newsletters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(copy),
    });
    const created = await res.json();
    const parsed: Newsletter = {
      id: created.id,
      title: created.title,
      subtitle: created.subtitle,
      slug: created.slug,
      category: created.category,
      template: created.template,
      authorId: created.author_id,
      coverImage: created.cover_image,
      readingTime: created.reading_time,
      status: created.status,
      visibility: created.visibility,
      blocks: created.blocks,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
      publishDate: created.publish_date,
      scheduledFor: created.scheduled_for,
      stats: created.stats,
    };
    setNewsletters((prev) => [parsed, ...prev]);
    return parsed;
  };

  const updateNewsletterStatus: DataContextValue["updateNewsletterStatus"] = async (id, status, scheduledFor) => {
    const src = newsletters.find((n) => n.id === id);
    if (!src) return;
    const payload = {
      ...src,
      status,
      scheduledFor: status === "scheduled" ? scheduledFor ?? src.scheduledFor : null,
      publishDate: status === "published" ? new Date().toISOString() : src.publishDate,
    };
    await fetch(`${API_BASE}/api/newsletters/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setNewsletters((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              status,
              scheduledFor: status === "scheduled" ? scheduledFor ?? n.scheduledFor : null,
              publishDate: status === "published" ? payload.publishDate : n.publishDate,
              updatedAt: new Date().toISOString(),
            }
          : n
      )
    );
  };

  const updateSubscriber: DataContextValue["updateSubscriber"] = async (s) => {
    await fetch(`${API_BASE}/api/subscribers/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    setSubscribers((prev) => prev.map((x) => (x.id === s.id ? s : x)));
  };

  const setSubscriberStatus: DataContextValue["setSubscriberStatus"] = async (id, status) => {
    const s = subscribers.find((x) => x.id === id);
    if (!s) return;
    const updated = { ...s, status };
    await fetch(`${API_BASE}/api/subscribers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setSubscribers((prev) => prev.map((x) => (x.id === id ? updated : x)));
  };

  const deleteSubscriber: DataContextValue["deleteSubscriber"] = async (id) => {
    await fetch(`${API_BASE}/api/subscribers/${id}`, {
      method: "DELETE",
    });
    setSubscribers((prev) => prev.filter((x) => x.id !== id));
  };

  const updatePlan: DataContextValue["updatePlan"] = async (p) => {
    const res = await fetch(`${API_BASE}/api/plans/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    const updated = await res.json();
    setPlans((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
  };

  const inviteUser: DataContextValue["inviteUser"] = async (name, email, role) => {
    const colors = ["#4f46e5", "#0ea5e9", "#16a34a", "#f59e0b", "#dc2626", "#9333ea"];
    const newUser = {
      id: genId("u"),
      name,
      email,
      role,
      avatarColor: colors[users.length % colors.length],
      status: "invited",
      lastActive: new Date().toISOString(),
    };
    const res = await fetch(`${API_BASE}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    const created = await res.json();
    const parsed: User = {
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
      avatarColor: created.avatar_color,
      status: created.status,
      lastActive: created.last_active,
    };
    setUsers((prev) => [...prev, parsed]);
  };

  const updateUser: DataContextValue["updateUser"] = async (u) => {
    const res = await fetch(`${API_BASE}/api/users/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(u),
    });
    const updated = await res.json();
    const parsed: User = {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      avatarColor: updated.avatar_color,
      status: updated.status,
      lastActive: updated.last_active,
    };
    setUsers((prev) => prev.map((x) => (x.id === u.id ? parsed : x)));
  };


  const value: DataContextValue = {
    loading,
    newsletters,
    subscribers,
    plans,
    users,
    audit,
    getNewsletter,
    saveNewsletter,
    createNewsletter,
    deleteNewsletter,
    duplicateNewsletter,
    updateNewsletterStatus,
    updateSubscriber,
    setSubscriberStatus,
    deleteSubscriber,
    updatePlan,
    inviteUser,
    updateUser,
    pushAudit,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = React.useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
