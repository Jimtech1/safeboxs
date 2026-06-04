import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { getCurrentTrader, updateTrader, type Trader } from "@/lib/mockTraderData";
import { toast } from "sonner";

export const Route = createFileRoute("/trader/profile")({
  component: TraderProfile,
});

function TraderProfile() {
  const [trader, setTrader] = useState<Trader | null>(null);
  useEffect(() => {
    const t = getCurrentTrader();
    setTrader(t);
  }, []);

  if (!trader) return null;

  const save = (patch: Partial<Trader>) => {
    updateTrader(patch);
    setTrader({ ...trader, ...patch });
    toast.success("Saved");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal info, bank account, security, and agent.</p>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="bank">Bank</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="agent">Agent</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                {trader.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
              </div>
              <Button variant="outline" onClick={() => toast.info("Photo upload is mocked.")}>Upload photo</Button>
            </div>
            <div>
              <Label>Full name</Label>
              <Input className="mt-1" defaultValue={trader.name} onBlur={(e) => save({ name: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input className="mt-1" value={trader.phone} readOnly />
            </div>
            <div>
              <Label>Email</Label>
              <Input className="mt-1" type="email" defaultValue={trader.email ?? ""} onBlur={(e) => save({ email: e.target.value })} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">Add a bank account to receive withdrawals via transfer.</p>
            <div>
              <Label>Bank name</Label>
              <Input className="mt-1" defaultValue={trader.bankAccount?.bankName ?? ""} placeholder="e.g. GTBank"
                onBlur={(e) => save({ bankAccount: { ...(trader.bankAccount ?? { accountNumber: "", accountName: "" }), bankName: e.target.value } })} />
            </div>
            <div>
              <Label>Account number</Label>
              <Input className="mt-1" inputMode="numeric" maxLength={10} defaultValue={trader.bankAccount?.accountNumber ?? ""}
                onBlur={(e) => save({ bankAccount: { ...(trader.bankAccount ?? { bankName: "", accountName: "" }), accountNumber: e.target.value } })} />
            </div>
            <div>
              <Label>Account name</Label>
              <Input className="mt-1" defaultValue={trader.bankAccount?.accountName ?? trader.name}
                onBlur={(e) => save({ bankAccount: { ...(trader.bankAccount ?? { bankName: "", accountNumber: "" }), accountName: e.target.value } })} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6 space-y-4">
            <div>
              <Label>Change PIN (4–6 digits)</Label>
              <div className="mt-1 flex gap-2">
                <Input type="password" inputMode="numeric" maxLength={6} placeholder="New PIN" id="newpin" />
                <Button onClick={() => {
                  const v = (document.getElementById("newpin") as HTMLInputElement).value;
                  if (v.length < 4 || v.length > 6) return toast.error("PIN must be 4–6 digits");
                  save({ pin: v });
                  (document.getElementById("newpin") as HTMLInputElement).value = "";
                }}>Update PIN</Button>
              </div>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <div><p className="font-medium">SMS alerts</p><p className="text-xs text-muted-foreground">Get an SMS for every transaction.</p></div>
              <Switch checked={trader.smsAlerts} onCheckedChange={(v) => save({ smsAlerts: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Email alerts</p><p className="text-xs text-muted-foreground">Get an email summary daily.</p></div>
              <Switch checked={trader.emailAlerts} onCheckedChange={(v) => save({ emailAlerts: v })} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="agent">
          <Card className="p-6 space-y-3">
            <p className="text-sm text-muted-foreground">Your assigned SafeBox agent</p>
            <Row label="Name" value={trader.agentName} />
            <Row label="Phone" value={trader.agentPhone} />
            <Row label="Location" value={trader.agentLocation} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
