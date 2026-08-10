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

export type SavingsProductId = "safevault" | "safegrowth" | "safelock";

export type SavingsProduct = {
  id: SavingsProductId;
  name: string;
  tagline: string;
  rateLabel: string;
  rate: number;
  lockIn: string;
  liquidity: string;
  ndicInsured: boolean;
  earlyExit: string;
  badge?: string;
};

export const SAVINGS_PRODUCTS: SavingsProduct[] = [
  {
    id: "safevault", name: "SafeVault", tagline: "Flexible Savings",
    rateLabel: "7% per annum", rate: 0.07,
    lockIn: "None", liquidity: "Instant access", ndicInsured: true, earlyExit: "N/A",
  },
  {
    id: "safegrowth", name: "SafeGrowth", tagline: "Popular Choice",
    rateLabel: "Up to 18% per annum", rate: 0.18,
    lockIn: "Until maturity", liquidity: "At maturity", ndicInsured: true, earlyExit: "Not allowed",
    badge: "Most Popular",
  },
  {
    id: "safelock", name: "SafeLock", tagline: "Fixed Savings",
    rateLabel: "Up to 15% per annum", rate: 0.15,
    lockIn: "Fixed term", liquidity: "At maturity", ndicInsured: true, earlyExit: "2% penalty",
  },
];

export const getSavingsProduct = (id?: SavingsProductId): SavingsProduct =>
  SAVINGS_PRODUCTS.find((p) => p.id === id) ?? SAVINGS_PRODUCTS[0];

export type KycDoc = {
  id: string;
  kind: "NIN slip" | "Passport photo" | "Utility bill" | "Shop photo" | "Other";
  fileName: string;
  uploadedAt: string;
  status: "Uploaded" | "Under review" | "Verified" | "Rejected";
};

export type TraderNotification = {
  id: string;
  title: string;
  body: string;
  iso: string;
  read: boolean;
  kind: "Deposit" | "Withdrawal" | "Interest" | "System" | "Goal";
};

export type Placement = {
  id: string;
  productId: SavingsProductId;
  productName: string;
  amount: number;
  rate: number;
  termDays: number;
  startedAt: string;
  maturesAt: string;
  status: "Active" | "Matured" | "Closed";
  earlyExitPenaltyPct: number;
};

export type Goal = {

  id: string;
  name: string;
  target: number;
  current: number;
  deadline?: string;
  /** Savings product the goal is held in. Legacy goals default to SafeVault. */
  product?: SavingsProductId;
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
  market?: string;
  balance: number;
  totalSaved: number;
  interestEarned: number;
  streakDays: number;
  joinDate: string;
  lastActive: string;
  status: "active" | "inactive" | "suspended";
  /** Hashed PIN — plain PINs are never persisted. */
  pin: string;
  photo?: string;
  kycStatus?: "Tier 1" | "Pending review" | "Verified" | "Rejected";
  bankAccount?: { bankName: string; accountNumber: string; accountName: string };
  nextOfKin?: { name: string; relationship: string; phone: string };
  kycDocs?: KycDoc[];
  smsAlerts: boolean;

  emailAlerts: boolean;
};

export const formatNGN = (n: number) =>
  `₦${Math.round(n).toLocaleString("en-NG")}`;

export const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "—";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ---------- Seed data ----------
const demoTraders: Trader[] = [
  {
    id: "TRD_001", name: "Fatima Bello", phone: "08012345678", email: "fatima@example.com",
    agentId: "AG-2000", agentName: "Adebayo Ogunlesi", agentPhone: "08033112233", agentLocation: "Bodija Market, Ibadan",
    market: "Bodija Market, Ibadan",
    balance: 245800, totalSaved: 312500, interestEarned: 12450, streakDays: 42,
    joinDate: "2026-01-15", lastActive: "2026-06-03", status: "active", pin: hashPin("1234"),
    kycStatus: "Verified",
    bankAccount: { bankName: "GTBank", accountNumber: "0123456789", accountName: "Fatima Bello" },
    smsAlerts: true, emailAlerts: false,
  },
  {
    id: "TRD_002", name: "Chinedu Okafor", phone: "08023456789",
    agentId: "AG-2001", agentName: "Ngozi Eze", agentPhone: "08044112233", agentLocation: "Onitsha Main Market",
    market: "Onitsha Main Market",
    balance: 89400, totalSaved: 132000, interestEarned: 4210, streakDays: 21,
    joinDate: "2026-02-08", lastActive: "2026-06-02", status: "active", pin: hashPin("1234"),
    kycStatus: "Tier 1",
    smsAlerts: true, emailAlerts: false,
  },
  {
    id: "TRD_003", name: "Aisha Mohammed", phone: "08034567890",
    agentId: "AG-2000", agentName: "Adebayo Ogunlesi", agentPhone: "08033112233", agentLocation: "Bodija Market, Ibadan",
    market: "Bodija Market, Ibadan",
    balance: 156200, totalSaved: 198000, interestEarned: 7800, streakDays: 65,
    joinDate: "2026-01-20", lastActive: "2026-06-04", status: "active", pin: hashPin("1234"),
    kycStatus: "Verified",
    smsAlerts: true, emailAlerts: true,
  },
];

