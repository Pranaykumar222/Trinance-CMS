import { useState } from "react";
import { toast } from "sonner";
import type { Plan } from "@/types";
import { useData } from "@/context/DataContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Check, Pencil, Users } from "lucide-react";

export function PlansManager({ plans }: { plans: Plan[] }) {
  const { updatePlan } = useData();
  const [editing, setEditing] = useState<Plan | null>(null);
  const [price, setPrice] = useState(0);

  const openEdit = (p: Plan) => { setEditing(p); setPrice(p.price); };

  const toggleActive = async (p: Plan) => {
    await updatePlan({ ...p, active: !p.active });
    toast.success(`${p.name} plan ${p.active ? "deactivated" : "activated"}`);
  };

  const saveEdit = async () => {
    if (!editing) return;
    await updatePlan({ ...editing, price });
    toast.success(`${editing.name} plan updated`, { description: `New price: ${formatCurrency(price)}` });
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id} className={p.id === "yearly" ? "border-primary/40 ring-1 ring-primary/10" : ""}>
            <CardContent className="p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    {p.id === "yearly" && <Badge>Best value</Badge>}
                  </div>
                  <p className="mt-1 text-3xl font-bold">
                    {formatCurrency(p.price)}
                    <span className="text-sm font-normal text-muted-foreground"> {p.duration}</span>
                  </p>
                </div>
                <Badge variant={p.active ? "success" : "muted"} dot>{p.active ? "Active" : "Inactive"}</Badge>
              </div>

              <ul className="mb-5 space-y-2">
                {p.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm">
                <Users className="size-4 text-muted-foreground" />
                <span className="font-semibold">{formatNumber(p.subscribers)}</span>
                <span className="text-muted-foreground">subscribers</span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch checked={p.active} onCheckedChange={() => toggleActive(p)} id={`active-${p.id}`} />
                  <Label htmlFor={`active-${p.id}`} className="text-sm text-muted-foreground">Active</Label>
                </div>
                <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit {editing?.name} plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="price">Price ({editing?.duration})</Label>
            <div className="flex items-center rounded-lg border border-input bg-card px-3 shadow-soft focus-within:border-primary">
              <span className="text-sm text-muted-foreground">₹</span>
              <input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="h-9 flex-1 bg-transparent px-1 text-sm outline-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
