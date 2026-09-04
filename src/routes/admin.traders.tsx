import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Download, FileText } from "lucide-react";
import { markets } from "@/lib/mockData";
import { useAllTraders } from "@/lib/platformStore";
import { usePageData, TablePagination, EmptyState, TableSkeleton, useBriefLoading } from "@/components/admin/DataTableShell";
import { exportCsv, exportPdf } from "@/components/admin/exportData";

export const Route = createFileRoute("/admin/traders")({
  head: () => ({ meta: [
    { title: "Trader Management | SafeBox Admin" },
    { name: "description", content: "Search, review and manage trader savings accounts." },
    { property: "og:title", content: "Trader Management | SafeBox Admin" },
    { property: "og:description", content: "Search, review and manage trader savings accounts." },
  ]}),
  component: TradersPage,
});

const formatNaira = (n: number) => `₦${Math.round(n).toLocaleString("en-NG")}`;

function TradersPage() {
  const traders = useAllTraders();
  const loading = useBriefLoading();
  const [q, setQ] = useState("");
  const [market, setMarket] = useState("All");
  const filtered = useMemo(() => traders.filter(
    (t) =>
      (market === "All" || t.market === market) &&
      (q === "" || t.name.toLowerCase().includes(q.toLowerCase()) || t.phone.includes(q) || t.id.toLowerCase().includes(q.toLowerCase())),
  ), [traders, market, q]);

  const { page, setPage, pageCount, pageRows } = usePageData(filtered, 15);

  const doExportCsv = () => exportCsv("traders", ["ID", "Name", "Phone", "Market", "Balance", "Total Saved", "Status", "KYC"],
    filtered.map((t) => [t.id, t.name, t.phone, t.market ?? "", t.balance, t.totalSaved, t.status, t.kycStatus ?? ""]));
  const doExportPdf = () => exportPdf("Traders", ["ID", "Name", "Phone", "Market", "Balance", "Status"],
    filtered.map((t) => [t.id, t.name, t.phone, t.market ?? "", formatNaira(t.balance), t.status]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Traders</h1>
          <p className="text-sm text-muted-foreground mt-1">{traders.length.toLocaleString()} registered traders across all markets.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={doExportCsv}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          <Button variant="outline" onClick={doExportPdf}><FileText className="h-4 w-4 mr-2" />Export PDF</Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name, phone, ID…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="border rounded-md px-3 text-sm bg-card" value={market} onChange={(e) => setMarket(e.target.value)}>
            <option>All</option>
            {markets.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>

        {loading ? <TableSkeleton cols={7} /> : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                  <th className="py-3 pr-4">Trader ID</th>
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Phone</th>
                  <th className="py-3 pr-4">Market</th>
                  <th className="py-3 pr-4 text-right">Balance</th>
                  <th className="py-3 pr-4 text-right">Total Saved</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pageRows.map((t) => (
                  <tr key={t.id} className="hover:bg-cream cursor-pointer">
                    <td className="py-3 pr-4 font-mono text-xs">{t.id}</td>
                    <td className="py-3 pr-4 font-medium">
                      <Link to="/admin/traders/$id" params={{ id: t.id }} className="text-primary hover:underline">{t.name}</Link>
                    </td>
                    <td className="py-3 pr-4">{t.phone}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{t.market ?? "—"}</td>
                    <td className="py-3 pr-4 text-right font-semibold">{formatNaira(t.balance)}</td>
                    <td className="py-3 pr-4 text-right">{formatNaira(t.totalSaved)}</td>
                    <td className="py-3">
                      <Badge variant={t.status === "active" ? "default" : "destructive"} className={t.status === "active" ? "bg-success" : ""}>
                        {t.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <EmptyState label="No traders match your filters" />}
          </div>
        )}
        <TablePagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} />
      </Card>
    </div>
  );
}
