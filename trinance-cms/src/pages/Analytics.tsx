import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { computeMetrics } from "@/lib/metrics";
import { buildTimeSeries } from "@/data/seed";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AreaTrend, BarTrend, LineTrend } from "@/components/common/TrendChart";
import { NewsletterStatusBadge } from "@/components/common/Badges";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import {
  Wallet,
  Users,
  MailOpen,
  MousePointerClick,
  TrendingUp,
  Trophy,
  Percent,
} from "lucide-react";

const RANGES = [
  { id: "today", label: "Today", days: 1 },
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "custom", label: "Custom", days: 90 },
] as const;

export default function Analytics() {
  const { loading, subscribers, plans, newsletters } = useData();
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("30d");

  const days = RANGES.find((r) => r.id === range)!.days;
  const m = useMemo(() => computeMetrics(subscribers, plans, newsletters), [subscribers, plans, newsletters]);
  const series = useMemo(() => {
    return buildTimeSeries(days).map((d) => ({ ...d, label: formatDate(d.date, { month: "short", day: "numeric" }) }));
  }, [days]);

  const topNewsletters = useMemo(
    () => [...newsletters].filter((n) => n.status === "published").sort((a, b) => b.stats.opens - a.stats.opens).slice(0, 5),
    [newsletters]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track growth, revenue, and engagement across Trinance."
        actions={
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${range === r.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {range === "custom" && (
        <Card className="flex flex-wrap items-end gap-3 p-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <Input type="date" defaultValue="2026-05-09" className="w-40" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <Input type="date" defaultValue="2026-08-07" className="w-40" />
          </div>
          <Button size="sm">Apply range</Button>
        </Card>
      )}

      {/* Overview KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard loading={loading} label="Revenue" value={formatCurrency(m.monthlyRevenue)} icon={Wallet} delta={5.4} hint="MRR" />
        <StatCard loading={loading} label="Subscriber growth" value={`+${formatNumber(Math.round(m.totalSubscribers * 0.042))}`} icon={Users} delta={4.2} hint="this period" />
        <StatCard loading={loading} label="Open rate" value={`${m.avgOpenRate.toFixed(1)}%`} icon={MailOpen} delta={1.8} hint="avg. across sends" />
        <StatCard loading={loading} label="Click rate" value={`${m.avgClickRate.toFixed(1)}%`} icon={MousePointerClick} delta={-0.6} hint="avg. across sends" />
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="engagement">Opens & clicks</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue">
          <Card>
            <CardHeader><CardTitle>Revenue over time</CardTitle><CardDescription>Cumulative revenue for the selected period</CardDescription></CardHeader>
            <CardContent>{loading ? <Skeleton className="h-[280px] w-full" /> : <AreaTrend data={series} dataKey="revenue" name="Revenue" formatter={(v) => formatCurrency(v)} height={280} />}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="subscribers">
          <Card>
            <CardHeader><CardTitle>Subscriber growth</CardTitle><CardDescription>Total subscribers over the selected period</CardDescription></CardHeader>
            <CardContent>{loading ? <Skeleton className="h-[280px] w-full" /> : <AreaTrend data={series} dataKey="subscribers" name="Subscribers" color="hsl(152 60% 40%)" formatter={(v) => formatNumber(v)} height={280} />}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="engagement">
          <Card>
            <CardHeader><CardTitle>Opens & clicks</CardTitle><CardDescription>Daily engagement across all sends</CardDescription></CardHeader>
            <CardContent>{loading ? <Skeleton className="h-[280px] w-full" /> : (
              <LineTrend data={series} height={280} formatter={(v) => formatNumber(v)} series={[
                { key: "opens", color: "hsl(243 75% 59%)", name: "Opens" },
                { key: "clicks", color: "hsl(32 95% 44%)", name: "Clicks" },
              ]} />
            )}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Highlights */}
        <div className="space-y-4">
          <HighlightCard icon={<Trophy className="size-4" />} label="Most read newsletter" title={m.mostRead?.title ?? "—"} value={`${formatNumber(m.mostRead?.stats.reads ?? 0)} reads`} />
          <HighlightCard icon={<TrendingUp className="size-4" />} label="Top performing (CTR)" title={m.topPerforming?.title ?? "—"} value={`${(m.topPerforming?.stats.clickRate ?? 0).toFixed(1)}% click rate`} />
          <HighlightCard icon={<Percent className="size-4" />} label="Subscription conversion" title={`${m.conversion.toFixed(1)}% of readers are paying`} value={`${formatNumber(m.activePaid)} paid subscribers`} />
        </div>

        {/* Top newsletters bar + table */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Top newsletters by opens</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {loading ? <Skeleton className="h-[180px] w-full" /> : (
              <BarTrend
                height={180}
                data={topNewsletters.map((n) => ({ label: n.title.slice(0, 14) + (n.title.length > 14 ? "…" : ""), opens: n.stats.opens }))}
                dataKey="opens"
                name="Opens"
                formatter={(v) => formatNumber(v)}
              />
            )}
            <div className="space-y-1">
              {topNewsletters.map((n) => (
                <div key={n.id} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-secondary/50">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{formatNumber(n.stats.opens)} opens · {n.stats.clickRate.toFixed(1)}% CTR</p>
                  </div>
                  <NewsletterStatusBadge status={n.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HighlightCard({ icon, label, title, value }: { icon: React.ReactNode; label: string; title: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">{icon}</span>
        {label}
      </div>
      <p className="font-semibold leading-snug text-foreground">{title}</p>
      <p className="mt-1 text-sm text-primary">{value}</p>
    </Card>
  );
}
