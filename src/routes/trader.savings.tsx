import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, Target, ShieldCheck, ArrowRight, PiggyBank, Wallet, Clock, Minus } from "lucide-react";
import {
  getCurrentTrader, getGoals, upsertGoal, deleteGoal, addToGoal, formatNGN, withdrawFromGoal,
  SAVINGS_PRODUCTS, getSavingsProduct, getPlacements, createPlacement, closePlacement,
  earlyExitPreview, projectedReturn, PRODUCT_TERMS,
  type Goal, type SavingsProductId, type Placement,
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

function daysRemaining(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

function TraderSavings() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [traderId, setTraderId] = useState<string>("");
  const [balance, setBalance] = useState(0);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [isNew, setIsNew] = useState(true);
  const [open, setOpen] = useState(false);

  // Purchase flow state
  const [purchaseProduct, setPurchaseProduct] = useState<SavingsProductId | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [purchaseTerm, setPurchaseTerm] = useState<number>(0);

  // Early exit state
  const [exitTarget, setExitTarget] = useState<Placement | null>(null);

  // Goal withdraw state
  const [withdrawGoal, setWithdrawGoal] = useState<Goal | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Goal delete state
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);

  const refresh = () => {
    const t = getCurrentTrader();
    if (t) {
      setTraderId(t.id);
      setGoals(getGoals(t.id));
      setPlacements(getPlacements(t.id));
      setBalance(t.balance);
    }
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

  const openPurchase = (productId: SavingsProductId) => {
    const terms = PRODUCT_TERMS[productId].termDays;
    setPurchaseProduct(productId);
    setPurchaseAmount("");
    setPurchaseTerm(terms[0]);
  };

  const submitPurchase = () => {
    if (!purchaseProduct) return;
    const amount = Number(purchaseAmount);
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    const res = createPlacement({ productId: purchaseProduct, amount, termDays: purchaseTerm });
    if ("error" in res) return toast.error(res.error);
    toast.success(`${formatNGN(amount)} placed in ${res.placement.productName}`);
    setPurchaseProduct(null);
    refresh();
  };

  const submitExit = () => {
    if (!exitTarget) return;
    const res = closePlacement(exitTarget.id);
    if ("error" in res) { toast.error(res.error); setExitTarget(null); return; }
    toast.success(`Payout of ${formatNGN(res.payout)} credited to your balance`);
    setExitTarget(null);
    refresh();
  };

  const submitGoalWithdraw = () => {
    if (!withdrawGoal) return;
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    const res = withdrawFromGoal(traderId, withdrawGoal.id, amount);
    if ("error" in res) return toast.error(res.error);
    toast.success(`${formatNGN(amount)} moved back to your balance`);
    setWithdrawGoal(null); setWithdrawAmount("");
    refresh();
  };

  const purchaseProductDef = purchaseProduct ? getSavingsProduct(purchaseProduct) : null;
  const purchaseAmountNum = Number(purchaseAmount) || 0;
  const purchaseProjected = purchaseProductDef ? projectedReturn(purchaseAmountNum, purchaseProductDef.rate, purchaseTerm) : 0;
  const purchasePenaltyPct = purchaseProduct ? PRODUCT_TERMS[purchaseProduct].penaltyPct : 0;

  const exitPreview = exitTarget ? earlyExitPreview(exitTarget) : null;
  const exitMatured = exitTarget ? new Date(exitTarget.maturesAt).getTime() <= Date.now() : false;

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

                <Button onClick={() => openPurchase(p.id)} className={`mt-4 w-full min-h-11 ${s.btn}`}>
                  Start saving <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Active placements */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Active Placements</h2>
        </div>
        {placements.filter((p) => p.status === "Active").length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            You have no active placements yet. Start saving in a product above.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {placements.filter((p) => p.status === "Active").map((p) => {
              const preview = earlyExitPreview(p);
              const remaining = daysRemaining(p.maturesAt);
              const matured = remaining <= 0;
              return (
                <Card key={p.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{p.productName}</p>
                      <p className="text-xs text-muted-foreground">Placed {formatNGN(p.amount)} · {p.termDays ? `${p.termDays} days` : "Flexible"}</p>
                    </div>
                    <Badge variant={matured ? "default" : "secondary"}>{matured ? "Matured" : "Active"}</Badge>
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <Spec label="Matures" value={new Date(p.maturesAt).toLocaleDateString("en-NG")} />
                    <Spec label="Days remaining" value={<span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{remaining}d</span>} />
                    <Spec label="Accrued value" value={formatNGN(p.amount + preview.accrued)} />
                  </div>
                  <Button variant="outline" className="mt-4 w-full min-h-11" onClick={() => setExitTarget(p)}>
                    {matured ? "Withdraw" : "Withdraw / early exit"}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
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
                      <Button size="icon" variant="ghost" aria-label="Delete goal" onClick={() => setDeleteTarget(g)}>
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
                  <Button variant="ghost" className="mt-2 w-full min-h-11" disabled={g.current <= 0}
                    onClick={() => { setWithdrawGoal(g); setWithdrawAmount(""); }}>
                    <Minus className="h-4 w-4 mr-2" />Withdraw from goal
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Create/edit goal dialog */}
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

      {/* Purchase / start saving dialog */}
      <Dialog open={!!purchaseProduct} onOpenChange={(v) => !v && setPurchaseProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Start saving in {purchaseProductDef?.name}</DialogTitle></DialogHeader>
          {purchaseProductDef && purchaseProduct && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Available balance: {formatNGN(balance)}</p>
              <div>
                <Label>Amount (₦)</Label>
                <Input className="mt-1" type="number" inputMode="numeric" min={1000} value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)} placeholder="e.g. 20000" />
              </div>
              {PRODUCT_TERMS[purchaseProduct].termDays.length > 1 || PRODUCT_TERMS[purchaseProduct].termDays[0] > 0 ? (
                <div>
                  <Label>Term</Label>
                  <Select value={String(purchaseTerm)} onValueChange={(v) => setPurchaseTerm(Number(v))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TERMS[purchaseProduct].termDays.map((d) => (
                        <SelectItem key={d} value={String(d)}>{d} days</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="rounded-xl bg-cream p-3 text-sm space-y-1.5">
                <Spec label="Lock-in" value={purchaseProductDef.lockIn} />
                <Spec label="Early-exit penalty" value={purchasePenaltyPct > 0 ? `${purchasePenaltyPct}%` : purchaseProductDef.earlyExit} />
                <Spec label="Projected return" value={<span className="font-semibold text-success">+{formatNGN(purchaseProjected)}</span>} />
                <Spec label="Value at maturity" value={<span className="font-semibold">{formatNGN(purchaseAmountNum + purchaseProjected)}</span>} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="min-h-11" onClick={() => setPurchaseProduct(null)}>Cancel</Button>
            <Button onClick={submitPurchase} className="min-h-11 bg-primary hover:bg-primary/90">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Early exit / withdraw placement alert */}
      <AlertDialog open={!!exitTarget} onOpenChange={(v) => !v && setExitTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{exitMatured ? "Withdraw matured placement" : "Withdraw before maturity?"}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-foreground">
                {exitTarget && exitPreview && (
                  <>
                    {!exitMatured && (
                      <p className="text-destructive">
                        Exiting now applies a {exitTarget.earlyExitPenaltyPct}% penalty ({formatNGN(exitPreview.penalty)}).
                      </p>
                    )}
                    <Spec label="Principal" value={formatNGN(exitTarget.amount)} />
                    <Spec label="Accrued interest" value={formatNGN(exitPreview.accrued)} />
                    {!exitMatured && <Spec label="Penalty" value={<span className="text-destructive">-{formatNGN(exitPreview.penalty)}</span>} />}
                    <Spec label="Net payout" value={<span className="font-semibold text-success">{formatNGN(exitMatured ? exitTarget.amount + exitPreview.accrued : exitPreview.payout)}</span>} />
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={submitExit}>Confirm withdrawal</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Withdraw from goal dialog */}
      <Dialog open={!!withdrawGoal} onOpenChange={(v) => !v && setWithdrawGoal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Withdraw from "{withdrawGoal?.name}"</DialogTitle></DialogHeader>
          {withdrawGoal && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Available in this goal: {formatNGN(withdrawGoal.current)}</p>
              <div>
                <Label>Amount (₦)</Label>
                <Input className="mt-1" type="number" inputMode="numeric" max={withdrawGoal.current}
                  value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="min-h-11" onClick={() => setWithdrawGoal(null)}>Cancel</Button>
            <Button onClick={submitGoalWithdraw} className="min-h-11 bg-primary hover:bg-primary/90">Withdraw</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete goal confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the goal. Any saved funds remain in your available balance and are not lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!deleteTarget) return;
              deleteGoal(traderId, deleteTarget.id);
              toast.success("Goal deleted");
              setDeleteTarget(null);
              refresh();
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
