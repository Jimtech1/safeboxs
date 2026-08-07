import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { Plus, Users, Search, ShieldQuestion, Wallet } from "lucide-react";
import { GroupCard, GroupStatusBadge } from "@/components/groups/GroupCard";
import {
  groupStore, useGroupState, formatNGN, computeTrustScore, trustLevelClasses,
  type GroupFrequency, type GroupType, type SavingsGroup,
} from "@/lib/groupStore";
import { getCurrentTrader, type Trader } from "@/lib/mockTraderData";
import { toast } from "sonner";

export const Route = createFileRoute("/trader/groups")({
  head: () => ({
    meta: [
      { title: "Group Savings — SafeBox Trader" },
      { name: "description", content: "Join or create Ajo/Esusu savings circles, contribute from your wallet and track rotational payouts." },
      { property: "og:title", content: "Group Savings — SafeBox Trader" },
      { property: "og:description", content: "Save together with your market community on SafeBox." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TraderGroups,
});

function TraderGroups() {
  const state = useGroupState();
  const [trader, setTrader] = useState<Trader | null>(null);
  const [query, setQuery] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [detail, setDetail] = useState<SavingsGroup | null>(null);

  useEffect(() => {
    const refresh = () => setTrader(getCurrentTrader());
    refresh();
    window.addEventListener("trader-store-change", refresh);
    return () => window.removeEventListener("trader-store-change", refresh);
  }, []);

  const mine = trader ? groupStore.forTrader(trader.id) : [];
  const discover = useMemo(() => {
    const list = trader ? groupStore.publicGroups(trader.id) : [];
    const q = query.trim().toLowerCase();
    return q ? list.filter((g) => g.name.toLowerCase().includes(q) || g.market.toLowerCase().includes(q)) : list;
  }, [state.groups, trader, query]);

  const trust = trader ? computeTrustScore(trader.id) : null;
  const live = detail ? groupStore.byId(detail.id) : null;

  const join = (groupId: string) => {
    if (!trader) return;
    const res = groupStore.joinGroup(groupId, trader.id);
    if ("error" in res) return toast.error(res.error);
    toast.success("You joined the group");
  };

  const joinByCode = () => {
    if (!trader) return;
    const g = groupStore.byCode(joinCode);
    if (!g) return toast.error("No group with that code");
    const res = groupStore.joinGroup(g.id, trader.id);
    if ("error" in res) return toast.error(res.error);
    toast.success(`Joined ${g.name}`);
    setJoinCode("");
  };

  if (!trader) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Group Savings</h1>
          <p className="text-sm text-muted-foreground">Save with your market community — Ajo rotations and Esusu targets.</p>
        </div>
        <div className="flex gap-2">
          {trust && (
            <Badge variant="outline" className={`${trustLevelClasses(trust.level)} px-3 py-1.5`}>
              Trust {trust.score} • {trust.level}
            </Badge>
          )}
          <Button onClick={() => setOpenCreate(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> New group
          </Button>
        </div>
      </div>

      <Tabs defaultValue="mine">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="mine">My groups ({mine.length})</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="pt-4">
          {mine.length === 0 ? (
            <Card className="p-10 text-center">
              <Users className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-medium">You are not in any group yet</p>
              <p className="text-sm text-muted-foreground">Join a public circle or create your own.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {mine.map((g) => (
                <GroupCard key={g.id} group={g} onOpen={() => setDetail(g)}
                  footer={<Button variant="outline" className="w-full" onClick={() => setDetail(g)}>Open group</Button>} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by group or market" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Input placeholder="Join code e.g. SB1024" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} className="sm:w-40" />
              <Button variant="outline" onClick={joinByCode} disabled={!joinCode.trim()}>Join</Button>
            </div>
          </div>
          {discover.length === 0 ? (
            <Card className="p-10 text-center text-sm text-muted-foreground">No open groups match your search.</Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {discover.map((g) => (
                <GroupCard key={g.id} group={g} onOpen={() => setDetail(g)}
                  footer={<Button className="w-full bg-primary hover:bg-primary/90" onClick={() => join(g.id)}>Join group</Button>} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateGroupDialog open={openCreate} onOpenChange={setOpenCreate} trader={trader} />

      <Dialog open={!!live} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {live && <GroupDetail group={live} trader={trader} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateGroupDialog({ open, onOpenChange, trader }: { open: boolean; onOpenChange: (o: boolean) => void; trader: Trader }) {
  const [form, setForm] = useState({
    name: "", description: "", type: "Rotational" as GroupType, frequency: "Weekly" as GroupFrequency,
    contributionAmount: "5000", maxMembers: "6", targetAmount: "", visibility: "Public" as "Public" | "Private",
  });

  const submit = () => {
    const res = groupStore.createGroup({
      name: form.name, description: form.description, type: form.type, frequency: form.frequency,
      market: trader.market ?? trader.agentLocation, visibility: form.visibility,
      contributionAmount: Number(form.contributionAmount), maxMembers: Number(form.maxMembers),
      targetAmount: form.type === "Target" ? Number(form.targetAmount) : undefined,
      createdBy: trader.id, createdByName: trader.name,
      agentId: trader.agentId, agentName: trader.agentName, seedMemberTraderId: trader.id,
    });
    if ("error" in res) return toast.error(res.error);
    toast.success(`Group created — invite others with code ${res.group.code}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create a savings group</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Group name</Label>
            <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sunday Ajo Circle" />
          </div>
          <div>
            <Label>What is it for?</Label>
            <Textarea className="mt-1" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
              <Label>Visibility</Label>
              <Select value={form.visibility} onValueChange={(v) => setForm({ ...form, visibility: v as "Public" | "Private" })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public — anyone can find and join</SelectItem>
                  <SelectItem value="Private">Private — join by code only</SelectItem>
                </SelectContent>
              </Select>
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

function GroupDetail({ group, trader }: { group: SavingsGroup; trader: Trader }) {
  const [amount, setAmount] = useState(String(group.contributionAmount));
  const [dispute, setDispute] = useState({ subject: "", detail: "" });
  const me = group.members.find((m) => m.traderId === trader.id && m.status !== "Left");
  const contributions = groupStore.contributionsFor(group.id);
  const payouts = groupStore.payoutsFor(group.id);
  const next = groupStore.nextRecipient(group.id);

  const contribute = () => {
    const res = groupStore.recordContribution({ groupId: group.id, traderId: trader.id, method: "Wallet", amount: Number(amount) });
    if ("error" in res) return toast.error(res.error);
    toast.success(`${formatNGN(res.amount)} contributed from your savings balance`);
  };

  return (
    <div className="space-y-5">
      <DialogHeader>
        <DialogTitle className="flex flex-wrap items-center gap-2">{group.name} <GroupStatusBadge status={group.status} /></DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">{group.description || `${group.type} • ${group.frequency} • ${group.market}`}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: "Pool", v: formatNGN(group.pool) },
          { l: "My contributions", v: formatNGN(me?.contributed ?? 0) },
          { l: "My payouts", v: formatNGN(me?.received ?? 0) },
          { l: "Join code", v: group.code },
        ].map((s) => (
          <Card key={s.l} className="p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.l}</p>
            <p className="text-sm font-bold">{s.v}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-cream">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Next payout — cycle #{group.cycle}</p>
        <p className="mt-1 font-semibold">{next ? next.name : "Awaiting members"}</p>
      </Card>

      <Tabs defaultValue="contribute">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="contribute">Pay</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="help">Dispute</TabsTrigger>
        </TabsList>

        <TabsContent value="contribute" className="pt-4 space-y-3">
          <div>
            <Label>Amount (₦)</Label>
            <Input className="mt-1" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90" onClick={contribute} disabled={!me}>
            <Wallet className="h-4 w-4 mr-2" /> Contribute from savings balance
          </Button>
          <p className="text-xs text-muted-foreground">
            Your savings balance is {formatNGN(trader.balance)}. You can also pay cash to your agent {group.agentName ?? trader.agentName}.
          </p>
          {me && (
            <Button variant="outline" className="w-full" onClick={() => {
              const res = groupStore.leaveGroup(group.id, trader.id);
              if ("error" in res) return toast.error(res.error);
              toast.success("You left the group");
            }}>Leave group</Button>
          )}
        </TabsContent>

        <TabsContent value="members" className="pt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>#</TableHead><TableHead>Member</TableHead><TableHead>Trust</TableHead>
                <TableHead className="text-right">Contributed</TableHead><TableHead className="text-right">Received</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {group.members.filter((m) => m.status !== "Left").map((m) => {
                  const t = computeTrustScore(m.traderId);
                  return (
                    <TableRow key={m.traderId}>
                      <TableCell>{m.position}</TableCell>
                      <TableCell>{m.name}{m.traderId === trader.id ? " (you)" : ""}</TableCell>
                      <TableCell><Badge variant="outline" className={trustLevelClasses(t.level)}>{t.level}</Badge></TableCell>
                      <TableCell className="text-right">{formatNGN(m.contributed)}</TableCell>
                      <TableCell className="text-right">{formatNGN(m.received)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="pt-4 space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Member</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {[...contributions.map((c) => ({ ...c, kind: `Contribution (${c.method})` })),
                  ...payouts.map((p) => ({ ...p, kind: "Payout" }))]
                  .sort((a, b) => b.iso.localeCompare(a.iso))
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
        </TabsContent>

        <TabsContent value="help" className="pt-4 space-y-3">
          <div>
            <Label>Subject</Label>
            <Input className="mt-1" value={dispute.subject} onChange={(e) => setDispute({ ...dispute, subject: e.target.value })} placeholder="e.g. Missing contribution" />
          </div>
          <div>
            <Label>What happened?</Label>
            <Textarea className="mt-1" rows={3} value={dispute.detail} onChange={(e) => setDispute({ ...dispute, detail: e.target.value })} />
          </div>
          <Button className="w-full" variant="outline" onClick={() => {
            const res = groupStore.raiseDispute({
              groupId: group.id, raisedBy: trader.id, raisedByName: trader.name,
              subject: dispute.subject, detail: dispute.detail,
            });
            if ("error" in res) return toast.error(res.error);
            toast.success("Dispute submitted to SafeBox operations");
            setDispute({ subject: "", detail: "" });
          }}>
            <ShieldQuestion className="h-4 w-4 mr-2" /> Report an issue
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
