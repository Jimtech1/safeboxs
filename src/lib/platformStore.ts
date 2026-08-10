// ============================================================================
// SafeBox unified platform store — single source of truth for Agents, Admins,
// the shared transaction ledger, and cross-dashboard analytics.
// Mock only: persisted to localStorage, no backend, no network calls.
// Trader records live in ./mockTraderData and are mutated through this module
// so Agent, Trader and Admin dashboards always agree.
// ============================================================================

import { useSyncExternalStore } from "react";
import { agents as seedAgents, currentAgent, markets, principals } from "./mockData";
import {
  applyAgentDeposit,
  applyAgentWithdrawal,
  findTraderByPhone,
  findTraderById,
  getAllTraders,
  subscribeTraderStore,
  traderTotals,
  updateTraderById,
} from "./mockTraderData";
import {
  hashPin, verifyPin, isValidPin, isValidPhone, normalizePhone,
  sanitizeText, isValidEmail, checkThrottle, registerFailure, clearFailures,
} from "./security";

export const DEPOSIT_FEE_GROSS = 100;
export const DEPOSIT_FEE_AGENT_SHARE = 10;
export const WITHDRAWAL_FEE_GROSS = 100;
export const WITHDRAWAL_FEE_AGENT_SHARE = 90;

export type AgentStatus = "Active" | "Pending" | "Suspended" | "Rejected";

export interface AgentRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  market: string;
  principal: string;
  floatBalance: number;
  floatCapacity: number;
  floatUsedToday: number;
  commissionMTD: number;
  status: AgentStatus;
  pin: string; // hashed
  photo?: string;
  bank?: { bankName: string; accountNumber: string; accountName: string };
  lowFloatThreshold: number;
  createdAt: string;
  lastLogin?: string;
  nin?: string;
}

export interface AgentStats {
  depositsCollectedToday: number;
  depositsCountToday: number;
  withdrawalsProcessedToday: number;
  withdrawalsCountToday: number;
  depositFeeEarnedToday: number;
  withdrawalFeeEarnedToday: number;
}

export type LedgerKind =
  | "Deposit"
  | "Withdrawal"
  | "FloatTopup"
  | "FloatWithdraw"
  | "GroupContribution"
  | "GroupPayout";

export interface LedgerTxn {
  id: string;
  agentId: string;
  agentName: string;
  kind: LedgerKind;
  traderId?: string;
  traderName?: string;
  traderPhone?: string;
  amount: number;
  fee?: number;
  channel?: string;
  reference?: string;
  status: "Successful";
  timestamp: string;
  iso: string;
  floatAfter: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Operations" | "Compliance" | "Finance" | "Viewer";
  status: "Active" | "Invited" | "Disabled";
  pin: string; // hashed
  invitedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
  iso: string;
  status: "New" | "In progress" | "Resolved";
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  iso: string;
}

export interface PlatformSettings {
  depositFee: number;
  withdrawalFee: number;
  agentDepositShare: number;
  agentWithdrawalShare: number;
  dailyWithdrawalLimit: number;
  lowFloatThreshold: number;
  yieldAnnualRate: number;
  smsAlerts: boolean;
  otpRequired: boolean;
  biometricMarkets: boolean;
  jackpotAmount: number;
  supportEmail: string;
  supportPhone: string;
}

export interface Report {
  id: string;
  name: string;
  range: string;
  generatedBy: string;
  iso: string;
  rows: number;
  status: "Ready";
}

interface PlatformState {
  agents: AgentRecord[];
  stats: Record<string, AgentStats>;
  ledger: LedgerTxn[];
  admins: AdminUser[];
  messages: ContactMessage[];
  audit: AuditEntry[];
  settings: PlatformSettings;
  reports: Report[];
  sessionAgentId?: string;
  sessionAdminId?: string;
}

const LS_KEY = "safebox.platform.v1";

const nowStamp = () => {
  const d = new Date();
  return {
    timestamp: d.toLocaleString("en-NG", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }),
    iso: d.toISOString(),
  };
};
const newId = (prefix: string) => `${prefix}-${Math.floor(Math.random() * 9_000_000 + 1_000_000)}`;

const emptyStats = (): AgentStats => ({
  depositsCollectedToday: 0, depositsCountToday: 0,
  withdrawalsProcessedToday: 0, withdrawalsCountToday: 0,
  depositFeeEarnedToday: 0, withdrawalFeeEarnedToday: 0,
});

