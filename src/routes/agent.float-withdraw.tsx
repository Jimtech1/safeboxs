import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Minus, CheckCircle2, Building2, MessageSquare, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { formatNaira } from "@/lib/mockData";
import { agentStore, useAgentState } from "@/lib/agentStore";
import { toast } from "sonner";

export const Route = createFileRoute("/agent/float-withdraw")({
  head: () => ({ meta: [
    { title: "Withdraw Float | SafeBox Agent" },
    { name: "description", content: "Transfer your float balance to your linked bank account." },
    { property: "og:title", content: "Withdraw Float | SafeBox Agent" },
    { property: "og:description", content: "Transfer your float balance to your linked bank account." },
  ]}),
  component: FloatWithdraw,
});

function FloatWithdraw() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState("25000");
  const [bank] = useState({ name: "GTBank", account: "0123456789", holder: "Adebayo Ogunlesi" });
  const navigate = useNavigate();
  const s = useAgentState();
  const amt = Number(amount || 0);
  const exceeds = amt > s.floatBalance;
  const newBalance = s.floatBalance - amt;
  const ref = "NIBSS-" + Math.floor(Math.random() * 9000000 + 1000000);

  return (
    <div className="space-y-4">
      <Link to="/agent" className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Back</Link>
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-destructive/15 text-destructive"><Minus /></div>
        <div>
          <h1 className="text-xl font-bold">Withdraw From Float</h1>
          <p className="text-xs text-muted-foreground">Transfer to your linked bank account</p>
        </div>
      </div>
      <Progress value={step * 33} />

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
          {step === 1 && (
            <Card className="p-5 space-y-4">
              <div className="rounded-xl bg-primary/5 p-4">
                <p className="text-xs text-muted-foreground">Available float balance</p>
                <p className="font-display text-2xl font-bold text-primary">{formatNaira(s.floatBalance)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Amount to withdraw</label>
                <Input className="mt-1.5 h-12 text-lg" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {[10000, 25000, 50000, 100000].map((a) => (
                    <button key={a} onClick={() => setAmount(String(a))} className="rounded-full border px-3 py-1 text-xs hover:bg-cream">{formatNaira(a)}</button>
                  ))}
                </div>
              </div>
              {exceeds && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive p-3 text-sm">
                  <AlertTriangle className="h-4 w-4" /> Amount exceeds float balance.
                </div>
              )}
              <Button disabled={!amt || exceeds} className="w-full h-12 bg-primary hover:bg-primary/90" onClick={() => setStep(2)}>Continue</Button>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold">Confirm transfer to bank</h3>
              <div className="rounded-xl border p-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-cream"><Building2 className="h-5 w-5 text-primary" /></div>
                <div className="text-sm">
                  <p className="font-semibold">{bank.holder}</p>
                  <p className="text-xs text-muted-foreground">{bank.name} • {bank.account}</p>
                </div>
              </div>
              <div className="rounded-xl bg-cream p-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-semibold">{formatNaira(amt)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Fee</span><span className="font-semibold">Free</span></div>
                <hr />
                <div className="flex justify-between"><span className="text-muted-foreground">New float balance</span><span className="font-display text-lg font-bold text-primary">{formatNaira(newBalance)}</span></div>
              </div>
              <Button className="w-full h-12 bg-destructive hover:bg-destructive/90" onClick={() => { if (agentStore.withdrawFloat(amt)) { setStep(3); toast.success(`${formatNaira(amt)} sent to ${bank.name} ${bank.account}.`); } }}>Send to Bank</Button>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-6 text-center space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-10 w-10" />
              </motion.div>
              <div>
                <h3 className="font-display text-2xl font-bold">Transfer Successful</h3>
                <p className="text-sm text-muted-foreground mt-1">Reference: {ref}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-success"><MessageSquare className="h-4 w-4" /> Bank credit alert sent</div>
              <div className="rounded-lg bg-cream p-3">
                <p className="text-xs text-muted-foreground">New float balance</p>
                <p className="font-display text-xl font-bold text-primary">{formatNaira(newBalance)}</p>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => navigate({ to: "/agent" })}>Back to Home</Button>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
