import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowDownToLine, ArrowUpFromLine, Search, Building2 } from "lucide-react";
import { transactions, formatNaira } from "@/lib/mockData";
import { useAgentState } from "@/lib/agentStore";

export const Route = createFileRoute("/agent/transactions")({
  head: () => ({ meta: [
    { title: "Agent Transactions | SafeBox" },
    { name: "description", content: "Every deposit, withdrawal and float movement you processed." },
    { property: "og:title", content: "Agent Transactions | SafeBox" },
    { property: "og:description", content: "Every deposit, withdrawal and float movement you processed." },
  ]}),
  component: TxList,
});

function TxList() {
  const s = useAgentState();
  const [tab, setTab] = useState<"today"|"week"|"month">("today");
  const [q, setQ] = useState("");
  const slices = { today: 8, week: 25, month: 60 };
  const mock = transactions.slice(0, slices[tab]).map((t) => ({
    id: t.id, kind: t.type as "Deposit" | "Withdrawal",
    label: t.traderName, amount: t.amount, timestamp: t.timestamp, status: t.status,
  }));
  const live = s.txns.map((t) => ({
    id: t.id,
    kind: t.kind === "FloatTopup" ? "FloatTopup" as const : t.kind === "FloatWithdraw" ? "FloatWithdraw" as const : t.kind,
    label: t.traderName ?? (t.kind === "FloatTopup" ? `Float top-up (${t.channel})` : t.kind === "FloatWithdraw" ? `Bank transfer (${t.channel})` : "—"),
    amount: t.amount, timestamp: t.timestamp, status: t.status,
  }));
  const list = [...live, ...mock].filter((t) => q === "" || t.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">My Transactions</h1>
      <div className="grid grid-cols-3 gap-2 rounded-xl bg-secondary p-1">
        {(["today","week","month"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`py-2 rounded-lg text-sm font-medium capitalize transition ${tab === t ? "bg-card shadow text-primary" : "text-muted-foreground"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search trader" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Card className="divide-y">
        {list.map((t) => {
          const isCredit = t.kind === "Deposit" || t.kind === "FloatTopup";
          const Icon = t.kind === "FloatTopup" || t.kind === "FloatWithdraw" ? Building2 : isCredit ? ArrowDownToLine : ArrowUpFromLine;
          return (
            <div key={t.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`grid h-9 w-9 place-items-center rounded-full ${isCredit ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.kind} • {t.timestamp}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold text-sm ${isCredit ? "text-success" : "text-destructive"}`}>
                  {isCredit ? "+" : "−"}{formatNaira(t.amount)}
                </p>
                <Badge variant="outline" className="text-[10px] mt-0.5">{t.status}</Badge>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No transactions found.</p>}
      </Card>
    </div>
  );
}
