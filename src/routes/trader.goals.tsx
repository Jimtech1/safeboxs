import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy path — the Goals page is now the Savings page
export const Route = createFileRoute("/trader/goals")({
  head: () => ({ meta: [
    { title: "Savings Goals | SafeBox" },
    { name: "description", content: "Set and track savings goals across SafeBox products." },
    { property: "og:title", content: "Savings Goals | SafeBox" },
    { property: "og:description", content: "Set and track savings goals across SafeBox products." },
  ]}),
  beforeLoad: () => {
    throw redirect({ to: "/trader/savings" });
  },
});
