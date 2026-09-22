import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, UserCog, ArrowLeftRight, Wallet, ShieldCheck, Settings, Users2, Bell, Search, ArrowDownToLine, ArrowUpFromLine, Percent } from "lucide-react";
import { SafeBoxLogo } from "@/components/SafeBoxLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";
import { DashboardFooter } from "@/components/DashboardFooter";
import { DashboardMobileNav } from "@/components/DashboardMobileNav";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/traders", label: "Traders", icon: Users },
  { to: "/admin/agents", label: "Agents", icon: UserCog },
  { to: "/admin/deposits", label: "Deposits", icon: ArrowDownToLine },
  { to: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
  { to: "/admin/groups", label: "Groups", icon: Users2 },
  { to: "/admin/float", label: "Float", icon: Wallet },
  { to: "/admin/yield", label: "Yield", icon: Percent },
  { to: "/admin/transactions", label: "Txns", icon: ArrowLeftRight },
  { to: "/admin/compliance", label: "Compliance", icon: ShieldCheck },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];


export function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string, exact?: boolean) => exact ? path === to : path.startsWith(to);

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-sidebar text-sidebar-foreground">
        <div className="px-5 py-5 border-b border-white/10">
          <SafeBoxLogo inverted />
          <p className="mt-1 text-xs text-sidebar-foreground/60">Operations Console</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((n) => {
            const active = isActive(n.to, n.exact);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-gold text-gold-foreground" : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/10 text-xs text-sidebar-foreground/60">
          v1.0 • Funds held by Nombank MFB
        </div>
      </aside>

      {/* Top header */}
      <div className="flex min-h-screen flex-col md:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b bg-card px-4 py-3 md:px-8">
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9 bg-cream border-0" placeholder="Search traders, agents, transactions…" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button aria-label="Notifications" className="relative grid h-11 w-11 place-items-center rounded-full bg-cream hover:bg-secondary transition">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">OT</div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-semibold">Operations Team</p>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 pb-10 md:p-8">
          <Outlet />
        </main>
        <div className="pb-20 md:pb-0"><DashboardFooter /></div>
      </div>

      {/* Mobile bottom nav */}
      <DashboardMobileNav items={nav} path={path} label="Admin navigation" />
    </div>
  );
}
