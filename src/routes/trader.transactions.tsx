import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download } from "lucide-react";
import { getCurrentTrader, getTransactions, formatNGN, type TraderTxn } from "@/lib/mockTraderData";
import { toast } from "sonner";

export const Route = createFileRoute("/trader/transactions")({
  head: () => ({ meta: [
    { title: "My Transactions | SafeBox" },
    { name: "description", content: "Every deposit and withdrawal on your savings account." },
    { property: "og:title", content: "My Transactions | SafeBox" },
    { property: "og:description", content: "Every deposit and withdrawal on your savings account." },
  ]}),
  component: TraderTransactions,
});

function TraderTransactions() {
  const [txns, setTxns] = useState<TraderTxn[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"All" | TraderTxn["type"]>("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const t = getCurrentTrader();
    if (t) setTxns(getTransactions(t.id));
  }, []);

  const filtered = useMemo(() => {
    return txns.filter((t) => {
      if (type !== "All" && t.type !== type) return false;
      if (q && !t.description.toLowerCase().includes(q.toLowerCase()) && !t.agentName.toLowerCase().includes(q.toLowerCase())) return false;
      if (from && new Date(t.date) < new Date(from)) return false;
      if (to && new Date(t.date) > new Date(to + "T23:59:59")) return false;
      return true;
    });
  }, [txns, q, type, from, to]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);

  const exportCsv = () => {
    const rows = [
      ["Date", "Description", "Amount", "Balance After", "Type", "Status", "Agent"],
      ...filtered.map((t) => [new Date(t.date).toISOString(), t.description, t.amount, t.balanceAfter, t.type, t.status, t.agentName]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "transactions.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Transaction History</h1>
          <p className="text-sm text-muted-foreground">All deposits, withdrawals, and interest credits.</p>
        </div>
        <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search description or agent" />
          </div>
          <Select value={type} onValueChange={(v) => { setType(v as typeof type); setPage(1); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All types</SelectItem>
              <SelectItem value="Deposit">Deposits</SelectItem>
              <SelectItem value="Withdrawal">Withdrawals</SelectItem>
              <SelectItem value="Interest">Interest</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
            <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Date & Time</th>
                <th className="text-left p-3">Description</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-right p-3 hidden md:table-cell">Balance After</th>
                <th className="text-left p-3 hidden md:table-cell">Type</th>
                <th className="text-left p-3 hidden lg:table-cell">Status</th>
                <th className="text-left p-3 hidden lg:table-cell">Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {slice.map((t) => (
                <tr key={t.id} className="hover:bg-cream/40">
                  <td className="p-3 text-xs whitespace-nowrap text-muted-foreground">{new Date(t.date).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="p-3">{t.description}</td>
                  <td className={`p-3 text-right font-semibold ${t.type === "Withdrawal" ? "text-destructive" : "text-success"}`}>
                    {t.type === "Withdrawal" ? "-" : "+"}{formatNGN(t.amount)}
                  </td>
                  <td className="p-3 text-right hidden md:table-cell">{formatNGN(t.balanceAfter)}</td>
                  <td className="p-3 hidden md:table-cell">{t.type}</td>
                  <td className="p-3 hidden lg:table-cell">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${t.status === "Completed" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{t.status}</span>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs hidden lg:table-cell">{t.agentName}</td>
                </tr>
              ))}
              {slice.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">No transactions match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-3 text-xs">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="h-8 w-20"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span>Page {page} of {totalPages}</span>
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
