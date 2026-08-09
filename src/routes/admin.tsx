import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "SafeBox Admin" },
    { name: "description", content: "Operations console for SafeBox agents, traders, float and settlements." },
    { property: "og:title", content: "SafeBox Admin" },
    { property: "og:description", content: "Operations console for SafeBox agents, traders, float and settlements." },
  ]}),
  component: AdminLayout,
});
