import { useState } from "react";
import { toast } from "sonner";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/components/common/PageHeader";
import { PlansManager } from "@/components/subscribers/PlansManager";
import { RoleBadge } from "@/components/common/Badges";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ROLE_DESCRIPTION, TEMPLATES } from "@/lib/constants";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";
import {
  Settings as SettingsIcon,
  Palette,
  Mail,
  Newspaper,
  CreditCard,
  ShieldCheck,
  Plug,
  KeyRound,
  DatabaseBackup,
  Copy,
  Check,
  Download,
} from "lucide-react";

const SECTIONS = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "email", label: "Email", icon: Mail },
  { id: "templates", label: "Templates", icon: Newspaper },
  { id: "plans", label: "Plans", icon: CreditCard },
  { id: "roles", label: "Roles & permissions", icon: ShieldCheck },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "api", label: "API keys", icon: KeyRound },
  { id: "backup", label: "Backup & export", icon: DatabaseBackup },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function Settings() {
  const { plans } = useData();
  const [section, setSection] = useState<SectionId>("general");

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure your Trinance workspace." />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                section === s.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <s.icon className="size-4" /> {s.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {section === "general" && <GeneralSettings />}
          {section === "branding" && <BrandingSettings />}
          {section === "email" && <EmailSettings />}
          {section === "templates" && <TemplatesSettings />}
          {section === "plans" && <PlansManager plans={plans} />}
          {section === "roles" && <RolesSettings />}
          {section === "integrations" && <IntegrationsSettings />}
          {section === "api" && <ApiSettings />}
          {section === "backup" && <BackupSettings />}
        </div>
      </div>
    </div>
  );
}

function SaveCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle>{description && <CardDescription>{description}</CardDescription>}</CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function GeneralSettings() {
  return (
    <SaveCard title="General" description="Basic workspace information.">
      <Row label="Workspace name"><Input defaultValue="Trinance" /></Row>
      <Row label="Public site URL"><Input defaultValue="https://trinance.com" /></Row>
      <Row label="Support email"><Input defaultValue="support@trinance.com" /></Row>
      <Row label="Default timezone"><Input defaultValue="Asia/Kolkata (GMT+5:30)" /></Row>
      <div className="flex justify-end"><Button onClick={() => toast.success("General settings saved")}>Save changes</Button></div>
    </SaveCard>
  );
}

function BrandingSettings() {
  return (
    <SaveCard title="Branding" description="How Trinance appears to readers.">
      <Row label="Logo">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">T</div>
          <Button variant="outline" onClick={() => toast.success("Upload dialog would open here")}>Upload new logo</Button>
        </div>
      </Row>
      <Separator />
      <Row label="Primary color">
        <div className="flex items-center gap-3">
          <span className="size-8 rounded-lg border border-border" style={{ background: "#4f46e5" }} />
          <Input defaultValue="#4F46E5" className="w-40" />
        </div>
      </Row>
      <Row label="Tagline"><Input defaultValue="Sharp financial newsletters for modern investors." /></Row>
      <div className="flex justify-end"><Button onClick={() => toast.success("Branding saved")}>Save changes</Button></div>
    </SaveCard>
  );
}

function EmailSettings() {
  return (
    <SaveCard title="Email configuration" description="Sender identity and delivery settings.">
      <Row label="From name"><Input defaultValue="Trinance" /></Row>
      <Row label="From email"><Input defaultValue="newsletters@trinance.com" /></Row>
      <Row label="Reply-to"><Input defaultValue="editors@trinance.com" /></Row>
      <Row label="Footer text" hint="Appears at the bottom of every newsletter."><Textarea rows={3} defaultValue="© 2026 Trinance. You're receiving this because you subscribed at trinance.com." /></Row>
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div><p className="text-sm font-medium">Send a test email before publishing</p><p className="text-xs text-muted-foreground">Always deliver a preview to editors first.</p></div>
        <Switch defaultChecked />
      </div>
      <div className="flex justify-end"><Button onClick={() => toast.success("Email settings saved")}>Save changes</Button></div>
    </SaveCard>
  );
}

function TemplatesSettings() {
  return (
    <SaveCard title="Newsletter templates" description="Enable or disable the templates writers can choose from.">
      <div className="space-y-2">
        {TEMPLATES.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
            <span className="flex size-9 items-center justify-center rounded-lg text-lg" style={{ background: `${t.accent}18` }}>{t.emoji}</span>
            <div className="flex-1"><p className="text-sm font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{t.description}</p></div>
            <Switch defaultChecked onCheckedChange={(v) => toast.success(`${t.name} ${v ? "enabled" : "disabled"}`)} />
          </div>
        ))}
      </div>
    </SaveCard>
  );
}

