import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Home, ArrowLeftRight, Users, Users2, Settings as SettingsIcon } from "lucide-react";
import { SafeBoxLogo } from "@/components/SafeBoxLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DashboardFooter } from "@/components/DashboardFooter";
import { DashboardMobileNav } from "@/components/DashboardMobileNav";
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
    <div className="flex min-h-screen flex-col bg-cream">
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

      <nav aria-label="Agent navigation" className="hidden border-b bg-card md:block">
        <div className="mx-auto flex max-w-2xl items-center gap-1 px-4 py-2">
          {tabs.map((t) => (
            <Link key={t.to} to={t.to} aria-current={isActive(t.to, t.exact) ? "page" : undefined}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${isActive(t.to, t.exact) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <t.icon className="h-4 w-4" />{t.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5 pb-10">
        <Outlet />
      </main>
      <div className="pb-20 md:pb-0"><DashboardFooter /></div>

      <DashboardMobileNav items={tabs} path={path} label="Agent navigation" />
    </div>
  );
}
