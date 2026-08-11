import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InitialsAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useData } from "@/context/DataContext";
import { ROLE_LABEL, ROLE_DESCRIPTION } from "@/lib/constants";
import type { Role } from "@/types";
import {
  Search,
  Bell,
  Menu,
  Moon,
  Sun,
  Plus,
  LogOut,
  UserCircle,
  Repeat,
  Check,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn, relativeTime } from "@/lib/utils";

export function Topbar({
  onMenuClick,
  onOpenSearch,
  onQuickCreate,
}: {
  onMenuClick: () => void;
  onOpenSearch: () => void;
  onQuickCreate: () => void;
}) {
  const { user, role, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { newsletters } = useData();
  const navigate = useNavigate();
  const roles: Role[] = ["owner", "admin", "editor", "writer"];

  const isAdminOrOwner = role === "admin" || role === "owner";
  const drafts = newsletters.filter((n) => n.status === "draft");

  const notifications = [
    ...(isAdminOrOwner ? drafts.map((d) => ({
      id: `draft-${d.id}`,
      title: "Draft Needs Review",
      body: `“${d.title}” is ready for review.`,
      dateVal: new Date(d.updatedAt),
      isDraft: true,
      idVal: d.id,
    })) : []),
    { id: "static-1", title: "New paid subscriber", body: "Aditya Sharma upgraded to the Yearly plan.", dateVal: new Date(Date.now() - 240 * 60000), isDraft: false, idVal: "" },
    { id: "static-2", title: "Payment failed", body: "A Monthly renewal payment needs attention.", dateVal: new Date(Date.now() - 900 * 60000), isDraft: false, idVal: "" },
  ];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="size-5" />
      </Button>

      <button
        onClick={onOpenSearch}
        className="group flex h-9 flex-1 max-w-md items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm text-muted-foreground shadow-soft transition-colors hover:border-primary/40"
      >
        <Search className="size-4" />
        <span>Search newsletters, subscribers…</span>
        <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "light" ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="size-[18px]" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              <Badge variant="secondary">{notifications.length} new</Badge>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.isDraft) {
                      navigate(`/newsletters/${n.idVal}/edit`);
                    }
                  }}
                  className={cn(
                    "flex gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-secondary/50",
                    n.isDraft && "cursor-pointer"
                  )}
                >
                  <span className={cn("mt-1 size-2 shrink-0 rounded-full", n.isDraft ? "bg-warning" : "bg-primary")} />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-tight">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                    <p className="text-[11px] text-muted-foreground/70">{relativeTime(n.dateVal)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full">Mark all as read</Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button className="hidden gap-1.5 sm:flex" onClick={onQuickCreate}>
          <Plus className="size-4" /> Quick Create
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-secondary">
              <InitialsAvatar name={user.name} color={user.avatarColor} className="size-8" />
              <div className="hidden text-left leading-tight md:block">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-[11px] text-muted-foreground">{ROLE_LABEL[role]}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex items-center gap-2">
                <InitialsAvatar name={user.name} color={user.avatarColor} className="size-8" />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-foreground">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-1.5">
              <Repeat className="size-3.5" /> Switch role (demo)
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {roles.map((r) => (
                <DropdownMenuItem key={r} onClick={() => switchRole(r)}>
                  <span className="flex-1">
                    <span className="font-medium">{ROLE_LABEL[r]}</span>
                    <span className="block text-[11px] text-muted-foreground">{ROLE_DESCRIPTION[r]}</span>
                  </span>
                  {role === r && <Check className="size-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <UserCircle className="size-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <SettingsIcon className="size-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={logout}>
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