function RolesSettings() {
  const roles: Role[] = ["owner", "admin", "editor", "writer"];
  const perms = [
    { label: "Create & edit drafts", roles: ["owner", "admin", "editor", "writer"] },
    { label: "Publish & schedule", roles: ["owner", "admin", "editor"] },
    { label: "Manage subscribers", roles: ["owner", "admin", "editor"] },
    { label: "View analytics", roles: ["owner", "admin", "editor"] },
    { label: "Manage team", roles: ["owner", "admin"] },
    { label: "Manage settings & billing", roles: ["owner", "admin"] },
  ];
  return (
    <SaveCard title="Roles & permissions" description="What each role can do in Trinance.">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 text-left font-semibold text-muted-foreground">Permission</th>
              {roles.map((r) => <th key={r} className="px-2 py-2 text-center"><RoleBadge role={r} /></th>)}
            </tr>
          </thead>
          <tbody>
            {perms.map((p) => (
              <tr key={p.label} className="border-b border-border last:border-0">
                <td className="py-3 font-medium">{p.label}</td>
                {roles.map((r) => (
                  <td key={r} className="px-2 py-3 text-center">
                    {p.roles.includes(r) ? <Check className="mx-auto size-4 text-success" /> : <span className="text-muted-foreground/40">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SaveCard>
  );
}

function IntegrationsSettings() {
  const integrations = [
    { name: "Stripe", desc: "Billing & subscription payments", connected: true },
    { name: "Razorpay", desc: "Payments for Indian subscribers", connected: true },
    { name: "Slack", desc: "Publishing notifications", connected: false },
    { name: "Google Analytics", desc: "Website traffic", connected: false },
    { name: "Zapier", desc: "Automate workflows", connected: false },
  ];
  return (
    <SaveCard title="Integrations" description="Connect Trinance to the tools you already use.">
      <div className="space-y-2">
        {integrations.map((i) => (
          <div key={i.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-secondary font-semibold">{i.name[0]}</div>
            <div className="flex-1"><p className="text-sm font-medium">{i.name}</p><p className="text-xs text-muted-foreground">{i.desc}</p></div>
            {i.connected ? <Badge variant="success" dot>Connected</Badge> : <Button variant="outline" size="sm" onClick={() => toast.success(`Connect ${i.name}`)}>Connect</Button>}
          </div>
        ))}
      </div>
    </SaveCard>
  );
}

function ApiSettings() {
  const [copied, setCopied] = useState(false);
  const key = "tri_live_sk_9f2c4a1e7b6d8x0y3z5w";
  const masked = key.slice(0, 12) + "•".repeat(14);
  const copy = () => {
    navigator.clipboard?.writeText(key).catch(() => {});
    setCopied(true);
    toast.success("API key copied");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <SaveCard title="API keys" description="Use these to access the Trinance API.">
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <div><p className="text-sm font-medium">Live secret key</p><p className="font-mono text-xs text-muted-foreground">{masked}</p></div>
          <Button variant="outline" size="sm" onClick={copy}>{copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy"}</Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Rotating your key will invalidate the current one immediately.</p>
        <Button variant="outline" onClick={() => toast.success("New API key generated")}>Rotate key</Button>
      </div>
    </SaveCard>
  );
}

function BackupSettings() {
  return (
    <SaveCard title="Backup & export" description="Export your data or download a full backup.">
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { label: "Export subscribers (CSV)", desc: "All subscriber records" },
          { label: "Export newsletters (JSON)", desc: "All content and metadata" },
          { label: "Export analytics (CSV)", desc: "Engagement and revenue data" },
          { label: "Full workspace backup", desc: "Everything, zipped" },
        ].map((x) => (
          <div key={x.label} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div><p className="text-sm font-medium">{x.label}</p><p className="text-xs text-muted-foreground">{x.desc}</p></div>
            <Button variant="outline" size="icon-sm" onClick={() => toast.success("Export started", { description: x.label })}><Download className="size-4" /></Button>
          </div>
        ))}
      </div>
      <Separator />
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div><p className="text-sm font-medium">Automatic weekly backups</p><p className="text-xs text-muted-foreground">Delivered to your storage bucket every Sunday.</p></div>
        <Switch defaultChecked />
      </div>
    </SaveCard>
  );
}
