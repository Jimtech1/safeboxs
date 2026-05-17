import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowDownToLine, CheckCircle2, MessageSquare, Delete } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { traders, formatNaira } from "@/lib/mockData";
import { agentStore } from "@/lib/agentStore";
import { toast } from "sonner";

export const Route = createFileRoute("/agent/deposit")({
  component: DepositFlow,
});

function NumPad({ onPress, onBack }: { onPress: (s: string) => void; onBack: () => void }) {
  const keys = ["1","2","3","4","5","6","7","8","9","00","0","del"];
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((k) => (
        <button
          key={k}
          onClick={() => k === "del" ? onBack() : onPress(k)}
          className="rounded-xl bg-white border-2 border-border py-4 text-xl font-semibold hover:bg-cream active:scale-95 transition"
        >
          {k === "del" ? <Delete className="h-5 w-5 mx-auto" /> : k}
        </button>
      ))}
    </div>
  );
}

function DepositFlow() {
  const [step, setStep] = useState<1|2|3|4>(1);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();

  const trader = traders.find((t) => t.phone === phone) ?? traders[0];
  const newBalance = trader.balance + Number(amount || 0);

  const reset = () => { setStep(1); setPhone(""); setAmount(""); };

  return (
    <div className="space-y-4">
      <Link to="/agent" className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Back</Link>
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success"><ArrowDownToLine /></div>
        <div>
          <h1 className="text-xl font-bold">Deposit</h1>
          <p className="text-xs text-muted-foreground">Step {step} of 4</p>
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div className="h-full bg-success" animate={{ width: `${step*25}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          {step === 1 && (
            <Card className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium">Trader phone number</label>
                <Input className="mt-1.5 h-12 text-lg" placeholder="0801 234 5678" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">Recent traders</p>
                <div className="space-y-2">
                  {traders.slice(0, 4).map((t) => (
                    <button key={t.id} onClick={() => setPhone(t.phone)} className={`w-full flex items-center justify-between rounded-lg border p-3 text-left hover:bg-cream transition ${phone === t.phone ? "border-primary bg-primary/5" : ""}`}>
                      <div>
                        <p className="font-medium text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.phone}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{t.lastTxn}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Button disabled={!phone} className="w-full h-12 bg-primary hover:bg-primary/90" onClick={() => setStep(2)}>Next</Button>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Trader</p>
                <p className="font-semibold">{trader.name}</p>
              </div>
              <div className="rounded-2xl bg-cream p-6 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Amount</p>
                <p className="font-display text-4xl font-bold mt-1">{formatNaira(Number(amount || 0))}</p>
              </div>
              <NumPad onPress={(k) => setAmount(amount + k)} onBack={() => setAmount(amount.slice(0, -1))} />
              <Button disabled={!amount || Number(amount) <= 0} className="w-full h-12 bg-success hover:bg-success/90" onClick={() => setStep(3)}>Confirm Deposit</Button>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold">Confirm transaction</h3>
              <div className="rounded-xl border bg-cream/50 p-4 space-y-3">
                <Row label="Trader" value={trader.name} />
                <Row label="Phone" value={trader.phone} />
                <Row label="Type" value="Deposit" />
                <Row label="Amount" value={formatNaira(Number(amount))} bold />
                <Row label="New balance" value={formatNaira(newBalance)} bold />
              </div>
              <Button className="w-full h-12 bg-success hover:bg-success/90" onClick={() => { agentStore.recordDeposit(Number(amount)); setStep(4); toast.success(`Deposit of ${formatNaira(Number(amount))} processed. SMS sent to trader.`); }}>
                Process Deposit
              </Button>
            </Card>
          )}

          {step === 4 && (
            <Card className="p-6 text-center space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-10 w-10" />
              </motion.div>
              <div>
                <h3 className="font-display text-2xl font-bold">Deposit Successful</h3>
                <p className="text-sm text-muted-foreground mt-1">{formatNaira(Number(amount))} saved for {trader.name}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-success">
                <MessageSquare className="h-4 w-4" /> SMS receipt sent
              </div>
              <div className="rounded-lg bg-cream p-3">
                <p className="text-xs text-muted-foreground">New balance</p>
                <p className="font-display text-xl font-bold text-primary">{formatNaira(newBalance)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={reset}>New Deposit</Button>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate({ to: "/agent" })}>Home</Button>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}
