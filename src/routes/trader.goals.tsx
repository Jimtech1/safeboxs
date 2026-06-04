import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Target } from "lucide-react";
import { getCurrentTrader, getGoals, upsertGoal, deleteGoal, addToGoal, formatNGN, type Goal } from "@/lib/mockTraderData";
import { toast } from "sonner";

export const Route = createFileRoute("/trader/goals")({
  component: TraderGoals,
});

function TraderGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [traderId, setTraderId] = useState<string>("");
  const [editing, setEditing] = useState<Goal | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = () => {
    const t = getCurrentTrader();
    if (t) { setTraderId(t.id); setGoals(getGoals(t.id)); }
  };
  useEffect(() => {
    refresh();
    window.addEventListener("trader-store-change", refresh);
    return () => window.removeEventListener("trader-store-change", refresh);
  }, []);

  const startNew = () => { setEditing({ id: `G_${Date.now()}`, name: "", target: 0, current: 0 }); setOpen(true); };
  const startEdit = (g: Goal) => { setEditing(g); setOpen(true); };

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) return toast.error("Give your goal a name");
    if (editing.target <= 0) return toast.error("Target must be greater than zero");
    upsertGoal(traderId, editing);
    toast.success("Goal saved");
    setOpen(false); setEditing(null); refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Savings Goals</h1>
          <p className="text-sm text-muted-foreground">Set targets and track your progress.</p>
        </div>
        <Button onClick={startNew} className="bg-primary hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" />Create New Goal</Button>
      </div>

      {goals.length === 0 ? (
        <Card className="p-10 text-center">
          <Target className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="mt-3 font-medium">No goals yet</p>
          <p className="text-sm text-muted-foreground">Start saving toward something specific.</p>
          <Button onClick={startNew} className="mt-4 bg-primary hover:bg-primary/90">Create your first goal</Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((g) => {
            const pct = Math.min(100, (g.current / g.target) * 100);
            return (
              <Card key={g.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{g.name}</p>
                    <p className="text-xs text-muted-foreground">{formatNGN(g.current)} of {formatNGN(g.target)}</p>
                    {g.deadline && <p className="text-xs text-muted-foreground mt-0.5">By {new Date(g.deadline).toLocaleDateString("en-NG")}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(g)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => { deleteGoal(traderId, g.id); toast.success("Goal deleted"); refresh(); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <Progress value={pct} className="mt-4" />
                <p className="mt-1 text-xs text-right text-muted-foreground">{Math.round(pct)}%</p>
                <div className="mt-3 flex gap-2">
                  {[1000, 5000, 10000].map((a) => (
                    <Button key={a} size="sm" variant="outline" onClick={() => { addToGoal(traderId, g.id, a); toast.success(`Added ${formatNGN(a)}`); refresh(); }}>
                      +{formatNGN(a)}
                    </Button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.current ? "Edit goal" : "Create new goal"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Goal name</Label>
                <Input className="mt-1" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. New shop equipment" />
              </div>
              <div>
                <Label>Target amount (₦)</Label>
                <Input className="mt-1" type="number" value={editing.target || ""} onChange={(e) => setEditing({ ...editing, target: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Deadline (optional)</Label>
                <Input className="mt-1" type="date" value={editing.deadline ?? ""} onChange={(e) => setEditing({ ...editing, deadline: e.target.value || undefined })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-primary hover:bg-primary/90">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
