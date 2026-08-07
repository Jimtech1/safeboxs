import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, TrendingUp, Users, Flame, AlertTriangle } from "lucide-react";
import { getCurrentTrader, formatNGN, type Trader } from "@/lib/mockTraderData";
import { groupStore, useGroupState, computeTrustScore, trustLevelClasses } from "@/lib/groupStore";

export const Route = createFileRoute("/trader/trust")({
  head: () => ({
    meta: [
      { title: "Trust Score & Credit Profile — SafeBox" },
      { name: "description", content: "See how your savings consistency, KYC and group participation build your SafeBox trust score and credit readiness." },
      { property: "og:title", content: "Trust Score & Credit Profile — SafeBox" },
      { property: "og:description", content: "Build trust through consistent saving and group participation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TraderTrust,
});

function TraderTrust() {
  useGroupState();
  const [trader, setTrader] = useState<Trader | null>(null);

  useEffect(() => {
    const refresh = () => setTrader(getCurrentTrader());
    refresh();
    window.addEventListener("trader-store-change", refresh);
    return () => window.removeEventListener("trader-store-change", refresh);
  }, []);

  if (!trader) return null;
  const trust = computeTrustScore(trader.id);
  const groups = groupStore.forTrader(trader.id);
  const activity = groupStore.traderActivity(trader.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Trust Score</h1>
        <p className="text-sm text-muted-foreground">Your savings behaviour builds trust — and unlocks credit readiness.</p>
      </div>

      <Card className="p-6 bg-sidebar text-sidebar-foreground">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-sidebar-foreground/70">Current score</p>
            <p className="mt-1 text-5xl font-bold">{trust.score}<span className="text-lg font-normal text-sidebar-foreground/60">/100</span></p>
            <Badge variant="outline" className={`${trustLevelClasses(trust.level)} mt-3`}>{trust.level} tier</Badge>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-sidebar-foreground/70">Indicative credit limit</p>
            <p className="mt-1 text-2xl font-bold">{formatNGN(trust.creditLimit)}</p>
            <p className="text-xs text-sidebar-foreground/60">Based on tier and current balance</p>
          </div>
        </div>
        <Progress value={trust.score} className="mt-5" />
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Users, label: "Groups joined", value: String(groups.length) },
          { icon: TrendingUp, label: "Group contributions", value: String(activity.contributions.length) },
          { icon: Flame, label: "Savings streak", value: `${trader.streakDays} days` },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon className="h-5 w-5 text-primary" />
            <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="text-lg font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <p className="font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> How your score is calculated</p>
        <div className="mt-4 space-y-4">
          {trust.factors.map((f) => (
            <div key={f.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{f.label}</span>
                <span className={f.earned < 0 ? "text-destructive" : "text-muted-foreground"}>
                  {f.earned} / {f.weight} pts
                </span>
              </div>
              <Progress value={Math.max(0, (f.earned / Math.abs(f.weight)) * 100)} className="mt-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">{f.note}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 border-gold/40 bg-gold/5">
        <p className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-gold-foreground" /> Grow your score faster</p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
          <li>Complete identity verification (KYC) for the full 20 points.</li>
          <li>Contribute on schedule — every logged contribution improves consistency.</li>
          <li>Join and complete group cycles without missing a turn.</li>
          <li>Keep your daily savings streak alive and avoid unnecessary withdrawals.</li>
        </ul>
      </Card>
    </div>
  );
}
