import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, ShieldCheck, Store, Briefcase } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { loginTrader } from "@/lib/mockTraderData";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [
    { title: "Login — SafeBox" },
    { name: "description", content: "Sign in to your SafeBox account as a trader or agent." },
  ]}),
});

function Login() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  // Trader state
  const [tPhone, setTPhone] = useState("08012345678");
  const [tPin, setTPin] = useState("1234");

  // Agent state
  const [aId, setAId] = useState("AG-2000");
  const [aPin, setAPin] = useState("1234");

  const traderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = tPhone.replace(/^\+?234/, "0").replace(/\s+/g, "");
    const t = loginTrader(phone, tPin);
    if (!t) return toast.error("Invalid phone or PIN. Try 08012345678 / 1234");
    toast.success(`Welcome back, ${t.name.split(" ")[0]}`);
    navigate({ to: "/trader" });
  };

  const agentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aId || aPin.length < 4) return toast.error("Enter your Agent ID and PIN");
    toast.success("Welcome back, Adebayo");
    navigate({ to: "/agent" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12 bg-hero-gradient">
        <Card className="w-full max-w-md p-6 md:p-8">
          <div className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground"><ShieldCheck /></div>
            <h1 className="mt-4 font-display text-2xl font-bold">Sign in to SafeBox</h1>
            <p className="text-sm text-muted-foreground mt-1">Choose your account type to continue.</p>
          </div>

          <Tabs defaultValue="trader" className="mt-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="trader"><Store className="h-4 w-4 mr-2" /> Trader</TabsTrigger>
              <TabsTrigger value="agent"><Briefcase className="h-4 w-4 mr-2" /> Agent</TabsTrigger>
            </TabsList>

            <TabsContent value="trader">
              <form className="mt-4 space-y-4" onSubmit={traderSubmit}>
                <div>
                  <Label>Phone number</Label>
                  <div className="mt-1 flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-sm">+234</span>
                    <Input className="rounded-l-none h-11" value={tPhone} onChange={(e) => setTPhone(e.target.value)} placeholder="08012345678" />
                  </div>
                </div>
                <div>
                  <Label>PIN</Label>
                  <div className="relative">
                    <Input type={show ? "text" : "password"} className="mt-1 h-11 pr-10" inputMode="numeric" maxLength={6} value={tPin} onChange={(e) => setTPin(e.target.value)} placeholder="Enter your PIN" />
                    <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-muted-foreground">
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90">Sign in as Trader</Button>
                <p className="text-center text-[11px] text-muted-foreground bg-cream rounded-md py-2 px-3">
                  <strong>Demo:</strong> <code>08012345678</code> · PIN <code>1234</code>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="agent">
              <form className="mt-4 space-y-4" onSubmit={agentSubmit}>
                <div>
                  <Label>Phone or Agent ID</Label>
                  <Input className="mt-1 h-11" value={aId} onChange={(e) => setAId(e.target.value)} placeholder="AG-2000 or 0801…" />
                </div>
                <div>
                  <Label>PIN</Label>
                  <div className="relative">
                    <Input type={show ? "text" : "password"} className="mt-1 h-11 pr-10" maxLength={6} value={aPin} onChange={(e) => setAPin(e.target.value)} placeholder="••••" />
                    <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-muted-foreground">
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90">Sign in as Agent</Button>
                <p className="text-center text-[11px] text-muted-foreground bg-cream rounded-md py-2 px-3">
                  <strong>Demo:</strong> Agent ID <code>AG-2000</code> · PIN <code>1234</code>
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to SafeBox? <Link to="/register" className="text-primary font-semibold">Create an account</Link>
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
