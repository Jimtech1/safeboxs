import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Coins, Flame, ArrowUpFromLine, Receipt, Download, Percent, Landmark, Copy } from "lucide-react";
import { getCurrentTrader, getTransactions, getGoals, formatNGN, type Trader, type TraderTxn, type Goal } from "@/lib/mockTraderData";
import { NOMBA, dailyInterest, projectedAnnual, formatKobo, virtualAccountFor } from "@/lib/yieldData";
import { toast } from "sonner";


export const Route = createFileRoute("/trader/")({
  head: () => ({ meta: [
    { title: "Trader Dashboard | SafeBox" },
    { name: "description", content: "See your savings balance, streak and recent transactions." },
    { property: "og:title", content: "Trader Dashboard | SafeBox" },
    { property: "og:description", content: "See your savings balance, streak and recent transactions." },
  ]}),
  component: TraderDashboard,
});

function TraderDashboard() {
  const [trader, setTrader] = useState<Trader | null>(null);
  const [txns, setTxns] = useState<TraderTxn[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const refresh = () => {
      const t = getCurrentTrader();
      setTrader(t);
      if (t) { setTxns(getTransactions(t.id)); setGoals(getGoals(t.id)); }
    };
    refresh();
    window.addEventListener("trader-store-change", refresh);
    return () => window.removeEventListener("trader-store-change", refresh);
  }, []);

  if (!trader) return null;

  const primaryGoal = goals[0];

  const metrics = [
    { label: "Current Balance", value: formatNGN(trader.balance), icon: Wallet, tone: "primary" },
    { label: "Total Saved", value: formatNGN(trader.totalSaved), icon: TrendingUp, tone: "accent" },
    { label: "Interest Earned", value: formatNGN(trader.interestEarned), icon: Coins, tone: "gold" },
    { label: "Savings Streak", value: `${trader.streakDays} days`, icon: Flame, tone: "destructive" },
  ] as const;

  const colors: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    gold: "bg-gold/15 text-gold-foreground",
    destructive: "bg-destructive/10 text-destructive",
  };

  const recent = txns.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{m.label}</p>
                <div className={`grid h-9 w-9 place-items-center rounded-lg ${colors[m.tone]}`}><m.icon className="h-4 w-4" /></div>
              </div>
              <p className="mt-2 font-display text-2xl font-bold">{m.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Yield + virtual account */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold flex items-center gap-2"><Percent className="h-4 w-4 text-gold-foreground" />Daily Interest</p>
              <p className="text-xs text-muted-foreground">{NOMBA.provider} • {(NOMBA.annualRate * 100).toFixed(1)}% p.a.</p>
            </div>
            <Link to="/trader/interest" className="text-xs text-primary hover:underline">Details →</Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-cream p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Today</p>
              <p className="mt-1 font-display text-base font-bold text-success">+{formatKobo(dailyInterest(trader.balance))}</p>
            </div>
            <div className="rounded-xl bg-cream p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total earned</p>
              <p className="mt-1 font-display text-base font-bold">{formatNGN(trader.interestEarned)}</p>
            </div>
            <div className="rounded-xl bg-cream p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Per year</p>
              <p className="mt-1 font-display text-base font-bold">{formatNGN(projectedAnnual(trader.balance))}</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">Interest is credited automatically at {NOMBA.payoutTime}.</p>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-semibold flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" />Your Virtual Account</p>
          <p className="text-xs text-muted-foreground">Fund your savings by transfer from any bank</p>
          {(() => {
            const va = virtualAccountFor(trader.id, trader.name);
            return (
              <div className="mt-4 rounded-xl bg-cream p-4 text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Account number</span>
                  <button
                    onClick={() => { navigator.clipboard?.writeText(va.accountNumber); toast.success("Account number copied"); }}
                    className="flex items-center gap-2 font-display text-lg font-bold text-primary"
                  >
                    {va.accountNumber}<Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Bank</span><span className="font-medium">{va.bankName}</span></div>
                <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">Name</span><span className="font-medium text-right">{va.accountName}</span></div>
              </div>
            );
          })()}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">

        <Card className="p-6 lg:col-span-1">
          <p className="text-sm font-semibold">Top Savings Goal</p>
          {primaryGoal ? (
            <>
              <ProgressCircle value={primaryGoal.current} max={primaryGoal.target} />
              <p className="mt-3 text-center text-sm font-medium">{primaryGoal.name}</p>
              <p className="text-center text-xs text-muted-foreground">{formatNGN(primaryGoal.current)} of {formatNGN(primaryGoal.target)}</p>
              <Link to="/trader/savings"><Button variant="outline" className="w-full mt-4">Manage goals</Button></Link>
            </>
          ) : (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              No goals yet.
              <Link to="/trader/savings"><Button className="w-full mt-4 bg-primary hover:bg-primary/90">Create your first goal</Button></Link>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <p className="font-semibold">Recent Transactions</p>
            <Link to="/trader/transactions" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-right p-3">Amount</th>
                  <th className="text-right p-3 hidden sm:table-cell">Balance</th>
                  <th className="text-left p-3 hidden sm:table-cell">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recent.map((t) => (
                  <tr key={t.id}>
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(t.date).toLocaleDateString("en-NG", { day: "2-digit", month: "short" })}</td>
                    <td className="p-3">{t.description}</td>
                    <td className={`p-3 text-right font-semibold ${t.type === "Withdrawal" ? "text-destructive" : "text-success"}`}>
                      {t.type === "Withdrawal" ? "-" : "+"}{formatNGN(t.amount)}
                    </td>
                    <td className="p-3 text-right hidden sm:table-cell">{formatNGN(t.balanceAfter)}</td>
                    <td className="p-3 hidden sm:table-cell"><TypeBadge type={t.type} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/trader/withdraw"><Button className="bg-primary hover:bg-primary/90"><ArrowUpFromLine className="h-4 w-4 mr-2" />Request Withdrawal</Button></Link>
        <Link to="/trader/transactions"><Button variant="outline"><Receipt className="h-4 w-4 mr-2" />View Full History</Button></Link>
        <Button variant="outline" onClick={() => toast.success("Statement download started (mock).")}>
          <Download className="h-4 w-4 mr-2" />Download Statement
        </Button>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: TraderTxn["type"] }) {
  const styles = {
    Deposit: "bg-success/15 text-success",
    Withdrawal: "bg-destructive/15 text-destructive",
    Interest: "bg-gold/20 text-gold-foreground",
  } as const;
  return <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${styles[type]}`}>{type}</span>;
}

function ProgressCircle({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const r = 56;
  const c = 2 * Math.PI * r;
  return (
    <div className="mt-4 grid place-items-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} stroke="currentColor" strokeWidth="12" fill="none" className="text-cream" />
        <circle cx="70" cy="70" r={r} stroke="currentColor" strokeWidth="12" fill="none"
          strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
          strokeLinecap="round" className="text-primary transition-all duration-700" />
      </svg>
      <p className="-mt-[88px] text-2xl font-bold">{Math.round(pct)}%</p>
      <div className="h-10" />
    </div>
  );
}
