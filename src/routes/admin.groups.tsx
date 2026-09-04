import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Search, Users, Wallet, PiggyBank, ShieldAlert, Download } from "lucide-react";
import { GroupStatusBadge } from "@/components/groups/GroupCard";
import {
  groupStore, useGroupState, formatNGN, computeTrustScore, trustLevelClasses,
  type GroupDispute, type SavingsGroup,
} from "@/lib/groupStore";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/groups")({
  head: () => ({
    meta: [
      { title: "Group Savings Oversight — SafeBox Admin" },
      { name: "description", content: "Monitor Ajo/Esusu groups, pooled balances, contribution activity, defaults and member disputes." },
      { property: "og:title", content: "Group Savings Oversight — SafeBox Admin" },
      { property: "og:description", content: "Operations console for SafeBox group contribution savings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminGroups,
});

function AdminGroups() {
  const state = useGroupState();
  const totals = groupStore.totals();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("pool");
  const [detail, setDetail] = useState<SavingsGroup | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = state.groups.filter((g) =>
      !q || g.name.toLowerCase().includes(q) || g.market.toLowerCase().includes(q) || (g.agentName ?? "").toLowerCase().includes(q));
    return [...list].sort((a, b) =>
      sort === "pool" ? b.pool - a.pool
      : sort === "collected" ? b.totalCollected - a.totalCollected
      : b.members.length - a.members.length);
  }, [state.groups, query, sort]);

  const chartData = rows.slice(0, 8).map((g) => ({ name: g.name.split(" ")[0], collected: g.totalCollected, pool: g.pool }));

  const exportCsv = () => {
    const header = "Group,Market,Agent,Type,Status,Members,Contribution,Pool,Collected,PaidOut\n";
    const body = rows.map((g) => [
      g.name, g.market, g.agentName ?? "-", g.type, g.status,
      g.members.filter((m) => m.status === "Active").length, g.contributionAmount, g.pool, g.totalCollected, g.totalPaidOut,
    ].join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([header + body], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "safebox-groups.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const live = detail ? groupStore.byId(detail.id) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Group Savings — All Markets</h1>
        <p className="text-sm text-muted-foreground">Ajo / Esusu circles, pooled balances, defaults and disputes.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Users, label: "Active groups", value: `${totals.activeGroups} / ${totals.groups}` },
          { icon: PiggyBank, label: "Pooled balance", value: formatNGN(totals.pooled) },
          { icon: Wallet, label: "Total collected", value: formatNGN(totals.collected) },
          { icon: ShieldAlert, label: "Open disputes", value: String(totals.openDisputes) },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon className="h-5 w-5 text-primary" />
            <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="text-lg font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="groups">
        <TabsList>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="disputes">Disputes ({totals.openDisputes})</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search group, market or agent" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="sm:w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pool">Highest pool</SelectItem>
                <SelectItem value="collected">Highest collected</SelectItem>
                <SelectItem value="members">Most members</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="p-4">
            <p className="text-sm font-semibold mb-3">Collections by group</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => formatNGN(v)} />
                  <Bar dataKey="collected" fill={C["primary"]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pool" fill={C["gold"]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Group</TableHead><TableHead>Market</TableHead><TableHead>Agent</TableHead>
                <TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Members</TableHead>
                <TableHead className="text-right">Pool</TableHead><TableHead className="text-right">Collected</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {rows.map((g) => (
                  <TableRow key={g.id} className="cursor-pointer" onClick={() => setDetail(g)}>
                    <TableCell className="font-medium hover:underline">{g.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{g.market}</TableCell>
                    <TableCell className="text-sm">{g.agentName ?? "—"}</TableCell>
                    <TableCell>{g.type}</TableCell>
                    <TableCell><GroupStatusBadge status={g.status} /></TableCell>
                    <TableCell className="text-right">{g.members.filter((m) => m.status === "Active").length}</TableCell>
                    <TableCell className="text-right">{formatNGN(g.pool)}</TableCell>
                    <TableCell className="text-right">{formatNGN(g.totalCollected)}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No groups found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
          <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
        </TabsContent>

        <TabsContent value="disputes" className="pt-4">
          <DisputesTable disputes={state.disputes} />
        </TabsContent>

        <TabsContent value="revenue" className="pt-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Service fees (₦100 / cycle)", value: formatNGN(totals.serviceFees) },
              { label: "Agent collection fees (₦50)", value: formatNGN(totals.agentFees) },
              { label: "Defaulted members", value: String(totals.defaulters) },
            ].map((s) => (
              <Card key={s.label} className="p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-lg font-bold">{s.value}</p>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!live} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {live && <AdminGroupDetail group={live} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DisputesTable({ disputes }: { disputes: GroupDispute[] }) {
  const [active, setActive] = useState<GroupDispute | null>(null);
  const [resolution, setResolution] = useState("");

  return (
    <>
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Raised</TableHead><TableHead>Group</TableHead><TableHead>Member</TableHead>
            <TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {disputes.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="text-xs">{new Date(d.iso).toLocaleDateString("en-NG", { dateStyle: "medium" })}</TableCell>
                <TableCell>{d.groupName}</TableCell>
                <TableCell>{d.raisedByName}</TableCell>
                <TableCell className="max-w-[220px] truncate">{d.subject}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={d.status === "Resolved" ? "bg-primary/10 text-primary border-primary/30" : "bg-amber-100 text-amber-800 border-amber-300"}>
                    {d.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => { setActive(d); setResolution(d.resolution ?? ""); }}>Review</Button>
                </TableCell>
              </TableRow>
            ))}
            {disputes.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No disputes raised</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{active?.subject}</DialogTitle></DialogHeader>
          {active && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{active.groupName} • raised by {active.raisedByName}</p>
              <Card className="p-3 text-sm bg-cream">{active.detail}</Card>
              <Textarea rows={3} placeholder="Resolution note" value={resolution} onChange={(e) => setResolution(e.target.value)} />
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => { if (active) { groupStore.setDisputeStatus(active.id, "Investigating", resolution); toast.success("Marked as investigating"); setActive(null); } }}>
              Investigating
            </Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => {
              if (!active) return;
              if (resolution.trim().length < 5) return toast.error("Add a resolution note");
              groupStore.setDisputeStatus(active.id, "Resolved", resolution);
              toast.success("Dispute resolved");
              setActive(null);
            }}>Resolve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AdminGroupDetail({ group }: { group: SavingsGroup }) {
  const contributions = groupStore.contributionsFor(group.id);
  const payouts = groupStore.payoutsFor(group.id);

  return (
    <div className="space-y-5">
      <DialogHeader>
        <DialogTitle className="flex flex-wrap items-center gap-2">{group.name} <GroupStatusBadge status={group.status} /></DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        {group.type} • {group.frequency} • {group.market} • Agent {group.agentName ?? "unassigned"} • Code {group.code}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: "Pool", v: formatNGN(group.pool) },
          { l: "Collected", v: formatNGN(group.totalCollected) },
          { l: "Paid out", v: formatNGN(group.totalPaidOut) },
          { l: "Cycle", v: `#${group.cycle}` },
        ].map((s) => (
          <Card key={s.l} className="p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.l}</p>
            <p className="text-sm font-bold">{s.v}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["Active", "Paused", "Completed"] as const).map((s) => (
          <Button key={s} size="sm" variant={group.status === s ? "default" : "outline"}
            onClick={() => { groupStore.setStatus(group.id, s); toast.success(`Group marked ${s}`); }}>
            {s}
          </Button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <p className="text-sm font-semibold mb-2">Members</p>
        <Table>
          <TableHeader><TableRow>
            <TableHead>#</TableHead><TableHead>Member</TableHead><TableHead>Trust</TableHead>
            <TableHead>Status</TableHead><TableHead className="text-right">Contributed</TableHead><TableHead className="text-right">Received</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {group.members.map((m) => {
              const t = computeTrustScore(m.traderId);
              return (
                <TableRow key={m.traderId}>
                  <TableCell>{m.position}</TableCell>
                  <TableCell>{m.name}<p className="text-xs text-muted-foreground">{m.phone}</p></TableCell>
                  <TableCell><Badge variant="outline" className={trustLevelClasses(t.level)}>{t.level} {t.score}</Badge></TableCell>
                  <TableCell>{m.status}{m.missed ? ` • ${m.missed} missed` : ""}</TableCell>
                  <TableCell className="text-right">{formatNGN(m.contributed)}</TableCell>
                  <TableCell className="text-right">{formatNGN(m.received)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="overflow-x-auto">
        <p className="text-sm font-semibold mb-2">Recent activity</p>
        <Table>
          <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Member</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
          <TableBody>
            {[...contributions.map((c) => ({ ...c, kind: `Contribution (${c.method})` })), ...payouts.map((p) => ({ ...p, kind: "Payout" }))]
              .sort((a, b) => b.iso.localeCompare(a.iso)).slice(0, 20)
              .map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs">{new Date(r.iso).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</TableCell>
                  <TableCell>{r.traderName}</TableCell>
                  <TableCell>{r.kind}</TableCell>
                  <TableCell className="text-right">{formatNGN(r.amount)}</TableCell>
                </TableRow>
              ))}
            {contributions.length + payouts.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No activity yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