function defaultState(): PlatformState {
  const agents: AgentRecord[] = seedAgents.map((a, i) => ({
    ...a,
    status: a.status as AgentStatus,
    email: `${a.name.split(" ")[0].toLowerCase()}.${a.id.toLowerCase()}@safebox.ng`,
    pin: hashPin("1234"),
    lowFloatThreshold: 50000,
    createdAt: new Date(Date.now() - (20 + i * 3) * 86400000).toISOString(),
  }));

  // The demo agent (AG-2000) is the signed-in agent used across the dashboard.
  if (agents[0]) {
    agents[0] = {
      ...agents[0],
      name: currentAgent.name,
      phone: "08033112233",
      email: "adebayo@safebox.ng",
      market: currentAgent.market,
      floatBalance: currentAgent.floatBalance,
      floatCapacity: currentAgent.floatCapacity,
      floatUsedToday: currentAgent.floatUsedToday,
      status: "Active",
      pin: hashPin("1234"),
      lowFloatThreshold: currentAgent.lowFloatThreshold,
      bank: { bankName: "GTBank", accountNumber: "0234567891", accountName: currentAgent.name },
    };
  }

  const stats: Record<string, AgentStats> = {};
  agents.forEach((a, i) => {
    stats[a.id] = i === 0
      ? {
          depositsCollectedToday: currentAgent.depositsCollectedToday,
          depositsCountToday: currentAgent.tradersServedToday,
          withdrawalsProcessedToday: currentAgent.withdrawalsToday,
          withdrawalsCountToday: 4,
          depositFeeEarnedToday: currentAgent.tradersServedToday * DEPOSIT_FEE_AGENT_SHARE,
          withdrawalFeeEarnedToday: 4 * WITHDRAWAL_FEE_AGENT_SHARE,
        }
      : {
          depositsCollectedToday: Math.round(a.floatUsedToday),
          depositsCountToday: Math.max(1, Math.round(a.floatUsedToday / 3500)),
          withdrawalsProcessedToday: Math.round(a.floatUsedToday * 0.22),
          withdrawalsCountToday: Math.max(0, Math.round(a.floatUsedToday / 26000)),
          depositFeeEarnedToday: Math.max(1, Math.round(a.floatUsedToday / 3500)) * DEPOSIT_FEE_AGENT_SHARE,
          withdrawalFeeEarnedToday: Math.max(0, Math.round(a.floatUsedToday / 26000)) * WITHDRAWAL_FEE_AGENT_SHARE,
        };
  });

  return {
    agents,
    stats,
    ledger: [],
    admins: [
      { id: "ADM-1", name: "Ops Control", email: "ops@safebox.ng", role: "Super Admin", status: "Active", pin: hashPin("123456"), invitedAt: new Date(Date.now() - 90 * 86400000).toISOString() },
      { id: "ADM-2", name: "Amaka Nwosu", email: "amaka@safebox.ng", role: "Compliance", status: "Active", pin: hashPin("123456"), invitedAt: new Date(Date.now() - 60 * 86400000).toISOString() },
      { id: "ADM-3", name: "Tunde Bakare", email: "tunde@safebox.ng", role: "Finance", status: "Invited", pin: hashPin("123456"), invitedAt: new Date(Date.now() - 4 * 86400000).toISOString() },
    ],
    messages: [],
    audit: [],
    reports: [],
    settings: {
      depositFee: DEPOSIT_FEE_GROSS,
      withdrawalFee: WITHDRAWAL_FEE_GROSS,
      agentDepositShare: DEPOSIT_FEE_AGENT_SHARE,
      agentWithdrawalShare: WITHDRAWAL_FEE_AGENT_SHARE,
      dailyWithdrawalLimit: 100000,
      lowFloatThreshold: 50000,
      yieldAnnualRate: 12,
      smsAlerts: true,
      otpRequired: true,
      biometricMarkets: true,
      jackpotAmount: 300000,
      supportEmail: "support@safebox.ng",
      supportPhone: "0700 SAFEBOX",
    },
  };
}

function load(): PlatformState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as PlatformState;
    return { ...defaultState(), ...parsed, settings: { ...defaultState().settings, ...parsed.settings } };
  } catch {
    return defaultState();
  }
}

let state: PlatformState = load();
const listeners = new Set<() => void>();

function commit(next: PlatformState) {
  state = next;
  if (typeof window !== "undefined") {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* quota */ }
  }
  listeners.forEach((l) => l());
}

function logAudit(next: PlatformState, actor: string, action: string) {
  next.audit = [{ id: newId("AUD"), actor, action, iso: new Date().toISOString() }, ...next.audit].slice(0, 200);
}

