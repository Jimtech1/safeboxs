import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { platformStore, useSettings, usePlatform, type AdminUser } from "@/lib/platformStore";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [
    { title: "Settings | SafeBox Admin" },
    { name: "description", content: "Configure fees, transaction limits, SMS and team access." },
    { property: "og:title", content: "Settings | SafeBox Admin" },
    { property: "og:description", content: "Configure fees, transaction limits, SMS and team access." },
  ]}),
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

const TEMPLATES_KEY = "safebox.admin.templates";
type Templates = { deposit: string; withdrawal: string; interest: string };
const defaultTemplates: Templates = {
  deposit: "You saved ₦{amount}. New balance: ₦{balance}.",
  withdrawal: "You withdrew ₦{amount}. New balance: ₦{balance}.",
  interest: "Interest credited: ₦{amount}. Balance: ₦{balance}.",
};

function loadTemplates(): Templates {
  if (typeof window === "undefined") return defaultTemplates;
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    return raw ? { ...defaultTemplates, ...JSON.parse(raw) } : defaultTemplates;
  } catch {
    return defaultTemplates;
  }
}

function SettingsPage() {
  usePlatform();
  const settings = useSettings();

  // Local editable copies (numbers as strings for input UX)
  const [depositFee, setDepositFee] = useState(String(settings.depositFee));
  const [withdrawalFee, setWithdrawalFee] = useState(String(settings.withdrawalFee));
  const [agentDepositShare, setAgentDepositShare] = useState(String(settings.agentDepositShare));
  const [agentWithdrawalShare, setAgentWithdrawalShare] = useState(String(settings.agentWithdrawalShare));
  const [dailyWithdrawalLimit, setDailyWithdrawalLimit] = useState(String(settings.dailyWithdrawalLimit));
  const [lowFloatThreshold, setLowFloatThreshold] = useState(String(settings.lowFloatThreshold));
  const [yieldAnnualRate, setYieldAnnualRate] = useState(String(settings.yieldAnnualRate));
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [templates, setTemplates] = useState<Templates>(loadTemplates);
  useEffect(() => {
    try { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates)); } catch { /* quota */ }
  }, [templates]);

  const [testPhone, setTestPhone] = useState("");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminUser["role"]>("Operations");

  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<AdminUser["role"]>("Operations");

  const [removeTarget, setRemoveTarget] = useState<AdminUser | null>(null);

  const asNumber = (v: string) => {
    const n = Number(v.replace(/,/g, ""));
    return Number.isFinite(n) ? n : NaN;
  };

  const saveNumberField = (key: string, value: string, patch: (n: number) => void, min = 0) => {
    const n = asNumber(value);
    if (Number.isNaN(n) || n < min) {
      setErrors((e) => ({ ...e, [key]: "Enter a valid non-negative number" }));
      toast.error("Enter a valid non-negative number");
      return;
    }
    setErrors((e) => { const next = { ...e }; delete next[key]; return next; });
    patch(n);
    toast.success("Setting saved");
  };

  const admins = usePlatform().admins;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure platform fees, transaction limits, SMS, and team access.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Platform Settings">
          <Field label="Deposit fee (₦, gross)">
            <Input value={depositFee} onChange={(e) => setDepositFee(e.target.value)}
              onBlur={() => saveNumberField("depositFee", depositFee, (n) => platformStore.saveSettings({ depositFee: n }))} />
            {errors.depositFee && <p className="text-xs text-destructive mt-1">{errors.depositFee}</p>}
          </Field>
          <Field label="Withdrawal fee (₦, gross)">
            <Input value={withdrawalFee} onChange={(e) => setWithdrawalFee(e.target.value)}
              onBlur={() => saveNumberField("withdrawalFee", withdrawalFee, (n) => platformStore.saveSettings({ withdrawalFee: n }))} />
          </Field>
          <Field label="Agent deposit share (₦)">
            <Input value={agentDepositShare} onChange={(e) => setAgentDepositShare(e.target.value)}
              onBlur={() => saveNumberField("agentDepositShare", agentDepositShare, (n) => platformStore.saveSettings({ agentDepositShare: n }))} />
          </Field>
          <Field label="Agent withdrawal share (₦)">
            <Input value={agentWithdrawalShare} onChange={(e) => setAgentWithdrawalShare(e.target.value)}
              onBlur={() => saveNumberField("agentWithdrawalShare", agentWithdrawalShare, (n) => platformStore.saveSettings({ agentWithdrawalShare: n }))} />
          </Field>
          <Field label="Yield rate (% p.a.)">
            <Input value={yieldAnnualRate} onChange={(e) => setYieldAnnualRate(e.target.value)}
              onBlur={() => saveNumberField("yieldAnnualRate", yieldAnnualRate, (n) => platformStore.saveSettings({ yieldAnnualRate: n }))} />
          </Field>
        </Section>

        <Section title="Transaction Limits">
          <Field label="Daily withdrawal limit (₦)">
            <Input value={dailyWithdrawalLimit} onChange={(e) => setDailyWithdrawalLimit(e.target.value)}
              onBlur={() => saveNumberField("dailyWithdrawalLimit", dailyWithdrawalLimit, (n) => platformStore.saveSettings({ dailyWithdrawalLimit: n }))} />
          </Field>
          <Field label="Low float threshold (₦)">
            <Input value={lowFloatThreshold} onChange={(e) => setLowFloatThreshold(e.target.value)}
              onBlur={() => saveNumberField("lowFloatThreshold", lowFloatThreshold, (n) => platformStore.saveSettings({ lowFloatThreshold: n }))} />
          </Field>
          <Field label="Support email">
            <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)}
              onBlur={() => { platformStore.saveSettings({ supportEmail }); toast.success("Setting saved"); }} />
          </Field>
          <Field label="Support phone">
            <Input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)}
              onBlur={() => { platformStore.saveSettings({ supportPhone }); toast.success("Setting saved"); }} />
          </Field>
        </Section>

        <Section title="SMS Gateway">
          <div className="flex items-center justify-between">
            <span className="text-sm">SMS alerts enabled</span>
            <Switch checked={settings.smsAlerts} onCheckedChange={(v) => { platformStore.saveSettings({ smsAlerts: v }); toast.success(v ? "SMS alerts enabled" : "SMS alerts disabled"); }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">OTP required for withdrawals</span>
            <Switch checked={settings.otpRequired} onCheckedChange={(v) => { platformStore.saveSettings({ otpRequired: v }); toast.success("Setting saved"); }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Biometric login (select markets)</span>
            <Switch checked={settings.biometricMarkets} onCheckedChange={(v) => { platformStore.saveSettings({ biometricMarkets: v }); toast.success("Setting saved"); }} />
          </div>
          <Field label="Send test SMS">
            <div className="flex gap-2">
              <Input placeholder="08012345678" value={testPhone} onChange={(e) => setTestPhone(e.target.value)} />
              <Button variant="outline" onClick={() => {
                const res = platformStore.sendTestSms(testPhone);
                if ("error" in res) toast.error(res.error);
                else { toast.success(`Test SMS sent to ${res.phone}`); setTestPhone(""); }
              }}>Send</Button>
            </div>
          </Field>
        </Section>

        <Section title="Notification Templates">
          <Field label="Deposit">
            <Input value={templates.deposit} onChange={(e) => setTemplates((t) => ({ ...t, deposit: e.target.value }))}
              onBlur={() => toast.success("Template saved")} />
          </Field>
          <Field label="Withdrawal">
            <Input value={templates.withdrawal} onChange={(e) => setTemplates((t) => ({ ...t, withdrawal: e.target.value }))}
              onBlur={() => toast.success("Template saved")} />
          </Field>
          <Field label="Interest credit">
            <Input value={templates.interest} onChange={(e) => setTemplates((t) => ({ ...t, interest: e.target.value }))}
              onBlur={() => toast.success("Template saved")} />
          </Field>
        </Section>

        <Section title="Admin Users">
          <div className="divide-y">
            {admins.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3 gap-2 flex-wrap">
                <div>
                  <p className="font-medium text-sm flex items-center gap-2">
                    {u.name}
                    <Badge variant="outline" className={u.status === "Active" ? "border-success text-success" : u.status === "Invited" ? "border-warning text-warning" : "border-destructive text-destructive"}>
                      {u.status}
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground">{u.role} • {u.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => {
                    setEditAdmin(u); setEditName(u.name); setEditEmail(u.email); setEditRole(u.role);
                  }}>Edit</Button>
                  {u.status === "Disabled" ? (
                    <Button size="sm" variant="outline" onClick={() => { platformStore.setAdminStatus(u.id, "Active"); toast.success(`${u.name} enabled`); }}>Enable</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => { platformStore.setAdminStatus(u.id, "Disabled"); toast.success(`${u.name} disabled`); }}>Disable</Button>
                  )}
                  <Button size="sm" variant="outline" className="border-destructive text-destructive" onClick={() => setRemoveTarget(u)}>Remove</Button>
                </div>
              </div>
            ))}
            {admins.length === 0 && <p className="py-3 text-sm text-muted-foreground">No team members yet.</p>}
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setInviteOpen(true)}>Invite team member</Button>
        </Section>
      </div>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite team member</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-sm">Full name</Label><Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} /></div>
            <div><Label className="text-sm">Work email</Label><Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} /></div>
            <div>
              <Label className="text-sm">Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AdminUser["role"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Super Admin", "Operations", "Compliance", "Finance", "Viewer"] as const).map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => {
              const res = platformStore.inviteAdmin({ name: inviteName, email: inviteEmail, role: inviteRole });
              if ("error" in res) return toast.error(res.error);
              toast.success(`Invited ${inviteName}`);
              setInviteOpen(false); setInviteName(""); setInviteEmail(""); setInviteRole("Operations");
            }}>Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit admin dialog */}
      <Dialog open={!!editAdmin} onOpenChange={(o) => !o && setEditAdmin(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit team member</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-sm">Full name</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
            <div><Label className="text-sm">Email</Label><Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} /></div>
            <div>
              <Label className="text-sm">Role</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as AdminUser["role"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Super Admin", "Operations", "Compliance", "Finance", "Viewer"] as const).map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => {
              if (!editAdmin) return;
              const res = platformStore.updateAdmin(editAdmin.id, { name: editName, email: editEmail, role: editRole });
              if ("error" in res) return toast.error(res.error);
              toast.success("Team member updated");
              setEditAdmin(null);
            }}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirm */}
      <AlertDialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removeTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This revokes their admin access immediately. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!removeTarget) return;
              platformStore.removeAdmin(removeTarget.id);
              toast.success("Team member removed");
              setRemoveTarget(null);
            }}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
