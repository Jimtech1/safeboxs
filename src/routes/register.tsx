import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Briefcase, Store, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { signupTrader } from "@/lib/mockTraderData";

export const Route = createFileRoute("/register")({
  component: Register,
  head: () => ({ meta: [
    { title: "Create your SafeBox account" },
    { name: "description", content: "Sign up as a trader to save daily, or apply to become a SafeBox agent." },
  ]}),
});

function Register() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-12 bg-hero-gradient">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold">Create your SafeBox account</h1>
            <p className="text-muted-foreground mt-2">Save with a trusted agent, or start earning by becoming one.</p>
          </div>

          <Card className="mt-6 p-6">
            <Tabs defaultValue="trader">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="trader"><Store className="h-4 w-4 mr-2" /> I'm a Trader</TabsTrigger>
                <TabsTrigger value="agent"><Briefcase className="h-4 w-4 mr-2" /> I'm an Agent</TabsTrigger>
              </TabsList>
              <TabsContent value="trader"><TraderSignup /></TabsContent>
              <TabsContent value="agent"><AgentSignup /></TabsContent>
            </Tabs>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-semibold">Sign in</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TraderSignup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [market, setMarket] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== confirmPin) return toast.error("PINs do not match");
    const result = signupTrader({ name, phone, email: email || undefined, market, pin });
    if ("error" in result) return toast.error(result.error);
    toast.success(`Welcome, ${result.name.split(" ")[0]}! Your account is ready.`);
    setDone(true);
    setTimeout(() => navigate({ to: "/trader" }), 800);
  };

  if (done) {
    return (
      <div className="text-center space-y-4 py-6">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success"><CheckCircle2 className="h-8 w-8" /></div>
        <h3 className="font-display text-2xl font-bold">Account Created</h3>
        <p className="text-sm text-muted-foreground">Taking you to your trader dashboard…</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <div><Label>Full name</Label><Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Fatima Bello" required /></div>
      <div>
        <Label>Phone number</Label>
        <div className="mt-1 flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-sm">+234</span>
          <Input className="rounded-l-none" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" required />
        </div>
      </div>
      <div><Label>Email (optional)</Label><Input type="email" className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
      <div><Label>Market / shop location</Label><Input className="mt-1" value={market} onChange={(e) => setMarket(e.target.value)} placeholder="Bodija Market, Ibadan" required /></div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label>Create 4-digit PIN</Label><Input type="password" inputMode="numeric" className="mt-1" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" required /></div>
        <div><Label>Confirm PIN</Label><Input type="password" inputMode="numeric" className="mt-1" maxLength={6} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} placeholder="••••" required /></div>
      </div>
      <Button className="w-full h-11 bg-primary hover:bg-primary/90">Create Trader Account <ArrowRight className="ml-2 h-4 w-4" /></Button>
    </form>
  );
}

function AgentSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  return (
    <div className="mt-4">
      {step === 1 && (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>First name</Label><Input className="mt-1" placeholder="Adebayo" required /></div>
            <div><Label>Last name</Label><Input className="mt-1" placeholder="Ogunlesi" required /></div>
          </div>
          <div><Label>Phone number</Label><Input type="tel" className="mt-1" placeholder="0801 234 5678" required /></div>
          <div><Label>BVN</Label><Input className="mt-1" placeholder="11 digits" maxLength={11} required /></div>
          <div><Label>Market / business location</Label><Input className="mt-1" placeholder="Bodija Market, Ibadan" required /></div>
          <div><Label>Years trading at this market</Label><Input type="number" min={0} className="mt-1" placeholder="3" required /></div>
          <Button className="w-full h-11 bg-primary hover:bg-primary/90">Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </form>
      )}
      {step === 2 && (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(3); toast.success("Application received. We'll call within 24h."); }}>
          <div><Label>Create 4-digit PIN</Label><Input type="password" className="mt-1" maxLength={4} placeholder="••••" required /></div>
          <div><Label>Confirm PIN</Label><Input type="password" className="mt-1" maxLength={4} placeholder="••••" required /></div>
          <label className="flex items-start gap-2 text-xs"><input type="checkbox" required className="mt-0.5" /> I agree to the SafeBox Terms and our banking partner’s (Nombank MFB) agent banking terms.</label>
          <Button className="w-full h-11 bg-primary hover:bg-primary/90">Submit Application</Button>
        </form>
      )}
      {step === 3 && (
        <div className="text-center space-y-4 py-4">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success"><CheckCircle2 className="h-8 w-8" /></div>
          <h3 className="font-display text-2xl font-bold">Application Submitted</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Our onboarding team will call you within 24 hours to verify documents. Try the demo agent dashboard any time.
          </p>
          <div className="flex gap-2 justify-center">
            <Link to="/"><Button variant="outline">Back to home</Button></Link>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate({ to: "/agent" })}>Open Agent Demo</Button>
          </div>
        </div>
      )}
    </div>
  );
}
