import { createFileRoute } from "@tanstack/react-router";
import { AgentLayout } from "@/components/agent/AgentLayout";

export const Route = createFileRoute("/agent")({
  component: AgentLayout,
});
