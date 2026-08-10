import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useData } from "@/context/DataContext";
import type { Subscriber, SubscriberStatus } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { SubscriberStatusBadge } from "@/components/common/Badges";
import { SubscriberDrawer } from "@/components/subscribers/SubscriberDrawer";
import { PlansManager } from "@/components/subscribers/PlansManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InitialsAvatar } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Users,
  BadgeDollarSign,
  Wallet,
  MoreHorizontal,
  Eye,
  Ban,
  RefreshCw,
  Trash2,
  Download,
  UserX,
} from "lucide-react";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

const PAGE_SIZE = 10;
const STATUS_OPTIONS: (SubscriberStatus | "all")[] = ["all", "active", "trialing", "past_due", "suspended", "cancelled"];

export default function Subscribers() {
  const { loading, subscribers, plans, setSubscriberStatus, deleteSubscriber, updateSubscriber } = useData();
  const [params] = useSearchParams();

  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<Subscriber | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Subscriber | null>(null);

  useEffect(() => {
    const q = params.get("q");
    if (q) setQuery(q);
  }, [params]);

  const filtered = useMemo(() => {
    let list = [...subscribers];
    if (plan !== "all") list = list.filter((s) => s.plan === plan);
    if (status !== "all") list = list.filter((s) => s.status === status);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    }
    return list.sort((a, b) => +new Date(b.joinedDate) - +new Date(a.joinedDate));
  }, [subscribers, plan, status, query]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalRevenue = subscribers.reduce((s, x) => s + x.lifetimeSpend, 0);
  const activePaid = subscribers.filter((s) => s.plan !== "free" && s.status === "active").length;

  const openDrawer = (s: Subscriber) => { setActive(s); setDrawerOpen(true); };

  const suspend = async (s: Subscriber) => {
    await setSubscriberStatus(s.id, "suspended");
    setActive({ ...s, status: "suspended" });
    toast.success("Subscriber suspended", { description: s.name });
  };
  const reactivate = async (s: Subscriber) => {
    await setSubscriberStatus(s.id, "active");
    setActive({ ...s, status: "active" });
    toast.success("Subscriber reactivated", { description: s.name });
  };
  const remove = async (s: Subscriber) => {
    await deleteSubscriber(s.id);
    toast.success("Subscriber deleted", { description: s.name });
  };
  const saveNotes = async (s: Subscriber, notes: string) => {
    await updateSubscriber({ ...s, notes });
    setActive({ ...s, notes });
    toast.success("Notes saved");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscribers"
        description="Manage your audience, plans, and billing."
        actions={<Button variant="outline" onClick={() => toast.success("Export started", { description: "Your CSV will be emailed shortly." })}><Download className="size-4" /> Export CSV</Button>}
      />

      <Tabs defaultValue="subscribers">
        <TabsList>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="plans">Subscription plans</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard loading={loading} label="Total subscribers" value={formatNumber(subscribers.length)} icon={Users} hint="in this workspace" />
            <StatCard loading={loading} label="Active paid" value={formatNumber(activePaid)} icon={BadgeDollarSign} hint="currently active" />
            <StatCard loading={loading} label="Lifetime revenue" value={formatCurrency(totalRevenue)} icon={Wallet} hint="from these subscribers" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name or email…" className="pl-9" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
            </div>
            <Select value={plan} onValueChange={(v) => { setPlan(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Plan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s === "all" ? "All statuses" : s.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="overflow-hidden">
            {loading ? (
              <div className="space-y-2 p-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : filtered.length === 0 ? (
              <EmptyState icon={UserX} title="No subscribers found" description="Try adjusting your search or filters." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Renewal</TableHead>
                    <TableHead className="hidden lg:table-cell">Lifetime spend</TableHead>
                    <TableHead className="hidden xl:table-cell">Joined</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((s) => (
                    <TableRow key={s.id} className="cursor-pointer" onClick={() => openDrawer(s)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={s.name} color={s.avatarColor} className="size-8" />
                          <div>
                            <p className="font-medium text-foreground">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell"><Badge variant={s.plan === "free" ? "secondary" : "default"} className="capitalize">{s.plan}</Badge></TableCell>
                      <TableCell><SubscriberStatusBadge status={s.status} /></TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{s.renewalDate ? formatDate(s.renewalDate) : "—"}</TableCell>
                      <TableCell className="hidden text-sm font-medium lg:table-cell">{formatCurrency(s.lifetimeSpend)}</TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">{formatDate(s.joinedDate)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => openDrawer(s)}><Eye className="size-4" /> View details</DropdownMenuItem>
                            {s.status === "suspended" ? (
                              <DropdownMenuItem onClick={() => reactivate(s)}><RefreshCw className="size-4" /> Reactivate</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => suspend(s)}><Ban className="size-4" /> Suspend</DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem destructive onClick={() => setToDelete(s)}><Trash2 className="size-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>

          {filtered.length > PAGE_SIZE && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          )}
        </TabsContent>

        <TabsContent value="plans">
          <PlansManager plans={plans} />
        </TabsContent>
      </Tabs>

      <SubscriberDrawer
        subscriber={active}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSuspend={suspend}
        onReactivate={reactivate}
        onSaveNotes={saveNotes}
      />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete this subscriber?"
        description={toDelete ? `${toDelete.name} will be permanently removed. This can't be undone.` : ""}
        confirmLabel="Delete"
        destructive
        onConfirm={() => toDelete && remove(toDelete)}
      />
    </div>
  );
}
