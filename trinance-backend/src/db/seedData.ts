import type {
  User,
  Plan,
  Newsletter,
  Subscriber,
  AuditEntry,
  ContentBlock,
} from "../types";

/* ------------------------------------------------------------------ */
/* Seeded PRNG for deterministic sample data                           */
/* ------------------------------------------------------------------ */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260807);
const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-08-07T09:30:00+05:30").getTime();
const iso = (ms: number) => new Date(ms).toISOString();
const daysAgo = (d: number) => iso(NOW - d * DAY);
const daysFromNow = (d: number) => iso(NOW + d * DAY);

const AVATAR_COLORS = ["#4f46e5", "#0ea5e9", "#16a34a", "#9333ea", "#f59e0b", "#0891b2", "#db2777", "#dc2626"];

/* ------------------------------------------------------------------ */
/* Team                                                                */
/* ------------------------------------------------------------------ */
export const users: User[] = [
  { id: "u1", name: "Shruti Menon", email: "shruti@trinance.com", role: "owner", avatarColor: "#4f46e5", status: "active", lastActive: daysAgo(0) },
  { id: "u2", name: "Arjun Kapoor", email: "arjun@trinance.com", role: "admin", avatarColor: "#0ea5e9", status: "active", lastActive: daysAgo(0) },
  { id: "u3", name: "Neha Sharma", email: "neha@trinance.com", role: "editor", avatarColor: "#16a34a", status: "active", lastActive: daysAgo(1) },
  { id: "u4", name: "Vikram Rao", email: "vikram@trinance.com", role: "editor", avatarColor: "#9333ea", status: "active", lastActive: daysAgo(2) },
  { id: "u5", name: "Priya Nair", email: "priya@trinance.com", role: "writer", avatarColor: "#f59e0b", status: "active", lastActive: daysAgo(1) },
  { id: "u6", name: "Karan Singh", email: "karan@trinance.com", role: "writer", avatarColor: "#0891b2", status: "active", lastActive: daysAgo(4) },
  { id: "u7", name: "Divya Iyer", email: "divya@trinance.com", role: "writer", avatarColor: "#db2777", status: "invited", lastActive: daysAgo(6) },
  { id: "u8", name: "Rohan Mehta", email: "rohan@trinance.com", role: "editor", avatarColor: "#dc2626", status: "disabled", lastActive: daysAgo(40) },
];

export const userById = (id: string) => users.find((u) => u.id === id);

/* ------------------------------------------------------------------ */
/* Plans                                                               */
/* ------------------------------------------------------------------ */
export const plans: Plan[] = [
  {
    id: "monthly",
    name: "Monthly",
    price: 12,
    duration: "per month",
    benefits: ["All daily & weekly newsletters", "Full archive access", "Community Q&A"],
    active: true,
    subscribers: 1840,
  },
  {
    id: "quarterly",
    name: "Quarterly",
    price: 30,
    duration: "per quarter",
    benefits: ["Everything in Monthly", "Quarterly deep-dive reports", "Priority support"],
    active: true,
    subscribers: 960,
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 99,
    duration: "per year",
    benefits: ["Everything in Quarterly", "Exclusive IPO analysis", "1:1 analyst office hours", "2 months free"],
    active: true,
    subscribers: 1420,
  },
];

/* ------------------------------------------------------------------ */
/* Newsletters                                                         */
/* ------------------------------------------------------------------ */
const b = (type: ContentBlock["type"], data: Record<string, any>): ContentBlock => ({
  id: `blk_${Math.floor(rand() * 1e9).toString(36)}`,
  type,
  data,
});

const marketBriefBlocks = (): ContentBlock[] => [
  b("number-highlight", { value: "+0.9%", label: "NIFTY 50 closed higher", trend: "up" }),
  b("market-summary", {
    indices: [
      { name: "NIFTY 50", value: "24,010", change: "+0.9%" },
      { name: "SENSEX", value: "79,240", change: "+0.8%" },
      { name: "BANK NIFTY", value: "51,120", change: "+1.1%" },
    ],
  }),
  b("heading", { text: "What moved the market", level: 2 }),
  b("paragraph", { text: "Indian equities extended gains for a third straight session as banking and IT majors led the advance. Foreign institutional flows turned positive after last week's outflows, and cooling US yields gave risk assets room to run." }),
  b("stocks-to-watch", {
    items: [
      { ticker: "HDFCBANK", note: "Q1 earnings Thursday", change: "+0.8%" },
      { ticker: "INFY", note: "Guidance raise expected", change: "+1.9%" },
      { ticker: "RELIANCE", note: "Retail demerger news", change: "+1.2%" },
    ],
  }),
  b("callout", { tone: "info", title: "The day ahead", text: "RBI policy decision at 10:00 AM IST. Consensus expects rates on hold; watch the commentary on inflation." }),
];

