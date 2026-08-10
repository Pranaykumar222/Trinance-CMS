import { useAuth } from "@/context/AuthContext";
import { ROLE_LABEL, ROLE_DESCRIPTION } from "@/lib/constants";
import type { Role } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Crown, ShieldCheck, PenLine, FileText } from "lucide-react";

const ROLE_ICON: Record<Role, React.ReactNode> = {
  owner: <Crown className="size-4" />,
  admin: <ShieldCheck className="size-4" />,
  editor: <PenLine className="size-4" />,
  writer: <FileText className="size-4" />,
};

export default function Login() {
  const { login } = useAuth();
  const roles: Role[] = ["owner", "admin", "editor", "writer"];

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-sidebar p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary font-bold">T</div>
          <span className="text-lg font-bold">Trinance</span>
        </div>
        <div className="space-y-5">
          <h1 className="text-4xl font-bold leading-tight">
            The editorial home for Trinance's financial newsletters.
          </h1>
          <p className="max-w-md text-sidebar-foreground/70">
            Draft, review, schedule, and publish market-moving newsletters — with subscriber
            management, revenue analytics, and role-based access built in.
          </p>
          <div className="flex gap-6 pt-4">
            <Stat value="46K" label="Subscribers" />
            <Stat value="$142K" label="Monthly revenue" />
            <Stat value="62%" label="Avg. open rate" />
          </div>
        </div>
        <p className="text-xs text-sidebar-foreground/50">© 2026 Trinance. Internal use only.</p>
      </div>

      {/* Auth panel */}
      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center lg:hidden">
            <div className="mx-auto flex size-11 items-center justify-center rounded-lg bg-primary font-bold text-white">T</div>
            <h1 className="text-xl font-bold">Trinance CMS</h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your Trinance editorial workspace.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" defaultValue="shruti@trinance.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" defaultValue="password" />
            </div>
            <Button className="w-full" size="lg" onClick={() => login("owner")}>
              Sign in <ArrowRight className="size-4" />
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">Or explore a role (demo)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {roles.map((r) => (
              <Card
                key={r}
                onClick={() => login(r)}
                className="cursor-pointer p-3 transition-all hover:border-primary/50 hover:shadow-pop"
              >
                <div className="flex items-center gap-2 text-primary">
                  {ROLE_ICON[r]}
                  <span className="text-sm font-semibold text-foreground">{ROLE_LABEL[r]}</span>
                </div>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{ROLE_DESCRIPTION[r]}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-sidebar-foreground/60">{label}</p>
    </div>
  );
}
