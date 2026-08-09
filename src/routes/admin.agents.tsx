import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus } from "lucide-react";
import { agents, formatNaira, principals } from "@/lib/mockData";

export const Route = createFileRoute("/admin/agents")({
  head: () => ({ meta: [
    { title: "Agent Management | SafeBox Admin" },
    { name: "description", content: "Manage SafeBox field agents, status and float balances." },
    { property: "og:title", content: "Agent Management | SafeBox Admin" },
    { property: "og:description", content: "Manage SafeBox field agents, status and float balances." },
  ]}),
  component: AgentsPage,
});

function AgentsPage() {
  const [q, setQ] = useState("");
  const [principal, setPrincipal] = useState("All");
  const [status, setStatus] = useState("All");

  const filtered = agents.filter((a) =>
    (principal === "All" || a.principal === principal) &&
    (status === "All" || a.status === status) &&
    (q === "" || a.name.toLowerCase().includes(q.toLowerCase()) || a.phone.includes(q) || a.id.toLowerCase().includes(q.toLowerCase())),
  );

  const statusColor = (s: string) =>
    s === "Active" ? "bg-success" : s === "Pending" ? "bg-warning" : "bg-destructive";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">{agents.length} agents across markets and principals.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90"><UserPlus className="h-4 w-4 mr-2" />Approve New Agent</Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name, phone, ID…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="border rounded-md px-3 text-sm bg-white" value={principal} onChange={(e) => setPrincipal(e.target.value)}>
            <option>All</option>
            {principals.map((p) => <option key={p}>{p}</option>)}
          </select>
          <select className="border rounded-md px-3 text-sm bg-white" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Suspended</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                <th className="py-3 pr-4">Agent ID</th>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Phone</th>
                <th className="py-3 pr-4">Market</th>
                <th className="py-3 pr-4">Principal</th>
                <th className="py-3 pr-4 text-right">Float Balance</th>
                <th className="py-3 pr-4 text-right">Used Today</th>
                <th className="py-3 pr-4 text-right">Comm. (MTD)</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-cream">
                  <td className="py-3 pr-4 font-mono text-xs">{a.id}</td>
                  <td className="py-3 pr-4 font-medium">{a.name}</td>
                  <td className="py-3 pr-4">{a.phone}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{a.market}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{a.principal}</td>
                  <td className="py-3 pr-4 text-right">
                    <span className={a.floatBalance < 50000 ? "text-destructive font-semibold" : "font-medium"}>{formatNaira(a.floatBalance)}</span>
                  </td>
                  <td className="py-3 pr-4 text-right text-muted-foreground">{formatNaira(a.floatUsedToday)}</td>
                  <td className="py-3 pr-4 text-right font-semibold text-success">{formatNaira(a.commissionMTD)}</td>
                  <td className="py-3 pr-4"><Badge className={statusColor(a.status)}>{a.status}</Badge></td>
                  <td className="py-3"><Button size="sm" variant="ghost">View</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
