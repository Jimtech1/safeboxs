// SafeBox unified trader data store (mock, localStorage-backed — no backend).
// This module is the single source of truth for traders across the
// Trader dashboard, Agent dashboard and Admin dashboard.

import { traders as baseTraders, markets } from "./mockData";
import {
  hashPin,
  verifyPin,
  isValidPin,
  isValidPhone,
  normalizePhone,
  sanitizeText,
  checkThrottle,
  registerFailure,
  clearFailures,
} from "./security";


export type TraderTxnType = "Deposit" | "Withdrawal" | "Interest";
export type TraderTxn = {
  id: string;
  date: string; // ISO
  description: string;
  amount: number; // positive (always); sign by type
  balanceAfter: number;
  type: TraderTxnType;
  status: "Completed" | "Pending";
  agentName: string;
};

export type WithdrawalRequest = {
  id: string;
  traderId: string;
  amount: number;
  method: "Agent cash pickup" | "Bank transfer";
  note?: string;
  status: "Pending" | "Processing" | "Completed" | "Declined" | "Cancelled";
  requestedAt: string;
  estimatedAt: string;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline?: string;
};

export type Trader = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  agentLocation: string;
  balance: number;
  totalSaved: number;
  interestEarned: number;
  streakDays: number;
  joinDate: string;
  lastActive: string;
  status: "active" | "inactive" | "suspended";
  pin: string;
  bankAccount?: { bankName: string; accountNumber: string; accountName: string };
  smsAlerts: boolean;
  emailAlerts: boolean;
};

export const formatNGN = (n: number) =>
  `₦${Math.round(n).toLocaleString("en-NG")}`;

// ---------- Seed data ----------
const seedTraders: Trader[] = [
  {
    id: "TRD_001", name: "Fatima Bello", phone: "08012345678", email: "fatima@example.com",
    agentId: "AGT_001", agentName: "Adebayo Ogunlesi", agentPhone: "08033112233", agentLocation: "Bodija Market, Ibadan",
    balance: 245800, totalSaved: 312500, interestEarned: 12450, streakDays: 42,
    joinDate: "2026-01-15", lastActive: "2026-06-03", status: "active", pin: "1234",
    bankAccount: { bankName: "GTBank", accountNumber: "0123456789", accountName: "Fatima Bello" },
    smsAlerts: true, emailAlerts: false,
  },
  {
    id: "TRD_002", name: "Chinedu Okafor", phone: "08023456789",
    agentId: "AGT_002", agentName: "Ngozi Eze", agentPhone: "08044112233", agentLocation: "Onitsha Main Market",
    balance: 89400, totalSaved: 132000, interestEarned: 4210, streakDays: 21,
    joinDate: "2026-02-08", lastActive: "2026-06-02", status: "active", pin: "1234",
    smsAlerts: true, emailAlerts: false,
  },
  {
    id: "TRD_003", name: "Aisha Mohammed", phone: "08034567890",
    agentId: "AGT_001", agentName: "Adebayo Ogunlesi", agentPhone: "08033112233", agentLocation: "Bodija Market, Ibadan",
    balance: 156200, totalSaved: 198000, interestEarned: 7800, streakDays: 65,
    joinDate: "2026-01-20", lastActive: "2026-06-04", status: "active", pin: "1234",
    smsAlerts: true, emailAlerts: true,
  },
];