// The 60 market traders from the platform catalogue become part of the same store,
// so Agent search, Admin tables and the Trader dashboard all read one list.
const catalogueTraders: Trader[] = baseTraders
  .filter((t) => !demoTraders.some((d) => d.phone === t.phone))
  .map((t, i) => ({
    id: t.id,
    name: t.name,
    phone: t.phone,
    agentId: `AG-${2000 + (i % 14)}`,
    agentName: "Adebayo Ogunlesi",
    agentPhone: "08033112233",
    agentLocation: t.market,
    market: t.market ?? markets[i % markets.length],
    balance: t.balance,
    totalSaved: t.totalSaved,
    interestEarned: Math.round(t.totalSaved * 0.03),
    streakDays: 5 + (i % 60),
    joinDate: new Date(Date.now() - (30 + i) * 86400000).toISOString(),
    lastActive: new Date(Date.now() - (i % 24) * 3600000).toISOString(),
    status: t.status === "Suspended" ? "suspended" : "active",
    pin: hashPin("1234"),
    kycStatus: i % 7 === 0 ? "Pending review" : "Tier 1",
    smsAlerts: true,
    emailAlerts: false,
  }));

const seedTraders: Trader[] = [...demoTraders, ...catalogueTraders];


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
  { id: "G_1", name: "Children's School Fees", target: 200000, current: 150000, deadline: "2026-09-01", product: "safegrowth" },
  { id: "G_2", name: "Shop Inventory Restock", target: 100000, current: 38000, product: "safevault" },
];


// ---------- Storage ----------
const KEY = "safebox_trader_store_v2";

type Store = {
  traders: Trader[];
  txnsByTrader: Record<string, TraderTxn[]>;
  withdrawals: WithdrawalRequest[];
  goalsByTrader: Record<string, Goal[]>;
  notificationsByTrader?: Record<string, TraderNotification[]>;
  placementsByTrader?: Record<string, Placement[]>;
  currentTraderId?: string;
};


function defaultStore(): Store {
  const txnsByTrader: Record<string, TraderTxn[]> = {};
  seedTraders.forEach((t, i) => {
    // Rich history for the demo accounts, a lighter tail for the catalogue
    txnsByTrader[t.id] = i < demoTraders.length
      ? buildSeedTransactions(t.id, t.balance)
      : buildSeedTransactions(t.id, t.balance).slice(0, 8);
  });
  return {
    traders: seedTraders,
    txnsByTrader,
    withdrawals: seedWithdrawals,
    goalsByTrader: { TRD_001: seedGoals, TRD_002: [], TRD_003: [] },
  };
}

let cache: Store | null = null;

function load(): Store {
  if (typeof window === "undefined") return defaultStore();
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Store) : defaultStore();
  } catch { cache = defaultStore(); }
  return cache;
}

function save(s: Store) {
  cache = s;
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* quota */ }
  window.dispatchEvent(new Event("trader-store-change"));
}

export function subscribeTraderStore(fn: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("trader-store-change", fn);
  return () => window.removeEventListener("trader-store-change", fn);
}

// ---------- Public API ----------
export function getStore() { return load(); }

export function getAllTraders(): Trader[] { return load().traders; }

export function findTraderByPhone(phone: string): Trader | null {
  const p = normalizePhone(phone);
  return load().traders.find((t) => t.phone === p) ?? null;
}

export function findTraderById(id: string): Trader | null {
  return load().traders.find((t) => t.id === id) ?? null;
}

export function loginTrader(phone: string, pin: string): Trader | null {
  const p = normalizePhone(phone);
  const key = `trader:${p}`;
  if (checkThrottle(key).blocked) return null;
  const s = load();
  const t = s.traders.find((x) => x.phone === p);
  if (!t || !verifyPin(pin, t.pin)) {
    registerFailure(key);
    return null;
  }
  if (t.status === "suspended") {
    registerFailure(key);
    return null;
  }
  clearFailures(key);
  s.currentTraderId = t.id;
  t.lastActive = new Date().toISOString();
  save(s);
  return t;
}

