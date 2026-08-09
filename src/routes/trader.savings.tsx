import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, Target, ShieldCheck, ArrowRight, PiggyBank } from "lucide-react";
import {
  getCurrentTrader, getGoals, upsertGoal, deleteGoal, addToGoal, formatNGN,
  SAVINGS_PRODUCTS, getSavingsProduct, type Goal, type SavingsProductId,
} from "@/lib/mockTraderData";
import { toast } from "sonner";

export const Route = createFileRoute("/trader/savings")({
  head: () => ({
    meta: [
      { title: "Savings & Products — SafeBox" },
      { name: "description", content: "Grow your money with SafeVault, SafeGrowth and SafeLock, and track every savings goal in one place." },
      { property: "og:title", content: "Savings & Products — SafeBox" },
      { property: "og:description", content: "Choose a SafeBox savings product and track your goals." },
    ],
  }),
  component: TraderSavings,
});

const productStyles: Record<SavingsProductId, { card: string; chip: string; accent: string; btn: string }> = {
  safevault: {
    card: "border-accent/30 bg-accent/5",
    chip: "bg-accent/15 text-accent",
    accent: "text-accent",
    btn: "bg-accent text-accent-foreground hover:bg-accent/90",
  },
  safegrowth: {
    card: "border-primary/30 bg-primary/5",
    chip: "bg-primary/15 text-primary",
    accent: "text-primary",
    btn: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  safelock: {
    card: "border-gold/40 bg-gold/10",
    chip: "bg-gold/25 text-gold-foreground",
    accent: "text-gold-foreground",
    btn: "bg-gold text-gold-foreground hover:bg-gold/90",
  },
};

function TraderSavings() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [traderId, setTraderId] = useState<string>("");
  const [editing, setEditing] = useState<Goal | null>(null);
  const [isNew, setIsNew] = useState(true);
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

  const startNew = (product: SavingsProductId = "safevault") => {
    setEditing({ id: `G_${Date.now()}`, name: "", target: 0, current: 0, product });
    setIsNew(true);
    setOpen(true);
  };
  const startEdit = (g: Goal) => { setEditing(g); setIsNew(false); setOpen(true); };

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) return toast.error("Give your goal a name");
    if (editing.target <= 0) return toast.error("Target must be greater than zero");
    upsertGoal(traderId, { ...editing, name: editing.name.trim(), product: editing.product ?? "safevault" });
    toast.success(`Goal saved in ${getSavingsProduct(editing.product).name}`);
    setOpen(false); setEditing(null); refresh();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Savings</h1>
        <p className="text-sm text-muted-foreground">Pick a savings product, then set goals and watch them grow.</p>
      </div>

      {/* Savings products */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Savings Products</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {SAVINGS_PRODUCTS.map((p) => {
            const s = productStyles[p.id];
            return (
              <Card key={p.id} className={`relative p-5 border-2 ${s.card}`}>
                {p.badge && (
                  <span className="absolute -top-3 right-4 rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-gold-foreground shadow">
                    {p.badge}
                  </span>
                )}
                <p className="font-display text-lg font-bold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.tagline}</p>
                <p className={`mt-2 font-display text-2xl font-bold ${s.accent}`}>{p.rateLabel}</p>

                <div className="mt-4 space-y-2 rounded-xl bg-background/70 p-3 text-sm">
                  <Spec label="Interest Rate" value={p.rateLabel} />
                  <Spec label="Lock-in Period" value={p.lockIn} />
                  <Spec label="Liquidity" value={p.liquidity} />
                  <Spec
                    label="Funds Held By"
                    value={
                      <span className="inline-flex items-center gap-1 font-medium text-success">
                        <ShieldCheck className="h-3.5 w-3.5" /> Nomba MFB (NDIC Insured)
                      </span>
                    }
                  />
                  <Spec label="Early Exit" value={p.earlyExit} />
                </div>

                <Button onClick={() => startNew(p.id)} className={`mt-4 w-full min-h-11 ${s.btn}`}>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Goals */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Savings Goals</h2>
            <p className="text-sm text-muted-foreground">Every goal earns the rate of its savings product.</p>
          </div>
          <Button onClick={() => startNew()} className="min-h-11 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />Create New Goal
          </Button>
        </div>

        {goals.length === 0 ? (
          <Card className="p-10 text-center">
            <Target className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-3 font-medium">No goals yet</p>
            <p className="text-sm text-muted-foreground">Start saving toward something specific.</p>
            <Button onClick={() => startNew()} className="mt-4 min-h-11 bg-primary hover:bg-primary/90">Create your first goal</Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {goals.map((g) => {
              const pct = Math.min(100, (g.current / g.target) * 100);
              const product = getSavingsProduct(g.product);
              const s = productStyles[product.id];
              return (
                <Card key={g.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{g.name}</p>
                      <p className="text-xs text-muted-foreground">{formatNGN(g.current)} of {formatNGN(g.target)}</p>
                      {g.deadline && <p className="text-xs text-muted-foreground mt-0.5">By {new Date(g.deadline).toLocaleDateString("en-NG")}</p>}
                      <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${s.chip}`}>
                        {product.name} • {product.rateLabel}
                      </span>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button size="icon" variant="ghost" aria-label="Edit goal" onClick={() => startEdit(g)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" aria-label="Delete goal" onClick={() => { deleteGoal(traderId, g.id); toast.success("Goal deleted"); refresh(); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={pct} className="mt-4" />
                  <p className="mt-1 text-xs text-right text-muted-foreground">{Math.round(pct)}%</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[1000, 5000, 10000].map((a) => (
                      <Button key={a} variant="outline" className="min-h-11"
                        onClick={() => { addToGoal(traderId, g.id, a); toast.success(`Added ${formatNGN(a)} to ${product.name}`); refresh(); }}>
                        +{formatNGN(a)}
                      </Button>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{isNew ? "Create new goal" : "Edit goal"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Goal name</Label>
                <Input className="mt-1" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. New shop equipment" />
              </div>
              <div>
                <Label>Target amount (₦)</Label>
                <Input className="mt-1" type="number" inputMode="numeric" value={editing.target || ""} onChange={(e) => setEditing({ ...editing, target: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Target date (optional)</Label>
                <Input className="mt-1" type="date" value={editing.deadline ?? ""} onChange={(e) => setEditing({ ...editing, deadline: e.target.value || undefined })} />
              </div>
              <div>
                <Label>Savings product</Label>
                <Select value={editing.product ?? "safevault"} onValueChange={(v) => setEditing({ ...editing, product: v as SavingsProductId })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a product" /></SelectTrigger>
                  <SelectContent>
                    {SAVINGS_PRODUCTS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.rateLabel.replace(" per annum", " p.a.")} — {p.tagline})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getSavingsProduct(editing.product).liquidity} • Early exit: {getSavingsProduct(editing.product).earlyExit}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="min-h-11" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="min-h-11 bg-primary hover:bg-primary/90">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
