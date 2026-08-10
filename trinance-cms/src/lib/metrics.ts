import type { Newsletter, Plan, Subscriber } from "@/types";

export function computeMetrics(subscribers: Subscriber[], plans: Plan[], newsletters: Newsletter[]) {
  const paidPlanTotal = plans.reduce((sum, p) => sum + p.subscribers, 0);
  const freeBase = 42230; // large realistic free audience beyond the sample list
  const totalSubscribers = freeBase + paidPlanTotal;
  const activePaid = paidPlanTotal;

  const monthlyRevenue =
    plans.find((p) => p.id === "monthly")!.price * plans.find((p) => p.id === "monthly")!.subscribers +
    (plans.find((p) => p.id === "quarterly")!.price / 3) * plans.find((p) => p.id === "quarterly")!.subscribers +
    (plans.find((p) => p.id === "yearly")!.price / 12) * plans.find((p) => p.id === "yearly")!.subscribers;

  const now = new Date("2026-08-07T00:00:00+05:30");
  const publishedThisMonth = newsletters.filter(
    (n) =>
      n.status === "published" &&
      n.publishDate &&
      new Date(n.publishDate).getMonth() === now.getMonth() &&
      new Date(n.publishDate).getFullYear() === now.getFullYear()
  ).length;

  const drafts = newsletters.filter((n) => n.status === "draft").length;
  const scheduled = newsletters.filter((n) => n.status === "scheduled").length;

  const published = newsletters.filter((n) => n.status === "published");
  const avgOpenRate = published.length
    ? published.reduce((s, n) => s + n.stats.openRate, 0) / published.length
    : 0;
  const avgClickRate = published.length
    ? published.reduce((s, n) => s + n.stats.clickRate, 0) / published.length
    : 0;

  const conversion = (activePaid / totalSubscribers) * 100;

  const mostRead = [...published].sort((a, b) => b.stats.reads - a.stats.reads)[0];
  const topPerforming = [...published].sort((a, b) => b.stats.clickRate - a.stats.clickRate)[0];

  return {
    totalSubscribers,
    activePaid,
    monthlyRevenue: Math.round(monthlyRevenue),
    publishedThisMonth,
    drafts,
    scheduled,
    avgOpenRate,
    avgClickRate,
    conversion,
    mostRead,
    topPerforming,
  };
}
