import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpFromLine, Users, Wallet, Coins, Download, FileText, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { agents, transactions, formatNaira } from "@/lib/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/withdrawals")({
  head: () => ({ meta: [
    { title: "Withdrawal Analytics | SafeBox Admin" },
    { name: "description", content: "Withdrawal volume, float refunds and fees across all agents." },
    { property: "og:title", content: "Withdrawal Analytics | SafeBox Admin" },
    { property: "og:description", content: "Withdrawal volume, float refunds and fees across all agents." },
  ]}),
  component: WithdrawalsAnalytics,
});

const WITHDRAWAL_FEE_AGENT = 90;
const WITHDRAWAL_FEE_GROSS = 100;
type Range = "today" | "week" | "month" | "custom";

function WithdrawalsAnalytics() {
  const [range, setRange] = useState<Range>("today");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"volume" | "name">("volume");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const perAgent = useMemo(() => {
    return agents.map((a) => {
      const agentW = transactions.filter((t) => t.agentName === a.name && t.type === "Withdrawal" && t.status === "Successful");
      const processed = agentW.reduce((s, t) => s + t.amount, 0);
      const count = agentW.length;
      return {
        ...a,
        processed,
        count,
        feeEarned: count * WITHDRAWAL_FEE_AGENT,
        floatImpact: processed,
        lastWithdrawal: agentW[0]?.timestamp ?? "—",
        recent: agentW.slice(0, 8),
      };
    });
  }, []);

  const filtered = useMemo(() => {
    let list = perAgent.filter((a) => a.count > 0);
    if (q) {
      const n = q.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(n) || a.market.toLowerCase().includes(n));
    }
    list = [...list].sort((a, b) => sort === "volume" ? b.processed - a.processed : a.name.localeCompare(b.name));
    return list;
  }, [perAgent, q, sort]);

  const totals = useMemo(() => {
    const total = filtered.reduce((s, a) => s + a.processed, 0);
    const totalCount = filtered.reduce((s, a) => s + a.count, 0);
    return {
      totalProcessed: total,
      totalRefunded: total,
      totalFeesGross: totalCount * WITHDRAWAL_FEE_GROSS,
      activeAgents: filtered.length,
    };
  }, [filtered]);

  const selected = selectedAgentId ? perAgent.find((a) => a.id === selectedAgentId) : null;

  const exportCsv = () => {
    const rows = [
      ["Agent", "Location", "Withdrawals Processed", "Number of Withdrawals", "Fees Earned", "Float Impact", "Last Withdrawal"],
      ...filtered.map((a) => [a.name, a.market, a.processed, a.count, a.feeEarned, a.floatImpact, a.lastWithdrawal]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `withdrawals-${range}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  if (selected) {
    const chartData = selected.recent.map((t, i) => ({ name: `W${selected.recent.length - i}`, amount: t.amount })).reverse();
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedAgentId(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to all agents</button>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{selected.name}</h1>
            <p className="text-sm text-muted-foreground">{selected.market} • Float balance {formatNaira(selected.floatBalance)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
            <Button variant="outline" onClick={() => toast.info("PDF export queued.")}><FileText className="h-4 w-4 mr-2" />Export PDF</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Withdrawals Processed" value={formatNaira(selected.processed)} icon={ArrowUpFromLine} tone="destructive" />
          <MetricCard label="# of Withdrawals" value={String(selected.count)} icon={Users} tone="primary" />
          <MetricCard label="Fees Earned" value={formatNaira(selected.feeEarned)} icon={Coins} tone="gold" />
        </div>

        <Card className="p-5">
          <h3 className="font-semibold mb-3">Recent withdrawal activity</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v: number) => formatNaira(v)} />
                <Bar dataKey="amount" fill="#b91c1c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b"><h3 className="font-semibold">Recent withdrawal transactions</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="bg-cream text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Timestamp</th>
                  <th className="text-left p-3">Trader</th>
                  <th className="text-right p-3">Amount</th>
                  <th className="text-right p-3">Fee Earned</th>
                  <th className="text-right p-3">Float Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {selected.recent.map((t) => (
                  <tr key={t.id}>
                    <td className="p-3">{t.timestamp}</td>
                    <td className="p-3">{t.traderName}</td>
                    <td className="p-3 text-right font-medium">{formatNaira(t.amount)}</td>
                    <td className="p-3 text-right text-success">{formatNaira(WITHDRAWAL_FEE_AGENT)}</td>
                    <td className="p-3 text-right text-success">+{formatNaira(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Withdrawal Analytics — All Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">Track withdrawal volume, float refunds and fees across the agent network.</p>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as Range)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total Withdrawals Processed" value={formatNaira(totals.totalProcessed)} icon={ArrowUpFromLine} tone="destructive" />
        <MetricCard label="Total Float Refunded" value={formatNaira(totals.totalRefunded)} icon={Wallet} tone="primary" />
        <MetricCard label="Total Withdrawal Fees (gross)" value={formatNaira(totals.totalFeesGross)} icon={Coins} tone="gold" sub="₦100 / withdrawal" />
        <MetricCard label="Active Agents w/ Withdrawals" value={String(totals.activeAgents)} icon={Users} tone="accent" />
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agent name or location" />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as "volume" | "name")}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="volume">Sort: Highest volume</SelectItem>
              <SelectItem value="name">Sort: Name (A–Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-cream text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Agent</th>
                <th className="text-left p-3">Location</th>
                <th className="text-right p-3">Withdrawals (₦)</th>
                <th className="text-right p-3"># Withdrawals</th>
                <th className="text-right p-3">Fees Earned</th>
                <th className="text-right p-3">Float Impact</th>
                <th className="text-left p-3">Last Withdrawal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-cream/50">
                  <td className="p-3"><button onClick={() => setSelectedAgentId(a.id)} className="font-medium text-primary hover:underline text-left">{a.name}</button></td>
                  <td className="p-3 text-muted-foreground">{a.market}</td>
                  <td className="p-3 text-right font-semibold">{formatNaira(a.processed)}</td>
                  <td className="p-3 text-right">{a.count}</td>
                  <td className="p-3 text-right text-success">{formatNaira(a.feeEarned)}</td>
                  <td className="p-3 text-right text-success">+{formatNaira(a.processed)}</td>
                  <td className="p-3 text-xs text-muted-foreground">{a.lastWithdrawal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          <Button variant="outline" onClick={() => toast.info("PDF export queued.")}><FileText className="h-4 w-4 mr-2" />Export PDF</Button>
        </div>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, tone, sub }: { label: string; value: string; icon: React.ElementType; tone: "destructive" | "primary" | "gold" | "accent"; sub?: string }) {
  const colors = {
    destructive: "bg-destructive/15 text-destructive",
    primary: "bg-primary/15 text-primary",
    gold: "bg-gold/15 text-gold-foreground",
    accent: "bg-accent/15 text-accent",
  } as const;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-muted-foreground tracking-wide">{label}</p>
        <div className={`grid h-9 w-9 place-items-center rounded-lg ${colors[tone]}`}><Icon className="h-4 w-4" /></div>
      </div>
      <p className="font-display text-2xl font-bold mt-2">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </Card>
  );
}
