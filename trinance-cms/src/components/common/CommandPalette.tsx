import * as React from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { NAV_ITEMS } from "@/lib/constants";
import {
  Newspaper,
  Users,
  PlusCircle,
  Moon,
  Sun,
  CornerDownLeft,
  Search,
} from "lucide-react";

export function CommandPalette({
  open,
  onOpenChange,
  onQuickCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuickCreate: () => void;
}) {
  const navigate = useNavigate();
  const { newsletters, subscribers } = useData();
  const { role } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const run = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  const navItems = NAV_ITEMS.filter((i) => i.roles.includes(role));

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command palette"
      className="fixed left-1/2 top-[15%] z-[60] w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover shadow-pop data-[state=open]:animate-slide-up"
    >
      <div className="flex items-center gap-2 border-b border-border px-4">
        <Search className="size-4 text-muted-foreground" />
        <Command.Input
          placeholder="Type a command or search…"
          className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">ESC</kbd>
      </div>
      <Command.List className="max-h-[360px] overflow-y-auto p-2">
        <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
          No results found.
        </Command.Empty>

        <Command.Group heading="Actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
          <PaletteItem onSelect={() => run(onQuickCreate)} icon={<PlusCircle className="size-4" />}>
            Create new newsletter
          </PaletteItem>
          <PaletteItem onSelect={() => run(toggleTheme)} icon={theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}>
            Toggle {theme === "light" ? "dark" : "light"} mode
          </PaletteItem>
        </Command.Group>

        <Command.Group heading="Navigate" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
          {navItems.map((item) => (
            <PaletteItem key={item.to} onSelect={() => run(() => navigate(item.to))} icon={<item.icon className="size-4" />}>
              Go to {item.label}
            </PaletteItem>
          ))}
        </Command.Group>

        <Command.Group heading="Newsletters" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
          {newsletters.slice(0, 6).map((n) => (
            <PaletteItem key={n.id} value={`nl ${n.title}`} onSelect={() => run(() => navigate(`/newsletters/${n.id}/edit`))} icon={<Newspaper className="size-4" />}>
              {n.title}
            </PaletteItem>
          ))}
        </Command.Group>

        {role !== "writer" && (
          <Command.Group heading="Subscribers" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
            {subscribers.slice(0, 5).map((s) => (
              <PaletteItem key={s.id} value={`sub ${s.name} ${s.email}`} onSelect={() => run(() => navigate(`/subscribers?q=${encodeURIComponent(s.email)}`))} icon={<Users className="size-4" />}>
                <span className="flex-1">{s.name}</span>
                <span className="text-xs text-muted-foreground">{s.email}</span>
              </PaletteItem>
            ))}
          </Command.Group>
        )}
      </Command.List>
      <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><CornerDownLeft className="size-3" /> to select</span>
        <span>Trinance CMS</span>
      </div>
    </Command.Dialog>
  );
}

function PaletteItem({
  children,
  onSelect,
  icon,
  value,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  icon: React.ReactNode;
  value?: string;
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm text-foreground outline-none data-[selected=true]:bg-secondary"
    >
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </Command.Item>
  );
}
