import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SafeBoxLogo } from "@/components/SafeBoxLogo";
import { loginTrader } from "@/lib/mockTraderData";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/trader/login")({
  component: TraderLogin,
});

function TraderLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("08012345678");
  const [pin, setPin] = useState("");
  const [remember, setRemember] = useState(true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = phone.replace(/^\+?234/, "0").replace(/\s+/g, "");
    const t = loginTrader(normalized, pin);
    if (!t) {
      toast.error("Invalid phone or PIN. Try 08012345678 / 1234");
      return;
    }
    toast.success(`Welcome back, ${t.name.split(" ")[0]}`);
    navigate({ to: "/trader" });
  };

  return (
    <div className="min-h-screen bg-cream grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-primary text-primary-foreground p-10">
        <SafeBoxLogo inverted />
        <div>
          <h1 className="text-4xl font-bold leading-tight">Track your savings. <span className="text-gold">Anytime.</span></h1>
          <p className="mt-4 text-primary-foreground/80 max-w-md">Log in to see your balance, view your full transaction history, and request withdrawals with one click.</p>
          <div className="mt-6 flex items-center gap-2 text-sm text-primary-foreground/80">
            <ShieldCheck className="h-4 w-4 text-gold" /> CBN compliant • Encrypted in transit
          </div>
        </div>
        <p className="text-xs text-primary-foreground/60">© SafeBox {new Date().getFullYear()}</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-md p-6 md:p-8">
          <div className="md:hidden mb-4"><SafeBoxLogo /></div>
          <h2 className="text-2xl font-bold">Trader Login</h2>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your SafeBox account</p>

          <Tabs defaultValue="pin" className="mt-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="pin">PIN</TabsTrigger>
              <TabsTrigger value="otp">OTP</TabsTrigger>
            </TabsList>
            <TabsContent value="pin">
              <form onSubmit={submit} className="space-y-4 mt-4">
                <div>
                  <Label>Phone number</Label>
                  <div className="mt-1 flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-sm">+234</span>
                    <Input className="rounded-l-none" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" />
                  </div>
                </div>
                <div>
                  <Label>PIN</Label>
                  <Input className="mt-1" type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter your 4-digit PIN" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
                  <button type="button" className="text-primary hover:underline" onClick={() => toast.info("Please contact your agent to reset your PIN.")}>Forgot PIN?</button>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Login</Button>
              </form>
            </TabsContent>
            <TabsContent value="otp">
              <form onSubmit={submit} className="space-y-4 mt-4">
                <div>
                  <Label>Phone number</Label>
                  <Input className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" />
                </div>
                <div>
                  <Label>One-time code</Label>
                  <Input className="mt-1" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Use 123456 for demo" />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Verify & Login</Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/contact" className="text-primary font-medium hover:underline">Contact your agent</Link>
          </p>
          <p className="mt-4 text-center text-[11px] text-muted-foreground bg-cream rounded-md py-2 px-3">
            <strong>Demo:</strong> phone <code>08012345678</code> · PIN <code>1234</code>
          </p>
        </Card>
      </div>
    </div>
  );
}
