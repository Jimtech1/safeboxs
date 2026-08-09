import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Search, Wallet, TrendingUp, ArrowDownToLine } from "lucide-react";
import { agents, floatTransactions, formatNaira, overviewMetrics } from "@/lib/mockData";

export const Route = createFileRoute("/admin/float")({
  component: FloatPage,
});

function FloatPage() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(agents[0].id);

  const lowFloat = agents.filter((a) => a.floatBalance < 50000 && a.status === "Active");
  const filtered = agents.filter((a) =>
    q === "" || a.name.toLowerCase().includes(q.toLowerCase()) || a.id.toLowerCase().includes(q.toLowerCase()) || a.market.toLowerCase().includes(q.toLowerCase())
  );
  const history = floatTransactions.filter((f) => f.agentId === selected).slice(0, 12);

  const summary = [
    { label: "Total Float Deployed", value: formatNaira(overviewMetrics.totalFloatDeployed), icon: Wallet, tone: "primary" },
    { label: "Agents Below Threshold", value: lowFloat.length.toString(), icon: AlertTriangle, tone: "warning" },
    { label: "Avg Float per Agent", value: formatNaira(Math.round(agents.reduce((s, a) => s + a.floatBalance, 0) / agents.length)), icon: TrendingUp, tone: "accent" },
    { label: "Today's Float Top-ups", value: formatNaira(floatTransactions.slice(0, 12).reduce((s, f) => s + f.amount, 0)), icon: ArrowDownToLine, tone: "success" },
  ];

  const toneBg: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/15 text-warning",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/15 text-success",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Float Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor agent float capital, top-ups, utilization, and low-float alerts.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label} className="p-5">
            <div className={`grid h-10 w-10 place-items-center rounded-lg ${toneBg[s.tone]}`}><s.icon className="h-5 w-5" /></div>
            <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Low float alerts */}
      <Card className="p-5 border-l-4 border-l-warning">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Low Float Alerts</h3>
          <Badge variant="outline" className="border-warning text-warning">{lowFloat.length} agents</Badge>
        </div>
        <div className="mt-3 divide-y">
          {lowFloat.slice(0, 5).map((a) => (
            <div key={a.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-sm">{a.name} <span className="text-xs text-muted-foreground font-normal">• {a.id}</span></p>
                <p className="text-xs text-muted-foreground">{a.market}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-destructive">{formatNaira(a.floatBalance)}</p>
                  <p className="text-[10px] text-muted-foreground">below ₦50,000</p>
                </div>
                <Button size="sm" variant="outline">Notify</Button>
              </div>
            </div>
          ))}
          {lowFloat.length === 0 && <p className="text-sm text-muted-foreground py-3">All agents are above the float threshold.</p>}
        </div>
      </Card>

      {/* Utilization report */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">Float Utilization Report</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search agent…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                <th className="py-3 pr-4">Agent</th>
                <th className="py-3 pr-4">Market</th>
                <th className="py-3 pr-4 text-right">Float Balance</th>
                <th className="py-3 pr-4 text-right">Used Today</th>
                <th className="py-3 pr-4">Utilization</th>
                <th className="py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((a) => {
                const util = Math.min(100, Math.round((a.floatUsedToday / Math.max(a.floatCapacity, 1)) * 100));
                return (
                  <tr key={a.id} className="hover:bg-cream">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{a.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{a.id}</p>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{a.market}</td>
                    <td className="py-3 pr-4 text-right">
                      <span className={a.floatBalance < 50000 ? "text-destructive font-semibold" : "font-medium"}>{formatNaira(a.floatBalance)}</span>
                    </td>
                    <td className="py-3 pr-4 text-right">{formatNaira(a.floatUsedToday)}</td>
                    <td className="py-3 pr-4 w-40">
                      <Progress value={util} />
                      <p className="text-[10px] text-muted-foreground mt-1">{util}% of cap</p>
                    </td>
                    <td className="py-3"><Button size="sm" variant="ghost" onClick={() => setSelected(a.id)}>History</Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Float history per selected agent */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Float Top-up History</h3>
            <p className="text-xs text-muted-foreground">Agent: {agents.find(a => a.id === selected)?.name} • {selected}</p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                <th className="py-3 pr-4">Reference</th>
                <th className="py-3 pr-4">When</th>
                <th className="py-3 pr-4">Channel</th>
                <th className="py-3 pr-4 text-right">Amount</th>
                <th className="py-3 pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {history.map((f) => (
                <tr key={f.id} className="hover:bg-cream">
                  <td className="py-3 pr-4 font-mono text-xs">{f.reference}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{f.timestamp}</td>
                  <td className="py-3 pr-4">{f.channel}</td>
                  <td className="py-3 pr-4 text-right font-semibold text-success">+{formatNaira(f.amount)}</td>
                  <td className="py-3 pr-4"><Badge variant="outline">{f.status}</Badge></td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-sm text-muted-foreground text-center">No float top-ups yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