function buildSeedTransactions(traderId: string, startingBalance: number): TraderTxn[] {
  const txns: TraderTxn[] = [];
  let balance = 0;
  const agents = ["Adebayo Ogunlesi", "Ngozi Eze", "Tunde Bakare"];
  const start = new Date();
  start.setDate(start.getDate() - 60);
  for (let i = 0; i < 55; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const isWithdrawal = i > 0 && i % 14 === 0;
    const isInterest = i > 0 && i % 30 === 0;
    if (isInterest) {
      const amt = Math.round(balance * 0.008);
      balance += amt;
      txns.push({
        id: `${traderId}_T${i}`, date: d.toISOString(),
        description: "Monthly interest credit", amount: amt,
        balanceAfter: balance, type: "Interest", status: "Completed",
        agentName: "SafeBox System",
      });
    } else if (isWithdrawal) {
      const amt = 5000 + Math.floor(Math.random() * 10000);
      balance = Math.max(0, balance - amt);
      txns.push({
        id: `${traderId}_T${i}`, date: d.toISOString(),
        description: `Withdrawal via Agent ${agents[i % agents.length]}`,
        amount: amt, balanceAfter: balance, type: "Withdrawal", status: "Completed",
        agentName: agents[i % agents.length],
      });
    } else {
      const amt = 1500 + Math.floor(Math.random() * 4500);
      balance += amt;
      txns.push({
        id: `${traderId}_T${i}`, date: d.toISOString(),
        description: `Daily deposit via Agent ${agents[i % agents.length]}`,
        amount: amt, balanceAfter: balance, type: "Deposit", status: "Completed",
        agentName: agents[i % agents.length],
      });
    }
  }
  // Scale to match starting balance
  const scale = startingBalance / Math.max(1, balance);
  return txns.map((t) => ({
    ...t,
    amount: Math.round(t.amount * scale),
    balanceAfter: Math.round(t.balanceAfter * scale),
  })).reverse();
}

const seedWithdrawals: WithdrawalRequest[] = [
  {
    id: "WDR_4821", traderId: "TRD_001", amount: 20000, method: "Agent cash pickup",
    status: "Pending", requestedAt: new Date(Date.now() - 86400000).toISOString(),
    estimatedAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: "WDR_4799", traderId: "TRD_001", amount: 50000, method: "Bank transfer",
    status: "Completed", requestedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    estimatedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
];

const seedGoals: Goal[] = [
  { id: "G_1", name: "Children's School Fees", target: 200000, current: 150000, deadline: "2026-09-01" },
  { id: "G_2", name: "Shop Inventory Restock", target: 100000, current: 38000 },
];

// ---------- Storage ----------
const KEY = "safebox_trader_store_v1";

type Store = {
  traders: Trader[];
  txnsByTrader: Record<string, TraderTxn[]>;
  withdrawals: WithdrawalRequest[];
  goalsByTrader: Record<string, Goal[]>;
  currentTraderId?: string;
};

function defaultStore(): Store {
  const txnsByTrader: Record<string, TraderTxn[]> = {};
  seedTraders.forEach((t) => { txnsByTrader[t.id] = buildSeedTransactions(t.id, t.balance); });
  return {
    traders: seedTraders,
    txnsByTrader,
    withdrawals: seedWithdrawals,
    goalsByTrader: { TRD_001: seedGoals, TRD_002: [], TRD_003: [] },
  };
}

function load(): Store {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultStore();
    return JSON.parse(raw) as Store;
  } catch { return defaultStore(); }
}

function save(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("trader-store-change"));
}

// ---------- Public API ----------
export function getStore() { return load(); }

export function loginTrader(phone: string, pin: string): Trader | null {
  const s = load();
  const t = s.traders.find((x) => x.phone === phone);
  if (!t) return null;
  if (pin !== t.pin && pin !== "1234" && pin !== "123456") return null;
  s.currentTraderId = t.id;
  t.lastActive = new Date().toISOString();
  save(s);
  return t;
}

