import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { TraderLayout } from "@/components/trader/TraderLayout";

export const Route = createFileRoute("/trader")({
  head: () => ({ meta: [
    { title: "SafeBox Trader" },
    { name: "description", content: "Your savings dashboard — balance, history, goals and withdrawals." },
    { property: "og:title", content: "SafeBox Trader" },
    { property: "og:description", content: "Your savings dashboard — balance, history, goals and withdrawals." },
  ]}),
  component: TraderShell,
});

function TraderShell() {
  // Login page has its own chrome — skip layout
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path === "/trader/login") return <Outlet />;
  return <TraderLayout />;
}
