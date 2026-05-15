import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowUpFromLine, Search, MapPin, Calendar, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { currentAgent, transactions, formatNaira } from "@/lib/mockData";

export const Route = createFileRoute("/agent/")({
  component: AgentHome,
});

function AgentHome() {
  const recent = transactions.slice(0, 5);
  const net = currentAgent.todayDeposits - currentAgent.todayWithdrawals;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3 w-3" />{currentAgent.market}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
          <Calendar className="h-3 w-3" />{new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Float / balance card */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="p-5">
          <p className="text-xs uppercase tracking-wide text-primary-foreground/70">Available Float</p>
          <p className="font-display text-4xl font-bold mt-1">{formatNaira(currentAgent.float)}</p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-primary-foreground/70">Deposits</p>
              <p className="font-semibold text-base text-success-foreground/90">{formatNaira(currentAgent.todayDeposits)}</p>
            </div>
            <div>
              <p className="text-primary-foreground/70">Withdrawals</p>
              <p className="font-semibold text-base">{formatNaira(currentAgent.todayWithdrawals)}</p>
            </div>
            <div>
              <p className="text-primary-foreground/70">Net</p>
              <p className="font-semibold text-base text-gold">+{formatNaira(net)}</p>
            </div>
          </div>
        </div>
        <Link to="/agent/eod" className="block bg-black/15 px-5 py-3 text-sm font-medium flex items-center justify-between hover:bg-black/20 transition">
          End Day Settlement <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>

      {/* Quick actions - large mobile-friendly */}
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
