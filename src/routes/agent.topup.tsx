import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, CheckCircle2, Wallet, Building2, Smartphone, CreditCard, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { currentAgent, myFloatTopUps, formatNaira } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/agent/topup")({
  component: TopUp,
});

const channels = [
  { id: "bank", label: "Bank Transfer", icon: Building2, desc: "Transfer to your float account" },
  { id: "ussd", label: "USSD", icon: Smartphone, desc: "*737# from any bank" },
  { id: "card", label: "Debit Card", icon: CreditCard, desc: "Pay with your debit card" },
] as const;

function TopUp() {
  const [step, setStep] = useState<1|2|3|4>(1);
  const [amount, setAmount] = useState("50000");
  const [channel, setChannel] = useState<typeof channels[number]["id"]>("bank");
  const navigate = useNavigate();
  const newBalance = currentAgent.floatBalance + Number(amount || 0);
  const ref = "NIBSS-" + Math.floor(Math.random() * 9000000 + 1000000);

  return (
    <div className="space-y-4">
      <Link to="/agent" className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Back</Link>
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/15 text-gold-foreground"><Plus /></div>
        <div>
          <h1 className="text-xl font-bold">Add Money to Float</h1>
          <p className="text-xs text-muted-foreground">Top up your dedicated float account</p>
        </div>
      </div>
      <Progress value={step * 25} />

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
          {step === 1 && (
            <Card className="p-5 space-y-4">
              <div className="rounded-xl bg-primary/5 p-4">
                <p className="text-xs text-muted-foreground">Current float balance</p>
                <p className="font-display text-2xl font-bold text-primary">{formatNaira(currentAgent.floatBalance)}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Capacity: {formatNaira(currentAgent.floatCapacity)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Amount to add</label>
                <Input className="mt-1.5 h-12 text-lg" placeholder="50,000" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {[25000, 50000, 100000, 200000].map((a) => (
                    <button key={a} onClick={() => setAmount(String(a))} className="rounded-full border px-3 py-1 text-xs hover:bg-cream">+ {formatNaira(a)}</button>
                  ))}
                </div>
              </div>
              <Button disabled={!amount || Number(amount) < 1000} className="w-full h-12 bg-primary hover:bg-primary/90" onClick={() => setStep(2)}>Continue</Button>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold">Choose payment channel</h3>
              <div className="space-y-2">
                {channels.map((c) => (
                  <button key={c.id} onClick={() => setChannel(c.id)} className={`w-full flex items-center gap-3 rounded-xl border-2 p-3 text-left transition ${channel === c.id ? "border-primary bg-primary/5" : "hover:bg-cream"}`}>
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-cream"><c.icon className="h-5 w-5 text-primary" /></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{c.label}</p>
                      <p className="text-xs text-muted-foreground">{c.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <Button className="w-full h-12 bg-primary hover:bg-primary/90" onClick={() => setStep(3)}>Continue</Button>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold">Confirm top-up</h3>
              <div className="rounded-xl bg-cream p-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-semibold">{formatNaira(Number(amount))}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Channel</span><span className="font-semibold">{channels.find(c => c.id === channel)?.label}</span></div>
                <hr />
                <div className="flex justify-between"><span className="text-muted-foreground">New float balance</span><span className="font-display text-lg font-bold text-primary">{formatNaira(newBalance)}</span></div>
              </div>
              <Button className="w-full h-12 bg-success hover:bg-success/90" onClick={() => { setStep(4); toast.success(`Float topped up by ${formatNaira(Number(amount))}.`); }}>Pay Now</Button>
            </Card>
          )}

          {step === 4 && (
            <Card className="p-6 text-center space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-10 w-10" />
              </motion.div>
              <div>
                <h3 className="font-display text-2xl font-bold">Float Top-Up Successful</h3>
                <p className="text-sm text-muted-foreground mt-1">Reference: {ref}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-success"><MessageSquare className="h-4 w-4" /> Confirmation SMS sent</div>
              <div className="rounded-lg bg-cream p-3">
                <p className="text-xs text-muted-foreground">New float balance</p>
                <p className="font-display text-xl font-bold text-primary">{formatNaira(newBalance)}</p>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => navigate({ to: "/agent" })}>Back to Home</Button>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {step === 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> Recent Float Top-ups</h3>
          </div>
          <div className="mt-3 divide-y">
            {myFloatTopUps.map((f) => (
              <div key={f.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium">+{formatNaira(f.amount)}</p>
                  <p className="text-[11px] text-muted-foreground">{f.channel} • {f.timestamp}</p>
                </div>
                <span className="text-[10px] font-medium text-success">{f.status}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
