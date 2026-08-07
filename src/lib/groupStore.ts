// SafeBox Group Contribution Savings (Ajo / Esusu) — mock, localStorage-backed.
// Wired into the unified stores: agent float (platformStore) and trader wallets
// (mockTraderData). No backend / API.

import { useSyncExternalStore } from "react";
import { platformStore } from "./platformStore";
import {
  applyGroupContribution,
  applyGroupPayout,
  findTraderById,
  getAllTraders,
  type Trader,
} from "./mockTraderData";
import { sanitizeText } from "./security";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type GroupType = "Rotational" | "Target";
export type GroupFrequency = "Daily" | "Weekly" | "Monthly";
export type GroupStatus = "Recruiting" | "Active" | "Paused" | "Completed";
export type MemberStatus = "Active" | "Left" | "Defaulted";
export type PaymentMethod = "Agent cash" | "Wallet";

export interface GroupMember {
  traderId: string;
  name: string;
  phone: string;
  position: number;
  joinedAt: string;
  status: MemberStatus;
  contributed: number;
  received: number;
  missed: number;
}

export interface GroupContribution {
  id: string;
  groupId: string;
  cycle: number;
  traderId: string;
  traderName: string;
  amount: number;
  method: PaymentMethod;
  agentName?: string;
  iso: string;
}

export interface GroupPayout {
  id: string;
  groupId: string;
  cycle: number;
  traderId: string;
  traderName: string;
  amount: number;
  method: PaymentMethod;
  agentName?: string;
  iso: string;
}

export interface GroupDispute {
  id: string;
  groupId: string;
  groupName: string;
  raisedBy: string;
  raisedByName: string;
  subject: string;
  detail: string;
  status: "Open" | "Investigating" | "Resolved";
  iso: string;
  resolution?: string;
}

export interface SavingsGroup {
  id: string;
  code: string;
  name: string;
  description: string;
  type: GroupType;
  frequency: GroupFrequency;
  market: string;
  visibility: "Public" | "Private";
  contributionAmount: number;
  targetAmount?: number;
  maxMembers: number;
  cycle: number; // current cycle / round
  status: GroupStatus;
  agentId?: string;
  agentName?: string;
  createdBy: string; // trader id or agent id
  createdByName: string;
  createdAt: string;
  pool: number; // amount currently held in the group pool
  totalCollected: number;
  totalPaidOut: number;
  serviceFeePerCycle: number;
  members: GroupMember[];
}

export interface GroupState {
  groups: SavingsGroup[];
  contributions: GroupContribution[];
  payouts: GroupPayout[];
  disputes: GroupDispute[];
}

// Revenue model (spec)
export const AGENT_GROUP_FEE = 50; // per collected contribution
export const GROUP_SERVICE_FEE = 100; // per completed cycle

const KEY = "safebox.groups.v1";
const newId = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const code = () => `SB${Math.floor(1000 + Math.random() * 8999)}`;
const iso = () => new Date().toISOString();

export const formatNGN = (n: number) => `₦${Math.round(n).toLocaleString("en-NG")}`;

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
function member(t: Trader, position: number, contributed = 0, received = 0): GroupMember {
  return {
    traderId: t.id, name: t.name, phone: t.phone, position,
    joinedAt: t.joinDate, status: "Active", contributed, received, missed: 0,
  };
}

