import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { CAN, TEMPLATES, CATEGORIES } from "@/lib/constants";
import { genId } from "@/lib/api";
import { slugify } from "@/lib/utils";
import type { Newsletter, NewsletterTemplate, Visibility } from "@/types";
import { ContentBuilder } from "@/components/editor/ContentBuilder";
import { NewsletterPreview } from "@/components/editor/NewsletterPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Save,
  Send,
  CalendarClock,
  Monitor,
  Tablet,
  Smartphone,
  Loader2,
  Info,
} from "lucide-react";

const STEPS = ["Basics", "Template", "Content", "Access", "Preview"];
type Device = "desktop" | "tablet" | "mobile";

function emptyDraft(authorId: string): Newsletter {
  return {
    id: genId("n"),
    title: "",
    subtitle: "",
    slug: "",
    category: "Markets",
    template: "daily-market-brief",
    authorId,
    coverImage: "",
    readingTime: 4,
    status: "draft",
    visibility: "free",
    blocks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishDate: null,
    scheduledFor: null,
    stats: { opens: 0, clicks: 0, openRate: 0, clickRate: 0, reads: 0 },
  };
}

export default function NewsletterEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { getNewsletter, createNewsletter, saveNewsletter, deleteNewsletter, updateNewsletterStatus, users, pushAudit } = useData();
  const isNew = !id;
  const cloningInProgress = useRef(false);

  const [draft, setDraft] = useState<Newsletter>(() => emptyDraft(user.id));
  const [step, setStep] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [device, setDevice] = useState<Device>("desktop");
  const [slugTouched, setSlugTouched] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scheduleAt, setScheduleAt] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const created = useRef(!isNew);

  useEffect(() => {
    if (id && !isDataLoaded) {
      const existing = getNewsletter(id);
      if (existing) {
        const hasPublishAccess = role === "admin" || role === "owner";
        if (existing.status === "published" && !hasPublishAccess) {
          const draftId = `${existing.id}_draft`;
          const existingDraft = getNewsletter(draftId);
          if (existingDraft) {
            navigate(`/newsletters/${draftId}/edit`, { replace: true });
          } else {
            if (cloningInProgress.current) return;
            cloningInProgress.current = true;

            const randomStr = Math.random().toString(36).substring(2, 6);
            const clone = {
              ...structuredClone(existing),
              id: draftId,
              status: "draft" as any,
              title: `${existing.title} (Draft Edit)`,
              slug: `${existing.slug}-draft-${randomStr}`,
              publishDate: null,
              scheduledFor: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            createNewsletter(clone).then(() => {
              navigate(`/newsletters/${draftId}/edit`, { replace: true });
            }).catch(() => {
              cloningInProgress.current = false;
            });
          }
          return;
        }

        setDraft(structuredClone(existing));
        setSlugTouched(true);
        if (existing.scheduledFor) {
          const d = new Date(existing.scheduledFor);
          const pad = (n: number) => String(n).padStart(2, "0");
          setScheduleAt(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
        }
        setIsDataLoaded(true);
      }
    } else if (!id) {
      setIsDataLoaded(true);
    }
  }, [id, getNewsletter, isDataLoaded, role, navigate, createNewsletter]);

  const set = (patch: Partial<Newsletter>) => setDraft((d) => ({ ...d, ...patch }));

  // Auto-generate slug from title until user edits slug (only for new newsletters)
  useEffect(() => {
    if (isNew && !slugTouched) {
      set({ slug: slugify(draft.title) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.title, slugTouched, isNew]);

  const canPublish = CAN.publish(role);

  const persist = async (overrides?: Partial<Newsletter>) => {
    const sanitizedReadingTime = Number(draft.readingTime) || 1;
    const payload = { ...draft, ...overrides, readingTime: sanitizedReadingTime };
    setSaveState("saving");
    if (!created.current) {
      await createNewsletter(payload);
      created.current = true;
    } else {
      await saveNewsletter(payload);
    }
    setDraft(payload);
    setSaveState("idle");
    setTimeout(() => setSaveState("idle"), 1600);
  };

  const validateBasics = () => {
    const e: Record<string, string> = {};
    if (!draft.title.trim()) e.title = "A title is required.";
    if (!draft.slug.trim()) e.slug = "A slug is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 0 && !validateBasics()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const handleSaveDraft = async () => {
    if (!validateBasics()) { setStep(0); return; }
    const hasPublishAccess = role === "admin" || role === "owner";
    const wasPublished = draft.status === "published";
    const nextStatus = (wasPublished && hasPublishAccess) ? "published" : "draft";
    
    await persist({ status: nextStatus });
    
    if (wasPublished && !hasPublishAccess) {
      toast.success("Draft saved", { description: "Changes saved. Status set to draft for Admin review." });
      navigate("/newsletters");
    } else {
      toast.success("Draft saved", { description: draft.title });
    }
  };

  const handlePublish = async () => {
    if (!validateBasics()) { setStep(0); return; }
    
    if (draft.id.endsWith("_draft")) {
      const parentId = draft.id.replace("_draft", "");
      const cleanTitle = draft.title.replace(" (Draft Edit)", "");
      const cleanSlug = draft.slug.split("-draft-")[0];
      const payload = { 
        ...draft, 
        id: parentId, 
        title: cleanTitle, 
        slug: cleanSlug,
        status: "published" as any, 
        publishDate: new Date().toISOString() 
      };
      await saveNewsletter(payload);
      await deleteNewsletter(draft.id);
    } else {
      await persist({ status: "published", publishDate: new Date().toISOString() });
    }
    
    pushAudit({ actorId: user.id, action: "published", target: draft.title.replace(" (Draft Edit)", "") });
    toast.success("Published", { description: `${draft.title.replace(" (Draft Edit)", "")} is now live.` });
    navigate("/newsletters");
  };

  const handleSchedule = async () => {
    if (!validateBasics()) { setStep(0); return; }
    if (!scheduleAt) { toast.error("Pick a date and time to schedule."); return; }
    
    if (draft.id.endsWith("_draft")) {
      const parentId = draft.id.replace("_draft", "");
      const cleanTitle = draft.title.replace(" (Draft Edit)", "");
      const cleanSlug = draft.slug.split("-draft-")[0];
      const payload = { 
        ...draft, 
        id: parentId, 
        title: cleanTitle, 
        slug: cleanSlug,
        status: "scheduled" as any, 
        scheduledFor: new Date(scheduleAt).toISOString() 
      };
      await saveNewsletter(payload);
      await deleteNewsletter(draft.id);
    } else {
      await persist({ status: "scheduled", scheduledFor: new Date(scheduleAt).toISOString() });
    }
    
    pushAudit({ actorId: user.id, action: "scheduled", target: draft.title.replace(" (Draft Edit)", "") });
    toast.success("Scheduled", { description: `Sends ${new Date(scheduleAt).toLocaleString()}` });
    navigate("/newsletters");
  };

  const deviceWidth: Record<Device, string> = {
    desktop: "max-w-2xl",
    tablet: "max-w-md",
    mobile: "max-w-[360px]",
  };

  if (id && !isDataLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary/30">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-secondary/30">
      {/* Editor top bar */}
      <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/newsletters")}>
          <ArrowLeft className="size-4" /> <span className="hidden sm:inline">Newsletters</span>
        </Button>
        <div className="h-5 w-px bg-border" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{draft.title || "Untitled newsletter"}</p>
        </div>
        <SaveIndicator state={saveState} />
        <Button variant="ghost" size="icon-sm" onClick={() => setShowPreview((p) => !p)} className="hidden lg:inline-flex" aria-label="Toggle preview">
          {showPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
        <Button variant="outline" size="sm" onClick={handleSaveDraft}>
          <Save className="size-4" /> <span className="hidden sm:inline">Save draft</span>
        </Button>
        {canPublish && (
          <Button size="sm" onClick={handlePublish}>
            <Send className="size-4" /> Publish
          </Button>
        )}
      </header>

      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-background px-4 py-2.5">
        {STEPS.map((label, i) => {
          const state = i === step ? "current" : i < step ? "done" : "todo";
          return (
            <button
              key={label}
              onClick={() => (i < step || i === step ? setStep(i) : next())}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                state === "current" && "bg-accent text-accent-foreground",
                state === "done" && "text-foreground hover:bg-secondary",
                state === "todo" && "text-muted-foreground hover:bg-secondary"
              )}
            >
              <span className={cn(
                "flex size-5 items-center justify-center rounded-full text-[11px] font-semibold",
                state === "current" && "bg-primary text-primary-foreground",
                state === "done" && "bg-success text-success-foreground",
                state === "todo" && "bg-muted text-muted-foreground"
              )}>
                {state === "done" ? <Check className="size-3" /> : i + 1}
              </span>
              {label}
              {i < STEPS.length - 1 && <ArrowRight className="size-3.5 text-muted-foreground/40" />}
            </button>
          );
        })}
      </div>

      {/* Draft Review Banner */}
      {!isNew && draft.status === "draft" && (role === "admin" || role === "owner") && (
        <div className="flex flex-col gap-3 border-b border-border bg-card px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-warning/10" style={{ color: "var(--warning)" }}>
              <CalendarClock className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Draft Review Panel</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Created by <strong className="text-foreground">{users.find((u: any) => u.id === draft.authorId)?.name || "Writer/Editor"}</strong>. Review blocks, request changes, or approve for release.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const note = window.prompt("Enter revision feedback note for the author:");
                if (note !== null) {
                  pushAudit({ actorId: user.id, action: "revision requested", target: `${draft.title} (Feedback: ${note})` });
                  toast.success("Revision requested", { description: "Changes request logged in audit log." });
                  navigate("/newsletters");
                }
              }}
            >
              Request Changes
            </Button>
            <Button
              size="sm"
              onClick={() => setStep(3)} // Route directly to Step 4 (Access) for publishing
            >
              Approve & Publish
            </Button>
          </div>
        </div>
      )}

      {/* Body: split-screen */}
      <div className="flex min-h-0 flex-1">
        <div className={cn("min-h-0 flex-1 overflow-y-auto", showPreview && step !== 4 ? "lg:max-w-[60%]" : "")}>
          <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8">
            {step === 0 && <StepBasics draft={draft} set={set} errors={errors} users={users} onSlugEdit={() => setSlugTouched(true)} />}
            {step === 1 && <StepTemplate draft={draft} set={set} />}
            {step === 2 && <ContentBuilder blocks={draft.blocks} onChange={(blocks) => set({ blocks })} />}
            {step === 3 && (
              <StepAccess
                draft={draft}
                set={set}
                canPublish={canPublish}
                scheduleAt={scheduleAt}
                setScheduleAt={setScheduleAt}
                onPublish={handlePublish}
                onSchedule={handleSchedule}
                onSaveDraft={handleSaveDraft}
              />
            )}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Preview</h2>
                    <p className="text-sm text-muted-foreground">This is exactly how readers will see it.</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
                    {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([d, Icon]) => (
                      <button
                        key={d}
                        onClick={() => setDevice(d)}
                        className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm capitalize", device === d ? "bg-secondary font-medium text-foreground" : "text-muted-foreground")}
                      >
                        <Icon className="size-4" /> <span className="hidden sm:inline">{d}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-slate-100 p-4 sm:p-8">
                  <div className={cn("mx-auto overflow-hidden rounded-xl bg-white shadow-pop transition-all", deviceWidth[device])}>
                    <NewsletterPreview newsletter={draft} />
                  </div>
                </div>
              </div>
            )}

            {/* Footer nav */}
            <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
              <Button variant="ghost" onClick={back} disabled={step === 0}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next}>Continue <ArrowRight className="size-4" /></Button>
              ) : canPublish ? (
                scheduleAt ? (
                  <Button onClick={handleSchedule}><CalendarClock className="size-4" /> Schedule send</Button>
                ) : (
                  <Button onClick={handlePublish}><Send className="size-4" /> Publish now</Button>
                )
              ) : (
                <Button onClick={handleSaveDraft}><Save className="size-4" /> Save draft</Button>
              )}
            </div>
          </div>
        </div>

        {/* Persistent live preview (steps 0–3) */}
        {showPreview && step !== 4 && (
          <aside className="hidden min-h-0 flex-1 overflow-y-auto border-l border-border bg-slate-100 lg:block">
            <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-slate-100/90 px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur">
              <Eye className="size-3.5" /> Live preview
            </div>
            <div className="p-6">
              <div className="mx-auto max-w-xl overflow-hidden rounded-xl bg-white shadow-card">
                <NewsletterPreview newsletter={draft} />
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" }) {
  if (state === "idle") return <span className="hidden text-xs text-muted-foreground sm:inline">Autosave on</span>;
  if (state === "saving")
    return <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex"><Loader2 className="size-3 animate-spin" /> Saving…</span>;
  return <span className="hidden items-center gap-1 text-xs text-success sm:flex"><Check className="size-3" /> Saved</span>;
}

/* ---------------- Step 1: Basics ---------------- */
function StepBasics({ draft, set, errors, users, onSlugEdit }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Basic information</h2>
        <p className="text-sm text-muted-foreground">Give your newsletter a title and the essentials.</p>
      </div>
      <div className="grid gap-5">
        <Field label="Title" error={errors.title} required>
          <Input value={draft.title} error={!!errors.title} placeholder="e.g. Markets rally as RBI holds rates steady" onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="Subtitle">
          <Input value={draft.subtitle} placeholder="A short deck that appears under the title" onChange={(e) => set({ subtitle: e.target.value })} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Slug" error={errors.slug} required hint="Used in the public URL">
            <div className="flex items-center rounded-lg border border-input bg-card shadow-soft focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/60">
              <span className="pl-3 text-sm text-muted-foreground">trinance.com/</span>
              <input
                value={draft.slug}
                onChange={(e) => { onSlugEdit(); set({ slug: slugify(e.target.value) }); }}
                className="h-9 flex-1 bg-transparent px-1 text-sm outline-none"
              />
            </div>
          </Field>
          <Field label="Category">
            <Select value={draft.category} onValueChange={(v) => set({ category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Author">
            <Select value={draft.authorId} onValueChange={(v) => set({ authorId: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {users.filter((u: any) => u.status === "active").map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Estimated reading time (min)">
            <Input
              type="number"
              min={1}
              value={draft.readingTime}
              onChange={(e) => {
                const val = e.target.value;
                set({ readingTime: val === "" ? "" : Number(val) });
              }}
            />
          </Field>
        </div>
        <Field label="Cover image URL" hint="Optional — leave blank for a template placeholder">
          <Input value={draft.coverImage} placeholder="https://…" onChange={(e) => set({ coverImage: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}

/* ---------------- Step 2: Template ---------------- */
function StepTemplate({ draft, set }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Choose a template</h2>
        <p className="text-sm text-muted-foreground">Templates set the tone and default structure. You can customise everything later.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => {
          const selected = draft.template === t.id;
          return (
            <button
              key={t.id}
              onClick={() => set({ template: t.id as NewsletterTemplate })}
              className={cn(
                "flex flex-col rounded-xl border p-4 text-left transition-all",
                selected ? "border-primary bg-accent ring-2 ring-primary/20" : "border-border bg-card hover:border-primary/40 hover:shadow-card"
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg text-xl" style={{ background: `${t.accent}18` }}>{t.emoji}</span>
                {selected && <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-3" /></span>}
              </div>
              <p className="font-semibold text-foreground">{t.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Step 4: Access & Publishing ---------------- */
function StepAccess({ draft, set, canPublish, scheduleAt, setScheduleAt, onPublish, onSchedule, onSaveDraft }: any) {
  const visibilities: { id: Visibility; label: string; desc: string }[] = [
    { id: "free", label: "Free", desc: "Anyone can read this newsletter." },
    { id: "monthly", label: "Monthly subscribers", desc: "Monthly plan and above." },
    { id: "quarterly", label: "Quarterly subscribers", desc: "Quarterly plan and above." },
    { id: "yearly", label: "Yearly subscribers", desc: "Yearly plan only — most exclusive." },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Access & publishing</h2>
        <p className="text-sm text-muted-foreground">Control who can read this and when it goes out.</p>
      </div>

      <div className="space-y-3">
        <Label>Visibility</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {visibilities.map((v) => {
            const selected = draft.visibility === v.id;
            return (
              <button
                key={v.id}
                onClick={() => set({ visibility: v.id })}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                  selected ? "border-primary bg-accent ring-2 ring-primary/20" : "border-border bg-card hover:border-primary/40"
                )}
              >
                <span className={cn("mt-0.5 flex size-4 items-center justify-center rounded-full border", selected ? "border-primary bg-primary" : "border-muted-foreground/40")}>
                  {selected && <span className="size-1.5 rounded-full bg-white" />}
                </span>
                <span>
                  <span className="block text-sm font-medium">{v.label}</span>
                  <span className="block text-xs text-muted-foreground">{v.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Publishing</Label>
        {!canPublish && (
          <Card className="flex items-start gap-3 border-warning/30 bg-warning/5 p-3">
            <Info className="mt-0.5 size-4 text-warning" />
            <p className="text-sm text-muted-foreground">
              Your role can create and edit drafts but can't publish or schedule. Save as a draft and an editor will review it.
            </p>
          </Card>
        )}
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Send className="size-4" /></div>
            <div>
              <p className="text-sm font-semibold">Publish now</p>
              <p className="text-xs text-muted-foreground">Send immediately to eligible subscribers.</p>
            </div>
            <Button size="sm" disabled={!canPublish} onClick={onPublish}>Publish</Button>
          </Card>
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground"><CalendarClock className="size-4" /></div>
            <div>
              <p className="text-sm font-semibold">Schedule</p>
              <p className="text-xs text-muted-foreground">Pick a date and time to send.</p>
            </div>
            <Input
              type="datetime-local"
              disabled={!canPublish}
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              className="h-9 pl-2 pr-1 text-[10.5px] cursor-pointer"
              style={{ colorScheme: "light dark" }}
            />
            <Button size="sm" variant="outline" disabled={!canPublish} onClick={onSchedule}>Schedule send</Button>
          </Card>
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Save className="size-4" /></div>
            <div>
              <p className="text-sm font-semibold">Save draft</p>
              <p className="text-xs text-muted-foreground">Keep working on it later.</p>
            </div>
            <Button size="sm" variant="outline" onClick={onSaveDraft}>Save draft</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Shared field ---------------- */
function Field({ label, children, error, hint, required }: { label: string; children: React.ReactNode; error?: string; hint?: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
