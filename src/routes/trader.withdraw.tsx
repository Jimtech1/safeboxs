import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, ArrowUpFromLine } from "lucide-react";
import { getCurrentTrader, getWithdrawals, requestWithdrawal, cancelWithdrawal, formatNGN, type Trader, type WithdrawalRequest } from "@/lib/mockTraderData";
import { toast } from "sonner";

export const Route = createFileRoute("/trader/withdraw")({
  head: () => ({ meta: [
    { title: "Request Withdrawal | SafeBox" },
    { name: "description", content: "Request cash from your agent or a transfer to your bank." },
    { property: "og:title", content: "Request Withdrawal | SafeBox" },
    { property: "og:description", content: "Request cash from your agent or a transfer to your bank." },
  ]}),
  component: TraderWithdraw,
});

function TraderWithdraw() {
  const [trader, setTrader] = useState<Trader | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<WithdrawalRequest["method"]>("Agent cash pickup");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState<WithdrawalRequest | null>(null);

  const refresh = () => {
    const t = getCurrentTrader();
    setTrader(t);
    if (t) setWithdrawals(getWithdrawals(t.id));
  };
  useEffect(() => {
    refresh();
    window.addEventListener("trader-store-change", refresh);
    return () => window.removeEventListener("trader-store-change", refresh);
  }, []);

  if (!trader) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n <= 0) return toast.error("Enter a valid amount");
    const result = requestWithdrawal({ amount: n, method, note });
    if ("error" in result) return toast.error(result.error);
    setConfirmed(result);
    setAmount(""); setNote("");
    refresh();
  };

  const active = withdrawals.filter((w) => w.status === "Pending" || w.status === "Processing");
  const past = withdrawals.filter((w) => w.status !== "Pending" && w.status !== "Processing");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Request Withdrawal</h1>
        <p className="text-sm text-muted-foreground">Available balance: <span className="font-semibold text-primary">{formatNGN(trader.balance)}</span></p>
      </div>

      <Card className="p-6 max-w-2xl">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Amount (₦)</Label>
            <Input className="mt-1" type="number" min={1} max={trader.balance} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 10000" required />
            <p className="mt-1 text-xs text-muted-foreground">Max {formatNGN(trader.balance)}</p>
          </div>
          <div>
            <Label>Withdrawal method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as WithdrawalRequest["method"])}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Agent cash pickup">From agent (cash pickup)</SelectItem>
                <SelectItem value="Bank transfer" disabled={!trader.bankAccount}>
                  Bank transfer {!trader.bankAccount && "(add account first)"}
                </SelectItem>
              </SelectContent>
            </Select>
            {method === "Bank transfer" && trader.bankAccount && (
              <p className="mt-1 text-xs text-muted-foreground">→ {trader.bankAccount.bankName} • {trader.bankAccount.accountNumber}</p>
            )}
          </div>
          <div>
            <Label>Note (optional)</Label>
            <Input className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What is this for?" />
          </div>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            <ArrowUpFromLine className="h-4 w-4 mr-2" /> Submit Request
          </Button>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b"><h2 className="font-semibold">Active Requests</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Request ID</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3 hidden md:table-cell">Requested</th>
                <th className="text-left p-3 hidden md:table-cell">Estimated</th>
                <th className="text-right p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {active.map((w) => (
                <tr key={w.id}>
                  <td className="p-3 font-mono text-xs">{w.id}</td>
                  <td className="p-3 text-right font-semibold">{formatNGN(w.amount)}</td>
                  <td className="p-3"><StatusBadge status={w.status} /></td>
                  <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{new Date(w.requestedAt).toLocaleString("en-NG")}</td>
                  <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{new Date(w.estimatedAt).toLocaleDateString("en-NG")}</td>
                  <td className="p-3 text-right">
                    {w.status === "Pending" && (
                      <Button size="sm" variant="outline" onClick={() => { cancelWithdrawal(w.id); toast.success("Request cancelled"); refresh(); }}>
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {active.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">No active withdrawal requests.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b"><h2 className="font-semibold">Withdrawal History</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Request ID</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3 hidden md:table-cell">Method</th>
                <th className="text-left p-3 hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {past.map((w) => (
                <tr key={w.id}>
                  <td className="p-3 font-mono text-xs">{w.id}</td>
                  <td className="p-3 text-right font-semibold">{formatNGN(w.amount)}</td>
                  <td className="p-3"><StatusBadge status={w.status} /></td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{w.method}</td>
                  <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">{new Date(w.requestedAt).toLocaleDateString("en-NG")}</td>
                </tr>
              ))}
              {past.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">No withdrawal history yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!confirmed} onOpenChange={() => setConfirmed(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-success" /> Request Submitted</DialogTitle>
          </DialogHeader>
          {confirmed && (
            <div className="space-y-2 text-sm">
              <Row label="Request ID" value={<span className="font-mono">{confirmed.id}</span>} />
              <Row label="Amount" value={<span className="font-semibold">{formatNGN(confirmed.amount)}</span>} />
              <Row label="Method" value={confirmed.method} />
              <Row label="Estimated processing" value="24–48 hours" />
              <p className="text-xs text-muted-foreground mt-2">You will receive an SMS when your withdrawal is ready.</p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setConfirmed(null)} className="bg-primary hover:bg-primary/90">Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex items-center justify-between border-b pb-1.5"><span className="text-muted-foreground">{label}</span>{value}</div>;
}

function StatusBadge({ status }: { status: WithdrawalRequest["status"] }) {
  const styles: Record<WithdrawalRequest["status"], string> = {
    Pending: "bg-warning/15 text-warning",
    Processing: "bg-primary/15 text-primary",
    Completed: "bg-success/15 text-success",
    Declined: "bg-destructive/15 text-destructive",
    Cancelled: "bg-muted text-muted-foreground",
  };
  return <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${styles[status]}`}>{status}</span>;
}
