export type Role = "owner" | "admin" | "editor" | "writer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
  status: "active" | "disabled" | "invited";
  lastActive: string;
}

export type NewsletterStatus = "draft" | "scheduled" | "published" | "archived";
export type Visibility = "free" | "monthly" | "quarterly" | "yearly";

export type NewsletterTemplate =
  | "daily-market-brief"
  | "weekly-wrap"
  | "breaking-news"
  | "ipo-analysis"
  | "stock-research"
  | "crypto-update"
  | "special-report";

export type BlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "quote"
  | "divider"
  | "callout"
  | "table"
  | "chart"
  | "number-highlight"
  | "stocks-to-watch"
  | "market-summary"
  | "economic-calendar"
  | "cta-button";

export interface ContentBlock {
  id: string;
  type: BlockType;
  data: Record<string, any>;
}

export interface Newsletter {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  category: string;
  template: NewsletterTemplate;
  authorId: string;
  coverImage: string;
  readingTime: number;
  status: NewsletterStatus;
  visibility: Visibility;
  blocks: ContentBlock[];
  createdAt: string;
  updatedAt: string;
  publishDate: string | null;
  scheduledFor: string | null;
  stats: { opens: number; clicks: number; openRate: number; clickRate: number; reads: number };
}

export type PlanId = "monthly" | "quarterly" | "yearly";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  duration: string;
  benefits: string[];
  active: boolean;
  subscribers: number;
}

export type SubscriberStatus = "active" | "trialing" | "past_due" | "suspended" | "cancelled";

export interface Payment {
  id: string;
  date: string;
  amount: number;
  plan: string;
  status: "paid" | "failed" | "refunded";
  method: string;
}

export interface ActivityEvent {
  id: string;
  date: string;
  label: string;
  type: "subscription" | "payment" | "email" | "note" | "system";
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  plan: "free" | PlanId;
  status: SubscriberStatus;
  renewalDate: string | null;
  lifetimeSpend: number;
  joinedDate: string;
  avatarColor: string;
  location: string;
  payments: Payment[];
  activity: ActivityEvent[];
  notes: string;
}

export interface AuditEntry {
  id: string;
  actorId: string;
  action: string;
  target: string;
  date: string;
}
