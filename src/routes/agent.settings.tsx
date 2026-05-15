import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, BookOpen, MessageCircle, LogOut, KeyRound } from "lucide-react";
import { currentAgent } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/agent/settings")({
  component: AgentSettings,
});

function AgentSettings() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Settings</h1>

      <Card className="p-5">
        <h3 className="font-semibold">Profile</h3>
        <div className="mt-3 space-y-3">
          <div><Label className="text-xs">Name</Label><Input defaultValue={currentAgent.name} disabled /></div>
          <div><Label className="text-xs">Phone</Label><Input defaultValue="0801 234 5678" disabled /></div>
          <div><Label className="text-xs">Market</Label><Input defaultValue={currentAgent.market} disabled /></div>
          <p className="text-xs text-muted-foreground">Editable by admin only.</p>
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <Row icon={KeyRound} title="Change PIN" subtitle="Update your 4-digit access PIN" />
        <Row icon={Smartphone} title="Device registration" subtitle="This device is linked ✓" />
        <Row icon={BookOpen} title="Training materials" subtitle="Videos and SOPs" />
        <Row icon={MessageCircle} title="Help & support" subtitle="Talk to SafeBox support" />
      </Card>

      <Button variant="outline" className="w-full border-destructive text-destructive" onClick={() => { toast.success("Logged out"); navigate({ to: "/" }); }}>
        <LogOut className="h-4 w-4 mr-2" />Logout
      </Button>
    </div>
  );
}

function Row({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <button className="w-full flex items-center gap-3 py-2 text-left hover:bg-cream rounded-lg px-2 transition">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </button>
  );
}
