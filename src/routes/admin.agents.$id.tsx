import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { formatNaira } from "@/lib/mockData";
import { platformStore, usePlatform } from "@/lib/platformStore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/agents/$id")({
  head: () => ({ meta: [
    { title: "Agent Detail | SafeBox Admin" },
    { name: "description", content: "Agent float history, utilization and account controls." },
  ]}),
  component: AgentDetail,
});

function AgentDetail() {
  const { id } = useParams({ from: "/admin/agents/$id" });
  const state = usePlatform();
  const agent = state.agents.find((a) => a.id === id);
  const [statusConfirm, setStatusConfirm] = useState<"Suspended" | "Active" | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const floatTxns = useMemo(
    () => state.ledger.filter((t) => t.agentId === id && (t.kind === "FloatTopup" || t.kind === "FloatWithdraw")).slice(0, 30),
    [state.ledger, id],
  );
  const deposits = state.ledger.filter((t) => t.agentId === id && t.kind === "Deposit");
  const withdrawals = state.ledger.filter((t) => t.agentId === id && t.kind === "Withdrawal");

  if (!agent) {
    return (
      <div className="space-y-4">
        <Link to="/admin/agents" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to agents</Link>
        <Card className="p-6 text-sm text-muted-foreground">Agent not found.</Card>
      </div>
    );
  }

  const capacity = Math.max(agent.floatCapacity, 1);
  const utilPct = Math.min(100, Math.round((agent.floatUsedToday / capacity) * 100));
  const chartData = [
    { name: "Deposits", amount: deposits.reduce((s, t) => s + t.amount, 0) },
    { name: "Withdrawals", amount: withdrawals.reduce((s, t) => s + t.amount, 0) },
    { name: "Used today", amount: agent.floatUsedToday },
    { name: "Capacity", amount: agent.floatCapacity },
  ];

  const statusColor = agent.status === "Active" ? "bg-success" : agent.status === "Pending" ? "bg-warning" : "bg-destructive";

  return (
    <div className="space-y-6">
      <Link to="/admin/agents" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to agents</Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">{agent.name} <Badge className={statusColor}>{agent.status}</Badge></h1>
          <p className="text-sm text-muted-foreground">{agent.id} • {agent.market} • Float balance {formatNaira(agent.floatBalance)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAdjustOpen(true)}>Adjust float</Button>
          {agent.status === "Suspended" ? (
            <Button className="bg-primary hover:bg-primary/90" onClick={() => setStatusConfirm("Active")}>Activate</Button>
          ) : (
            <Button variant="outline" className="border-destructive text-destructive" onClick={() => setStatusConfirm("Suspended")}>Suspend</Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4"><p className="text-xs uppercase text-muted-foreground">Float balance</p><p className="text-xl font-bold">{formatNaira(agent.floatBalance)}</p></Card>
        <Card className="p-4"><p className="text-xs uppercase text-muted-foreground">Float capacity</p><p className="text-xl font-bold">{formatNaira(agent.floatCapacity)}</p></Card>
        <Card className="p-4"><p className="text-xs uppercase text-muted-foreground">Utilization today</p><p className="text-xl font-bold">{utilPct}%</p></Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Float utilization</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => formatNaira(v)} />
              <Bar dataKey="amount" fill={C["primary"]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b"><h3 className="font-semibold">Float transaction history</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-cream text-xs uppercase text-muted-foreground">
              <tr><th className="text-left p-3">When</th><th className="text-left p-3">Kind</th><th className="text-left p-3">Channel/Reason</th><th className="text-right p-3">Amount</th></tr>
            </thead>
            <tbody className="divide-y">
              {floatTxns.map((t) => (
                <tr key={t.id}>
                  <td className="p-3">{t.timestamp}</td>
                  <td className="p-3">{t.kind === "FloatTopup" ? "Top-up" : "Withdraw"}</td>
                  <td className="p-3 text-muted-foreground">{t.channel ?? t.reference ?? "—"}</td>
                  <td className={`p-3 text-right font-medium ${t.kind === "FloatTopup" ? "text-success" : "text-destructive"}`}>
                    {t.kind === "FloatTopup" ? "+" : "−"}{formatNaira(t.amount)}
                  </td>
                </tr>
              ))}
              {floatTxns.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No float activity yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adjust float for {agent.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Amount (use negative to debit, e.g. -5000)" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Textarea placeholder="Reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => {
              const delta = Number(amount);
              if (!Number.isFinite(delta) || delta === 0) return toast.error("Enter a valid amount");
              if (reason.trim().length < 3) return toast.error("Add a short reason");
              const res = platformStore.adjustAgentFloat(agent.id, delta, reason);
              if ("error" in res) return toast.error(res.error);
              toast.success("Float adjusted");
              setAdjustOpen(false); setAmount(""); setReason("");
            }}>Apply adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!statusConfirm} onOpenChange={(o) => !o && setStatusConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{statusConfirm === "Suspended" ? "Suspend" : "Activate"} {agent.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {statusConfirm === "Suspended" ? "They will lose access to their dashboard and float immediately." : "They will regain full dashboard access."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!statusConfirm) return;
              platformStore.setAgentStatus(agent.id, statusConfirm);
              toast.success(`${agent.name} ${statusConfirm === "Suspended" ? "suspended" : "activated"}`);
              setStatusConfirm(null);
            }}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
