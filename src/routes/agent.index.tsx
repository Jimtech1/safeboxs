import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowUpFromLine, Search, MapPin, Calendar, Plus, Minus, Wallet, AlertTriangle, Info, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { currentAgent, transactions, formatNaira } from "@/lib/mockData";
import { useAgentState } from "@/lib/agentStore";

export const Route = createFileRoute("/agent/")({
  component: AgentHome,
});

function AgentHome() {
  const s = useAgentState();
  const recent = transactions.slice(0, 5);
  const lowFloat = s.floatBalance < currentAgent.lowFloatThreshold;
  const utilization = Math.min(100, Math.round((s.depositsCollectedToday / currentAgent.floatCapacity) * 100));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3 w-3" />{currentAgent.market}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
          <Calendar className="h-3 w-3" />{new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Float capital card */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-primary-foreground/70">Your Float Balance</p>
            <Wallet className="h-4 w-4 text-gold" />
          </div>
          <p className="font-display text-4xl font-bold mt-1">{formatNaira(s.floatBalance)}</p>
          <p className="text-xs text-primary-foreground/70 mt-1">Updates live: starting float − deposits + withdrawals</p>

          <Link to="/agent/topup" className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-gold text-gold-foreground py-3 font-semibold hover:bg-gold/90 transition">
            <Plus className="h-5 w-5" /> Add Money to Float
          </Link>
        </div>
      </Card>

      {lowFloat && (
        <Card className="p-4 border-2 border-warning bg-warning/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Low float warning</p>
              <p className="text-xs text-muted-foreground mt-0.5">Top up to keep serving traders without interruption.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Side-by-side cards: deposits + withdrawals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Today's Collections */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              <ArrowDownToLine className="h-4 w-4 text-success" /> Today's Collections
            </h3>
            <span className="text-[10px] uppercase text-muted-foreground">Live</span>
          </div>
          <div className="mt-3 space-y-2.5">
            <Metric label="Deposits Collected" value={formatNaira(s.depositsCollectedToday)} tone="success" sub={`${s.depositsCountToday} traders`} />
            <Metric label="Float Used" value={formatNaira(s.depositsCollectedToday)} tone="primary" sub={`${utilization}% of cap`} />
            <Metric label="Deposit Fee Earned" value={formatNaira(s.depositFeeEarnedToday)} tone="gold" sub="₦10 / deposit" />
          </div>
          <div className="mt-3">
            <Progress value={utilization} />
          </div>
        </Card>

        {/* Today's Withdrawals */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              <ArrowUpFromLine className="h-4 w-4 text-destructive" /> Today's Withdrawals
            </h3>
            <span className="text-[10px] uppercase text-muted-foreground">Live</span>
          </div>
          <div className="mt-3 space-y-2.5">
            <Metric label="Withdrawals Processed" value={formatNaira(s.withdrawalsProcessedToday)} tone="destructive" sub={`${s.withdrawalsCountToday} txns`} />
            <Metric label="Float Refund" value={formatNaira(s.withdrawalsProcessedToday)} tone="primary" sub="back to your float" />
            <Metric label="Withdrawal Fee Earned" value={formatNaira(s.withdrawalFeeEarnedToday)} tone="gold" sub="₦90 / withdrawal" />
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-cream p-2.5 text-[11px] text-muted-foreground leading-snug">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
            <span>When a trader withdraws cash, you pay from your pocket. Your float balance increases by the same amount to refund you. The trader pays a ₦100 fee, which you share with SafeBox.</span>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link to="/agent/deposit">
          <Card className="p-4 hover:shadow-md transition cursor-pointer border-2 hover:border-success">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-success/15 text-success mx-auto">
              <ArrowDownToLine className="h-6 w-6" />
            </div>
            <p className="mt-2 text-center font-semibold text-sm">Deposit</p>
          </Card>
        </Link>
        <Link to="/agent/withdraw">
          <Card className="p-4 hover:shadow-md transition cursor-pointer border-2 hover:border-destructive">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-destructive/15 text-destructive mx-auto">
              <ArrowUpFromLine className="h-6 w-6" />
            </div>
            <p className="mt-2 text-center font-semibold text-sm">Withdraw</p>
          </Card>
        </Link>
        <Link to="/agent/balance">
          <Card className="p-4 hover:shadow-md transition cursor-pointer border-2 hover:border-accent">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/15 text-accent mx-auto">
              <Search className="h-6 w-6" />
            </div>
            <p className="mt-2 text-center font-semibold text-sm">Balance</p>
          </Card>
        </Link>
      </div>

      {/* Recent transactions */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Recent Transactions</h3>
          <Link to="/agent/transactions" className="text-xs text-accent font-medium">See all</Link>
        </div>
        <div className="mt-3 divide-y">
          {recent.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className={`grid h-9 w-9 place-items-center rounded-full ${t.type === "Deposit" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                  {t.type === "Deposit" ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.traderName}</p>
                  <p className="text-xs text-muted-foreground">{t.type} • {t.timestamp}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold text-sm ${t.type === "Deposit" ? "text-success" : "text-destructive"}`}>
                  {t.type === "Deposit" ? "+" : "−"}{formatNaira(t.amount)}
                </p>
                <Badge variant="outline" className="text-[10px] mt-0.5">{t.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: "success" | "primary" | "destructive" | "gold" }) {
  const toneClass = {
    success: "text-success",
    primary: "text-primary",
    destructive: "text-destructive",
    gold: "text-gold-foreground",
  }[tone];
  return (
    <div className="flex items-end justify-between gap-2">
      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
      <p className={`font-display text-base font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}