export function traderLoginBlocked(phone: string) {
  return checkThrottle(`trader:${normalizePhone(phone)}`);
}


export function signupTrader(input: {
  name: string; phone: string; email?: string; market: string; pin: string;
  agentId?: string; agentName?: string; agentPhone?: string; autoLogin?: boolean;
}): Trader | { error: string } {
  const s = load();
  const normalizedPhone = normalizePhone(input.phone);
  const name = sanitizeText(input.name, 60);
  if (name.length < 3) return { error: "Enter the trader's full name" };
  if (!isValidPhone(normalizedPhone)) return { error: "Phone must be 11 digits starting with 0" };
  if (!isValidPin(input.pin)) return { error: "PIN must be 4-6 digits" };
  if (s.traders.some((t) => t.phone === normalizedPhone)) return { error: "An account with this phone already exists" };
  const id = `TRD_${Date.now().toString(36).toUpperCase()}`;
  const now = new Date().toISOString();
  const market = sanitizeText(input.market, 80) || "Bodija Market, Ibadan";
  const trader: Trader = {
    id, name, phone: normalizedPhone, email: input.email ? sanitizeText(input.email, 120) : undefined,
    agentId: input.agentId ?? "AG-2000", agentName: input.agentName ?? "Adebayo Ogunlesi",
    agentPhone: input.agentPhone ?? "08033112233", agentLocation: market, market,
    balance: 0, totalSaved: 0, interestEarned: 0, streakDays: 0,
    joinDate: now, lastActive: now, status: "active", pin: hashPin(input.pin),
    kycStatus: "Tier 1",
    smsAlerts: true, emailAlerts: !!input.email,
  };
  s.traders.unshift(trader);
  s.txnsByTrader[id] = [];
  s.goalsByTrader[id] = [];
  if (input.autoLogin !== false) s.currentTraderId = id;
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
  const { pin, id, ...safe } = patch as Partial<Trader>;
  s.traders[idx] = { ...s.traders[idx], ...safe };
  save(s);
}

export function updateTraderById(id: string, patch: Partial<Trader>) {
  const s = load();
  const idx = s.traders.findIndex((t) => t.id === id);
  if (idx === -1) return;
  const { pin: _pin, id: _id, ...safe } = patch as Partial<Trader>;
  s.traders[idx] = { ...s.traders[idx], ...safe };
  save(s);
}

export function changeTraderPin(currentPin: string, newPin: string): { ok: true } | { error: string } {
  const s = load();
  const t = s.traders.find((x) => x.id === s.currentTraderId);
  if (!t) return { error: "Not signed in" };
  if (!verifyPin(currentPin, t.pin)) return { error: "Current PIN is incorrect" };
  if (!isValidPin(newPin)) return { error: "New PIN must be 4-6 digits" };
  if (verifyPin(newPin, t.pin)) return { error: "New PIN must be different" };
  t.pin = hashPin(newPin);
  save(s);
  return { ok: true };
}

// ---------- Agent-driven mutations (shared with the agent dashboard) ----------
function pushTxn(s: Store, traderId: string, txn: TraderTxn) {
  s.txnsByTrader[traderId] = [txn, ...(s.txnsByTrader[traderId] ?? [])].slice(0, 200);
  pushNotificationInternal(s, traderId, {
    kind: txn.type,
    title:
      txn.type === "Deposit" ? `Deposit of ${formatNGN(txn.amount)} received`
      : txn.type === "Withdrawal" ? `Withdrawal of ${formatNGN(txn.amount)} processed`
      : `Interest credit of ${formatNGN(txn.amount)}`,
    body: `${txn.description}. New balance: ${formatNGN(txn.balanceAfter)}.`,
  });
}

function pushNotificationInternal(
  s: Store,
  traderId: string,
  input: { title: string; body: string; kind: TraderNotification["kind"] },
) {
  s.notificationsByTrader = s.notificationsByTrader ?? {};
  s.notificationsByTrader[traderId] = [
    {
      id: `NTF_${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 100)}`,
      title: input.title,
      body: input.body,
      kind: input.kind,
      iso: new Date().toISOString(),
      read: false,
    },
    ...(s.notificationsByTrader[traderId] ?? []),
  ].slice(0, 50);
}



