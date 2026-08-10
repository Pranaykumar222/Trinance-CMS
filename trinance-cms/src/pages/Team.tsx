import { useState } from "react";
import { toast } from "sonner";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABEL, ROLE_DESCRIPTION } from "@/lib/constants";
import type { Role, User } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { RoleBadge } from "@/components/common/Badges";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, MoreHorizontal, Ban, RefreshCw, Shield, History } from "lucide-react";
import { userById } from "@/data/seed";
import { formatDateTime, relativeTime } from "@/lib/utils";

const ROLES: Role[] = ["owner", "admin", "editor", "writer"];

export default function Team() {
  const { users, audit, inviteUser, updateUser } = useData();
  const { user: me } = useAuth();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("writer");
  const [toDisable, setToDisable] = useState<User | null>(null);

  const sendInvite = async () => {
    if (!email.trim()) { toast.error("Enter an email to invite."); return; }
    await inviteUser(name.trim() || email.split("@")[0], email.trim(), role);
    toast.success("Invitation sent", { description: `${email} · ${ROLE_LABEL[role]}` });
    setInviteOpen(false);
    setName(""); setEmail(""); setRole("writer");
  };

  const changeRole = async (u: User, r: Role) => {
    await updateUser({ ...u, role: r });
    toast.success(`${u.name} is now ${ROLE_LABEL[r]}`);
  };
  const toggleDisabled = async (u: User) => {
    const status = u.status === "disabled" ? "active" : "disabled";
    await updateUser({ ...u, status });
    toast.success(status === "disabled" ? `${u.name} disabled` : `${u.name} re-enabled`);
  };

  const activeCount = users.filter((u) => u.status === "active").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Invite teammates and manage roles and permissions."
        actions={<Button onClick={() => setInviteOpen(true)}><UserPlus className="size-4" /> Invite member</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Members</CardTitle>
              <Badge variant="secondary">{activeCount} active</Badge>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Last active</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={u.name} color={u.avatarColor} className="size-9" />
                          <div>
                            <p className="font-medium text-foreground">{u.name} {u.id === me.id && <span className="text-xs text-muted-foreground">(you)</span>}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><RoleBadge role={u.role} /></TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={u.status === "active" ? "success" : u.status === "invited" ? "warning" : "muted"} dot className="capitalize">{u.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {u.status === "invited" ? "Pending" : relativeTime(u.lastActive)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" disabled={u.id === me.id}><MoreHorizontal className="size-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Change role</DropdownMenuLabel>
                            {ROLES.map((r) => (
                              <DropdownMenuItem key={r} onClick={() => changeRole(u, r)}>
                                <Shield className="size-4" /> {ROLE_LABEL[r]}
                                {u.role === r && <span className="ml-auto text-xs text-primary">current</span>}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem destructive={u.status !== "disabled"} onClick={() => u.status === "disabled" ? toggleDisabled(u) : setToDisable(u)}>
                              {u.status === "disabled" ? <><RefreshCw className="size-4" /> Re-enable</> : <><Ban className="size-4" /> Disable</>}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Permission matrix */}
          <Card>
            <CardHeader><CardTitle>Roles & permissions</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {ROLES.map((r) => (
                  <div key={r} className="rounded-xl border border-border p-4">
                    <div className="mb-1.5 flex items-center gap-2"><RoleBadge role={r} /></div>
                    <p className="text-sm text-muted-foreground">{ROLE_DESCRIPTION[r]}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity log */}
        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <History className="size-4 text-muted-foreground" />
            <CardTitle>Activity log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {audit.map((a, i) => {
                const actor = userById(a.actorId);
                return (
                  <div key={a.id} className="relative flex gap-3 pb-4">
                    {i < audit.length - 1 && <span className="absolute left-[15px] top-8 h-full w-px bg-border" />}
                    <InitialsAvatar name={actor?.name ?? "?"} color={actor?.avatarColor ?? "#888"} className="z-10 size-8 text-[10px]" />
                    <div className="min-w-0 pt-0.5">
                      <p className="text-sm">
                        <span className="font-medium">{actor?.name ?? "Someone"}</span>{" "}
                        <span className="text-muted-foreground">{a.action}</span>
                      </p>
                      <p className="truncate text-sm text-foreground">{a.target}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(a.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a team member</DialogTitle>
            <DialogDescription>They'll receive an email invitation to join your Trinance workspace.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="inv-name">Full name</Label>
              <Input id="inv-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-email">Email</Label>
              <Input id="inv-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@trinance.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.filter((r) => r !== "owner").map((r) => (
                    <SelectItem key={r} value={r}>
                      <span className="font-medium">{ROLE_LABEL[r]}</span> — <span className="text-muted-foreground">{ROLE_DESCRIPTION[r]}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={sendInvite}>Send invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDisable}
        onOpenChange={(o) => !o && setToDisable(null)}
        title="Disable this member?"
        description={toDisable ? `${toDisable.name} will lose access until re-enabled.` : ""}
        confirmLabel="Disable"
        destructive
        onConfirm={() => toDisable && toggleDisabled(toDisable)}
      />
    </div>
  );
}
