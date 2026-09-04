import { useEffect, useState } from "react";

/**
 * Recharts writes colors as SVG presentation attributes, where CSS `var(--x)`
 * is NOT supported — the series simply renders invisible. This hook resolves
 * the design tokens to concrete color strings and re-resolves them whenever
 * the light/dark theme changes.
 */
const TOKENS = [
  "primary",
  "gold",
  "accent",
  "success",
  "warning",
  "destructive",
  "border",
  "muted-foreground",
  "foreground",
  "card",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
] as const;

export type ChartColors = Record<(typeof TOKENS)[number], string>;

const FALLBACK: ChartColors = {
  primary: "#0B4F2E",
  gold: "#D4AF37",
  accent: "#0D9488",
  success: "#16A34A",
  warning: "#E0A526",
  destructive: "#DC2626",
  border: "#E5E7EB",
  "muted-foreground": "#6B7280",
  foreground: "#1F2937",
  card: "#FFFFFF",
  "chart-1": "#0B4F2E",
  "chart-2": "#D4AF37",
  "chart-3": "#0D9488",
  "chart-4": "#16A34A",
  "chart-5": "#E0A526",
};

function read(): ChartColors {
  if (typeof window === "undefined") return FALLBACK;
  const cs = getComputedStyle(document.documentElement);
  const out = { ...FALLBACK } as ChartColors;
  for (const t of TOKENS) {
    const v = cs.getPropertyValue(`--${t}`).trim();
    if (v) out[t] = v;
  }
  return out;
}

export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(FALLBACK);

  useEffect(() => {
    const update = () => setColors(read());
    update();
    window.addEventListener("safebox-theme-change", update);
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      window.removeEventListener("safebox-theme-change", update);
      obs.disconnect();
    };
  }, []);

  return colors;
}
