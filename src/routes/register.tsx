import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, User, Briefcase, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: Register,
  head: () => ({ meta: [
    { title: "Open an Account — SafeBox" },
    { name: "description", content: "Open a SafeBox trader account or apply to become an agent." },
  ]}),
});

type Role = "trader" | "agent";

function Register() {
  const [role, setRole] = useState<Role>("trader");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-12 bg-hero-gradient">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold">Open Your SafeBox Account</h1>
            <p className="text-muted-foreground mt-2">Takes less than 3 minutes. CBN compliant.</p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button onClick={() => setRole("trader")} className={`rounded-xl border-2 p-4 text-left transition ${role === "trader" ? "border-primary bg-primary/5" : "bg-white hover:bg-cream"}`}>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><User /></div>
              <p className="mt-3 font-semibold">I'm a Trader</p>
              <p className="text-xs text-muted-foreground mt-1">Save daily, earn yield, withdraw anytime.</p>
            </button>
            <button onClick={() => setRole("agent")} className={`rounded-xl border-2 p-4 text-left transition ${role === "agent" ? "border-gold bg-gold/10" : "bg-white hover:bg-cream"}`}>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gold/15 text-gold-foreground"><Briefcase /></div>
              <p className="mt-3 font-semibold">I'm Becoming an Agent</p>
              <p className="text-xs text-muted-foreground mt-1">Earn commissions, serve your market.</p>
            </button>
          </div>

          <Card className="mt-6 p-6">
            {step === 1 && (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <h3 className="font-semibold">Personal details</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium">First name</label><Input className="mt-1.5" placeholder="Adebayo" required /></div>
                  <div><label className="text-sm font-medium">Last name</label><Input className="mt-1.5" placeholder="Ogunlesi" required /></div>
                </div>
                <div><label className="text-sm font-medium">Phone number</label><Input type="tel" className="mt-1.5" placeholder="0801 234 5678" required /></div>
                <div><label className="text-sm font-medium">BVN</label><Input className="mt-1.5" placeholder="22 digits" required /></div>
                <div><label className="text-sm font-medium">{role === "agent" ? "Market / business location" : "Market where you trade"}</label><Input className="mt-1.5" placeholder="Bodija Market, Ibadan" required /></div>
                <Button className="w-full h-11 bg-primary hover:bg-primary/90">Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </form>
            )}

            {step === 2 && (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(3); toast.success(role === "agent" ? "Application received. We'll call within 24h." : "Account created. Welcome to SafeBox!"); }}>
                <h3 className="font-semibold">Set your security</h3>
                <div><label className="text-sm font-medium">Create 4-digit PIN</label><Input type="password" className="mt-1.5" maxLength={4} placeholder="••••" required /></div>
                <div><label className="text-sm font-medium">Confirm PIN</label><Input type="password" className="mt-1.5" maxLength={4} placeholder="••••" required /></div>
                <label className="flex items-start gap-2 text-xs"><input type="checkbox" required className="mt-0.5" /> I agree to the SafeBox Terms and CBN agent banking guidelines.</label>
                <Button className="w-full h-11 bg-primary hover:bg-primary/90">{role === "agent" ? "Submit Application" : "Create Account"}</Button>
              </form>
            )}

            {step === 3 && (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success"><CheckCircle2 className="h-8 w-8" /></div>
                <h3 className="font-display text-2xl font-bold">{role === "agent" ? "Application Submitted" : "Account Created"}</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  {role === "agent"
                    ? "Our onboarding team will call you within 24 hours to verify documents and schedule training."
                    : "Visit any SafeBox agent in your market to start saving daily."}
                </p>
                <div className="flex gap-2 justify-center">
                  <Link to="/"><Button variant="outline">Back to home</Button></Link>
                  {role === "agent" && <Link to="/login"><Button className="bg-primary hover:bg-primary/90">Agent Login</Button></Link>}
                  {role !== "agent" && <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate({ to: "/for-traders" })}>Learn more</Button>}
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
