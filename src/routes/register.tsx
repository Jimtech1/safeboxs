import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Briefcase, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: Register,
  head: () => ({ meta: [
    { title: "Become a SafeBox Agent — Open an Account" },
    { name: "description", content: "Apply to become a SafeBox agent. Earn commissions serving market traders." },
  ]}),
});

function Register() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-12 bg-hero-gradient">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gold/15 text-gold-foreground"><Briefcase className="h-7 w-7" /></div>
            <h1 className="mt-4 font-display text-3xl md:text-4xl font-bold">Become a SafeBox Agent</h1>
            <p className="text-muted-foreground mt-2">Earn commissions serving traders in your market. Takes less than 3 minutes. CBN compliant.</p>
          </div>

          <Card className="mt-6 p-6">
            {step === 1 && (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <h3 className="font-semibold">Personal & business details</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium">First name</label><Input className="mt-1.5" placeholder="Adebayo" required /></div>
                  <div><label className="text-sm font-medium">Last name</label><Input className="mt-1.5" placeholder="Ogunlesi" required /></div>
                </div>
                <div><label className="text-sm font-medium">Phone number</label><Input type="tel" className="mt-1.5" placeholder="0801 234 5678" required /></div>
                <div><label className="text-sm font-medium">BVN</label><Input className="mt-1.5" placeholder="22 digits" maxLength={22} required /></div>
                <div><label className="text-sm font-medium">Market / business location</label><Input className="mt-1.5" placeholder="Bodija Market, Ibadan" required /></div>
                <div><label className="text-sm font-medium">Years trading at this market</label><Input type="number" min={0} className="mt-1.5" placeholder="3" required /></div>
                <Button className="w-full h-11 bg-primary hover:bg-primary/90">Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </form>
            )}

            {step === 2 && (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(3); toast.success("Application received. We'll call within 24h."); }}>
                <h3 className="font-semibold">Set your security</h3>
                <div><label className="text-sm font-medium">Create 4-digit PIN</label><Input type="password" className="mt-1.5" maxLength={4} placeholder="••••" required /></div>
                <div><label className="text-sm font-medium">Confirm PIN</label><Input type="password" className="mt-1.5" maxLength={4} placeholder="••••" required /></div>
                <label className="flex items-start gap-2 text-xs"><input type="checkbox" required className="mt-0.5" /> I agree to the SafeBox Terms and CBN agent banking guidelines.</label>
                <Button className="w-full h-11 bg-primary hover:bg-primary/90">Submit Application</Button>
              </form>
            )}

            {step === 3 && (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success"><CheckCircle2 className="h-8 w-8" /></div>
                <h3 className="font-display text-2xl font-bold">Application Submitted</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Our onboarding team will call you within 24 hours to verify documents and schedule training. You can sign in with the demo credentials any time.
                </p>
                <div className="flex gap-2 justify-center">
                  <Link to="/"><Button variant="outline">Back to home</Button></Link>
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate({ to: "/login" })}>Agent Login</Button>
                </div>
              </div>
            )}
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already an agent? <Link to="/login" className="text-primary font-semibold">Sign in</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
