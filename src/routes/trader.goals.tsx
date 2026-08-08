import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy path — the Goals page is now the Savings page
export const Route = createFileRoute("/trader/goals")({
  beforeLoad: () => {
    throw redirect({ to: "/trader/savings" });
  },
});
