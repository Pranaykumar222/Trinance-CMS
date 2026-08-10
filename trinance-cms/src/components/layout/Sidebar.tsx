import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PenSquare, X } from "lucide-react";

export function Sidebar({
  mobileOpen,
  onClose,
  onQuickCreate,
}: {
  mobileOpen: boolean;
  onClose: () => void;
  onQuickCreate: () => void;
}) {
  const { role } = useAuth();
  const items = NAV_ITEMS.filter((i) => i.roles.includes(role));

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary font-bold text-white">
              T
            </div>
            <div className="leading-tight">
              <p className="text-[15px] font-bold text-white">Trinance</p>
              <p className="text-[11px] font-medium text-sidebar-foreground/60">Editorial CMS</p>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" className="text-sidebar-foreground hover:bg-white/10 hover:text-white lg:hidden" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="px-3 pb-2">
          <Button className="w-full justify-start gap-2" onClick={onQuickCreate}>
            <PenSquare className="size-4" /> New Newsletter
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-white shadow-soft"
                    : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white"
                )
              }
            >
              <item.icon className="size-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-lg bg-white/5 p-3">
            <p className="text-xs font-semibold text-white">Publishing tip</p>
            <p className="mt-1 text-[11px] leading-relaxed text-sidebar-foreground/70">
              Press <kbd className="rounded bg-white/10 px-1">⌘K</kbd> anywhere to jump to a newsletter or run an action.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
