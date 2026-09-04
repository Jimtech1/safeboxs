import { useChartColors } from "@/lib/chartColors";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Percent, Coins, TrendingUp, Copy, Landmark, Info } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getCurrentTrader, formatNGN, type Trader } from "@/lib/mockTraderData";
import {
  NOMBA, buildYieldLedger, dailyInterest, projectedAnnual, formatKobo,
  virtualAccountFor, type YieldEntry,
} from "@/lib/yieldData";
import { toast } from "sonner";

export const Route = createFileRoute("/trader/interest")({
  component: TraderInterest,
  head: () => ({
    meta: [
      { title: "Daily Interest & Virtual Account | SafeBox Trader" },
      { name: "description", content: "Track the daily interest your SafeBox savings earn through Nomba Treasury and fund your account via your dedicated virtual account number." },
      { property: "og:title", content: "Daily Interest & Virtual Account | SafeBox Trader" },
      { property: "og:description", content: "See daily yield accrual on your savings and your dedicated Nomba virtual account details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function TraderInterest() {
  const C = useChartColors();
  const [trader, setTrader] = useState<Trader | null>(null);
  const [ledger, setLedger] = useState<YieldEntry[]>([]);

  useEffect(() => {
    const refresh = () => {
      const t = getCurrentTrader();
      setTrader(t);
      if (t) setLedger(buildYieldLedger(t.balance, 30));
    };
    refresh();
    window.addEventListener("trader-store-change", refresh);
    return () => window.removeEventListener("trader-store-change", refresh);
  }, []);

  if (!trader) return null;

  const va = virtualAccountFor(trader.id, trader.name);
  const earned30 = ledger.length ? ledger[ledger.length - 1].cumulative : 0;

  const copy = (v: string) => {
    navigator.clipboard?.writeText(v);
    toast.success("Account number copied");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Daily Interest</h1>
        <p className="text-sm text-muted-foreground">
          Your savings earn yield every day through {NOMBA.provider}. Interest is credited at {NOMBA.payoutTime}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Annual Rate" value={`${(NOMBA.annualRate * 100).toFixed(1)}%`} sub="p.a. on your balance" icon={Percent} tone="bg-gold/15 text-gold-foreground" />
        <Stat label="Today's Interest" value={formatKobo(dailyInterest(trader.balance))} sub="accrued so far" icon={Coins} tone="bg-primary/10 text-primary" />
        <Stat label="Earned (30 days)" value={formatKobo(earned30)} sub="credited to balance" icon={TrendingUp} tone="bg-accent/10 text-accent" />
        <Stat label="Projected / year" value={formatNGN(projectedAnnual(trader.balance))} sub="if balance holds" icon={TrendingUp} tone="bg-success/15 text-success" />
      </div>

      <Card className="p-5">
        <p className="font-semibold">Interest accrual — last 30 days</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ledger}>
              <CartesianGrid strokeDasharray="3 3" stroke={C["border"]} />
              <XAxis dataKey="label" stroke={C["muted-foreground"]} fontSize={11} interval={4} />
              <YAxis stroke={C["muted-foreground"]} fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: 12, borderColor: C["border"], background: C["card"], color: C["foreground"] }} formatter={(v: number) => formatKobo(Number(v))} />
              <Area type="monotone" dataKey="cumulative" name="Cumulative interest" stroke={C["primary"]} fill={C["primary"]} fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-primary" />
            <p className="font-semibold">Your virtual account</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Transfer from any bank to this account and it lands in your SafeBox savings instantly — and starts earning interest the same day.
          </p>
          <div className="mt-4 rounded-xl bg-cream p-4 space-y-2 text-sm">
            <Row label="Bank" value={va.bankName} />
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Account number</span>
              <button onClick={() => copy(va.accountNumber)} className="flex items-center gap-2 font-display text-lg font-bold text-primary">
                {va.accountNumber} <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <Row label="Account name" value={va.accountName} />
            <Row label="Provider" value={va.provider} />
          </div>
          <Button variant="outline" className="mt-4 w-full" onClick={() => copy(va.accountNumber)}>Copy account number</Button>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b"><p className="font-semibold">Daily credits</p></div>
          <div className="max-h-[320px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream text-xs uppercase text-muted-foreground sticky top-0">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-right p-3">Balance</th>
                  <th className="text-right p-3">Interest</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...ledger].reverse().map((e) => (
                  <tr key={e.date}>
                    <td className="p-3 text-xs text-muted-foreground">{e.label}</td>
                    <td className="p-3 text-right">{formatNGN(e.balance)}</td>
                    <td className="p-3 text-right font-semibold text-success">+{formatKobo(e.interest)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card className="p-4 flex items-start gap-3 bg-cream">
        <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
        <p className="text-xs text-muted-foreground">
          SafeBox places pooled savings in {NOMBA.provider} instruments. Traders receive {Math.round(NOMBA.traderShare * 100)}% of the yield earned;
          the rest covers agent commissions and platform operations. Rates are indicative and may change.
        </p>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function Stat({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: React.ElementType; tone: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className={`grid h-9 w-9 place-items-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></div>
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </Card>
  );
}
