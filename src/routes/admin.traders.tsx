import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Download } from "lucide-react";
import { traders, formatNaira, markets } from "@/lib/mockData";

export const Route = createFileRoute("/admin/traders")({
  component: TradersPage,
});

function TradersPage() {
  const [q, setQ] = useState("");
  const [market, setMarket] = useState("All");
  const filtered = traders.filter(
    (t) =>
      (market === "All" || t.market === market) &&
      (q === "" || t.name.toLowerCase().includes(q.toLowerCase()) || t.phone.includes(q) || t.id.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Traders</h1>
          <p className="text-sm text-muted-foreground mt-1">{traders.length.toLocaleString()} registered traders across all markets.</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export CSV</Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name, phone, ID…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="border rounded-md px-3 text-sm bg-white" value={market} onChange={(e) => setMarket(e.target.value)}>
            <option>All</option>
            {markets.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                <th className="py-3 pr-4">Trader ID</th>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Phone</th>
                <th className="py-3 pr-4">Market</th>
                <th className="py-3 pr-4 text-right">Balance</th>
                <th className="py-3 pr-4 text-right">Total Saved</th>
                <th className="py-3 pr-4">Last Txn</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.slice(0, 30).map((t) => (
                <tr key={t.id} className="hover:bg-cream cursor-pointer">
                  <td className="py-3 pr-4 font-mono text-xs">{t.id}</td>
                  <td className="py-3 pr-4 font-medium">{t.name}</td>
                  <td className="py-3 pr-4">{t.phone}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{t.market}</td>
                  <td className="py-3 pr-4 text-right font-semibold">{formatNaira(t.balance)}</td>
                  <td className="py-3 pr-4 text-right">{formatNaira(t.totalSaved)}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{t.lastTxn}</td>
                  <td className="py-3">
                    <Badge variant={t.status === "Active" ? "default" : "destructive"} className={t.status === "Active" ? "bg-success" : ""}>
                      {t.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Showing {Math.min(30, filtered.length)} of {filtered.length}</p>
      </Card>
    </div>
  );
}