export const newsletters: Newsletter[] = [
  {
    id: "n1",
    title: "Markets rally as RBI holds rates steady",
    subtitle: "Banks and IT lead a broad-based advance ahead of earnings",
    slug: "markets-rally-rbi-holds-rates",
    category: "Markets",
    template: "daily-market-brief",
    authorId: "u3",
    coverImage: "",
    readingTime: 4,
    status: "published",
    visibility: "free",
    blocks: marketBriefBlocks(),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    publishDate: daysAgo(1),
    scheduledFor: null,
    stats: { opens: 18240, clicks: 3120, openRate: 62.4, clickRate: 17.1, reads: 14200 },
  },
  {
    id: "n2",
    title: "The Weekly Wrap: Rotation into value picks up",
    subtitle: "Five charts that defined the trading week",
    slug: "weekly-wrap-rotation-into-value",
    category: "Macro",
    template: "weekly-wrap",
    authorId: "u4",
    coverImage: "",
    readingTime: 7,
    status: "published",
    visibility: "monthly",
    blocks: [
      b("heading", { text: "The week in five charts", level: 2 }),
      b("paragraph", { text: "Value outperformed growth by the widest margin since March as investors repositioned ahead of the earnings season." }),
      b("chart", { title: "Value vs Growth — 5 day relative", series: [100, 101, 103, 102, 105, 107, 109] }),
      b("quote", { text: "The rotation is real, but it's early. Positioning is still crowded in mega-cap tech.", cite: "Neha Sharma, Trinance" }),
    ],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    publishDate: daysAgo(3),
    scheduledFor: null,
    stats: { opens: 15980, clicks: 4210, openRate: 58.9, clickRate: 26.3, reads: 11040 },
  },
  {
    id: "n3",
    title: "IPO Deep Dive: Zerolytics files for a ₹6,200 cr listing",
    subtitle: "Valuation, risks, and how the anchor book is shaping up",
    slug: "ipo-zerolytics-listing",
    category: "IPO & Listings",
    template: "ipo-analysis",
    authorId: "u4",
    coverImage: "",
    readingTime: 11,
    status: "published",
    visibility: "yearly",
    blocks: [
      b("callout", { tone: "warning", title: "Subscriber exclusive", text: "This analysis is available to Yearly members." }),
      b("heading", { text: "The offer at a glance", level: 2 }),
      b("table", { headers: ["Metric", "Value"], rows: [["Issue size", "₹6,200 cr"], ["Price band", "₹540–₹570"], ["P/E (FY26E)", "38x"], ["Anchor demand", "4.2x"]] }),
      b("paragraph", { text: "Zerolytics is the third data-infrastructure company to file this quarter, and by far the largest. Growth has been rapid but margins remain thin." }),
    ],
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
    publishDate: daysAgo(4),
    scheduledFor: null,
    stats: { opens: 9240, clicks: 2870, openRate: 71.2, clickRate: 31.1, reads: 7010 },
  },
  {
    id: "n4",
    title: "Crypto Update: ETH staking yields compress",
    subtitle: "What the latest on-chain data says about validator economics",
    slug: "crypto-eth-staking-yields",
    category: "Crypto",
    template: "crypto-update",
    authorId: "u5",
    coverImage: "",
    readingTime: 6,
    status: "scheduled",
    visibility: "monthly",
    blocks: [
      b("number-highlight", { value: "3.1%", label: "ETH staking yield (30d avg)", trend: "down" }),
      b("paragraph", { text: "Staking yields have compressed as the validator set grows. We break down what it means for institutional allocators." }),
    ],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(0),
    publishDate: null,
    scheduledFor: daysFromNow(1),
    stats: { opens: 0, clicks: 0, openRate: 0, clickRate: 0, reads: 0 },
  },
  {
    id: "n5",
    title: "Breaking: Central bank surprises with a 25bps cut",
    subtitle: "First move in the easing cycle — markets react",
    slug: "breaking-25bps-cut",
    category: "Markets",
    template: "breaking-news",
    authorId: "u3",
    coverImage: "",
    readingTime: 3,
    status: "scheduled",
    visibility: "free",
    blocks: [
      b("callout", { tone: "danger", title: "Developing story", text: "We will update this alert as the press conference continues." }),
      b("paragraph", { text: "In a move that caught most economists off guard, the central bank delivered its first rate cut of the cycle." }),
    ],
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
    publishDate: null,
    scheduledFor: daysFromNow(2),
    stats: { opens: 0, clicks: 0, openRate: 0, clickRate: 0, reads: 0 },
  },
  {
    id: "n6",
    title: "Stock Research: Is HDFC Bank's re-rating justified?",
    subtitle: "A full thesis on the post-merger franchise",
    slug: "stock-research-hdfc-bank",
    category: "Equities",
    template: "stock-research",
    authorId: "u6",
    coverImage: "",
    readingTime: 14,
    status: "draft",
    visibility: "yearly",
    blocks: [
      b("heading", { text: "Thesis in one line", level: 2 }),
      b("paragraph", { text: "The market is under-pricing deposit franchise durability post-merger. We think there's 18% upside over 12 months." }),
    ],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(0),
    publishDate: null,
    scheduledFor: null,
    stats: { opens: 0, clicks: 0, openRate: 0, clickRate: 0, reads: 0 },
  },
  {
    id: "n7",
    title: "Daily Market Brief — draft for Aug 8",
    subtitle: "Pre-market snapshot",
    slug: "daily-brief-aug-8",
    category: "Markets",
    template: "daily-market-brief",
    authorId: "u5",
    coverImage: "",
    readingTime: 4,
    status: "draft",
    visibility: "free",
    blocks: marketBriefBlocks(),
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
    publishDate: null,
    scheduledFor: null,
    stats: { opens: 0, clicks: 0, openRate: 0, clickRate: 0, reads: 0 },
  },
  {
    id: "n8",
    title: "Special Report: The coming capex supercycle",
    subtitle: "Why the next decade of infrastructure spend matters",
    slug: "special-report-capex-supercycle",
    category: "Macro",
    template: "special-report",
    authorId: "u4",
    coverImage: "",
    readingTime: 18,
    status: "published",
    visibility: "quarterly",
    blocks: [
      b("heading", { text: "A generational shift", level: 2 }),
      b("paragraph", { text: "Public and private capital expenditure is inflecting after a decade of underinvestment. We map the winners." }),
      b("chart", { title: "Gross fixed capital formation (% GDP)", series: [28, 28, 29, 30, 31, 33, 34] }),
    ],
    createdAt: daysAgo(12),
    updatedAt: daysAgo(10),
    publishDate: daysAgo(10),
    scheduledFor: null,
    stats: { opens: 13120, clicks: 3980, openRate: 66.8, clickRate: 30.3, reads: 9800 },
  },
  {
    id: "n9",
    title: "Weekly Wrap: Small-caps cool off",
    subtitle: "Profit-taking hits the broader market",
    slug: "weekly-wrap-smallcaps-cool",
    category: "Markets",
    template: "weekly-wrap",
    authorId: "u3",
    coverImage: "",
    readingTime: 6,
    status: "archived",
    visibility: "monthly",
    blocks: [b("paragraph", { text: "After a torrid run, small-caps saw their first weekly decline in two months." })],
    createdAt: daysAgo(45),
    updatedAt: daysAgo(45),
    publishDate: daysAgo(44),
    scheduledFor: null,
    stats: { opens: 14020, clicks: 3100, openRate: 55.1, clickRate: 22.1, reads: 9200 },
  },
];

