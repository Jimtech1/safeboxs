import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowUpFromLine, Search, MapPin, Calendar, Plus, Wallet, TrendingUp, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { currentAgent, transactions, formatNaira } from "@/lib/mockData";

export const Route = createFileRoute("/agent/")({
  component: AgentHome,
});

function AgentHome() {
  const recent = transactions.slice(0, 5);
  const lowFloat = currentAgent.floatBalance < currentAgent.lowFloatThreshold;
  const utilization = Math.min(100, Math.round((currentAgent.floatUsedToday / currentAgent.floatCapacity) * 100));

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
          <p className="font-display text-4xl font-bold mt-1">{formatNaira(currentAgent.floatBalance)}</p>
          <p className="text-xs text-primary-foreground/70 mt-1">Capital you've loaded to credit traders</p>

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

      {/* Daily collection summary */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Today's Collection</h3>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Live</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-success/10 p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Deposits Collected</p>
            <p className="font-display text-lg font-bold text-success mt-1">{formatNaira(currentAgent.depositsCollectedToday)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{currentAgent.tradersServedToday} traders</p>
          </div>
          <div className="rounded-xl bg-primary/10 p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Float Used</p>
            <p className="font-display text-lg font-bold text-primary mt-1">{formatNaira(currentAgent.floatUsedToday)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{utilization}% of cap</p>
          </div>
          <div className="rounded-xl bg-gold/15 p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Commission</p>
            <p className="font-display text-lg font-bold text-gold-foreground mt-1">{formatNaira(currentAgent.commissionToday)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Earned today</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Float utilization</span>
            <span>{utilization}%</span>
          </div>
          <Progress value={utilization} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          Cash you collected from traders is yours — it reimburses the float you spent crediting their accounts. No end-of-day deposit required.
        </p>
      </Card>

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
