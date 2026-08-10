import type { BlockType, NewsletterTemplate, Role } from "@/types";
import {
  LayoutDashboard,
  Newspaper,
  Users,
  BarChart3,
  UserCog,
  Settings,
  type LucideIcon,
  Heading,
  Pilcrow,
  Image as ImageIcon,
  Quote,
  Minus,
  Megaphone,
  Table as TableIcon,
  LineChart,
  Hash,
  TrendingUp,
  Newspaper as MarketIcon,
  CalendarDays,
  MousePointerClick,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, roles: ["owner", "admin", "editor", "writer"] },
  { label: "Newsletters", to: "/newsletters", icon: Newspaper, roles: ["owner", "admin", "editor", "writer"] },
  { label: "Subscribers", to: "/subscribers", icon: Users, roles: ["owner", "admin", "editor"] },
  { label: "Analytics", to: "/analytics", icon: BarChart3, roles: ["owner", "admin", "editor"] },
  { label: "Team", to: "/team", icon: UserCog, roles: ["owner", "admin"] },
  { label: "Settings", to: "/settings", icon: Settings, roles: ["owner", "admin"] },
];

export const TEMPLATES: {
  id: NewsletterTemplate;
  name: string;
  description: string;
  accent: string;
  emoji: string;
}[] = [
  { id: "daily-market-brief", name: "Daily Market Brief", description: "Fast pre-market snapshot: indices, movers, and the day ahead.", accent: "#4f46e5", emoji: "📈" },
  { id: "weekly-wrap", name: "Weekly Wrap", description: "The week in markets — themes, winners, losers, and what's next.", accent: "#0ea5e9", emoji: "🗓️" },
  { id: "breaking-news", name: "Breaking News", description: "Single-story alert for market-moving events.", accent: "#dc2626", emoji: "🚨" },
  { id: "ipo-analysis", name: "IPO Analysis", description: "Deep dive on an upcoming or recent public offering.", accent: "#9333ea", emoji: "🏦" },
  { id: "stock-research", name: "Stock Research", description: "Long-form thesis on a single company or sector.", accent: "#16a34a", emoji: "🔬" },
  { id: "crypto-update", name: "Crypto Update", description: "Digital asset moves, on-chain data, and regulation.", accent: "#f59e0b", emoji: "₿" },
  { id: "special-report", name: "Special Report", description: "Flagship editorial for macro themes and big ideas.", accent: "#0f172a", emoji: "⭐" },
];

export const TEMPLATE_NAME: Record<NewsletterTemplate, string> = TEMPLATES.reduce(
  (acc, t) => ({ ...acc, [t.id]: t.name }),
  {} as Record<NewsletterTemplate, string>
);

export const CATEGORIES = [
  "Markets",
  "Equities",
  "Macro",
  "Crypto",
  "IPO & Listings",
  "Commodities",
  "Personal Finance",
  "Technology",
];

export interface BlockDef {
  type: BlockType;
  label: string;
  icon: LucideIcon;
  group: "Basic" | "Media" | "Financial";
  defaultData: Record<string, any>;
}

export const BLOCK_DEFS: BlockDef[] = [
  { type: "heading", label: "Heading", icon: Heading, group: "Basic", defaultData: { text: "Section heading", level: 2 } },
  { type: "paragraph", label: "Paragraph", icon: Pilcrow, group: "Basic", defaultData: { text: "Write your commentary here. Explain the numbers and what they mean for readers." } },
  { type: "quote", label: "Quote", icon: Quote, group: "Basic", defaultData: { text: "Markets can remain irrational longer than you can remain solvent.", cite: "John Maynard Keynes" } },
  { type: "divider", label: "Divider", icon: Minus, group: "Basic", defaultData: {} },
  { type: "callout", label: "Callout", icon: Megaphone, group: "Basic", defaultData: { tone: "info", title: "Editor's note", text: "Key takeaway for readers." } },
  { type: "image", label: "Image", icon: ImageIcon, group: "Media", defaultData: { url: "", caption: "Image caption" } },
  { type: "cta-button", label: "CTA Button", icon: MousePointerClick, group: "Media", defaultData: { label: "Read the full analysis", url: "https://trinance.com" } },
  { type: "number-highlight", label: "Number Highlight", icon: Hash, group: "Financial", defaultData: { value: "+2.4%", label: "NIFTY 50 today", trend: "up" } },
  { type: "table", label: "Table", icon: TableIcon, group: "Financial", defaultData: { headers: ["Ticker", "Price", "Change"], rows: [["RELIANCE", "₹2,940", "+1.2%"], ["TCS", "₹3,880", "-0.4%"]] } },
  { type: "chart", label: "Chart", icon: LineChart, group: "Financial", defaultData: { title: "NIFTY 50 — 30 day", series: [42, 44, 43, 46, 48, 47, 50, 52, 51, 55] } },
  { type: "stocks-to-watch", label: "Stocks to Watch", icon: TrendingUp, group: "Financial", defaultData: { items: [{ ticker: "HDFCBANK", note: "Earnings Thursday", change: "+0.8%" }, { ticker: "INFY", note: "Guidance raise expected", change: "+1.9%" }] } },
  { type: "market-summary", label: "Market Summary", icon: MarketIcon, group: "Financial", defaultData: { indices: [{ name: "NIFTY 50", value: "24,010", change: "+0.9%" }, { name: "SENSEX", value: "79,240", change: "+0.8%" }, { name: "BANK NIFTY", value: "51,120", change: "+1.1%" }] } },
  { type: "economic-calendar", label: "Economic Calendar", icon: CalendarDays, group: "Financial", defaultData: { events: [{ time: "9:00 AM", label: "RBI policy decision", impact: "high" }, { time: "6:00 PM", label: "US CPI release", impact: "high" }] } },
];

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  writer: "Writer",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  owner: "Full access to every module and billing.",
  admin: "Manage newsletters, subscribers, analytics, and settings.",
  editor: "Create, edit, review, schedule, and publish newsletters.",
  writer: "Create and edit drafts only. Cannot publish.",
};

/** Permission matrix used across the app for gating actions. */
export const CAN = {
  publish: (r: Role) => r === "owner" || r === "admin" || r === "editor",
  viewSubscribers: (r: Role) => r !== "writer",
  viewAnalytics: (r: Role) => r !== "writer",
  manageTeam: (r: Role) => r === "owner" || r === "admin",
  manageSettings: (r: Role) => r === "owner" || r === "admin",
  deleteNewsletter: (r: Role) => r === "owner" || r === "admin" || r === "editor",
};