/* ------------------------------------------------------------------ */
/* Subscribers                                                         */
/* ------------------------------------------------------------------ */
const FIRST = ["Aditya", "Sneha", "Rahul", "Ananya", "Kabir", "Isha", "Manav", "Riya", "Dev", "Tara", "Yash", "Meera", "Aarav", "Kiara", "Nikhil", "Sara", "Aryan", "Zara", "Ved", "Anaya", "Reyansh", "Diya", "Kabir", "Myra", "Advait"];
const LAST = ["Sharma", "Patel", "Reddy", "Gupta", "Nair", "Menon", "Rao", "Iyer", "Desai", "Khan", "Bose", "Chopra", "Malhotra", "Verma", "Joshi", "Pillai", "Ghosh", "Kaur"];
const CITIES = ["Mumbai", "Bengaluru", "Delhi", "Pune", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Gurugram", "Singapore", "Dubai", "London"];
const METHODS = ["Visa •••• 4242", "Mastercard •••• 5518", "UPI — GPay", "Amex •••• 1009", "Visa •••• 8821"];

function makeSubscriber(i: number) {
  const first = pick(FIRST);
  const last = pick(LAST);
  const name = `${first} ${last}`;
  const planRoll = rand();
  const plan = planRoll < 0.32 ? "free" : planRoll < 0.55 ? "monthly" : planRoll < 0.78 ? "quarterly" : "yearly";
  const statusRoll = rand();
  let status: Subscriber["status"];
  if (plan === "free") status = statusRoll < 0.9 ? "active" : "cancelled";
  else if (statusRoll < 0.74) status = "active";
  else if (statusRoll < 0.84) status = "trialing";
  else if (statusRoll < 0.92) status = "past_due";
  else if (statusRoll < 0.97) status = "cancelled";
  else status = "suspended";

  const joined = between(2, 700);
  const priceMap: Record<string, number> = { free: 0, monthly: 12, quarterly: 30, yearly: 99 };
  const cycles = plan === "free" ? 0 : between(1, 8);
  const lifetimeSpend = priceMap[plan] * cycles;

  const payments = Array.from({ length: cycles }).map((_, p) => ({
    id: `pay_${i}_${p}`,
    date: daysAgo(joined - p * (plan === "monthly" ? 30 : plan === "quarterly" ? 90 : 365)),
    amount: priceMap[plan],
    plan: plan.charAt(0).toUpperCase() + plan.slice(1),
    status: (rand() < 0.94 ? "paid" : rand() < 0.6 ? "failed" : "refunded") as any,
    method: pick(METHODS),
  }));

  const activity = [
    { id: `act_${i}_1`, date: daysAgo(joined), label: "Subscribed to Trinance", type: "subscription" as const },
    { id: `act_${i}_2`, date: daysAgo(between(0, joined)), label: "Opened 'The Weekly Wrap'", type: "email" as const },
    { id: `act_${i}_3`, date: daysAgo(between(0, joined)), label: "Clicked a link in 'Daily Market Brief'", type: "email" as const },
  ];
  if (plan !== "free") {
    activity.unshift({ id: `act_${i}_0`, date: payments[0]?.date ?? daysAgo(joined), label: `Payment received — ${plan}`, type: "payment" as any });
  }

  return {
    id: `sub_${i.toString().padStart(3, "0")}`,
    name,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${between(1, 99)}@example.com`,
    plan,
    status,
    renewalDate:
      plan === "free" || status === "cancelled"
        ? null
        : daysFromNow(between(3, plan === "yearly" ? 300 : plan === "quarterly" ? 80 : 28)),
    lifetimeSpend,
    joinedDate: daysAgo(joined),
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
    location: pick(CITIES),
    payments: payments.reverse(),
    activity: activity.sort((a, z) => +new Date(z.date) - +new Date(a.date)),
    notes: rand() < 0.2 ? "High-engagement reader. Candidate for annual upsell." : "",
  };
}

export const subscribers = Array.from({ length: 54 }).map((_, i) => makeSubscriber(i + 1));

/* ------------------------------------------------------------------ */
/* Audit log                                                           */
/* ------------------------------------------------------------------ */
export const auditLog: AuditEntry[] = [
  { id: "a1", actorId: "u3", action: "published", target: "Markets rally as RBI holds rates steady", date: daysAgo(1) },
  { id: "a2", actorId: "u4", action: "scheduled", target: "Crypto Update: ETH staking yields compress", date: daysAgo(0) },
  { id: "a3", actorId: "u1", action: "invited", target: "divya@trinance.com (Writer)", date: daysAgo(6) },
  { id: "a4", actorId: "u2", action: "updated plan", target: "Yearly — price changed to $99", date: daysAgo(8) },
  { id: "a5", actorId: "u3", action: "archived", target: "Weekly Wrap: Small-caps cool off", date: daysAgo(45) },
  { id: "a6", actorId: "u1", action: "disabled user", target: "rohan@trinance.com", date: daysAgo(40) },
  { id: "a7", actorId: "u5", action: "created draft", target: "Daily Market Brief — draft for Aug 8", date: daysAgo(0) },
  { id: "a8", actorId: "u6", action: "created draft", target: "Stock Research: Is HDFC Bank's re-rating justified?", date: daysAgo(2) },
];
