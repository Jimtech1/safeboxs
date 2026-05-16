// Mock data for SafeBox

export const formatNaira = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });

export const markets = [
  "Bodija Market, Ibadan",
  "Alaba International, Lagos",
  "Mile 12 Market, Lagos",
  "Ariaria Market, Aba",
  "Wuse Market, Abuja",
  "Oil Mill Market, PH",
  "Oshodi Market, Lagos",
];

const firstNames = ["Adebayo", "Chiamaka", "Ifeoma", "Tunde", "Aisha", "Emeka", "Bola", "Yusuf", "Ngozi", "Femi", "Hauwa", "Kemi", "Sade", "Musa", "Obinna", "Funke", "Ibrahim", "Ada", "Segun", "Halima"];
const lastNames = ["Ogunlesi", "Okonkwo", "Adeyemi", "Bello", "Eze", "Lawal", "Nwankwo", "Suleiman", "Olatunji", "Mohammed", "Adesina", "Ibekwe", "Akande", "Yakubu", "Onuoha"];

const rng = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};
const rnd = rng(42);
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];

export interface Trader {
  id: string;
  name: string;
  phone: string;
  market: string;
  balance: number;
  totalSaved: number;
  lastTxn: string;
  status: "Active" | "Suspended";
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  market: string;
  principal: string;
  floatBalance: number;
  floatCapacity: number;
  floatUsedToday: number;
  commissionMTD: number;
  status: "Active" | "Suspended" | "Pending";
}

export interface Transaction {
  id: string;
  timestamp: string;
  traderName: string;
  traderPhone: string;
  agentName: string;
  type: "Deposit" | "Withdrawal";
  amount: number;
  status: "Successful" | "Pending" | "Failed";
  smsSent: boolean;
}

export interface FloatTransaction {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: string;
  amount: number;
  channel: "Bank Transfer" | "Card" | "USSD";
  reference: string;
  status: "Successful" | "Pending";
}

const phone = (i: number) => `0${800 + (i % 100)}${(1000000 + i * 137).toString().slice(0, 7)}`;

export const traders: Trader[] = Array.from({ length: 60 }, (_, i) => ({
  id: `TR-${10000 + i}`,
  name: `${pick(firstNames)} ${pick(lastNames)}`,
  phone: phone(i),
  market: pick(markets),
  balance: Math.floor(rnd() * 450000) + 5000,
  totalSaved: Math.floor(rnd() * 2000000) + 50000,
  lastTxn: `${Math.floor(rnd() * 23)}h ago`,
  status: rnd() > 0.08 ? "Active" : "Suspended",
}));

export const principals = ["Licensed MFB Alpha", "Partner Bank Beta", "Principal Gamma MFB"];

export const agents: Agent[] = Array.from({ length: 14 }, (_, i) => {
  const capacity = (Math.floor(rnd() * 8) + 3) * 50000;
  const balance = Math.floor(rnd() * capacity);
  return {
    id: `AG-${2000 + i}`,
    name: `${pick(firstNames)} ${pick(lastNames)}`,
    phone: phone(i + 200),
    market: pick(markets),
    principal: pick(principals),
    floatBalance: balance,
    floatCapacity: capacity,
    floatUsedToday: Math.floor(rnd() * 80000),
    commissionMTD: Math.floor(rnd() * 80000) + 5000,
    status: i < 11 ? "Active" : i < 13 ? "Pending" : "Suspended",
  };
});

export const transactions: Transaction[] = Array.from({ length: 220 }, (_, i) => {
  const t = traders[i % traders.length];
  const a = agents[i % agents.length];
  const isDeposit = rnd() > 0.35;
  const day = Math.floor(rnd() * 30);
  const hr = Math.floor(rnd() * 24);
  return {
    id: `TX-${500000 + i}`,
    timestamp: `${day}d ${hr}h ago`,
    traderName: t.name,
    traderPhone: t.phone,
    agentName: a.name,
    type: isDeposit ? "Deposit" : "Withdrawal",
    amount: Math.floor(rnd() * 80000) + 500,
    status: rnd() > 0.05 ? "Successful" : rnd() > 0.5 ? "Pending" : "Failed",
    smsSent: rnd() > 0.03,
  };
});

