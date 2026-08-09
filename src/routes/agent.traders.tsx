import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNaira, markets, currentAgent } from "@/lib/mockData";
import { tradersStore, useTraders } from "@/lib/agentStore";
import { toast } from "sonner";

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
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or phone" className="pl-9 bg-white" />
      </div>

      <Card className="divide-y">
        {filtered.map((t) => (
          <div key={t.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary font-semibold">{t.name.charAt(0)}</div>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{mask(t.phone)} • {t.lastTxn}</p>
              </div>
            </div>
            <p className="font-semibold text-sm text-primary">{formatNaira(t.balance)}</p>
          </div>
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
    </div>
  );
}
