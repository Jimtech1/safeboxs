import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Home, ArrowLeftRight, Users, Users2, Settings as SettingsIcon } from "lucide-react";
import { SafeBoxLogo } from "@/components/SafeBoxLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { currentAgent } from "@/lib/mockData";

const tabs = [
  { to: "/agent", label: "Home", icon: Home, exact: true },
  { to: "/agent/transactions", label: "Txns", icon: ArrowLeftRight },
  { to: "/agent/groups", label: "Groups", icon: Users2 },
  { to: "/agent/traders", label: "Traders", icon: Users },
  { to: "/agent/settings", label: "Settings", icon: SettingsIcon },
];

export function AgentLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string, exact?: boolean) => exact ? path === to : path.startsWith(to);

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <Link to="/" aria-label="SafeBox home"><SafeBoxLogo inverted /></Link>
          <div className="flex items-center gap-2">
          <ThemeToggle inverted />
          <div className="text-right">
            <p className="text-xs text-primary-foreground/70">Agent</p>
            <p className="text-sm font-semibold">{currentAgent.name.split(" ")[0]}</p>
          </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5 pb-28">
        <Outlet />
      </main>

      <nav aria-label="Agent navigation" className="fixed bottom-0 inset-x-0 z-40 bg-card border-t shadow-lg">
        <div className="mx-auto max-w-2xl grid grid-cols-5">
          {tabs.map((t) => {
            const active = isActive(t.to, t.exact);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex min-w-0 flex-col items-center gap-0.5 px-0.5 py-2.5 text-[10px] leading-tight font-medium transition-colors sm:text-[11px] ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className={`grid h-8 w-8 place-items-center rounded-full transition-colors sm:h-9 sm:w-9 ${active ? "bg-primary/10" : ""}`}>
                  <t.icon className="h-5 w-5" />
                </div>
                <span className="w-full truncate text-center">{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
