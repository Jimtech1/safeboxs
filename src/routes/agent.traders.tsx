import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, CheckCircle2, ArrowDownToLine, ArrowUpFromLine, Pencil, Ban, RotateCcw, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNaira, markets, currentAgent } from "@/lib/mockData";
import { tradersStore, useTraders } from "@/lib/agentStore";
import { findTraderById, getTransactions, updateTraderById } from "@/lib/mockTraderData";
import { virtualAccountFor } from "@/lib/yieldData";
import { toast } from "sonner";
import type { Trader } from "@/lib/mockData";

export const Route = createFileRoute("/agent/traders")({
  head: () => ({ meta: [
    { title: "My Traders | SafeBox Agent" },
    { name: "description", content: "Register and manage the traders on your route." },
    { property: "og:title", content: "My Traders | SafeBox Agent" },
    { property: "og:description", content: "Register and manage the traders on your route." },
  ]}),
  component: AgentTraders,
});

const mask = (p: string) => p.slice(0, 4) + "***" + p.slice(-3);

function AgentTraders() {
  const traders = useTraders();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Trader | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    bvn: "",
    market: currentAgent.market,
    stallNumber: "",
    nextOfKin: "",
  });

  const filtered = useMemo(() => {
    const list = traders.slice(0, 60);
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter((t) => t.name.toLowerCase().includes(needle) || t.phone.includes(needle));
  }, [q, traders]);

  const reset = () => setForm({ firstName: "", lastName: "", phone: "", bvn: "", market: currentAgent.market, stallNumber: "", nextOfKin: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = `${form.firstName} ${form.lastName}`.trim();
    if (!name || !form.phone || form.bvn.length < 11) {
      toast.error("Please complete all required fields.");
      return;
    }
    tradersStore.add({ name, phone: form.phone, market: form.market });
    toast.success(`Trader ${name} onboarded. Welcome SMS sent.`);
    setOpen(false);
    reset();
  };

  // Refresh selected trader with the freshest record whenever the list updates.
  const liveSelected = selected ? traders.find((t) => t.id === selected.id) ?? selected : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">My Traders</h1>
          <p className="text-xs text-muted-foreground">{traders.length} on your roster</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />Add
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or phone" className="pl-9 bg-card" />
      </div>

      <Card className="divide-y">
        {filtered.map((t) => (
          <button
            key={t.id}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-cream transition"
            onClick={() => setSelected(t)}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary font-semibold">{t.name.charAt(0)}</div>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{mask(t.phone)} • {t.lastTxn}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm text-primary">{formatNaira(t.balance)}</p>
              {t.status === "Suspended" && <Badge variant="outline" className="mt-1 text-[10px] border-destructive text-destructive">Deactivated</Badge>}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No traders match your search.</div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add a new trader</DialogTitle>
            <DialogDescription>Onboard a trader to SafeBox. They'll receive an SMS welcome with their account details.</DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={submit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First name *</Label>
                <Input className="mt-1" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              <div>
                <Label>Last name *</Label>
                <Input className="mt-1" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label>Phone number *</Label>
              <Input type="tel" className="mt-1" placeholder="0801 234 5678" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} required />
            </div>
            <div>
              <Label>BVN *</Label>
              <Input className="mt-1" placeholder="11 digits" maxLength={11} value={form.bvn} onChange={(e) => setForm({ ...form, bvn: e.target.value.replace(/\D/g, "") })} required />
            </div>
            <div>
              <Label>Market</Label>
              <Select value={form.market} onValueChange={(v) => setForm({ ...form, market: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {markets.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Stall number</Label>
                <Input className="mt-1" placeholder="B-42" value={form.stallNumber} onChange={(e) => setForm({ ...form, stallNumber: e.target.value })} />
              </div>
              <div>
                <Label>Next of kin phone</Label>
                <Input type="tel" className="mt-1" placeholder="0802 ..." value={form.nextOfKin} onChange={(e) => setForm({ ...form, nextOfKin: e.target.value })} />
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-md bg-cream p-3 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <span>By submitting, you confirm the trader has provided consent and a valid means of ID. KYC will be auto-verified against the BVN.</span>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">Onboard Trader</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <TraderDetail trader={liveSelected} onClose={() => setSelected(null)} />
    </div>
  );
}

function TraderDetail({ trader, onClose }: { trader: Trader | null; onClose: () => void }) {
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", market: "" });
  const [confirmStatus, setConfirmStatus] = useState(false);

  if (!trader) return null;

  const full = findTraderById(trader.id);
  const txns = getTransactions(trader.id).slice(0, 8);
  const va = full ? virtualAccountFor(full.id, full.name) : null;
  const isActive = trader.status !== "Suspended";

  const openEdit = () => {
    setEditForm({ name: trader.name, market: trader.market });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!editForm.name.trim()) { toast.error("Name is required."); return; }
    updateTraderById(trader.id, { name: editForm.name.trim(), market: editForm.market });
    toast.success("Trader details updated.");
    setEditOpen(false);
  };

  const toggleStatus = () => {
    updateTraderById(trader.id, { status: isActive ? "suspended" : "active" });
    toast.success(isActive ? "Trader deactivated." : "Trader reactivated.");
    setConfirmStatus(false);
  };

  return (
    <>
      <Dialog open={!!trader} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-md max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {trader.name}
              {full?.kycStatus && <Badge variant="outline" className="text-[10px]">{full.kycStatus}</Badge>}
              {!isActive && <Badge variant="outline" className="text-[10px] border-destructive text-destructive">Deactivated</Badge>}
            </DialogTitle>
            <DialogDescription>{mask(trader.phone)} • {trader.market}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Balance</p>
              <p className="text-lg font-bold text-primary">{formatNaira(trader.balance)}</p>
            </Card>
            <Card className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total saved</p>
              <p className="text-lg font-bold">{formatNaira(full?.totalSaved ?? 0)}</p>
            </Card>
            <Card className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Streak</p>
              <p className="text-lg font-bold">{full?.streakDays ?? 0} days</p>
            </Card>
            <Card className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">KYC status</p>
              <p className="text-sm font-semibold mt-1">{full?.kycStatus ?? "Not set"}</p>
            </Card>
          </div>

          {va && (
            <Card className="p-3 bg-cream/60">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Wallet className="h-3 w-3" /> Virtual account</p>
              <p className="text-sm font-semibold mt-1">{va.bankName} • {va.accountNumber}</p>
              <p className="text-xs text-muted-foreground">{va.accountName}</p>
            </Card>
          )}

          <div>
            <p className="text-sm font-semibold mb-2">Recent transactions</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {txns.length === 0 && <p className="text-xs text-muted-foreground">No transactions yet.</p>}
              {txns.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm border-b pb-1.5 last:border-0">
                  <div>
                    <p className="font-medium">{t.description}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(t.date).toLocaleDateString("en-NG", { day: "2-digit", month: "short" })}</p>
                  </div>
                  <span className={t.type === "Withdrawal" ? "text-destructive font-semibold" : "text-success font-semibold"}>
                    {t.type === "Withdrawal" ? "-" : "+"}{formatNaira(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="border-success text-success">
              <Link to="/agent/deposit"><ArrowDownToLine className="h-4 w-4 mr-2" />Deposit</Link>
            </Button>
            <Button asChild variant="outline" className="border-destructive text-destructive">
              <Link to="/agent/withdraw"><ArrowUpFromLine className="h-4 w-4 mr-2" />Withdraw</Link>
            </Button>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" onClick={openEdit}><Pencil className="h-4 w-4 mr-2" />Edit</Button>
            <Button
              variant="outline"
              className={isActive ? "border-destructive text-destructive" : "border-success text-success"}
              onClick={() => setConfirmStatus(true)}
            >
              {isActive ? <><Ban className="h-4 w-4 mr-2" />Deactivate</> : <><RotateCcw className="h-4 w-4 mr-2" />Reactivate</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit trader</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input className="mt-1" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
            <div>
              <Label>Market</Label>
              <Select value={editForm.market} onValueChange={(v) => setEditForm({ ...editForm, market: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{markets.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmStatus} onOpenChange={setConfirmStatus}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isActive ? "Deactivate trader?" : "Reactivate trader?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isActive
                ? `${trader.name} will no longer be able to transact until reactivated.`
                : `${trader.name} will regain full access to deposits and withdrawals.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={toggleStatus} className={isActive ? "bg-destructive hover:bg-destructive/90" : "bg-success hover:bg-success/90"}>
              {isActive ? "Deactivate" : "Reactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
