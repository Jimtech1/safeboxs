import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/trader/login")({
  head: () => ({ meta: [
    { title: "Trader Login | SafeBox" },
    { name: "description", content: "Log in with your phone number and PIN to view your savings." },
    { property: "og:title", content: "Trader Login | SafeBox" },
    { property: "og:description", content: "Log in with your phone number and PIN to view your savings." },
  ]}),
  component: TraderLoginRedirect,
});

function TraderLoginRedirect() {
  const navigate = useNavigate();
  useEffect(() => { navigate({ to: "/login", replace: true }); }, [navigate]);
  return null;
}
