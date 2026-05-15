import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Home, ArrowLeftRight, Users, BarChart3, Settings as SettingsIcon } from "lucide-react";
import { SafeBoxLogo } from "@/components/SafeBoxLogo";
import { currentAgent } from "@/lib/mockData";

const tabs = [
  { to: "/agent", label: "Home", icon: Home, exact: true },
  { to: "/agent/transactions", label: "Txns", icon: ArrowLeftRight },
  { to: "/agent/traders", label: "Traders", icon: Users },
  { to: "/agent/performance", label: "Stats", icon: BarChart3 },
  { to: "/agent/settings", label: "Settings", icon: SettingsIcon },
];

export function AgentLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string, exact?: boolean) => exact ? path === to : path.startsWith(to);

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <SafeBoxLogo inverted />
          <div className="text-right">
            <p className="text-xs text-primary-foreground/70">Agent</p>
            <p className="text-sm font-semibold">{currentAgent.name.split(" ")[0]}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5 pb-28">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t shadow-lg">
        <div className="mx-auto max-w-2xl grid grid-cols-5">
          {tabs.map((t) => {
            const active = isActive(t.to, t.exact);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${active ? "bg-primary/10" : ""}`}>
                  <t.icon className="h-5 w-5" />
                </div>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
