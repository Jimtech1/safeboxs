import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Users, HandCoins, Search, ShieldAlert } from "lucide-react";
import { GroupCard, GroupStatusBadge } from "@/components/groups/GroupCard";
import {
  groupStore, useGroupState, formatNGN, computeTrustScore, trustLevelClasses,
  type GroupFrequency, type GroupType, type SavingsGroup,
} from "@/lib/groupStore";
import { useCurrentAgentRecord } from "@/lib/platformStore";
import { useTraders } from "@/lib/agentStore";
import { toast } from "sonner";

export const Route = createFileRoute("/agent/groups")({
  head: () => ({
    meta: [
      { title: "Group Savings — SafeBox Agent" },
      { name: "description", content: "Create Ajo/Esusu groups, collect contributions and disburse rotational payouts from your float." },
      { property: "og:title", content: "Group Savings — SafeBox Agent" },
      { property: "og:description", content: "Manage group contribution savings for your market traders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AgentGroups,
});

function AgentGroups() {
  const agent = useCurrentAgentRecord();
  const state = useGroupState();
  const traders = useTraders();
  const [query, setQuery] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [detail, setDetail] = useState<SavingsGroup | null>(null);

  const myGroups = useMemo(() => {
    const list = agent ? state.groups.filter((g) => !g.agentId || g.agentId === agent.id) : state.groups;
    const q = query.trim().toLowerCase();
    return q ? list.filter((g) => g.name.toLowerCase().includes(q) || g.market.toLowerCase().includes(q) || g.code.toLowerCase().includes(q)) : list;
  }, [state.groups, agent, query]);

  const totals = groupStore.totals();
  const live = detail ? groupStore.byId(detail.id) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Group Savings</h1>
          <p className="text-sm text-muted-foreground">Ajo / Esusu circles you manage. Contributions use your float; payouts refund it.</p>
        </div>
        <Button onClick={() => setOpenCreate(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Create group
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Groups", value: myGroups.length },
          { label: "Members", value: totals.members },
          { label: "Pooled now", value: formatNGN(totals.pooled) },
          { label: "Group fees earned", value: formatNGN(totals.agentFees) },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-lg font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search groups by name, market or code" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {myGroups.length === 0 ? (
        <Card className="p-10 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No groups yet</p>
          <p className="text-sm text-muted-foreground">Create a savings circle for your market.</p>
          <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={() => setOpenCreate(true)}>Create your first group</Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {myGroups.map((g) => (
            <GroupCard key={g.id} group={g} onOpen={() => setDetail(g)}
              footer={<Button variant="outline" className="w-full" onClick={() => setDetail(g)}>Manage group</Button>} />
          ))}
        </div>
      )}

      <CreateGroupDialog open={openCreate} onOpenChange={setOpenCreate}
        agent={agent ? { id: agent.id, name: agent.name, market: agent.market } : null} />

      <Dialog open={!!live} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {live && <GroupManage group={live} traders={traders} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateGroupDialog({ open, onOpenChange, agent }: {
  open: boolean; onOpenChange: (o: boolean) => void;
  agent: { id: string; name: string; market: string } | null;
}) {
  const [form, setForm] = useState({
    name: "", description: "", type: "Rotational" as GroupType, frequency: "Weekly" as GroupFrequency,
    market: agent?.market ?? "", contributionAmount: "5000", maxMembers: "6", targetAmount: "",
  });

  const submit = () => {
    const res = groupStore.createGroup({
      name: form.name, description: form.description, type: form.type, frequency: form.frequency,
      market: form.market || agent?.market || "Market", contributionAmount: Number(form.contributionAmount),
      maxMembers: Number(form.maxMembers),
      targetAmount: form.type === "Target" ? Number(form.targetAmount) : undefined,
      createdBy: agent?.id ?? "AGENT", createdByName: agent?.name ?? "Agent",
      agentId: agent?.id, agentName: agent?.name,
    });
    if ("error" in res) return toast.error(res.error);
    toast.success(`Group created — share code ${res.group.code}`);
    onOpenChange(false);
    setForm({ ...form, name: "", description: "", targetAmount: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create savings group</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Group name</Label>
            <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Bodija Provisions Ajo" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea className="mt-1" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this circle for?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as GroupType })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rotational">Rotational (Ajo)</SelectItem>
                  <SelectItem value="Target">Target (Esusu)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v as GroupFrequency })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Contribution (₦)</Label>
              <Input className="mt-1" type="number" value={form.contributionAmount} onChange={(e) => setForm({ ...form, contributionAmount: e.target.value })} />
            </div>
            <div>
              <Label>Max members</Label>
              <Input className="mt-1" type="number" value={form.maxMembers} onChange={(e) => setForm({ ...form, maxMembers: e.target.value })} />
            </div>
            {form.type === "Target" && (
              <div className="col-span-2">
                <Label>Target amount (₦)</Label>
                <Input className="mt-1" type="number" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} />
              </div>
            )}
            <div className="col-span-2">
              <Label>Market / location</Label>
              <Input className="mt-1" value={form.market} onChange={(e) => setForm({ ...form, market: e.target.value })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={submit}>Create group</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GroupManage({ group, traders }: { group: SavingsGroup; traders: { id: string; name: string; phone: string }[] }) {
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState(String(group.contributionAmount));
  const [addTraderId, setAddTraderId] = useState("");
  const contributions = groupStore.contributionsFor(group.id);
  const payouts = groupStore.payoutsFor(group.id);
  const next = groupStore.nextRecipient(group.id);
  const activeMembers = group.members.filter((m) => m.status !== "Left");
  const nonMembers = traders.filter((t) => !group.members.some((m) => m.traderId === t.id && m.status !== "Left"));

  const collect = () => {
    const res = groupStore.recordContribution({ groupId: group.id, traderId: memberId, method: "Agent cash", amount: Number(amount) });
    if ("error" in res) return toast.error(res.error);
    toast.success(`Collected ${formatNGN(res.amount)} • SMS confirmation sent`);
  };

  const disburse = () => {
    if (!next) return toast.error("No eligible recipient");
    const res = groupStore.payout({ groupId: group.id, traderId: next.traderId, method: "Agent cash" });
    if ("error" in res) return toast.error(res.error);
    toast.success(`Paid ${formatNGN(res.amount)} to ${next.name} — float refunded`);
  };

  return (
    <div className="space-y-5">
      <DialogHeader>
        <DialogTitle className="flex flex-wrap items-center gap-2">
          {group.name} <GroupStatusBadge status={group.status} />
        </DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">{group.description || "Group savings circle"}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: "Pool", v: formatNGN(group.pool) },
          { l: "Collected", v: formatNGN(group.totalCollected) },
          { l: "Paid out", v: formatNGN(group.totalPaidOut) },
          { l: "Join code", v: group.code },
        ].map((s) => (
          <Card key={s.l} className="p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.l}</p>
            <p className="text-sm font-bold">{s.v}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="collect">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="collect">Collect</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="payout">Payout</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="collect" className="space-y-3 pt-4">
          <div>
            <Label>Member</Label>
            <Select value={memberId} onValueChange={setMemberId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select member" /></SelectTrigger>
              <SelectContent>
                {activeMembers.map((m) => <SelectItem key={m.traderId} value={m.traderId}>{m.name} — {m.phone}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Amount (₦)</Label>
            <Input className="mt-1" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90" onClick={collect} disabled={!memberId}>
            <HandCoins className="h-4 w-4 mr-2" /> Record cash contribution
          </Button>
          <p className="text-xs text-muted-foreground">
            Your float is debited by the contribution and you keep the cash collected. You earn ₦50 per contribution.
          </p>
        </TabsContent>

        <TabsContent value="members" className="space-y-3 pt-4">
          <div className="flex gap-2">
            <Select value={addTraderId} onValueChange={setAddTraderId}>
              <SelectTrigger><SelectValue placeholder="Add a trader to this group" /></SelectTrigger>
              <SelectContent>
                {nonMembers.slice(0, 40).map((t) => <SelectItem key={t.id} value={t.id}>{t.name} — {t.phone}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              const res = groupStore.joinGroup(group.id, addTraderId);
              if ("error" in res) return toast.error(res.error);
              toast.success("Member added");
              setAddTraderId("");
            }} disabled={!addTraderId}>Add</Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>#</TableHead><TableHead>Member</TableHead><TableHead>Trust</TableHead>
                <TableHead className="text-right">Contributed</TableHead><TableHead className="text-right">Received</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {activeMembers.map((m) => {
                  const trust = computeTrustScore(m.traderId);
                  return (
                    <TableRow key={m.traderId}>
                      <TableCell>{m.position}</TableCell>
                      <TableCell>
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.phone}</p>
                      </TableCell>
                      <TableCell><Badge variant="outline" className={trustLevelClasses(trust.level)}>{trust.level} {trust.score}</Badge></TableCell>
                      <TableCell className="text-right">{formatNGN(m.contributed)}</TableCell>
                      <TableCell className="text-right">{formatNGN(m.received)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => { groupStore.markMissed(group.id, m.traderId); toast.success("Missed contribution logged"); }}>
                          <ShieldAlert className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="payout" className="space-y-3 pt-4">
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Next in line — cycle #{group.cycle}</p>
            <p className="mt-1 font-semibold">{next ? `${next.name} • ${next.phone}` : "No eligible member"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pool {formatNGN(group.pool)} minus ₦{group.serviceFeePerCycle} service fee
            </p>
          </Card>
          <Button className="w-full bg-gold text-gold-foreground hover:bg-gold/90" onClick={disburse} disabled={!next || group.pool <= 0}>
            Disburse pool as cash
          </Button>
          <p className="text-xs text-muted-foreground">Paying out as cash refunds your float by the same amount and earns you the withdrawal fee share.</p>
        </TabsContent>

        <TabsContent value="history" className="pt-4 space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2">Contributions</p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Member</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                <TableBody>
                  {contributions.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No contributions yet</TableCell></TableRow>}
                  {contributions.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-xs">{new Date(c.iso).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</TableCell>
                      <TableCell>{c.traderName}</TableCell>
                      <TableCell>{c.method}</TableCell>
                      <TableCell className="text-right">{formatNGN(c.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">Payouts</p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Recipient</TableHead><TableHead>Cycle</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                <TableBody>
                  {payouts.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No payouts yet</TableCell></TableRow>}
                  {payouts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs">{new Date(p.iso).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</TableCell>
                      <TableCell>{p.traderName}</TableCell>
                      <TableCell>#{p.cycle}</TableCell>
                      <TableCell className="text-right">{formatNGN(p.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
