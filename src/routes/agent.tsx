import { createFileRoute } from "@tanstack/react-router";
import { AgentLayout } from "@/components/agent/AgentLayout";

export const Route = createFileRoute("/agent")({
  head: () => ({ meta: [
    { title: "SafeBox Agent" },
    { name: "description", content: "Mobile agent app for daily collections, withdrawals and float." },
    { property: "og:title", content: "SafeBox Agent" },
    { property: "og:description", content: "Mobile agent app for daily collections, withdrawals and float." },
  ]}),
  component: AgentLayout,
});