const clone = (): PlatformState => ({
  ...state,
  agents: state.agents.map((a) => ({ ...a })),
  stats: Object.fromEntries(Object.entries(state.stats).map(([k, v]) => [k, { ...v }])),
  ledger: [...state.ledger],
  admins: state.admins.map((a) => ({ ...a })),
  messages: [...state.messages],
  audit: [...state.audit],
  reports: [...state.reports],
  settings: { ...state.settings },
});

// ---------------------------------------------------------------------------
// Store API
// ---------------------------------------------------------------------------
export const platformStore = {
  get: () => state,
  subscribe(fn: () => void) {
    listeners.add(fn);
    const off = subscribeTraderStore(fn);
    return () => { listeners.delete(fn); off(); };
  },
  reset() { commit(defaultState()); },

  /** Free-form audit entry so every dashboard action leaves a trail. */
  audit(action: string, actor?: string) {
    const next = clone();
    logAudit(next, actor ?? this.currentAdmin()?.name ?? this.currentAgent()?.name ?? "System", action);
    commit(next);
  },

  /** Mock SMS re-send for a ledger transaction (agent receipt flow). */
  resendSms(txnId: string) {
    const txn = state.ledger.find((t) => t.id === txnId);
    const next = clone();
    logAudit(next, next.agents.find((a) => a.id === next.sessionAgentId)?.name ?? "Agent",
      `Re-sent SMS receipt for ${txnId}`);
    commit(next);
    return txn ?? null;
  },

  /** Admin float adjustment (credit or debit an agent's float capital). */
  adjustAgentFloat(agentId: string, delta: number, reason: string) {
    const next = clone();
    const agent = next.agents.find((a) => a.id === agentId);
    if (!agent) return { error: "Agent not found" } as const;
    if (!Number.isFinite(delta) || delta === 0) return { error: "Enter an adjustment amount" } as const;
    if (agent.floatBalance + delta < 0) return { error: "Adjustment would make float negative" } as const;
    agent.floatBalance += delta;
    agent.floatCapacity = Math.max(agent.floatCapacity, agent.floatBalance);
    next.ledger = [{
      id: newId(delta > 0 ? "FL" : "FL"), agentId: agent.id, agentName: agent.name,
      kind: delta > 0 ? ("FloatTopup" as const) : ("FloatWithdraw" as const),
      amount: Math.abs(delta), channel: "Admin adjustment", reference: sanitizeText(reason, 80),
      status: "Successful" as const, ...nowStamp(), floatAfter: agent.floatBalance,
    }, ...next.ledger].slice(0, 500);
    logAudit(next, this.currentAdmin()?.name ?? "Admin",
      `${delta > 0 ? "Credited" : "Debited"} ₦${Math.abs(delta).toLocaleString()} float for ${agent.name} — ${sanitizeText(reason, 80)}`);
    commit(next);
    return { ok: true, floatBalance: agent.floatBalance } as const;
  },

  updateAdmin(id: string, patch: { name?: string; role?: AdminUser["role"]; email?: string }) {
    const next = clone();
    const a = next.admins.find((x) => x.id === id);
    if (!a) return { error: "Admin not found" } as const;
    if (patch.email && !isValidEmail(patch.email)) return { error: "Enter a valid email address" } as const;
    if (patch.name) a.name = sanitizeText(patch.name, 60);
    if (patch.email) a.email = patch.email.trim().toLowerCase();
    if (patch.role) a.role = patch.role;
    logAudit(next, this.currentAdmin()?.name ?? "Admin", `Updated team member ${a.name}`);
    commit(next);
    return { ok: true } as const;
  },

  sendTestSms(to: string) {
    const phone = normalizePhone(to);
    if (!isValidPhone(phone)) return { error: "Enter an 11-digit phone number" } as const;
    const next = clone();
    logAudit(next, this.currentAdmin()?.name ?? "Admin", `Sent test SMS to ${phone}`);
    commit(next);
    return { ok: true, phone } as const;
  },


  // ---------- Agent auth ----------
  currentAgent(): AgentRecord | null {
    if (!state.sessionAgentId) return null;
    return state.agents.find((a) => a.id === state.sessionAgentId) ?? null;
  },
  loginAgent(identifier: string, pin: string): { agent: AgentRecord } | { error: string } {
    const id = identifier.trim();
    const key = `agent:${id.toLowerCase()}`;
    const throttle = checkThrottle(key);
    if (throttle.blocked) return { error: `Too many attempts. Try again in ${throttle.retryInSec}s.` };
    const phone = normalizePhone(id);
    const agent = state.agents.find(
      (a) => a.phone === phone || a.id.toLowerCase() === id.toLowerCase() || a.email?.toLowerCase() === id.toLowerCase(),
    );
    if (!agent || !verifyPin(pin, agent.pin)) {
      registerFailure(key);
      return { error: "Invalid credentials. Check your phone number and PIN." };
    }
    if (agent.status === "Suspended" || agent.status === "Rejected") {
      return { error: "This agent account is not active. Contact SafeBox support." };
    }
    if (agent.status === "Pending") {
      return { error: "Your application is still under review. You will get an SMS once approved." };
    }
    clearFailures(key);
    const next = clone();
    next.sessionAgentId = agent.id;
    const rec = next.agents.find((a) => a.id === agent.id)!;
    rec.lastLogin = new Date().toISOString();
    logAudit(next, agent.name, "Agent signed in");
    commit(next);
    return { agent: rec };
  },
  signupAgent(input: {
    name: string; phone: string; email?: string; market: string; pin: string;
    principal?: string; nin?: string;
  }): { agent: AgentRecord } | { error: string } {
    const name = sanitizeText(input.name, 60);
    const phone = normalizePhone(input.phone);
    if (name.split(" ").filter(Boolean).length < 2) return { error: "Enter your first and last name" };
    if (!isValidPhone(phone)) return { error: "Phone must be 11 digits starting with 0" };
    if (input.email && !isValidEmail(input.email)) return { error: "Enter a valid email address" };
    if (!isValidPin(input.pin)) return { error: "PIN must be 4-6 digits" };
    if (state.agents.some((a) => a.phone === phone)) return { error: "An agent account with this phone already exists" };
    const next = clone();
    const agent: AgentRecord = {
      id: `AG-${3000 + next.agents.length}`,
      name,
      phone,
      email: input.email ? sanitizeText(input.email, 120) : undefined,
      market: sanitizeText(input.market, 80) || markets[0],
      principal: input.principal ?? principals[0],
      floatBalance: 0,
      floatCapacity: 150000,
      floatUsedToday: 0,
      commissionMTD: 0,
      status: "Active", // demo mode: instant activation so the dashboard is usable
      pin: hashPin(input.pin),
      lowFloatThreshold: next.settings.lowFloatThreshold,
      createdAt: new Date().toISOString(),
      nin: input.nin ? sanitizeText(input.nin, 11) : undefined,
    };
    next.agents = [agent, ...next.agents];
    next.stats[agent.id] = emptyStats();
    next.sessionAgentId = agent.id;
    logAudit(next, agent.name, "New agent registered");
    commit(next);
    return { agent };
  },
  logoutAgent() {
    const next = clone();
    next.sessionAgentId = undefined;
    commit(next);
  },
  updateAgentProfile(patch: Partial<Pick<AgentRecord, "name" | "email" | "market" | "photo" | "bank" | "lowFloatThreshold" | "phone">>) {
    const next = clone();
    const agent = next.agents.find((a) => a.id === next.sessionAgentId);
    if (!agent) return { error: "Not signed in" } as const;
    if (patch.phone && !isValidPhone(normalizePhone(patch.phone))) return { error: "Invalid phone number" } as const;
    if (patch.email && !isValidEmail(patch.email)) return { error: "Invalid email address" } as const;
    Object.assign(agent, {
      ...patch,
      ...(patch.name ? { name: sanitizeText(patch.name, 60) } : {}),
      ...(patch.phone ? { phone: normalizePhone(patch.phone) } : {}),
    });
    logAudit(next, agent.name, "Updated agent profile");
    commit(next);
    return { ok: true } as const;
  },
  changeAgentPin(currentPin: string, newPin: string) {
    const next = clone();
    const agent = next.agents.find((a) => a.id === next.sessionAgentId);
    if (!agent) return { error: "Not signed in" } as const;
    if (!verifyPin(currentPin, agent.pin)) return { error: "Current PIN is incorrect" } as const;
    if (!isValidPin(newPin)) return { error: "New PIN must be 4-6 digits" } as const;
    if (verifyPin(newPin, agent.pin)) return { error: "New PIN must be different" } as const;
    agent.pin = hashPin(newPin);
    logAudit(next, agent.name, "Changed transaction PIN");
    commit(next);
    return { ok: true } as const;
  },

  // ---------- Admin auth ----------
  currentAdmin(): AdminUser | null {
    if (!state.sessionAdminId) return null;
    return state.admins.find((a) => a.id === state.sessionAdminId) ?? null;
  },
  loginAdmin(email: string, pin: string): { admin: AdminUser } | { error: string } {
    const key = `admin:${email.toLowerCase()}`;
    const throttle = checkThrottle(key);
    if (throttle.blocked) return { error: `Too many attempts. Try again in ${throttle.retryInSec}s.` };
    const admin = state.admins.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!admin || !verifyPin(pin, admin.pin)) {
      registerFailure(key);
      return { error: "Invalid admin credentials." };
    }
    if (admin.status === "Disabled") return { error: "This admin account is disabled." };
    clearFailures(key);
    const next = clone();
    next.sessionAdminId = admin.id;
    const rec = next.admins.find((a) => a.id === admin.id)!;
    rec.status = "Active";
    logAudit(next, admin.name, "Admin signed in");
    commit(next);
    return { admin: rec };
  },
  logoutAdmin() {
    const next = clone();
    next.sessionAdminId = undefined;
    commit(next);
  },
  inviteAdmin(input: { name: string; email: string; role: AdminUser["role"] }) {
    const name = sanitizeText(input.name, 60);
    if (name.length < 3) return { error: "Enter the team member's name" } as const;
    if (!isValidEmail(input.email)) return { error: "Enter a valid work email" } as const;
    if (state.admins.some((a) => a.email.toLowerCase() === input.email.toLowerCase())) {
      return { error: "This email is already on the team" } as const;
    }
    const next = clone();
    next.admins = [{
      id: newId("ADM"), name, email: input.email.trim().toLowerCase(), role: input.role,
      status: "Invited", pin: hashPin("123456"), invitedAt: new Date().toISOString(),
    }, ...next.admins];
    logAudit(next, this.currentAdmin()?.name ?? "Admin", `Invited ${name} as ${input.role}`);
    commit(next);
    return { ok: true } as const;
  },
  setAdminStatus(id: string, status: AdminUser["status"]) {
    const next = clone();
    const a = next.admins.find((x) => x.id === id);
    if (!a) return;
    a.status = status;
    logAudit(next, this.currentAdmin()?.name ?? "Admin", `${status} team member ${a.name}`);
    commit(next);
  },
  removeAdmin(id: string) {
    const next = clone();
    const a = next.admins.find((x) => x.id === id);
    next.admins = next.admins.filter((x) => x.id !== id);
    logAudit(next, this.currentAdmin()?.name ?? "Admin", `Removed team member ${a?.name ?? id}`);
    commit(next);
  },

  // ---------- Admin actions ----------
  setAgentStatus(id: string, status: AgentStatus) {
    const next = clone();
    const a = next.agents.find((x) => x.id === id);
    if (!a) return;
    a.status = status;
    logAudit(next, this.currentAdmin()?.name ?? "Admin", `${status} agent ${a.name}`);
    commit(next);
  },
  approveAgent(id: string) { this.setAgentStatus(id, "Active"); },
  rejectAgent(id: string) { this.setAgentStatus(id, "Rejected"); },
  setTraderKyc(traderId: string, status: "Verified" | "Rejected" | "Pending review") {
    updateTraderById(traderId, { kycStatus: status });
    const next = clone();
    logAudit(next, this.currentAdmin()?.name ?? "Admin", `Trader ${traderId} KYC ${status}`);
    commit(next);
  },
  setTraderStatus(traderId: string, status: "active" | "suspended") {
    updateTraderById(traderId, { status });
    const next = clone();
    logAudit(next, this.currentAdmin()?.name ?? "Admin", `Trader ${traderId} ${status}`);
    commit(next);
  },
  saveSettings(patch: Partial<PlatformSettings>) {
    const next = clone();
    next.settings = { ...next.settings, ...patch };
    logAudit(next, this.currentAdmin()?.name ?? "Admin", "Updated platform settings");
    commit(next);
    return { ok: true } as const;
  },
  generateReport(input: { name: string; range: string; rows: number }) {
    const next = clone();
    const report: Report = {
      id: newId("RPT"), name: input.name, range: input.range,
      generatedBy: this.currentAdmin()?.name ?? "Admin",
      iso: new Date().toISOString(), rows: input.rows, status: "Ready",
    };
    next.reports = [report, ...next.reports].slice(0, 50);
    logAudit(next, report.generatedBy, `Generated report: ${input.name}`);
    commit(next);
    return report;
  },
  addMessage(input: { name: string; email: string; phone?: string; topic: string; message: string }) {
    const name = sanitizeText(input.name, 60);
    if (name.length < 2) return { error: "Please enter your name" } as const;
    if (!isValidEmail(input.email)) return { error: "Please enter a valid email address" } as const;
    const message = sanitizeText(input.message, 1000);
    if (message.length < 10) return { error: "Tell us a bit more (at least 10 characters)" } as const;
    const next = clone();
    next.messages = [{
      id: newId("MSG"), name, email: input.email.trim(), phone: input.phone ? normalizePhone(input.phone) : undefined,
      topic: sanitizeText(input.topic, 60), message, iso: new Date().toISOString(), status: "New" as const,
    }, ...next.messages].slice(0, 100);
    commit(next);
    return { ok: true } as const;
  },
  setMessageStatus(id: string, status: ContactMessage["status"]) {
    const next = clone();
    const m = next.messages.find((x) => x.id === id);
    if (m) { m.status = status; commit(next); }
  },

  // ---------- Transactions (agent driven) ----------
  recordDeposit(amount: number, trader?: { name: string; phone: string; id?: string }) {
    const next = clone();
    const agentId = next.sessionAgentId ?? next.agents[0]?.id;
    const agent = next.agents.find((a) => a.id === agentId);
    if (!agent) return { error: "No agent session" } as const;
    if (amount <= 0) return { error: "Enter a valid amount" } as const;
    if (amount > agent.floatBalance) return { error: "Insufficient float. Top up your float first." } as const;

    const record = trader?.id ? findTraderById(trader.id) : trader?.phone ? findTraderByPhone(trader.phone) : null;
    agent.floatBalance -= amount;
    agent.floatUsedToday += amount;
    agent.commissionMTD += DEPOSIT_FEE_AGENT_SHARE;
    const st = next.stats[agent.id] ?? emptyStats();
    next.stats[agent.id] = {
      ...st,
      depositsCollectedToday: st.depositsCollectedToday + amount,
      depositsCountToday: st.depositsCountToday + 1,
      depositFeeEarnedToday: st.depositFeeEarnedToday + DEPOSIT_FEE_AGENT_SHARE,
    };
    next.ledger = [{
      id: newId("TX"), agentId: agent.id, agentName: agent.name, kind: "Deposit" as const,
      traderId: record?.id, traderName: record?.name ?? trader?.name, traderPhone: record?.phone ?? trader?.phone,
      amount, fee: DEPOSIT_FEE_AGENT_SHARE, status: "Successful" as const, ...nowStamp(), floatAfter: agent.floatBalance,
    }, ...next.ledger].slice(0, 500);
    logAudit(next, agent.name, `Deposit ${amount} for ${record?.name ?? trader?.name ?? "trader"}`);
    commit(next);
    if (record) applyAgentDeposit({ traderId: record.id, amount, agentName: agent.name });
    return { ok: true, floatBalance: agent.floatBalance, traderBalance: record ? record.balance + amount : undefined } as const;
  },

  recordWithdrawal(amount: number, trader?: { name: string; phone: string; id?: string }) {
    const next = clone();
    const agentId = next.sessionAgentId ?? next.agents[0]?.id;
    const agent = next.agents.find((a) => a.id === agentId);
    if (!agent) return { error: "No agent session" } as const;
    if (amount <= 0) return { error: "Enter a valid amount" } as const;
    const record = trader?.id ? findTraderById(trader.id) : trader?.phone ? findTraderByPhone(trader.phone) : null;

    agent.floatBalance += amount;
    agent.commissionMTD += WITHDRAWAL_FEE_AGENT_SHARE;
    const st = next.stats[agent.id] ?? emptyStats();
    next.stats[agent.id] = {
      ...st,
      withdrawalsProcessedToday: st.withdrawalsProcessedToday + amount,
      withdrawalsCountToday: st.withdrawalsCountToday + 1,
      withdrawalFeeEarnedToday: st.withdrawalFeeEarnedToday + WITHDRAWAL_FEE_AGENT_SHARE,
    };
    next.ledger = [{
      id: newId("TX"), agentId: agent.id, agentName: agent.name, kind: "Withdrawal" as const,
      traderId: record?.id, traderName: record?.name ?? trader?.name, traderPhone: record?.phone ?? trader?.phone,
      amount, fee: WITHDRAWAL_FEE_AGENT_SHARE, status: "Successful" as const, ...nowStamp(), floatAfter: agent.floatBalance,
    }, ...next.ledger].slice(0, 500);
    logAudit(next, agent.name, `Withdrawal ${amount} for ${record?.name ?? trader?.name ?? "trader"}`);
    commit(next);
    if (record) applyAgentWithdrawal({ traderId: record.id, amount, fee: WITHDRAWAL_FEE_GROSS, agentName: agent.name });
    return { ok: true, floatBalance: agent.floatBalance } as const;
  },

  topupFloat(amount: number, channel = "Bank Transfer") {
    const next = clone();
    const agent = next.agents.find((a) => a.id === (next.sessionAgentId ?? next.agents[0]?.id));
    if (!agent || amount <= 0) return false;
    agent.floatBalance += amount;
    agent.floatCapacity = Math.max(agent.floatCapacity, agent.floatBalance);
    next.ledger = [{
      id: newId("FL"), agentId: agent.id, agentName: agent.name, kind: "FloatTopup" as const,
      amount, channel, reference: newId("NIBSS"), status: "Successful" as const, ...nowStamp(), floatAfter: agent.floatBalance,
    }, ...next.ledger].slice(0, 500);
    logAudit(next, agent.name, `Float top-up ${amount} via ${channel}`);
    commit(next);
    return true;
  },

  withdrawFloat(amount: number, channel = "Bank Transfer") {
    const next = clone();
    const agent = next.agents.find((a) => a.id === (next.sessionAgentId ?? next.agents[0]?.id));
    if (!agent || amount <= 0 || amount > agent.floatBalance) return false;
    agent.floatBalance -= amount;
    next.ledger = [{
      id: newId("FL"), agentId: agent.id, agentName: agent.name, kind: "FloatWithdraw" as const,
      amount, channel, reference: newId("NIBSS"), status: "Successful" as const, ...nowStamp(), floatAfter: agent.floatBalance,
    }, ...next.ledger].slice(0, 500);
    logAudit(next, agent.name, `Float payout ${amount} to ${channel}`);
    commit(next);
    return true;
  },

  // ---------- Group savings (Ajo/Esusu) ----------
  /**
   * Agent-led group contribution: agent collects cash, float is debited and the
   * pooled amount moves into the group ledger (handled by groupStore).
   */
  recordGroupContribution(input: {
    amount: number; groupName: string; traderId?: string; traderName?: string; fee?: number;
  }) {
    const next = clone();
    const agent = next.agents.find((a) => a.id === (next.sessionAgentId ?? next.agents[0]?.id));
    if (!agent) return { error: "No agent session" } as const;
    if (input.amount <= 0) return { error: "Enter a valid amount" } as const;
    if (input.amount > agent.floatBalance) return { error: "Insufficient float. Top up your float first." } as const;
    const fee = input.fee ?? DEPOSIT_FEE_AGENT_SHARE;
    agent.floatBalance -= input.amount;
    agent.floatUsedToday += input.amount;
    agent.commissionMTD += fee;
    const st = next.stats[agent.id] ?? emptyStats();
    next.stats[agent.id] = {
      ...st,
      depositsCollectedToday: st.depositsCollectedToday + input.amount,
      depositsCountToday: st.depositsCountToday + 1,
      depositFeeEarnedToday: st.depositFeeEarnedToday + fee,
    };
    next.ledger = [{
      id: newId("GC"), agentId: agent.id, agentName: agent.name, kind: "GroupContribution" as const,
      traderId: input.traderId, traderName: input.traderName, amount: input.amount, fee,
      channel: input.groupName, status: "Successful" as const, ...nowStamp(), floatAfter: agent.floatBalance,
    }, ...next.ledger].slice(0, 500);
    logAudit(next, agent.name, `Group contribution ${input.amount} — ${input.groupName}`);
    commit(next);
    return { ok: true, floatBalance: agent.floatBalance } as const;
  },

  /** Agent-led group payout: agent disburses cash, float is refunded. */
  recordGroupPayout(input: { amount: number; groupName: string; traderId?: string; traderName?: string }) {
    const next = clone();
    const agent = next.agents.find((a) => a.id === (next.sessionAgentId ?? next.agents[0]?.id));
    if (!agent) return { error: "No agent session" } as const;
    if (input.amount <= 0) return { error: "Enter a valid amount" } as const;
    agent.floatBalance += input.amount;
    agent.commissionMTD += WITHDRAWAL_FEE_AGENT_SHARE;
    const st = next.stats[agent.id] ?? emptyStats();
    next.stats[agent.id] = {
      ...st,
      withdrawalsProcessedToday: st.withdrawalsProcessedToday + input.amount,
      withdrawalsCountToday: st.withdrawalsCountToday + 1,
      withdrawalFeeEarnedToday: st.withdrawalFeeEarnedToday + WITHDRAWAL_FEE_AGENT_SHARE,
    };
    next.ledger = [{
      id: newId("GP"), agentId: agent.id, agentName: agent.name, kind: "GroupPayout" as const,
      traderId: input.traderId, traderName: input.traderName, amount: input.amount,
      fee: WITHDRAWAL_FEE_AGENT_SHARE, channel: input.groupName,
      status: "Successful" as const, ...nowStamp(), floatAfter: agent.floatBalance,
    }, ...next.ledger].slice(0, 500);
    logAudit(next, agent.name, `Group payout ${input.amount} — ${input.groupName}`);
    commit(next);
    return { ok: true, floatBalance: agent.floatBalance } as const;
  },

  audit: (limit = 50) => state.audit.slice(0, limit),
};

