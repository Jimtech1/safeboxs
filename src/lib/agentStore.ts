import { useSyncExternalStore } from "react";
import { currentAgent } from "./mockData";
import type { Trader } from "./mockData";
import { traders as seedTraders } from "./mockData";

export interface LoggedTxn {
  id: string;
  kind: "Deposit" | "Withdrawal" | "FloatTopup" | "FloatWithdraw";
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

export interface AgentState {
  floatBalance: number;
  depositsCollectedToday: number;
  depositsCountToday: number;
  withdrawalsProcessedToday: number;
  withdrawalsCountToday: number;
  depositFeeEarnedToday: number;
  withdrawalFeeEarnedToday: number;
  txns: LoggedTxn[];
}

const DEPOSIT_FEE_AGENT_SHARE = 10;
const WITHDRAWAL_FEE_AGENT_SHARE = 90;
const LS_KEY = "safebox.agentState.v2";
const LS_TRADERS = "safebox.traders.v2";

const defaultState = (): AgentState => ({
  floatBalance: currentAgent.floatBalance,
  depositsCollectedToday: currentAgent.depositsCollectedToday,
  depositsCountToday: currentAgent.tradersServedToday,
  withdrawalsProcessedToday: currentAgent.withdrawalsToday,
  withdrawalsCountToday: 4,
  depositFeeEarnedToday: currentAgent.tradersServedToday * DEPOSIT_FEE_AGENT_SHARE,
  withdrawalFeeEarnedToday: 4 * WITHDRAWAL_FEE_AGENT_SHARE,
  txns: [],
});

const load = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const save = (key: string, v: unknown) => {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
};

let state: AgentState = load(LS_KEY, defaultState());

const listeners = new Set<() => void>();
const emit = () => { save(LS_KEY, state); listeners.forEach((l) => l()); };

const nowStamp = () => {
  const d = new Date();
  return { timestamp: d.toLocaleString("en-NG", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }), iso: d.toISOString() };
};
const newId = (prefix: string) => `${prefix}-${Math.floor(Math.random() * 9_000_000 + 1_000_000)}`;

export const agentStore = {
  get: () => state,
  subscribe: (fn: () => void) => { listeners.add(fn); return () => listeners.delete(fn); },
  reset() { state = defaultState(); emit(); },
  recordDeposit(amount: number, trader?: { name: string; phone: string }) {
    const ts = nowStamp();
    state = {
      ...state,
      floatBalance: state.floatBalance - amount,
      depositsCollectedToday: state.depositsCollectedToday + amount,
      depositsCountToday: state.depositsCountToday + 1,
      depositFeeEarnedToday: state.depositFeeEarnedToday + DEPOSIT_FEE_AGENT_SHARE,
      txns: [{
        id: newId("TX"), kind: "Deposit", traderName: trader?.name, traderPhone: trader?.phone,
        amount, fee: DEPOSIT_FEE_AGENT_SHARE, status: "Successful", ...ts, floatAfter: state.floatBalance - amount,
      }, ...state.txns],
    };
    emit();
  },
  recordWithdrawal(amount: number, trader?: { name: string; phone: string }) {
    const ts = nowStamp();
    state = {
      ...state,
      floatBalance: state.floatBalance + amount,
      withdrawalsProcessedToday: state.withdrawalsProcessedToday + amount,
      withdrawalsCountToday: state.withdrawalsCountToday + 1,
      withdrawalFeeEarnedToday: state.withdrawalFeeEarnedToday + WITHDRAWAL_FEE_AGENT_SHARE,
      txns: [{
        id: newId("TX"), kind: "Withdrawal", traderName: trader?.name, traderPhone: trader?.phone,
        amount, fee: WITHDRAWAL_FEE_AGENT_SHARE, status: "Successful", ...ts, floatAfter: state.floatBalance + amount,
      }, ...state.txns],
    };
    emit();
  },
  topupFloat(amount: number, channel = "Bank Transfer") {
    const ts = nowStamp();
    const ref = newId("NIBSS");
    state = {
      ...state,
      floatBalance: state.floatBalance + amount,
      txns: [{
        id: newId("FL"), kind: "FloatTopup", amount, channel, reference: ref,
        status: "Successful", ...ts, floatAfter: state.floatBalance + amount,
      }, ...state.txns],
    };
    emit();
  },
  withdrawFloat(amount: number, channel = "Bank Transfer") {
    if (amount > state.floatBalance) return false;
    const ts = nowStamp();
    const ref = newId("NIBSS");
    state = {
      ...state,
      floatBalance: state.floatBalance - amount,
      txns: [{
        id: newId("FL"), kind: "FloatWithdraw", amount, channel, reference: ref,
        status: "Successful", ...ts, floatAfter: state.floatBalance - amount,
      }, ...state.txns],
    };
    emit();
    return true;
  },
};

export function useAgentState(): AgentState {
  return useSyncExternalStore(agentStore.subscribe, agentStore.get, agentStore.get);
}

// Traders store with persistence
let tradersState: Trader[] = load<Trader[]>(LS_TRADERS, []);
if (tradersState.length === 0) tradersState = [...seedTraders];
const tradersListeners = new Set<() => void>();
const emitTraders = () => { save(LS_TRADERS, tradersState); tradersListeners.forEach((l) => l()); };

export const tradersStore = {
  get: () => tradersState,
  subscribe: (fn: () => void) => { tradersListeners.add(fn); return () => tradersListeners.delete(fn); },
  add(t: Omit<Trader, "id" | "balance" | "totalSaved" | "lastTxn" | "status">) {
    const newT: Trader = {
      id: `TR-${20000 + tradersState.length}`,
      balance: 0, totalSaved: 0, lastTxn: "Just now", status: "Active",
      ...t,
    };
    tradersState = [newT, ...tradersState];
    emitTraders();
  },
};

export function useTraders(): Trader[] {
  return useSyncExternalStore(tradersStore.subscribe, tradersStore.get, tradersStore.get);
}
