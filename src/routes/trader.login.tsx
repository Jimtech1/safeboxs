import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/trader/login")({
  component: TraderLoginRedirect,
});

function TraderLoginRedirect() {
  const navigate = useNavigate();
  useEffect(() => { navigate({ to: "/login", replace: true }); }, [navigate]);
  return null;
}
