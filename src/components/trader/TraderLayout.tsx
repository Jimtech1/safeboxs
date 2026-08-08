import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, Receipt, ArrowUpFromLine, PiggyBank, User, LogOut, Bell, Percent, Users2, ShieldCheck } from "lucide-react";
import { SafeBoxLogo } from "@/components/SafeBoxLogo";
import { getCurrentTrader, logoutTrader, type Trader } from "@/lib/mockTraderData";
import { toast } from "sonner";

const nav = [
  { to: "/trader", label: "Dashboard", icon: Home, exact: true },
  { to: "/trader/savings", label: "Savings", icon: PiggyBank },
  { to: "/trader/groups", label: "Contribution", icon: Users2 },
  { to: "/trader/transactions", label: "Transactions", icon: Receipt },
  { to: "/trader/trust", label: "Trust", icon: ShieldCheck },
  { to: "/trader/interest", label: "Interest", icon: Percent },
  { to: "/trader/withdraw", label: "Withdraw", icon: ArrowUpFromLine },
  { to: "/trader/profile", label: "Profile", icon: User },
];



export function TraderLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [trader, setTrader] = useState<Trader | null>(null);

  useEffect(() => {
    const t = getCurrentTrader();
    if (!t) {
      navigate({ to: "/trader/login" });
      return;
    }
    setTrader(t);
    const onChange = () => setTrader(getCurrentTrader());
    window.addEventListener("trader-store-change", onChange);
    return () => window.removeEventListener("trader-store-change", onChange);
  }, [navigate]);

  if (!trader) return null;

  const isActive = (to: string, exact?: boolean) => exact ? path === to : path.startsWith(to);

  const handleLogout = () => {
    logoutTrader();
    toast.success("Logged out");
    navigate({ to: "/trader/login" });
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-sidebar text-sidebar-foreground">
        <div className="px-5 py-5 border-b border-white/10">
          <SafeBoxLogo inverted />
          <p className="mt-1 text-xs text-sidebar-foreground/60">Trader Dashboard</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((n) => {
            const active = isActive(n.to, n.exact);
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-gold text-gold-foreground" : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white"
              }`}>
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={handleLogout} className="mx-3 mb-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-white/5 hover:text-white">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b bg-white px-4 py-3 md:px-8">
          <div>
            <p className="text-sm font-semibold leading-tight">Welcome back, {trader.name.split(" ")[0]}</p>
            <p className="text-xs text-muted-foreground">Last active: {new Date(trader.lastActive).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative grid h-9 w-9 place-items-center rounded-full bg-cream hover:bg-secondary">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
              {trader.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-sidebar border-t border-white/10 z-40">
        <div className="grid grid-cols-5 overflow-x-auto">
          {nav.map((n) => {
            const active = isActive(n.to, n.exact);
            return (
              <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-1 py-2 px-1 text-[10px] ${active ? "text-gold" : "text-sidebar-foreground/70"}`}>
                <n.icon className="h-5 w-5" />
                <span className="truncate w-full text-center">{n.label}</span>
              </Link>
            );
          })}
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 py-2 px-1 text-[10px] text-sidebar-foreground/70">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
}
