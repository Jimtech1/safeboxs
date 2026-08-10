import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Smartphone, BookOpen, MessageCircle, LogOut, KeyRound, Camera, CheckCircle2, PlayCircle,
} from "lucide-react";
import { markets } from "@/lib/mockData";
import { platformStore, useCurrentAgentRecord } from "@/lib/platformStore";
import { toast } from "sonner";

export const Route = createFileRoute("/agent/settings")({
  head: () => ({ meta: [
    { title: "Agent Settings | SafeBox" },
    { name: "description", content: "Profile, PIN, device registration, training and support." },
    { property: "og:title", content: "Agent Settings | SafeBox" },
    { property: "og:description", content: "Profile, PIN, device registration, training and support." },
  ]}),
  component: AgentSettings,
});

const DEVICE_KEY = "safebox.agent.device";
const TRAINING_KEY = "safebox.agent.training";

const trainingItems = [
  { id: "t1", title: "SafeBox Agent onboarding SOP", type: "PDF", duration: "8 min read" },
  { id: "t2", title: "How to collect a deposit", type: "Video", duration: "3 min" },
  { id: "t3", title: "Processing withdrawals safely (OTP)", type: "Video", duration: "4 min" },
  { id: "t4", title: "Float management & top-ups", type: "PDF", duration: "5 min read" },
  { id: "t5", title: "Handling group savings (Ajo/Esusu)", type: "Video", duration: "6 min" },
];

function loadCompleted(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(TRAINING_KEY) ?? "{}"); } catch { return {}; }
}

function deviceId() {
  if (typeof window === "undefined") return "DEVICE-0000";
  const ua = navigator.userAgent + navigator.language + screen.width + screen.height;
  let h = 0;
  for (let i = 0; i < ua.length; i++) { h = (h * 31 + ua.charCodeAt(i)) >>> 0; }
  return `DEV-${h.toString(16).toUpperCase().slice(0, 8)}`;
}

