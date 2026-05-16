import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, UserCog, ArrowLeftRight, Wallet, ShieldCheck, Settings, Bell, Search } from "lucide-react";
import { SafeBoxLogo } from "@/components/SafeBoxLogo";
import { Input } from "@/components/ui/input";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/traders", label: "Traders", icon: Users },
  { to: "/admin/agents", label: "Agents", icon: UserCog },
  { to: "/admin/float", label: "Float", icon: Wallet },
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
          v1.0 • CBN Compliant
        </div>
      </aside>

      {/* Top header */}
      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b bg-white px-4 py-3 md:px-8">
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9 bg-cream border-0" placeholder="Search traders, agents, transactions…" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative grid h-9 w-9 place-items-center rounded-full bg-cream hover:bg-secondary transition">
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

        <main className="p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-sidebar border-t border-white/10 z-40">
        <div className="grid grid-cols-7">
          {nav.map((n) => {
            const active = isActive(n.to, n.exact);
            return (
              <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-1 py-2 text-[10px] ${active ? "text-gold" : "text-sidebar-foreground/70"}`}>
                <n.icon className="h-5 w-5" />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
