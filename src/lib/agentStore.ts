// Compatibility bridge: the agent dashboard keeps this API, but all state now
// lives in the unified platform store (single source of truth).
import { useSyncExternalStore } from "react";
import type { Trader } from "./mockData";
import { platformStore, usePlatform, DEPOSIT_FEE_AGENT_SHARE, WITHDRAWAL_FEE_AGENT_SHARE } from "./platformStore";
import { getAllTraders, signupTrader, subscribeTraderStore } from "./mockTraderData";

export type { LedgerTxn as LoggedTxn } from "./platformStore";

export interface AgentState {
  floatBalance: number;
  depositsCollectedToday: number;
  depositsCountToday: number;
  withdrawalsProcessedToday: number;
  withdrawalsCountToday: number;
  depositFeeEarnedToday: number;
  withdrawalFeeEarnedToday: number;
  txns: ReturnType<typeof platformStore.get>["ledger"];
}

export { DEPOSIT_FEE_AGENT_SHARE, WITHDRAWAL_FEE_AGENT_SHARE };

export const agentStore = {
  subscribe: platformStore.subscribe,
  get(): AgentState {
    const s = platformStore.get();
    const agent = platformStore.currentAgent() ?? s.agents[0];
    const st = s.stats[agent?.id ?? ""] ?? {
      depositsCollectedToday: 0, depositsCountToday: 0, withdrawalsProcessedToday: 0,
      withdrawalsCountToday: 0, depositFeeEarnedToday: 0, withdrawalFeeEarnedToday: 0,
    };
    return {
      floatBalance: agent?.floatBalance ?? 0,
      ...st,
      txns: s.ledger.filter((t) => t.agentId === agent?.id),
    };
  },
  recordDeposit: (amount: number, trader?: { name: string; phone: string; id?: string }) =>
    platformStore.recordDeposit(amount, trader),
  recordWithdrawal: (amount: number, trader?: { name: string; phone: string; id?: string }) =>
    platformStore.recordWithdrawal(amount, trader),
  topupFloat: (amount: number, channel?: string) => platformStore.topupFloat(amount, channel),
  withdrawFloat: (amount: number, channel?: string) => platformStore.withdrawFloat(amount, channel),
  reset: () => platformStore.reset(),
};

export function useAgentState(): AgentState {
  usePlatform();
  return agentStore.get();
}

// ---- Traders (mapped from the unified trader store) ----
const mapTrader = (t: ReturnType<typeof getAllTraders>[number]): Trader => ({
  id: t.id,
  name: t.name,
  phone: t.phone,
  market: t.market ?? t.agentLocation,
  balance: t.balance,
  totalSaved: t.totalSaved,
  lastTxn: t.lastActive,
  status: t.status === "suspended" ? "Suspended" : "Active",
});

let snapshot: Trader[] = [];
let lastRef: unknown = null;

export const tradersStore = {
  subscribe: (fn: () => void) => subscribeTraderStore(fn),
  get(): Trader[] {
    const raw = getAllTraders();
    if (raw !== lastRef) { lastRef = raw; snapshot = raw.map(mapTrader); }
    return snapshot;
  },
  add(t: { name: string; phone: string; market: string }) {
    const agent = platformStore.currentAgent();
    return signupTrader({
      name: t.name, phone: t.phone, market: t.market, pin: "1234",
      agentId: agent?.id, agentName: agent?.name, agentPhone: agent?.phone, autoLogin: false,
    });
  },
};

export function useTraders(): Trader[] {
  return useSyncExternalStore(tradersStore.subscribe, tradersStore.get, tradersStore.get);
}
