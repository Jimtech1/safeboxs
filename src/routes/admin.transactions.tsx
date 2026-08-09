import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Check, X } from "lucide-react";
import { transactions, formatNaira } from "@/lib/mockData";

export const Route = createFileRoute("/admin/transactions")({
  head: () => ({ meta: [
    { title: "Transactions | SafeBox Admin" },
    { name: "description", content: "Full ledger of deposits, withdrawals and group contributions." },
    { property: "og:title", content: "Transactions | SafeBox Admin" },
    { property: "og:description", content: "Full ledger of deposits, withdrawals and group contributions." },
  ]}),
  component: TxPage,
});

const maskPhone = (p: string) => p.slice(0, 4) + "***" + p.slice(-3);

function TxPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const filtered = transactions.filter((t) =>
    (type === "All" || t.type === type) &&
    (q === "" || t.id.toLowerCase().includes(q.toLowerCase()) || t.traderPhone.includes(q) || t.agentName.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">Global transaction log across all agents and traders.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
          <Button variant="outline" className="border-destructive text-destructive">Reverse Transaction</Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search Tx ID, trader phone, agent…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="border rounded-md px-3 text-sm bg-white" value={type} onChange={(e) => setType(e.target.value)}>
            <option>All</option>
            <option>Deposit</option>
            <option>Withdrawal</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                <th className="py-3 pr-4">Tx ID</th>
                <th className="py-3 pr-4">Time</th>
                <th className="py-3 pr-4">Trader</th>
                <th className="py-3 pr-4">Agent</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4 text-right">Amount</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">SMS</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.slice(0, 40).map((t) => (
                <tr key={t.id} className="hover:bg-cream">
                  <td className="py-3 pr-4 font-mono text-xs">{t.id}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{t.timestamp}</td>
                  <td className="py-3 pr-4">{maskPhone(t.traderPhone)}</td>
                  <td className="py-3 pr-4">{t.agentName}</td>
                  <td className="py-3 pr-4">
                    <Badge variant="outline" className={t.type === "Deposit" ? "border-success text-success" : "border-accent text-accent"}>
                      {t.type}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold">{formatNaira(t.amount)}</td>
                  <td className="py-3 pr-4">
                    <Badge className={t.status === "Successful" ? "bg-success" : t.status === "Pending" ? "bg-warning" : "bg-destructive"}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="py-3">{t.smsSent ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-destructive" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Showing {Math.min(40, filtered.length)} of {filtered.length}</p>
      </Card>
    </div>
  );
}
