import { useChartColors } from "@/lib/chartColors";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { currentAgent, dailyCommission, formatNaira } from "@/lib/mockData";

export const Route = createFileRoute("/agent/performance")({
  head: () => ({ meta: [
    { title: "My Performance | SafeBox Agent" },
    { name: "description", content: "Collections, commissions and streaks for your route." },
    { property: "og:title", content: "My Performance | SafeBox Agent" },
    { property: "og:description", content: "Collections, commissions and streaks for your route." },
  ]}),
  component: Performance,
});

const stats = [
  { label: "Today", value: currentAgent.commissionToday, tone: "success" },
  { label: "This Week", value: currentAgent.commissionWeek, tone: "primary" },
  { label: "This Month", value: currentAgent.commissionMonth, tone: "gold" },
];

const toneBg: Record<string, string> = {
  success: "bg-success/15 text-success",
  primary: "bg-primary/10 text-primary",
  gold: "bg-gold/15 text-gold-foreground",
};

const history = Array.from({ length: 6 }, (_, i) => ({
  date: `${i+1} Nov`,
  deposits: 8 + i,
  withdrawals: 3 + (i % 4),
  commission: 800 + i * 230,
}));

function Performance() {
  const C = useChartColors();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">My Performance</h1>

      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <Card key={s.label} className={`p-3 ${toneBg[s.tone]} border-0`}>
            <p className="text-[10px] uppercase opacity-80">{s.label}</p>
            <p className="font-display text-lg font-bold mt-1">{formatNaira(s.value)}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Traders served</p>
          <p className="font-display text-2xl font-bold">{currentAgent.tradersServed}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Avg daily deposits</p>
          <p className="font-display text-2xl font-bold">{formatNaira(currentAgent.avgDailyDeposits)}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold text-sm">Daily commission • last 7 days</h3>
        <div className="h-56 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyCommission}>
              <CartesianGrid strokeDasharray="3 3" stroke={C["border"]} />
              <XAxis dataKey="day" stroke={C["muted-foreground"]} fontSize={11} />
              <YAxis stroke={C["muted-foreground"]} fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: 12, borderColor: C["border"], background: C["card"], color: C["foreground"] }} />
              <Bar dataKey="value" fill={C["gold"]} radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-sm">Commission history</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="py-2 pr-2">Date</th>
                <th className="py-2 pr-2 text-right">Dep</th>
                <th className="py-2 pr-2 text-right">With</th>
                <th className="py-2 text-right">Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {history.map((h) => (
                <tr key={h.date}>
                  <td className="py-2 pr-2">{h.date}</td>
                  <td className="py-2 pr-2 text-right">{h.deposits}</td>
                  <td className="py-2 pr-2 text-right">{h.withdrawals}</td>
                  <td className="py-2 text-right font-semibold text-success">{formatNaira(h.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
