import { type LucideIcon, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  loading,
  onClick,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: number;
  hint?: string;
  loading?: boolean;
  onClick?: () => void;
}) {
  if (loading) {
    return (
      <Card className="p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-8 w-28" />
        <Skeleton className="mt-3 h-3 w-20" />
      </Card>
    );
  }

  const positive = (delta ?? 0) >= 0;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-5 transition-all",
        onClick && "cursor-pointer hover:border-primary/40 hover:shadow-pop"
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-[18px]" />
        </span>
      </div>
      <p className="mt-3 text-[28px] font-bold leading-tight tracking-tight text-foreground">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-semibold",
              positive ? "text-success" : "text-destructive"
            )}
          >
            {positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(delta)}%
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  );
}
