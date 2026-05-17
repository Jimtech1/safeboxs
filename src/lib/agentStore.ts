import { useSyncExternalStore } from "react";
import { currentAgent } from "./mockData";

export interface AgentState {
  floatBalance: number;
  depositsCollectedToday: number;
  depositsCountToday: number;
  withdrawalsProcessedToday: number;
  withdrawalsCountToday: number;
  depositFeeEarnedToday: number;
  withdrawalFeeEarnedToday: number;
}

const DEPOSIT_FEE_AGENT_SHARE = 10; // ₦10 per deposit (agent)
const WITHDRAWAL_FEE_AGENT_SHARE = 90; // ₦90 per withdrawal (agent)

let state: AgentState = {
  floatBalance: currentAgent.floatBalance,
  depositsCollectedToday: currentAgent.depositsCollectedToday,
  depositsCountToday: currentAgent.tradersServedToday,
  withdrawalsProcessedToday: currentAgent.withdrawalsToday,
  withdrawalsCountToday: 4,
  depositFeeEarnedToday: currentAgent.tradersServedToday * DEPOSIT_FEE_AGENT_SHARE,
  withdrawalFeeEarnedToday: 4 * WITHDRAWAL_FEE_AGENT_SHARE,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const agentStore = {
  get: () => state,
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  recordDeposit(amount: number) {
    state = {
      ...state,
      floatBalance: state.floatBalance - amount,
      depositsCollectedToday: state.depositsCollectedToday + amount,
      depositsCountToday: state.depositsCountToday + 1,
      depositFeeEarnedToday: state.depositFeeEarnedToday + DEPOSIT_FEE_AGENT_SHARE,
    };
    emit();
  },
  recordWithdrawal(amount: number) {
    state = {
      ...state,
      floatBalance: state.floatBalance + amount,
      withdrawalsProcessedToday: state.withdrawalsProcessedToday + amount,
      withdrawalsCountToday: state.withdrawalsCountToday + 1,
      withdrawalFeeEarnedToday: state.withdrawalFeeEarnedToday + WITHDRAWAL_FEE_AGENT_SHARE,
    };
    emit();
  },
  topupFloat(amount: number) {
    state = { ...state, floatBalance: state.floatBalance + amount };
    emit();
  },
  addTrader() {
    // hook for traders list — no-op on agent state
  },
};

export function useAgentState(): AgentState {
  return useSyncExternalStore(agentStore.subscribe, agentStore.get, agentStore.get);
}

// Traders store (for adding traders from agent dashboard)
import type { Trader } from "./mockData";
import { traders as seedTraders } from "./mockData";

let tradersState: Trader[] = [...seedTraders];
const tradersListeners = new Set<() => void>();
const emitTraders = () => tradersListeners.forEach((l) => l());

export const tradersStore = {
  get: () => tradersState,
  subscribe: (fn: () => void) => {
    tradersListeners.add(fn);
    return () => tradersListeners.delete(fn);
  },
  add(t: Omit<Trader, "id" | "balance" | "totalSaved" | "lastTxn" | "status">) {
    const newT: Trader = {
      id: `TR-${20000 + tradersState.length}`,
      balance: 0,
      totalSaved: 0,
      lastTxn: "Just now",
      status: "Active",
      ...t,
    };
    tradersState = [newT, ...tradersState];
    emitTraders();
  },
};

export function useTraders(): Trader[] {
  return useSyncExternalStore(tradersStore.subscribe, tradersStore.get, tradersStore.get);
}