function seed(): GroupState {
  const traders = getAllTraders();
  const pick = (i: number) => traders[i % Math.max(1, traders.length)];
  const groups: SavingsGroup[] = [];
  const contributions: GroupContribution[] = [];
  const payouts: GroupPayout[] = [];

  if (traders.length) {
    const a = pick(0), b = pick(1), c = pick(2);
    const g1: SavingsGroup = {
      id: "GRP-BODIJA1", code: "SB1024", name: "Bodija Traders Ajo",
      description: "Weekly rotational savings for provisions sellers in Bodija Market.",
      type: "Rotational", frequency: "Weekly", market: a.agentLocation, visibility: "Public",
      contributionAmount: 5000, maxMembers: 6, cycle: 3, status: "Active",
      agentId: a.agentId, agentName: a.agentName, createdBy: a.id, createdByName: a.name,
      createdAt: "2026-03-04", pool: 15000, totalCollected: 90000, totalPaidOut: 75000,
      serviceFeePerCycle: GROUP_SERVICE_FEE,
      members: [member(a, 1, 15000, 30000), member(b, 2, 15000, 30000), member(c, 3, 15000, 0)],
    };
    const g2: SavingsGroup = {
      id: "GRP-ONITSHA1", code: "SB2048", name: "Onitsha Esusu Target Circle",
      description: "Save together toward restocking before the December rush.",
      type: "Target", frequency: "Daily", market: b.agentLocation, visibility: "Public",
      contributionAmount: 1000, targetAmount: 600000, maxMembers: 10, cycle: 1, status: "Recruiting",
      agentId: b.agentId, agentName: b.agentName, createdBy: b.id, createdByName: b.name,
      createdAt: "2026-05-19", pool: 42000, totalCollected: 42000, totalPaidOut: 0,
      serviceFeePerCycle: GROUP_SERVICE_FEE,
      members: [member(b, 1, 22000), member(c, 2, 20000)],
    };
    groups.push(g1, g2);
    contributions.push(
      { id: "GC-1", groupId: g1.id, cycle: 3, traderId: a.id, traderName: a.name, amount: 5000, method: "Agent cash", agentName: a.agentName, iso: "2026-06-02T09:15:00.000Z" },
      { id: "GC-2", groupId: g1.id, cycle: 3, traderId: b.id, traderName: b.name, amount: 5000, method: "Wallet", iso: "2026-06-02T10:02:00.000Z" },
      { id: "GC-3", groupId: g2.id, cycle: 1, traderId: c.id, traderName: c.name, amount: 1000, method: "Agent cash", agentName: b.agentName, iso: "2026-06-03T08:40:00.000Z" },
    );
    payouts.push(
      { id: "GP-1", groupId: g1.id, cycle: 1, traderId: a.id, traderName: a.name, amount: 30000, method: "Agent cash", agentName: a.agentName, iso: "2026-04-08T12:00:00.000Z" },
      { id: "GP-2", groupId: g1.id, cycle: 2, traderId: b.id, traderName: b.name, amount: 30000, method: "Wallet", iso: "2026-05-06T12:00:00.000Z" },
    );
  }

  return {
    groups,
    contributions,
    payouts,
    disputes: [
      {
        id: "DSP-1", groupId: "GRP-BODIJA1", groupName: "Bodija Traders Ajo",
        raisedBy: "TRD_002", raisedByName: "Chinedu Okafor",
        subject: "Missing cycle 2 contribution record",
        detail: "I paid cash to the agent on the 5th but my cycle 2 contribution is not showing.",
        status: "Open", iso: "2026-06-01T14:22:00.000Z",
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------
let state: GroupState = seed();
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...seed(), ...(JSON.parse(raw) as GroupState) };
  } catch { /* ignore */ }
}

function commit(next: GroupState) {
  state = next;
  if (typeof window !== "undefined") {
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* quota */ }
  }
  listeners.forEach((l) => l());
}

const clone = (): GroupState => JSON.parse(JSON.stringify(state)) as GroupState;

// ---------------------------------------------------------------------------
// Trust score (spec weights)
// ---------------------------------------------------------------------------
export type TrustLevel = "Gold" | "Silver" | "Bronze" | "Amber" | "Red";

export interface TrustScore {
  traderId: string;
  score: number;
  level: TrustLevel;
  factors: { label: string; weight: number; earned: number; note: string }[];
  creditLimit: number;
}

export function trustLevel(score: number): TrustLevel {
  if (score >= 80) return "Gold";
  if (score >= 60) return "Silver";
  if (score >= 40) return "Bronze";
  if (score >= 20) return "Amber";
  return "Red";
}

export function trustLevelClasses(level: TrustLevel) {
  switch (level) {
    case "Gold": return "bg-gold/15 text-gold-foreground border-gold/40";
    case "Silver": return "bg-secondary text-secondary-foreground border-border";
    case "Bronze": return "bg-primary/10 text-primary border-primary/30";
    case "Amber": return "bg-amber-100 text-amber-800 border-amber-300";
    default: return "bg-destructive/10 text-destructive border-destructive/30";
  }
}