function AgentSettings() {
  const navigate = useNavigate();
  const agent = useCurrentAgentRecord();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: agent?.name ?? "",
    phone: agent?.phone ?? "",
    email: agent?.email ?? "",
    market: agent?.market ?? "",
    bankName: agent?.bank?.bankName ?? "",
    accountNumber: agent?.bank?.accountNumber ?? "",
    accountName: agent?.bank?.accountName ?? "",
  });

  const [pinOpen, setPinOpen] = useState(false);
  const [pinForm, setPinForm] = useState({ current: "", next: "", confirm: "" });
  const [trainingOpen, setTrainingOpen] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>(loadCompleted);
  const [supportOpen, setSupportOpen] = useState(false);
  const [support, setSupport] = useState({ subject: "", message: "" });
  const [registered, setRegistered] = useState(() => typeof window !== "undefined" && localStorage.getItem(DEVICE_KEY) === deviceId());

  const saveProfile = () => {
    const res = platformStore.updateAgentProfile({
      name: form.name,
      phone: form.phone,
      email: form.email,
      market: form.market,
      bank: { bankName: form.bankName, accountNumber: form.accountNumber, accountName: form.accountName },
    });
    if ("error" in res) { toast.error(res.error); return; }
    toast.success("Profile updated.");
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      const res = platformStore.updateAgentProfile({ photo: url });
      if ("error" in res) { toast.error(res.error); return; }
      toast.success("Profile photo updated.");
    };
    reader.readAsDataURL(file);
  };

  const submitPin = () => {
    if (pinForm.next !== pinForm.confirm) { toast.error("New PIN and confirmation do not match."); return; }
    const res = platformStore.changeAgentPin(pinForm.current, pinForm.next);
    if ("error" in res) { toast.error(res.error); return; }
    toast.success("PIN changed successfully.");
    setPinOpen(false);
    setPinForm({ current: "", next: "", confirm: "" });
  };

  const toggleDevice = () => {
    if (registered) {
      localStorage.removeItem(DEVICE_KEY);
      setRegistered(false);
      toast.success("Device unregistered.");
    } else {
      localStorage.setItem(DEVICE_KEY, deviceId());
      setRegistered(true);
      toast.success("This device is now registered.");
    }
  };

  const toggleTraining = (id: string) => {
    const next = { ...completed, [id]: !completed[id] };
    setCompleted(next);
    localStorage.setItem(TRAINING_KEY, JSON.stringify(next));
  };

  const completedCount = trainingItems.filter((t) => completed[t.id]).length;

  const submitSupport = () => {
    if (!support.subject.trim() || !support.message.trim()) {
      toast.error("Please fill in both subject and message.");
      return;
    }
    platformStore.logAction(`Support request: ${support.subject} — ${support.message}`, agent?.name);
    toast.success("Your message was sent to SafeBox support. We'll respond within 24 hours.");
    setSupportOpen(false);
    setSupport({ subject: "", message: "" });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Settings</h1>

      <Card className="p-5">
        <h3 className="font-semibold">Profile</h3>
        <div className="mt-3 flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={agent?.photo} alt={agent?.name} />
              <AvatarFallback>{agent?.name?.charAt(0) ?? "A"}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground"
              aria-label="Change photo"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          </div>
          <div>
            <p className="text-sm font-medium">{agent?.name}</p>
            <p className="text-xs text-muted-foreground">Agent ID: {agent?.id}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div><Label className="text-xs">Name</Label><Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label className="text-xs">Phone</Label><Input className="mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label className="text-xs">Email</Label><Input className="mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div>
            <Label className="text-xs">Market</Label>
            <select
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={form.market}
              onChange={(e) => setForm({ ...form, market: e.target.value })}
            >
              {markets.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-3 rounded-lg bg-cream p-3">
            <p className="text-xs font-semibold text-muted-foreground">Bank details</p>
            <div><Label className="text-xs">Bank name</Label><Input className="mt-1" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} /></div>
            <div><Label className="text-xs">Account number</Label><Input className="mt-1" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} /></div>
            <div><Label className="text-xs">Account name</Label><Input className="mt-1" value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} /></div>
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90" onClick={saveProfile}>Save changes</Button>
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <Row icon={KeyRound} title="Change PIN" subtitle="Update your 4-digit access PIN" onClick={() => setPinOpen(true)} />
        <Row
          icon={Smartphone}
          title="Device registration"
          subtitle={registered ? `This device is linked ✓ (${deviceId()})` : `Not registered (${deviceId()})`}
          onClick={toggleDevice}
          action={registered ? "Unregister" : "Register"}
        />
        <Row icon={BookOpen} title="Training materials" subtitle={`${completedCount}/${trainingItems.length} completed`} onClick={() => setTrainingOpen(true)} />
        <Row icon={MessageCircle} title="Help & support" subtitle="Talk to SafeBox support" onClick={() => setSupportOpen(true)} />
      </Card>

      <Button
        variant="outline"
        className="w-full border-destructive text-destructive"
        onClick={() => { platformStore.logoutAgent(); toast.success("Logged out"); navigate({ to: "/" }); }}
      >
        <LogOut className="h-4 w-4 mr-2" />Logout
      </Button>

      {/* Change PIN */}
      <Dialog open={pinOpen} onOpenChange={setPinOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change PIN</DialogTitle>
            <DialogDescription>Your PIN protects deposits, withdrawals and float transfers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Current PIN</Label><Input className="mt-1" type="password" inputMode="numeric" maxLength={6} value={pinForm.current} onChange={(e) => setPinForm({ ...pinForm, current: e.target.value.replace(/\D/g, "") })} /></div>
            <div><Label className="text-xs">New PIN</Label><Input className="mt-1" type="password" inputMode="numeric" maxLength={6} value={pinForm.next} onChange={(e) => setPinForm({ ...pinForm, next: e.target.value.replace(/\D/g, "") })} /></div>
            <div><Label className="text-xs">Confirm new PIN</Label><Input className="mt-1" type="password" inputMode="numeric" maxLength={6} value={pinForm.confirm} onChange={(e) => setPinForm({ ...pinForm, confirm: e.target.value.replace(/\D/g, "") })} /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPinOpen(false)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={submitPin}>Update PIN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Training materials */}
      <Dialog open={trainingOpen} onOpenChange={setTrainingOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Training materials</DialogTitle>
            <DialogDescription>SOPs and videos to help you serve traders well.</DialogDescription>
          </DialogHeader>
          <Progress value={(completedCount / trainingItems.length) * 100} />
          <div className="space-y-2">
            {trainingItems.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    {t.type === "Video" ? <PlayCircle className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.type} • {t.duration}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={completed[t.id] ? "outline" : "default"}
                  className={completed[t.id] ? "" : "bg-primary hover:bg-primary/90"}
                  onClick={() => toggleTraining(t.id)}
                >
                  {completed[t.id] ? <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-4 w-4" /> Done</span> : "Mark complete"}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Help & support */}
      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Help & support</DialogTitle>
            <DialogDescription>Send a message to the SafeBox support team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Subject</Label><Input className="mt-1" value={support.subject} onChange={(e) => setSupport({ ...support, subject: e.target.value })} placeholder="e.g. Float top-up delayed" /></div>
            <div><Label className="text-xs">Message</Label><Textarea className="mt-1" rows={4} value={support.message} onChange={(e) => setSupport({ ...support, message: e.target.value })} placeholder="Describe your issue..." /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSupportOpen(false)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={submitSupport}>Send message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ icon: Icon, title, subtitle, onClick, action }: { icon: any; title: string; subtitle: string; onClick?: () => void; action?: string }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-2 text-left hover:bg-cream rounded-lg px-2 transition">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary shrink-0"><Icon className="h-4 w-4" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      {action && <span className="text-xs font-semibold text-primary shrink-0">{action}</span>}
    </button>
  );
}
