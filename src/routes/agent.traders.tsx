import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { traders, formatNaira } from "@/lib/mockData";

export const Route = createFileRoute("/agent/traders")({
  component: AgentTraders,
});

const mask = (p: string) => p.slice(0, 4) + "***" + p.slice(-3);

function AgentTraders() {
  const list = traders.slice(0, 12);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">My Traders</h1>
        <Button className="bg-primary hover:bg-primary/90" size="sm"><Plus className="h-4 w-4 mr-1" />Add</Button>
      </div>
      <Card className="divide-y">
        {list.map((t) => (
          <div key={t.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary font-semibold">{t.name.charAt(0)}</div>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{mask(t.phone)} • {t.lastTxn}</p>
              </div>
            </div>
            <p className="font-semibold text-sm text-primary">{formatNaira(t.balance)}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