export function computeTrustScore(traderId: string): TrustScore {
  hydrate();
  const t = findTraderById(traderId);
  const groups = state.groups.filter((g) => g.members.some((m) => m.traderId === traderId));
  const myContribs = state.contributions.filter((c) => c.traderId === traderId);
  const missed = groups.reduce((s, g) => s + (g.members.find((m) => m.traderId === traderId)?.missed ?? 0), 0);
  const defaulted = groups.some((g) => g.members.find((m) => m.traderId === traderId)?.status === "Defaulted");

  const kyc = t?.kycStatus === "Verified" ? 20 : t?.kycStatus === "Tier 1" ? 12 : t?.kycStatus === "Pending review" ? 6 : 0;
  const consistency = Math.min(30, Math.round((myContribs.length / 12) * 30));
  const participation = Math.min(25, groups.length * 12);
  const streak = Math.min(15, Math.round(((t?.streakDays ?? 0) / 60) * 15));
  const penalty = -Math.min(10, missed * 3 + (defaulted ? 10 : 0));

  const score = Math.max(0, Math.min(100, kyc + consistency + participation + streak + penalty));
  const level = trustLevel(score);
  const creditLimit = level === "Gold" ? Math.round((t?.balance ?? 0) * 0.5)
    : level === "Silver" ? Math.round((t?.balance ?? 0) * 0.3)
    : level === "Bronze" ? Math.round((t?.balance ?? 0) * 0.15) : 0;

  return {
    traderId, score, level, creditLimit,
    factors: [
      { label: "Identity verification (KYC)", weight: 20, earned: kyc, note: t?.kycStatus ?? "Not started" },
      { label: "Savings consistency", weight: 30, earned: consistency, note: `${myContribs.length} contributions logged` },
      { label: "Group participation", weight: 25, earned: participation, note: `${groups.length} active group${groups.length === 1 ? "" : "s"}` },
      { label: "Savings streak", weight: 15, earned: streak, note: `${t?.streakDays ?? 0} day streak` },
      { label: "Default penalty", weight: -10, earned: penalty, note: missed ? `${missed} missed contribution(s)` : "No missed contributions" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Store API
// ---------------------------------------------------------------------------
export const groupStore = {
  subscribe(fn: () => void) {
    hydrate();
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  get(): GroupState {
    hydrate();
    return state;
  },

  byId(id: string) { hydrate(); return state.groups.find((g) => g.id === id) ?? null; },
  byCode(c: string) {
    hydrate();
    return state.groups.find((g) => g.code.toLowerCase() === c.trim().toLowerCase()) ?? null;
  },
  forTrader(traderId: string) {
    hydrate();
    return state.groups.filter((g) => g.members.some((m) => m.traderId === traderId && m.status !== "Left"));
  },
  publicGroups(traderId?: string) {
    hydrate();
    return state.groups.filter(
      (g) => g.visibility === "Public" && g.status !== "Completed" &&
        (!traderId || !g.members.some((m) => m.traderId === traderId)),
    );
  },
  contributionsFor(groupId: string) { hydrate(); return state.contributions.filter((c) => c.groupId === groupId); },
  payoutsFor(groupId: string) { hydrate(); return state.payouts.filter((p) => p.groupId === groupId); },
  traderActivity(traderId: string) {
    hydrate();
    return {
      contributions: state.contributions.filter((c) => c.traderId === traderId),
      payouts: state.payouts.filter((p) => p.traderId === traderId),
    };
  },

  createGroup(input: {
    name: string; description?: string; type: GroupType; frequency: GroupFrequency;
    market: string; visibility?: "Public" | "Private"; contributionAmount: number;
    targetAmount?: number; maxMembers: number;
    createdBy: string; createdByName: string; agentId?: string; agentName?: string;
    seedMemberTraderId?: string;
  }): { group: SavingsGroup } | { error: string } {
    const name = sanitizeText(input.name, 60);
    if (name.length < 3) return { error: "Give the group a clear name" };
    if (input.contributionAmount <= 0) return { error: "Contribution amount must be greater than zero" };
    if (input.maxMembers < 2 || input.maxMembers > 30) return { error: "Group size must be between 2 and 30 members" };
    if (input.type === "Target" && (!input.targetAmount || input.targetAmount <= 0)) {
      return { error: "Set a target amount for a target group" };
    }
    const next = clone();
    const members: GroupMember[] = [];
    const seedTrader = input.seedMemberTraderId ? findTraderById(input.seedMemberTraderId) : null;
    if (seedTrader) members.push(member(seedTrader, 1));
    const group: SavingsGroup = {
      id: newId("GRP"), code: code(), name,
      description: sanitizeText(input.description ?? "", 200),
      type: input.type, frequency: input.frequency,
      market: sanitizeText(input.market, 80), visibility: input.visibility ?? "Public",
      contributionAmount: Math.round(input.contributionAmount),
      targetAmount: input.targetAmount ? Math.round(input.targetAmount) : undefined,
      maxMembers: input.maxMembers, cycle: 1, status: "Recruiting",
      agentId: input.agentId, agentName: input.agentName,
      createdBy: input.createdBy, createdByName: sanitizeText(input.createdByName, 60),
      createdAt: iso(), pool: 0, totalCollected: 0, totalPaidOut: 0,
      serviceFeePerCycle: GROUP_SERVICE_FEE, members,
    };
    next.groups = [group, ...next.groups];
    commit(next);
    return { group };
  },

  joinGroup(groupId: string, traderId: string): { ok: true } | { error: string } {
    const next = clone();
    const g = next.groups.find((x) => x.id === groupId);
    if (!g) return { error: "Group not found" };
    if (g.status === "Completed") return { error: "This group has completed its cycle" };
    if (g.members.some((m) => m.traderId === traderId && m.status !== "Left")) return { error: "You are already a member" };
    if (g.members.filter((m) => m.status !== "Left").length >= g.maxMembers) return { error: "This group is full" };
    const t = findTraderById(traderId);
    if (!t) return { error: "Trader profile not found" };
    g.members = [...g.members.filter((m) => m.traderId !== traderId), member(t, g.members.length + 1)];
    if (g.members.length >= g.maxMembers) g.status = "Active";
    commit(next);
    return { ok: true };
  },

  leaveGroup(groupId: string, traderId: string) {
    const next = clone();
    const g = next.groups.find((x) => x.id === groupId);
    const m = g?.members.find((x) => x.traderId === traderId);
    if (!g || !m) return { error: "Membership not found" } as const;
    m.status = "Left";
    commit(next);
    return { ok: true } as const;
  },

  activate(groupId: string) {
    const next = clone();
    const g = next.groups.find((x) => x.id === groupId);
    if (!g) return { error: "Group not found" } as const;
    if (g.members.filter((m) => m.status === "Active").length < 2) return { error: "Need at least 2 members to start" } as const;
    g.status = "Active";
    commit(next);
    return { ok: true } as const;
  },

  setStatus(groupId: string, status: GroupStatus) {
    const next = clone();
    const g = next.groups.find((x) => x.id === groupId);
    if (!g) return;
    g.status = status;
    commit(next);
  },

  /**
   * Record a contribution. `Agent cash` debits the agent float (platformStore);
   * `Wallet` debits the trader's savings balance (mockTraderData).
   */
  recordContribution(input: {
    groupId: string; traderId: string; method: PaymentMethod; amount?: number;
  }): { ok: true; amount: number } | { error: string } {
    const g = groupStore.byId(input.groupId);
    if (!g) return { error: "Group not found" };
    const m = g.members.find((x) => x.traderId === input.traderId && x.status !== "Left");
    if (!m) return { error: "This trader is not an active member" };
    const amount = Math.round(input.amount ?? g.contributionAmount);
    if (amount <= 0) return { error: "Enter a valid amount" };

    let agentName: string | undefined;
    if (input.method === "Agent cash") {
      const res = platformStore.recordGroupContribution({
        amount, groupName: g.name, traderId: m.traderId, traderName: m.name, fee: AGENT_GROUP_FEE,
      });
      if ("error" in res) return { error: res.error };
      agentName = platformStore.currentAgent()?.name;
    } else {
      const applied = applyGroupContribution({ traderId: m.traderId, amount, groupName: g.name });
      if (!applied) return { error: "Insufficient savings balance for this contribution" };
    }

    const next = clone();
    const grp = next.groups.find((x) => x.id === g.id)!;
    const mem = grp.members.find((x) => x.traderId === input.traderId)!;
    mem.contributed += amount;
    grp.pool += amount;
    grp.totalCollected += amount;
    if (grp.status === "Recruiting" && grp.members.filter((x) => x.status === "Active").length >= 2) grp.status = "Active";
    next.contributions = [{
      id: newId("GC"), groupId: grp.id, cycle: grp.cycle, traderId: mem.traderId, traderName: mem.name,
      amount, method: input.method, agentName, iso: iso(),
    }, ...next.contributions].slice(0, 500);
    commit(next);
    return { ok: true, amount };
  },

  /** Who is next in line for a rotational payout. */
  nextRecipient(groupId: string): GroupMember | null {
    const g = groupStore.byId(groupId);
    if (!g) return null;
    const active = g.members.filter((m) => m.status === "Active").sort((a, b) => a.position - b.position);
    return active.find((m) => m.received === 0) ?? active[0] ?? null;
  },

  /** Pay out the pool to a member. Wallet credits savings; Agent cash refunds float. */
  payout(input: { groupId: string; traderId: string; method: PaymentMethod; amount?: number }):
    { ok: true; amount: number } | { error: string } {
    const g = groupStore.byId(input.groupId);
    if (!g) return { error: "Group not found" };
    const m = g.members.find((x) => x.traderId === input.traderId && x.status !== "Left");
    if (!m) return { error: "Recipient is not an active member" };
    const gross = Math.round(input.amount ?? g.pool);
    if (gross <= 0) return { error: "There is nothing in the pool yet" };
    if (gross > g.pool) return { error: "Payout cannot exceed the group pool" };
    const netFee = Math.min(g.serviceFeePerCycle, gross);
    const amount = gross - netFee;

    let agentName: string | undefined;
    if (input.method === "Agent cash") {
      const res = platformStore.recordGroupPayout({ amount, groupName: g.name, traderId: m.traderId, traderName: m.name });
      if ("error" in res) return { error: res.error };
      agentName = platformStore.currentAgent()?.name;
    } else {
      applyGroupPayout({ traderId: m.traderId, amount, groupName: g.name, label: "Group payout" });
    }

    const next = clone();
    const grp = next.groups.find((x) => x.id === g.id)!;
    const mem = grp.members.find((x) => x.traderId === input.traderId)!;
    mem.received += amount;
    grp.pool -= gross;
    grp.totalPaidOut += amount;
    const active = grp.members.filter((x) => x.status === "Active");
    grp.cycle += 1;
    if (grp.type === "Rotational" && active.every((x) => x.received > 0)) grp.status = "Completed";
    if (grp.type === "Target" && grp.targetAmount && grp.totalCollected >= grp.targetAmount && grp.pool <= 0) grp.status = "Completed";
    next.payouts = [{
      id: newId("GP"), groupId: grp.id, cycle: g.cycle, traderId: mem.traderId, traderName: mem.name,
      amount, method: input.method, agentName, iso: iso(),
    }, ...next.payouts].slice(0, 500);
    commit(next);
    return { ok: true, amount };
  },

  markMissed(groupId: string, traderId: string) {
    const next = clone();
    const g = next.groups.find((x) => x.id === groupId);
    const m = g?.members.find((x) => x.traderId === traderId);
    if (!g || !m) return;
    m.missed += 1;
    if (m.missed >= 3) m.status = "Defaulted";
    commit(next);
  },

  raiseDispute(input: { groupId: string; raisedBy: string; raisedByName: string; subject: string; detail: string }) {
    const g = groupStore.byId(input.groupId);
    if (!g) return { error: "Group not found" } as const;
    const subject = sanitizeText(input.subject, 80);
    const detail = sanitizeText(input.detail, 600);
    if (subject.length < 4) return { error: "Add a short subject" } as const;
    if (detail.length < 10) return { error: "Describe the issue in a bit more detail" } as const;
    const next = clone();
    next.disputes = [{
      id: newId("DSP"), groupId: g.id, groupName: g.name, raisedBy: input.raisedBy,
      raisedByName: sanitizeText(input.raisedByName, 60), subject, detail,
      status: "Open" as const, iso: iso(),
    }, ...next.disputes].slice(0, 200);
    commit(next);
    return { ok: true } as const;
  },

  setDisputeStatus(id: string, status: GroupDispute["status"], resolution?: string) {
    const next = clone();
    const d = next.disputes.find((x) => x.id === id);
    if (!d) return;
    d.status = status;
    if (resolution) d.resolution = sanitizeText(resolution, 300);
    commit(next);
  },

  totals() {
    hydrate();
    const active = state.groups.filter((g) => g.status === "Active");
    return {
      groups: state.groups.length,
      activeGroups: active.length,
      members: state.groups.reduce((s, g) => s + g.members.filter((m) => m.status === "Active").length, 0),
      pooled: state.groups.reduce((s, g) => s + g.pool, 0),
      collected: state.groups.reduce((s, g) => s + g.totalCollected, 0),
      paidOut: state.groups.reduce((s, g) => s + g.totalPaidOut, 0),
      openDisputes: state.disputes.filter((d) => d.status !== "Resolved").length,
      serviceFees: state.payouts.length * GROUP_SERVICE_FEE,
      agentFees: state.contributions.filter((c) => c.method === "Agent cash").length * AGENT_GROUP_FEE,
      defaulters: state.groups.reduce((s, g) => s + g.members.filter((m) => m.status === "Defaulted").length, 0),
    };
  },

  reset() {
    if (typeof window !== "undefined") localStorage.removeItem(KEY);
    hydrated = true;
    commit(seed());
  },
};

// ---------------------------------------------------------------------------
// React bindings
// ---------------------------------------------------------------------------
export function useGroupState(): GroupState {
  return useSyncExternalStore(groupStore.subscribe, groupStore.get, groupStore.get);
}

export function useTrustScore(traderId: string | undefined): TrustScore | null {
  useGroupState();
  if (!traderId) return null;
  return computeTrustScore(traderId);
}
