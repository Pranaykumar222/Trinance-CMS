import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { CAN, TEMPLATE_NAME, CATEGORIES } from "@/lib/constants";
import { userById } from "@/data/seed";
import type { Newsletter, NewsletterStatus } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { NewsletterStatusBadge, VisibilityBadge } from "@/components/common/Badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { InitialsAvatar } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  PenSquare,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Send,
  Archive,
  Newspaper,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

type SortKey = "updated" | "title" | "opens";
const PAGE_SIZE = 8;

const TABS: { value: NewsletterStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export default function NewslettersList() {
  const { loading, newsletters, deleteNewsletter, duplicateNewsletter, updateNewsletterStatus, pushAudit } = useData();
  const { role, user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<NewsletterStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("updated");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = useState<Newsletter | null>(null);
  const [bulkDelete, setBulkDelete] = useState(false);

  const filtered = useMemo(() => {
    let list = [...newsletters];
    if (tab !== "all") list = list.filter((n) => n.status === tab);
    if (category !== "all") list = list.filter((n) => n.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (n) => n.title.toLowerCase().includes(q) || n.subtitle.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "opens") return b.stats.opens - a.stats.opens;
      return +new Date(b.updatedAt) - +new Date(a.updatedAt);
    });
    return list;
  }, [newsletters, tab, category, query, sort]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: newsletters.length };
    for (const t of TABS) if (t.value !== "all") c[t.value] = newsletters.filter((n) => n.status === t.value).length;
    return c;
  }, [newsletters]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allOnPageSelected = paged.length > 0 && paged.every((n) => selected.has(n.id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) paged.forEach((n) => next.delete(n.id));
      else paged.forEach((n) => next.add(n.id));
      return next;
    });
  };
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleDelete = async (n: Newsletter) => {
    await deleteNewsletter(n.id);
    pushAudit({ actorId: user.id, action: "deleted", target: n.title });
    toast.success("Newsletter deleted", { description: n.title });
  };

  const handleDuplicate = async (n: Newsletter) => {
    const copy = await duplicateNewsletter(n.id);
    if (copy) toast.success("Duplicated as draft", { description: copy.title });
  };

  const handlePublish = async (n: Newsletter) => {
    await updateNewsletterStatus(n.id, "published");
    pushAudit({ actorId: user.id, action: "published", target: n.title });
    toast.success("Published", { description: `${n.title} is now live.` });
  };

  const handleArchive = async (n: Newsletter) => {
    await updateNewsletterStatus(n.id, "archived");
    toast.success("Archived", { description: n.title });
  };

  const runBulkDelete = async () => {
    const ids = [...selected];
    await Promise.all(ids.map((id) => deleteNewsletter(id)));
    toast.success(`Deleted ${ids.length} newsletter${ids.length > 1 ? "s" : ""}`);
    setSelected(new Set());
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Newsletters"
        description="Draft, schedule, and publish across every Trinance format."
        actions={
          <Button onClick={() => navigate("/newsletters/new")}>
            <PenSquare className="size-4" /> New Newsletter
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={tab} onValueChange={(v) => { setTab(v as any); setPage(1); }}>
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
                <span className="ml-1.5 rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground">
                  {counts[t.value] ?? 0}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search newsletters…"
              className="w-full pl-9 sm:w-56"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <Filter className="size-4 opacity-60" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[150px]">
              <ArrowUpDown className="size-4 opacity-60" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Last edited</SelectItem>
              <SelectItem value="title">Title (A–Z)</SelectItem>
              <SelectItem value="opens">Most opens</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-accent px-4 py-2.5 text-sm animate-fade-in">
          <span className="font-medium text-accent-foreground">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>Clear</Button>
            {CAN.deleteNewsletter(role) && (
              <Button size="sm" variant="destructive" onClick={() => setBulkDelete(true)}>
                <Trash2 className="size-4" /> Delete
              </Button>
            )}
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="No newsletters here yet"
            description={query || category !== "all" ? "Try adjusting your search or filters." : "Create your first newsletter to get started."}
            action={<Button onClick={() => navigate("/newsletters/new")}><PenSquare className="size-4" /> New Newsletter</Button>}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allOnPageSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Visibility</TableHead>
                <TableHead className="hidden xl:table-cell">Author</TableHead>
                <TableHead className="hidden lg:table-cell">Last edited</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((n) => {
                const author = userById(n.authorId);
                return (
                  <TableRow key={n.id} data-state={selected.has(n.id) ? "selected" : undefined}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.has(n.id)} onCheckedChange={() => toggleOne(n.id)} aria-label={`Select ${n.title}`} />
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => navigate(`/newsletters/${n.id}/edit`)}>
                      <p className="font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{TEMPLATE_NAME[n.template]} · {n.readingTime} min read</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell"><NewsletterStatusBadge status={n.status} /></TableCell>
                    <TableCell className="hidden lg:table-cell"><VisibilityBadge visibility={n.visibility} /></TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex items-center gap-2">
                        <InitialsAvatar name={author?.name ?? "?"} color={author?.avatarColor ?? "#888"} className="size-7" />
                        <span className="text-sm">{author?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {formatDate(n.updatedAt)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => navigate(`/newsletters/${n.id}/edit`)}>
                            <Pencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(n)}>
                            <Copy className="size-4" /> Duplicate
                          </DropdownMenuItem>
                          {CAN.publish(role) && n.status !== "published" && (
                            <DropdownMenuItem onClick={() => handlePublish(n)}>
                              <Send className="size-4" /> Publish now
                            </DropdownMenuItem>
                          )}
                          {n.status !== "archived" && (
                            <DropdownMenuItem onClick={() => handleArchive(n)}>
                              <Archive className="size-4" /> Archive
                            </DropdownMenuItem>
                          )}
                          {CAN.deleteNewsletter(role) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem destructive onClick={() => setToDelete(n)}>
                                <Trash2 className="size-4" /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {filtered.length > PAGE_SIZE && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete this newsletter?"
        description={toDelete ? `“${toDelete.title}” will be permanently removed. This can't be undone.` : ""}
        confirmLabel="Delete"
        destructive
        onConfirm={() => toDelete && handleDelete(toDelete)}
      />
      <ConfirmDialog
        open={bulkDelete}
        onOpenChange={setBulkDelete}
        title={`Delete ${selected.size} newsletters?`}
        description="The selected newsletters will be permanently removed. This can't be undone."
        confirmLabel="Delete all"
        destructive
        onConfirm={runBulkDelete}
      />
    </div>
  );
}
