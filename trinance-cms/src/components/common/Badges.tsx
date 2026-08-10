import { Badge } from "@/components/ui/badge";
import type { NewsletterStatus, Visibility, Role, SubscriberStatus } from "@/types";

const statusMap: Record<NewsletterStatus, { label: string; variant: any }> = {
  draft: { label: "Draft", variant: "muted" },
  scheduled: { label: "Scheduled", variant: "warning" },
  published: { label: "Published", variant: "success" },
  archived: { label: "Archived", variant: "secondary" },
};

export function NewsletterStatusBadge({ status }: { status: NewsletterStatus }) {
  const s = statusMap[status];
  return <Badge variant={s.variant} dot>{s.label}</Badge>;
}

const visibilityMap: Record<Visibility, string> = {
  free: "Free",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  return (
    <Badge variant={visibility === "free" ? "secondary" : "default"}>
      {visibilityMap[visibility]}
    </Badge>
  );
}

const roleMap: Record<Role, { label: string; variant: any }> = {
  owner: { label: "Owner", variant: "default" },
  admin: { label: "Admin", variant: "default" },
  editor: { label: "Editor", variant: "secondary" },
  writer: { label: "Writer", variant: "muted" },
};

export function RoleBadge({ role }: { role: Role }) {
  const r = roleMap[role];
  return <Badge variant={r.variant}>{r.label}</Badge>;
}

const subStatusMap: Record<SubscriberStatus, { label: string; variant: any }> = {
  active: { label: "Active", variant: "success" },
  trialing: { label: "Trialing", variant: "default" },
  past_due: { label: "Past due", variant: "warning" },
  suspended: { label: "Suspended", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "muted" },
};

export function SubscriberStatusBadge({ status }: { status: SubscriberStatus }) {
  const s = subStatusMap[status];
  return <Badge variant={s.variant} dot>{s.label}</Badge>;
}