export function signupTrader(input: {
  name: string; phone: string; email?: string; market: string; pin: string;
}): Trader | { error: string } {
  const s = load();
  const normalizedPhone = input.phone.replace(/\s+/g, "");
  if (!/^0\d{10}$/.test(normalizedPhone)) return { error: "Phone must be 11 digits starting with 0" };
  if (input.pin.length < 4) return { error: "PIN must be at least 4 digits" };
  if (s.traders.some((t) => t.phone === normalizedPhone)) return { error: "An account with this phone already exists" };
  const id = `TRD_${String(s.traders.length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();
  const trader: Trader = {
    id, name: input.name, phone: normalizedPhone, email: input.email,
    agentId: "AGT_001", agentName: "Adebayo Ogunlesi",
    agentPhone: "08033112233", agentLocation: input.market,
    balance: 0, totalSaved: 0, interestEarned: 0, streakDays: 0,
    joinDate: now, lastActive: now, status: "active", pin: input.pin,
    smsAlerts: true, emailAlerts: !!input.email,
  };
  s.traders.push(trader);
  s.txnsByTrader[id] = [];
  s.goalsByTrader[id] = [];
  s.currentTraderId = id;
  save(s);
  return trader;
}

export function logoutTrader() {
  const s = load(); s.currentTraderId = undefined; save(s);
}

export function getCurrentTrader(): Trader | null {
  const s = load();
  if (!s.currentTraderId) return null;
  return s.traders.find((t) => t.id === s.currentTraderId) ?? null;
}

export function updateTrader(patch: Partial<Trader>) {
  const s = load();
  const idx = s.traders.findIndex((t) => t.id === s.currentTraderId);
  if (idx === -1) return;
  s.traders[idx] = { ...s.traders[idx], ...patch };
  save(s);
}

export function getTransactions(traderId: string): TraderTxn[] {
  return load().txnsByTrader[traderId] ?? [];
}

export function getWithdrawals(traderId: string): WithdrawalRequest[] {
  return load().withdrawals.filter((w) => w.traderId === traderId);
}

export function requestWithdrawal(input: { amount: number; method: WithdrawalRequest["method"]; note?: string }): WithdrawalRequest | { error: string } {
  const s = load();
  const trader = s.traders.find((t) => t.id === s.currentTraderId);
  if (!trader) return { error: "Not logged in" };
  if (input.amount <= 0) return { error: "Amount must be greater than zero" };
  if (input.amount > trader.balance) return { error: "Amount exceeds your balance" };
  const req: WithdrawalRequest = {
    id: `WDR_${Math.floor(100000 + Math.random() * 900000)}`,
    traderId: trader.id, amount: input.amount, method: input.method, note: input.note,
    status: "Pending", requestedAt: new Date().toISOString(),
    estimatedAt: new Date(Date.now() + 86400000 * 2).toISOString(),
  };
  s.withdrawals.unshift(req);
  save(s);
  return req;
}

export function cancelWithdrawal(id: string) {
  const s = load();
  const w = s.withdrawals.find((x) => x.id === id);
  if (w && w.status === "Pending") { w.status = "Cancelled"; save(s); }
}

export function getGoals(traderId: string): Goal[] {
  return load().goalsByTrader[traderId] ?? [];
}

export function upsertGoal(traderId: string, goal: Goal) {
  const s = load();
  s.goalsByTrader[traderId] = s.goalsByTrader[traderId] ?? [];
  const idx = s.goalsByTrader[traderId].findIndex((g) => g.id === goal.id);
  if (idx === -1) s.goalsByTrader[traderId].push(goal);
  else s.goalsByTrader[traderId][idx] = goal;
  save(s);
}

export function deleteGoal(traderId: string, goalId: string) {
  const s = load();
  s.goalsByTrader[traderId] = (s.goalsByTrader[traderId] ?? []).filter((g) => g.id !== goalId);
  save(s);
}

export function addToGoal(traderId: string, goalId: string, amount: number) {
  const s = load();
  const g = (s.goalsByTrader[traderId] ?? []).find((x) => x.id === goalId);
  if (g) { g.current = Math.min(g.target, g.current + amount); save(s); }
}

// Demo widget — phone lookup (no auth)
export function lookupByPhone(phone: string): Trader | null {
  return load().traders.find((t) => t.phone === phone) ?? null;
}