// ---------------------------------------------------------------------------
// React bindings
// ---------------------------------------------------------------------------
export function usePlatform() {
  return useSyncExternalStore(platformStore.subscribe, platformStore.get, platformStore.get);
}

export function useCurrentAgentRecord(): AgentRecord | null {
  usePlatform();
  return platformStore.currentAgent();
}

export function useCurrentAdmin(): AdminUser | null {
  usePlatform();
  return platformStore.currentAdmin();
}

export function useSettings(): PlatformSettings {
  return usePlatform().settings;
}

// ---------------------------------------------------------------------------
// Analytics derived from live state (used by the admin dashboard)
// ---------------------------------------------------------------------------
export interface AgentAnalyticsRow {
  agent: AgentRecord;
  depositsAmount: number;
  depositsCount: number;
  depositFees: number;
  withdrawalsAmount: number;
  withdrawalsCount: number;
  withdrawalFees: number;
  floatImpact: number;
  lastDeposit?: string;
  lastWithdrawal?: string;
}

export function agentAnalytics(): AgentAnalyticsRow[] {
  const s = state;
  return s.agents.map((agent) => {
    const st = s.stats[agent.id] ?? emptyStats();
    const mine = s.ledger.filter((t) => t.agentId === agent.id);
    const lastDep = mine.find((t) => t.kind === "Deposit");
    const lastWit = mine.find((t) => t.kind === "Withdrawal");
    return {
      agent,
      depositsAmount: st.depositsCollectedToday,
      depositsCount: st.depositsCountToday,
      depositFees: st.depositFeeEarnedToday,
      withdrawalsAmount: st.withdrawalsProcessedToday,
      withdrawalsCount: st.withdrawalsCountToday,
      withdrawalFees: st.withdrawalFeeEarnedToday,
      floatImpact: st.withdrawalsProcessedToday - st.depositsCollectedToday,
      lastDeposit: lastDep?.timestamp,
      lastWithdrawal: lastWit?.timestamp,
    };
  });
}

