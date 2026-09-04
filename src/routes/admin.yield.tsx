import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Percent, Banknote, Coins, TrendingUp, Landmark } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { formatNaira, traders, agents } from "@/lib/mockData";
import { NOMBA, treasurySummary, treasuryPools, dailyInterest, virtualAccountFor, formatKobo } from "@/lib/yieldData";

export const Route = createFileRoute("/admin/yield")({
  component: YieldTreasury,
  head: () => ({
    meta: [
      { title: "Treasury Yield & Virtual Accounts | SafeBox Admin" },
      { name: "description", content: "Monitor Nomba Treasury yield accrual, trader interest payouts, platform margin and virtual account provisioning across SafeBox." },
      { property: "og:title", content: "Treasury Yield & Virtual Accounts | SafeBox Admin" },
      { property: "og:description", content: "Nomba Treasury yield, daily interest payouts and virtual account provisioning." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function YieldTreasury() {
  const t = treasurySummary();
  const topTraders = traders.slice(0, 8);

  const cards = [
    { label: "Assets Under Management", value: formatNaira(t.aum), icon: Banknote, tone: "bg-primary/10 text-primary" },
    { label: "Deployed to Treasury", value: formatNaira(t.deployed), icon: Landmark, tone: "bg-accent/10 text-accent" },
    { label: "Gross Yield / day", value: formatNaira(t.grossDaily), icon: Coins, tone: "bg-gold/15 text-gold-foreground" },
    { label: "Trader Interest / day", value: formatNaira(t.traderPayout), icon: TrendingUp, tone: "bg-success/15 text-success" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Yield & Treasury</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {NOMBA.provider} integration • {(NOMBA.annualRate * 100).toFixed(1)}% p.a. • payouts at {NOMBA.payoutTime}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-success/15 text-success">Nomba API: Connected (mock)</Badge>
          <Button variant="outline">Run payout now</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className={`grid h-10 w-10 place-items-center rounded-lg ${c.tone}`}><c.icon className="h-5 w-5" /></div>
            <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{c.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold">Daily yield vs trader payout</h3>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={t.series}>
                <CartesianGrid strokeDasharray="3 3" stroke={C["border"]} />
                <XAxis dataKey="label" stroke={C["muted-foreground"]} fontSize={11} interval={4} />
                <YAxis stroke={C["muted-foreground"]} fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, borderColor: C["border"], background: C["card"], color: C["foreground"] }} formatter={(v: number) => formatNaira(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="gross" name="Gross yield" stroke={C["gold"]} fill={C["gold"]} fillOpacity={0.18} strokeWidth={2} />
                <Area type="monotone" dataKey="payout" name="Trader interest" stroke={C["primary"]} fill={C["primary"]} fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Treasury allocation</h3>
          <div className="mt-4 space-y-4">
            {treasuryPools.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground">{p.allocation}%</span>
                </div>
                <Progress value={p.allocation} className="mt-1.5" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.rate ? `${p.rate}% p.a.` : "Liquidity reserve"} • {p.status}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-cream p-3 text-xs text-muted-foreground">
            Platform margin retained: <span className="font-semibold text-foreground">{formatNaira(t.platformMargin)}</span> / day
            ({100 - Math.round(NOMBA.traderShare * 100)}% of gross yield).
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Virtual accounts & interest accrual</h3>
            <p className="text-xs text-muted-foreground">Nomba-issued account numbers provisioned per trader</p>
          </div>
          <Badge variant="outline" className="text-xs">{traders.length} provisioned</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-cream text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Trader</th>
                <th className="text-left p-3">Virtual account</th>
                <th className="text-left p-3 hidden md:table-cell">Bank</th>
                <th className="text-right p-3">Balance</th>
                <th className="text-right p-3">Interest / day</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {topTraders.map((tr) => {
                const va = virtualAccountFor(tr.id, tr.name);
                return (
                  <tr key={tr.id}>
                    <td className="p-3 font-medium">{tr.name}</td>
                    <td className="p-3 font-mono text-xs">{va.accountNumber}</td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{va.bankName}</td>
                    <td className="p-3 text-right">{formatNaira(tr.balance)}</td>
                    <td className="p-3 text-right text-success font-semibold">+{formatKobo(dailyInterest(tr.balance))}</td>
                    <td className="p-3"><Badge className="bg-success/15 text-success text-[11px]">Accruing</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Agent float yield</h3>
          <p className="text-xs text-muted-foreground">Idle float earns {(NOMBA.agentFloatRate * 100).toFixed(1)}% p.a. via Nomba Treasury</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-cream text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Agent</th>
                <th className="text-left p-3">Float virtual account</th>
                <th className="text-right p-3">Float balance</th>
                <th className="text-right p-3">Yield / day</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {agents.slice(0, 6).map((a) => {
                const va = virtualAccountFor(a.id, a.name, "91");
                return (
                  <tr key={a.id}>
                    <td className="p-3 font-medium">{a.name}</td>
                    <td className="p-3 font-mono text-xs">{va.accountNumber}</td>
                    <td className="p-3 text-right">{formatNaira(a.floatBalance)}</td>
                    <td className="p-3 text-right text-success font-semibold">
                      +{formatKobo(dailyInterest(a.floatBalance, NOMBA.agentFloatRate))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