export function applyAgentDeposit(input: { traderId: string; amount: number; agentName: string }) {
  const s = load();
  const t = s.traders.find((x) => x.id === input.traderId);
  if (!t) return null;
  t.balance += input.amount;
  t.totalSaved += input.amount;
  t.streakDays += 1;
  t.lastActive = new Date().toISOString();
  pushTxn(s, t.id, {
    id: `TXN_${Date.now().toString(36).toUpperCase()}`,
    date: new Date().toISOString(),
    description: `Cash deposit via ${input.agentName}`,
    amount: input.amount, balanceAfter: t.balance, type: "Deposit",
    status: "Completed", agentName: input.agentName,
  });
  save(s);
  return t;
}

export function applyAgentWithdrawal(input: { traderId: string; amount: number; fee?: number; agentName: string }) {
  const s = load();
  const t = s.traders.find((x) => x.id === input.traderId);
  if (!t) return null;
  const total = input.amount + (input.fee ?? 0);
  t.balance = Math.max(0, t.balance - total);
  t.lastActive = new Date().toISOString();
  pushTxn(s, t.id, {
    id: `TXN_${Date.now().toString(36).toUpperCase()}`,
    date: new Date().toISOString(),
    description: `Cash withdrawal via ${input.agentName}${input.fee ? ` (₦${input.fee} fee)` : ""}`,
    amount: total, balanceAfter: t.balance, type: "Withdrawal",
    status: "Completed", agentName: input.agentName,
  });
  // Close out any matching pending request
  const pending = s.withdrawals.find((w) => w.traderId === t.id && w.status === "Pending");
  if (pending) pending.status = "Completed";
  save(s);
  return t;
}

export function setWithdrawalStatus(id: string, status: WithdrawalRequest["status"]) {
  const s = load();
  const w = s.withdrawals.find((x) => x.id === id);
  if (!w) return;
  w.status = status;
  if (status === "Completed") {
    const t = s.traders.find((x) => x.id === w.traderId);
    if (t) {
      t.balance = Math.max(0, t.balance - w.amount);
      pushTxn(s, t.id, {
        id: `TXN_${Date.now().toString(36).toUpperCase()}`,
        date: new Date().toISOString(),
        description: `Withdrawal ${w.method.toLowerCase()}`,
        amount: w.amount, balanceAfter: t.balance, type: "Withdrawal",
        status: "Completed", agentName: t.agentName,
      });
    }
  }
  save(s);
}

export function allWithdrawals(): WithdrawalRequest[] { return load().withdrawals; }

export function traderTotals() {
  const s = load();
  return {
    count: s.traders.length,
    active: s.traders.filter((t) => t.status === "active").length,
    suspended: s.traders.filter((t) => t.status === "suspended").length,
    balance: s.traders.reduce((a, t) => a + t.balance, 0),
    saved: s.traders.reduce((a, t) => a + t.totalSaved, 0),
    interest: s.traders.reduce((a, t) => a + t.interestEarned, 0),
    pendingKyc: s.traders.filter((t) => t.kycStatus === "Pending review").length,
  };
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
  // Legacy goals (created before savings products) default to SafeVault
  return (load().goalsByTrader[traderId] ?? []).map((g) => ({ ...g, product: g.product ?? "safevault" }));
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

// ---------- Group savings mutations (Ajo/Esusu) ----------
/** Debit a trader's savings wallet for a group contribution paid from balance. */
export function applyGroupContribution(input: { traderId: string; amount: number; groupName: string; agentName?: string }) {
  const s = load();
  const t = s.traders.find((x) => x.id === input.traderId);
  if (!t) return null;
  if (t.balance < input.amount) return null;
  t.balance -= input.amount;
  t.lastActive = new Date().toISOString();
  pushTxn(s, t.id, {
    id: `TXN_${Date.now().toString(36).toUpperCase()}`,
    date: new Date().toISOString(),
    description: `Group contribution — ${input.groupName}`,
    amount: input.amount, balanceAfter: t.balance, type: "Withdrawal",
    status: "Completed", agentName: input.agentName ?? "SafeBox Groups",
  });
  save(s);
  return t;
}

/** Credit a trader's savings wallet with a group payout / refund. */
export function applyGroupPayout(input: { traderId: string; amount: number; groupName: string; agentName?: string; label?: string }) {
  const s = load();
  const t = s.traders.find((x) => x.id === input.traderId);
  if (!t) return null;
  t.balance += input.amount;
  t.totalSaved += input.amount;
  t.lastActive = new Date().toISOString();
  pushTxn(s, t.id, {
    id: `TXN_${Date.now().toString(36).toUpperCase()}`,
    date: new Date().toISOString(),
    description: `${input.label ?? "Group payout"} — ${input.groupName}`,
    amount: input.amount, balanceAfter: t.balance, type: "Deposit",
    status: "Completed", agentName: input.agentName ?? "SafeBox Groups",
  });
  save(s);
  return t;
}
