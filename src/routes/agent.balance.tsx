import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Search, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { traders, formatNaira, transactions } from "@/lib/mockData";

export const Route = createFileRoute("/agent/balance")({
  head: () => ({ meta: [
    { title: "Float Balance | SafeBox Agent" },
    { name: "description", content: "Track your float capital, usage and refunds." },
    { property: "og:title", content: "Float Balance | SafeBox Agent" },
    { property: "og:description", content: "Track your float capital, usage and refunds." },
  ]}),
  component: BalanceFlow,
});

function BalanceFlow() {
  const [phone, setPhone] = useState("");
  const [shown, setShown] = useState(false);
  const trader = traders.find((t) => t.phone === phone) ?? traders[0];
  const last = transactions.find((t) => t.traderPhone === trader.phone) ?? transactions[0];

  return (
    <div className="space-y-4">
      <Link to="/agent" className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Back</Link>
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent"><Search /></div>
        <h1 className="text-xl font-bold">Check Balance</h1>
      </div>

      {!shown ? (
        <Card className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium">Trader phone number</label>
            <Input className="mt-1.5 h-12 text-lg" placeholder="0801 234 5678" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button disabled={!phone} className="w-full h-12 bg-accent hover:bg-accent/90" onClick={() => setShown(true)}>Check Balance</Button>
        </Card>
      ) : (
        <Card className="p-5 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Trader</p>
            <p className="font-semibold text-lg">{trader.name}</p>
            <p className="text-xs text-muted-foreground">{trader.phone}</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 text-center">
            <p className="text-xs uppercase tracking-wide text-primary-foreground/70">Current balance</p>
            <p className="font-display text-4xl font-bold mt-1">{formatNaira(trader.balance)}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Last transaction</p>
            <p className="font-medium text-sm">{last.type} • {formatNaira(last.amount)}</p>
            <p className="text-xs text-muted-foreground">{last.timestamp}</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-success"><MessageSquare className="h-4 w-4" /> Balance also sent via SMS</div>
          <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => { setShown(false); setPhone(""); }}>Done</Button>
        </Card>
      )}
    </div>
  );
}
