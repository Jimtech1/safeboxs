import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCog, Banknote, TrendingUp, Building2, Percent, ArrowUpRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";
import { overviewMetrics, savingsByRegion, txTypeSplit, formatNaira, agents, transactions } from "@/lib/mockData";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

const metrics = [
  { label: "Total Active Traders", value: overviewMetrics.activeTraders.toLocaleString(), icon: Users, change: "+4.2%", tone: "primary" },
  { label: "Total Active Agents", value: overviewMetrics.activeAgents.toLocaleString(), icon: UserCog, change: "+2.1%", tone: "accent" },
  { label: "Total Savings Volume", value: "₦12.4B", icon: Banknote, change: "+11.8%", tone: "gold" },
  { label: "Daily Transaction Volume", value: "₦84.2M", icon: TrendingUp, change: "+6.4%", tone: "success" },
  { label: "Active Principals (MFBs)", value: overviewMetrics.activePrincipals.toString(), icon: Building2, change: "stable", tone: "primary" },
  { label: "Avg Yield Earned (YTD)", value: overviewMetrics.avgYield + "%", icon: Percent, change: "+0.3%", tone: "gold" },
];

const toneBg: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  gold: "bg-gold/15 text-gold-foreground",
  success: "bg-success/15 text-success",
};

const PIE_COLORS = ["var(--primary)", "var(--gold)"];

function Overview() {
  const pendingAgents = agents.filter((a) => a.status === "Pending");
  const highValue = transactions.filter((t) => t.amount > 50000).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Good morning, Operations Team</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's what's happening across SafeBox today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Today</Button>
          <Button className="bg-primary hover:bg-primary/90">Generate Report</Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label} className="p-5">
            <div className="flex items-start justify-between">
              <div className={`grid h-10 w-10 place-items-center rounded-lg ${toneBg[m.tone]}`}>
                <m.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-success flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />{m.change}
              </span>
            </div>
            <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">{m.label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{m.value}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Savings Volume by Region</h3>
              <p className="text-xs text-muted-foreground">Last 30 days, in ₦M</p>
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={savingsByRegion}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Lagos" stroke="var(--primary)" strokeWidth={2} />
                <Line type="monotone" dataKey="Kano" stroke="var(--gold)" strokeWidth={2} />
                <Line type="monotone" dataKey="Oyo" stroke="var(--accent)" strokeWidth={2} />
                <Line type="monotone" dataKey="Rivers" stroke="var(--success)" strokeWidth={2} />
                <Line type="monotone" dataKey="FCT" stroke="var(--warning)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Transactions by Type</h3>
          <p className="text-xs text-muted-foreground">Today</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={txTypeSplit} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {txTypeSplit.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Pending Agent Approvals</h3>
            <Button size="sm" variant="ghost">View all</Button>
          </div>
          <div className="mt-3 divide-y">
            {pendingAgents.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.market} • {a.id}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Review</Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">Approve</Button>
                </div>
              </div>
            ))}
            {pendingAgents.length === 0 && <p className="text-sm text-muted-foreground py-3">No pending approvals.</p>}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">High-Value Transactions</h3>
            <Badge variant="outline" className="border-warning text-warning"><AlertTriangle className="h-3 w-3 mr-1" />Review</Badge>
          </div>
          <div className="mt-3 divide-y">
            {highValue.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">{formatNaira(t.amount)} • {t.type}</p>
                  <p className="text-xs text-muted-foreground">{t.traderName} → {t.agentName}</p>
                </div>
                <Button size="sm" variant="outline">Review</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="p-5 bg-primary text-primary-foreground">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-gold" />
            <div>
              <p className="font-semibold">Quick actions</p>
              <p className="text-xs text-primary-foreground/70">Common admin tasks at a glance</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="bg-gold text-gold-foreground hover:bg-gold/90">Approve New Agent</Button>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">Generate Compliance Report</Button>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">Reconcile Settlement</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