export function platformTotals() {
  const rows = agentAnalytics();
  const t = traderTotals();
  return {
    agents: state.agents.length,
    activeAgents: state.agents.filter((a) => a.status === "Active").length,
    pendingAgents: state.agents.filter((a) => a.status === "Pending").length,
    lowFloatAgents: state.agents.filter((a) => a.floatBalance < a.lowFloatThreshold).length,
    floatDeployed: state.agents.reduce((a, x) => a + x.floatBalance, 0),
    depositsToday: rows.reduce((a, r) => a + r.depositsAmount, 0),
    depositsCount: rows.reduce((a, r) => a + r.depositsCount, 0),
    depositFees: rows.reduce((a, r) => a + r.depositsCount * DEPOSIT_FEE_GROSS, 0),
    withdrawalsToday: rows.reduce((a, r) => a + r.withdrawalsAmount, 0),
    withdrawalsCount: rows.reduce((a, r) => a + r.withdrawalsCount, 0),
    withdrawalFees: rows.reduce((a, r) => a + r.withdrawalsCount * WITHDRAWAL_FEE_GROSS, 0),
    traders: t.count,
    activeTraders: t.active,
    traderBalance: t.balance,
    traderInterest: t.interest,
    pendingKyc: t.pendingKyc,
  };
}

export function useAgentAnalytics() {
  usePlatform();
  return agentAnalytics();
}

export function usePlatformTotals() {
  usePlatform();
  return platformTotals();
}

export function useAllTraders() {
  usePlatform();
  return getAllTraders();
}
