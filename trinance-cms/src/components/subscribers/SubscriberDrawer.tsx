import { useState, useEffect } from "react";
import type { Subscriber } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { InitialsAvatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SubscriberStatusBadge } from "@/components/common/Badges";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import {
  Mail,
  MapPin,
  CalendarDays,
  CreditCard,
  Ban,
  RefreshCw,
  Save,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Activity,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = ["Profile", "Payments", "Activity", "Notes"] as const;
type Tab = (typeof TABS)[number];

export function SubscriberDrawer({
  subscriber,
  open,
  onOpenChange,
  onSuspend,
  onReactivate,
  onSaveNotes,
}: {
  subscriber: Subscriber | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSuspend: (s: Subscriber) => void;
  onReactivate: (s: Subscriber) => void;
  onSaveNotes: (s: Subscriber, notes: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("Profile");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (subscriber) { setNotes(subscriber.notes); setTab("Profile"); }
  }, [subscriber]);

  if (!subscriber) return null;
  const suspended = subscriber.status === "suspended";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0">
        <SheetHeader className="border-b border-border">
          <div className="flex items-center gap-3">
            <InitialsAvatar name={subscriber.name} color={subscriber.avatarColor} className="size-12 text-base" />
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate">{subscriber.name}</SheetTitle>
              <p className="truncate text-sm text-muted-foreground">{subscriber.email}</p>
            </div>
            <SubscriberStatusBadge status={subscriber.status} />
          </div>
        </SheetHeader>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border px-4 py-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === "Profile" && (
            <div className="space-y-5">
              <Section title="Subscription">
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current plan</p>
                      <p className="text-lg font-semibold capitalize">{subscriber.plan}</p>
                    </div>
                    <Badge variant={subscriber.plan === "free" ? "secondary" : "default"} className="capitalize">{subscriber.plan}</Badge>
                  </div>
                  <Separator className="my-3" />
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <Info label="Lifetime spend" value={formatCurrency(subscriber.lifetimeSpend)} />
                    <Info label="Renewal" value={subscriber.renewalDate ? formatDate(subscriber.renewalDate) : "—"} />
                  </dl>
                </div>
              </Section>
              <Section title="Details">
                <div className="space-y-2.5 text-sm">
                  <Detail icon={<Mail className="size-4" />} value={subscriber.email} />
                  <Detail icon={<MapPin className="size-4" />} value={subscriber.location} />
                  <Detail icon={<CalendarDays className="size-4" />} value={`Joined ${formatDate(subscriber.joinedDate)}`} />
                </div>
              </Section>
              <Section title="Newsletter access">
                <div className="flex flex-wrap gap-1.5">
                  {subscriber.plan === "free" ? (
                    <Badge variant="secondary">Free newsletters</Badge>
                  ) : (
                    <>
                      <Badge variant="secondary">Free newsletters</Badge>
                      <Badge>Monthly</Badge>
                      {(subscriber.plan === "quarterly" || subscriber.plan === "yearly") && <Badge>Quarterly</Badge>}
                      {subscriber.plan === "yearly" && <Badge>Yearly exclusives</Badge>}
                    </>
                  )}
                </div>
              </Section>
            </div>
          )}

          {tab === "Payments" && (
            <div className="space-y-2">
              {subscriber.payments.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No payments yet — this is a free subscriber.</p>
              ) : (
                subscriber.payments.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <span className={cn(
                      "flex size-9 items-center justify-center rounded-lg",
                      p.status === "paid" ? "bg-success/10 text-success" : p.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                    )}>
                      {p.status === "paid" ? <CheckCircle2 className="size-4" /> : p.status === "failed" ? <XCircle className="size-4" /> : <RotateCcw className="size-4" />}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{formatCurrency(p.amount)} · {p.plan}</p>
                      <p className="text-xs text-muted-foreground">{p.method} · {formatDate(p.date)}</p>
                    </div>
                    <Badge variant={p.status === "paid" ? "success" : p.status === "failed" ? "destructive" : "muted"} className="capitalize">{p.status}</Badge>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "Activity" && (
            <div className="relative space-y-1 pl-2">
              {subscriber.activity.map((a, i) => (
                <div key={a.id} className="relative flex gap-3 pb-4">
                  {i < subscriber.activity.length - 1 && <span className="absolute left-[15px] top-8 h-full w-px bg-border" />}
                  <span className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    {a.type === "payment" ? <CreditCard className="size-4" /> : a.type === "email" ? <Mail className="size-4" /> : a.type === "subscription" ? <Activity className="size-4" /> : <Clock className="size-4" />}
                  </span>
                  <div className="pt-1">
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(a.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "Notes" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Internal notes — visible only to your team.</p>
              <Textarea rows={8} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note about this subscriber…" />
              <Button size="sm" onClick={() => onSaveNotes(subscriber, notes)}>
                <Save className="size-4" /> Save notes
              </Button>
            </div>
          )}
        </div>

        <SheetFooter>
          {suspended ? (
            <Button variant="success" onClick={() => onReactivate(subscriber)}>
              <RefreshCw className="size-4" /> Reactivate
            </Button>
          ) : (
            <Button variant="outline" onClick={() => onSuspend(subscriber)}>
              <Ban className="size-4" /> Suspend
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
function Detail({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2.5 text-foreground">
      <span className="text-muted-foreground">{icon}</span>
      {value}
    </div>
  );
}