export const floatTransactions: FloatTransaction[] = Array.from({ length: 80 }, (_, i) => {
  const a = agents[i % agents.length];
  return {
    id: `FL-${700000 + i}`,
    agentId: a.id,
    agentName: a.name,
    timestamp: `${Math.floor(rnd() * 20)}d ${Math.floor(rnd() * 24)}h ago`,
    amount: (Math.floor(rnd() * 9) + 1) * 25000,
    channel: rnd() > 0.6 ? "Bank Transfer" : rnd() > 0.4 ? "USSD" : "Card",
    reference: `NIBSS-${Math.floor(rnd() * 9000000) + 1000000}`,
    status: rnd() > 0.08 ? "Successful" : "Pending",
  };
});

// Charts data
export const savingsByRegion = [
  { day: "Wk1", Lagos: 18, Kano: 9, Oyo: 11, Rivers: 7, FCT: 8 },
  { day: "Wk2", Lagos: 22, Kano: 12, Oyo: 13, Rivers: 9, FCT: 10 },
  { day: "Wk3", Lagos: 26, Kano: 14, Oyo: 16, Rivers: 11, FCT: 12 },
  { day: "Wk4", Lagos: 31, Kano: 17, Oyo: 19, Rivers: 13, FCT: 14 },
];

export const txTypeSplit = [
  { name: "Deposits", value: 65 },
  { name: "Withdrawals", value: 35 },
];

export const dailyCommission = [
  { day: "Mon", value: 980 },
  { day: "Tue", value: 1240 },
  { day: "Wed", value: 870 },
  { day: "Thu", value: 1430 },
  { day: "Fri", value: 1820 },
  { day: "Sat", value: 2110 },
  { day: "Sun", value: 1240 },
];

// Current logged-in agent (float-funded model)
export const currentAgent = {
  name: "Adebayo Ogunlesi",
  market: "Bodija Market, Ibadan",
  floatBalance: 145000,
  floatCapacity: 250000,
  floatUsedToday: 78500,
  depositsCollectedToday: 78500,
  withdrawalsToday: 12000,
  commissionToday: 1240,
  commissionWeek: 6800,
  commissionMonth: 24500,
  tradersServedToday: 23,
  tradersServed: 147,
  avgDailyDeposits: 42000,
  lowFloatThreshold: 50000,
};

export const myFloatTopUps: FloatTransaction[] = [
  { id: "FL-900001", agentId: "AG-2000", agentName: "Adebayo Ogunlesi", timestamp: "Today 8:14 AM", amount: 100000, channel: "Bank Transfer", reference: "NIBSS-8273644", status: "Successful" },
  { id: "FL-900002", agentId: "AG-2000", agentName: "Adebayo Ogunlesi", timestamp: "Yesterday 7:02 AM", amount: 75000, channel: "USSD", reference: "NIBSS-8264411", status: "Successful" },
  { id: "FL-900003", agentId: "AG-2000", agentName: "Adebayo Ogunlesi", timestamp: "2d ago 9:30 AM", amount: 50000, channel: "Bank Transfer", reference: "NIBSS-8251008", status: "Successful" },
  { id: "FL-900004", agentId: "AG-2000", agentName: "Adebayo Ogunlesi", timestamp: "4d ago 8:45 AM", amount: 120000, channel: "Card", reference: "NIBSS-8230229", status: "Successful" },
];

export const overviewMetrics = {
  activeTraders: 24847,
  activeAgents: 5234,
  savingsVolume: 12_400_000_000,
  dailyVolume: 84_200_000,
  activePrincipals: 3,
  avgYield: 8.4,
  totalFloatDeployed: 412_500_000,
  lowFloatAgents: 38,
};
