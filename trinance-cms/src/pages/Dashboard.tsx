import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { computeMetrics } from "@/lib/metrics";
import { buildTimeSeries, userById } from "@/data/seed";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InitialsAvatar } from "@/components/ui/avatar";
import { AreaTrend } from "@/components/common/TrendChart";
import { NewsletterStatusBadge, VisibilityBadge } from "@/components/common/Badges";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber, formatDate, relativeTime } from "@/lib/utils";
import { TEMPLATE_NAME } from "@/lib/constants";
import {
  Users,
  BadgeDollarSign,
  Wallet,
  Send,
  FileEdit,
  CalendarClock,
  PenSquare,
  ArrowRight,
  UserPlus,
  CreditCard,
  Sparkles,
} from "lucide-react";

export default function Dashboard() {
  const { loading, subscribers, plans, newsletters } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const m = useMemo(() => computeMetrics(subscribers, plans, newsletters), [subscribers, plans, newsletters]);
  const series = useMemo(() => {
    const raw = buildTimeSeries(30);
    return raw.map((d) => ({ ...d, label: formatDate(d.date, { month: "short", day: "numeric" }) }));
  }, []);

  const recent = useMemo(
    () =>
      [...newsletters]
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
        .slice(0, 5),
    [newsletters]
  );

  const latestSubscriber = useMemo(
    () => [...subscribers].sort((a, b) => +new Date(b.joinedDate) - +new Date(a.joinedDate))[0],
    [subscribers]
  );
  const latestPublished = useMemo(
    () =>
      [...newsletters]
        .filter((n) => n.status === "published" && n.publishDate)
        .sort((a, b) => +new Date(b.publishDate!) - +new Date(a.publishDate!))[0],
    [newsletters]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good morning, ${user.name.split(" ")[0]}`}
        description="Here's what's happening across Trinance today."
        actions={
          <Button onClick={() => navigate("/newsletters/new")}>
            <PenSquare className="size-4" /> New Newsletter
          </Button>
        }
      />

      {/* Widgets */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard loading={loading} label="Total Subscribers" value={formatNumber(m.totalSubscribers)} icon={Users} delta={4.2} hint="vs last month" onClick={() => navigate("/subscribers")} />
        <StatCard loading={loading} label="Active Paid Subscribers" value={formatNumber(m.activePaid)} icon={BadgeDollarSign} delta={6.1} hint="vs last month" onClick={() => navigate("/subscribers")} />
        <StatCard loading={loading} label="Monthly Revenue" value={formatCurrency(m.monthlyRevenue)} icon={Wallet} delta={5.4} hint="vs last month" onClick={() => navigate("/analytics")} />
        <StatCard loading={loading} label="Published This Month" value={String(m.publishedThisMonth)} icon={Send} delta={12} hint="vs last month" onClick={() => navigate("/newsletters")} />
        <StatCard loading={loading} label="Drafts Waiting" value={String(m.drafts)} icon={FileEdit} hint="needs attention" onClick={() => navigate("/newsletters")} />
        <StatCard loading={loading} label="Scheduled" value={String(m.scheduled)} icon={CalendarClock} hint="queued to send" onClick={() => navigate("/newsletters")} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Revenue & subscribers</CardTitle>
              <CardDescription>Cumulative growth over the last 30 days</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/analytics")}>
              View analytics <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <AreaTrend data={series} dataKey="revenue" name="Revenue" formatter={(v) => formatCurrency(v)} />
            )}
          </CardContent>
        </Card>

        {/* Quick actions + activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <QuickAction icon={<PenSquare className="size-4" />} label="Create Newsletter" onClick={() => navigate("/newsletters/new")} />
              <QuickAction icon={<FileEdit className="size-4" />} label="Continue Draft" hint={`${m.drafts} waiting`} onClick={() => navigate("/newsletters")} />
              <QuickAction icon={<Users className="size-4" />} label="View Subscribers" onClick={() => navigate("/subscribers")} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
              ) : (
                <>
                  <ActivityRow
                    icon={<Sparkles className="size-4 text-primary" />}
                    title="Latest newsletter"
                    body={latestPublished?.title ?? "—"}
                    time={latestPublished ? relativeTime(latestPublished.publishDate!) : ""}
                  />
                  <ActivityRow
                    icon={<UserPlus className="size-4 text-success" />}
                    title="Newest subscriber"
                    body={`${latestSubscriber.name} · ${latestSubscriber.plan}`}
                    time={relativeTime(latestSubscriber.joinedDate)}
                  />
                  <ActivityRow
                    icon={<CreditCard className="size-4 text-warning" />}
                    title="Recent payment"
                    body={formatCurrency(99) + " · Yearly plan"}
                    time={relativeTime(new Date(Date.now() - 3600_000))}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent newsletters table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Recent newsletters</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/newsletters")}>
            View all <ArrowRight className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <div className="space-y-2 px-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Access</TableHead>
                  <TableHead className="hidden lg:table-cell">Author</TableHead>
                  <TableHead className="hidden lg:table-cell">Publish date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((n) => {
                  const author = userById(n.authorId);
                  return (
                    <TableRow key={n.id} className="cursor-pointer" onClick={() => navigate(`/newsletters/${n.id}/edit`)}>
                      <TableCell>
                        <p className="font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{TEMPLATE_NAME[n.template]}</p>
                      </TableCell>
                      <TableCell><NewsletterStatusBadge status={n.status} /></TableCell>
                      <TableCell className="hidden md:table-cell"><VisibilityBadge visibility={n.visibility} /></TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <InitialsAvatar name={author?.name ?? "?"} color={author?.avatarColor ?? "#888"} className="size-7" />
                          <span className="text-sm">{author?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {n.publishDate ? formatDate(n.publishDate) : n.scheduledFor ? `Scheduled ${formatDate(n.scheduledFor)}` : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuickAction({ icon, label, hint, onClick }: { icon: React.ReactNode; label: string; hint?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-secondary/50"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      <ArrowRight className="size-4 text-muted-foreground" />
    </button>
  );
}

function ActivityRow({ icon, title, body, time }: { icon: React.ReactNode; title: string; body: string; time: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-secondary">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="truncate text-sm font-medium">{body}</p>
      </div>
      <span className="shrink-0 text-[11px] text-muted-foreground">{time}</span>
    </div>
  );
}
