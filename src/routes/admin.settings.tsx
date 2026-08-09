import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3 sm:items-center">
      <Label className="text-sm">{label}</Label>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure platform fees, transaction limits, SMS, and team access.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Platform Settings">
          <Field label="Deposit fee (%)"><Input defaultValue="0.5" /></Field>
          <Field label="Withdrawal fee (%)"><Input defaultValue="0.75" /></Field>
          <Field label="Agent commission per txn (₦)"><Input defaultValue="10" /></Field>
          <Field label="Yield calculation"><select className="border rounded-md px-3 py-2 text-sm w-full"><option>Daily</option><option>Weekly</option><option>Monthly</option></select></Field>
        </Section>

        <Section title="Transaction Limits">
          <Field label="Daily deposit limit (₦)"><Input defaultValue="100,000" /></Field>
          <Field label="Daily withdrawal limit (₦)"><Input defaultValue="100,000" /></Field>
          <Field label="Weekly withdrawal limit (₦)"><Input defaultValue="500,000" /></Field>
          <Field label="Agent cash-out limit (₦)"><Input defaultValue="1,200,000" /></Field>
        </Section>

        <Section title="SMS Gateway">
          <Field label="Provider"><Input defaultValue="SafeBox SMS Hub" /></Field>
          <Field label="API key"><Input defaultValue="sk_••••••••••••" type="password" /></Field>
          <Field label="Balance"><p className="text-sm font-semibold">₦128,400 • ~21,400 SMS</p></Field>
          <Button variant="outline" className="w-fit">Send test SMS</Button>
        </Section>

        <Section title="Notification Templates">
          <Field label="Deposit"><Input defaultValue="You saved ₦{amount}. New balance: ₦{balance}." /></Field>
          <Field label="Withdrawal"><Input defaultValue="You withdrew ₦{amount}. New balance: ₦{balance}." /></Field>
          <Field label="Interest credit"><Input defaultValue="Interest credited: ₦{amount}. Balance: ₦{balance}." /></Field>
          <div className="flex items-center justify-between"><span className="text-sm">SMS on every transaction</span><Switch defaultChecked /></div>
        </Section>

        <Section title="Admin Users">
          <div className="divide-y">
            {[
              { n: "Operations Team", r: "Super Admin" },
              { n: "Adaeze Okolo", r: "Compliance Officer" },
              { n: "Tunde Bello", r: "Operations" },
            ].map((u) => (
              <div key={u.n} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">{u.n}</p>
                  <p className="text-xs text-muted-foreground">{u.r}</p>
                </div>
                <Button size="sm" variant="ghost">Edit</Button>
              </div>
            ))}
          </div>
          <Button className="bg-primary hover:bg-primary/90">Invite team member</Button>
        </Section>
      </div>
    </div>
  );
}
