// Mock Nomba Treasury API — daily yield accrual + virtual account numbers.
// All values are simulated locally; no network calls are made.

export const NOMBA = {
  provider: "Nomba Treasury",
  bankName: "Nomba MFB",
  annualRate: 0.12, // 12% p.a. treasury yield
  traderShare: 0.75, // traders keep 75% of yield
  agentFloatRate: 0.08, // 8% p.a. on idle agent float
  payoutTime: "02:00 WAT daily",
} as const;

export const dailyRate = (annual = NOMBA.annualRate) => annual / 365;

/** Deterministic pseudo-random from a string seed (stable across renders/reloads). */
function seedFrom(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export type VirtualAccount = {
  accountNumber: string;
  accountName: string;
  bankName: string;
  provider: string;
  status: "Active";
};

/** Mock Nomba virtual account (NUBAN-style 10 digits), stable per id. */
export function virtualAccountFor(id: string, name: string, prefix = "90"): VirtualAccount {
  const s = seedFrom(id + name);
  const body = String(s % 100000000).padStart(8, "0");
  return {
    accountNumber: `${prefix}${body}`,
    accountName: `SafeBox / ${name}`,
    bankName: NOMBA.bankName,
    provider: NOMBA.provider,
    status: "Active",
  };
}

export type YieldEntry = {
  date: string; // ISO date
  label: string;
  balance: number;
  interest: number;
  cumulative: number;
};

/** Simulated daily interest accrual for the last `days` days. */
export function buildYieldLedger(balance: number, days = 30, annual = NOMBA.annualRate): YieldEntry[] {
  const out: YieldEntry[] = [];
  let cumulative = 0;
  const seed = seedFrom(String(Math.round(balance)) + days);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // Balance drifts slightly day to day so the ledger looks organic.
    const drift = ((seed >> (i % 12)) % 9) / 100 - 0.04;
    const dayBalance = Math.max(0, Math.round(balance * (1 + drift)));
    const interest = Math.round(dayBalance * dailyRate(annual) * NOMBA.traderShare * 100) / 100;
    cumulative = Math.round((cumulative + interest) * 100) / 100;
    out.push({
      date: d.toISOString(),
      label: d.toLocaleDateString("en-NG", { day: "2-digit", month: "short" }),
      balance: dayBalance,
      interest,
      cumulative,
    });
  }
  return out;
}

export const dailyInterest = (balance: number, annual = NOMBA.annualRate) =>
  Math.round(balance * dailyRate(annual) * NOMBA.traderShare * 100) / 100;

export const projectedAnnual = (balance: number, annual = NOMBA.annualRate) =>
  Math.round(balance * annual * NOMBA.traderShare);

export const formatKobo = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Platform-level treasury figures for the admin console. */
export function treasurySummary() {
  const aum = 12_412_800_000;
  const deployed = Math.round(aum * 0.86);
  const grossDaily = Math.round(deployed * dailyRate());
  const traderPayout = Math.round(grossDaily * NOMBA.traderShare);
  const platformMargin = grossDaily - traderPayout;
  const days = 30;
  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const wobble = 1 + (((seedFrom(String(i)) % 11) - 5) / 100);
    return {
      label: d.toLocaleDateString("en-NG", { day: "2-digit", month: "short" }),
      gross: Math.round(grossDaily * wobble),
      payout: Math.round(traderPayout * wobble),
    };
  });
  return { aum, deployed, grossDaily, traderPayout, platformMargin, series };
}

export const treasuryPools = [
  { name: "Nomba Treasury Bills (91-day)", allocation: 46, rate: 12.4, status: "Active" as const },
  { name: "Nomba Money Market Fund", allocation: 32, rate: 11.1, status: "Active" as const },
  { name: "Nomba Fixed Placement (30-day)", allocation: 14, rate: 10.2, status: "Active" as const },
  { name: "Settlement buffer (liquid)", allocation: 8, rate: 0, status: "Reserve" as const },
];
