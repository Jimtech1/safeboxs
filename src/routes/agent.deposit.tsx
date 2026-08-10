import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowDownToLine, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { traders, formatNaira } from "@/lib/mockData";
import { agentStore, useAgentState } from "@/lib/agentStore";
import { toast } from "sonner";
import { NumPad } from "@/components/agent/NumPad";
import { TxnReceipt, type TxnReceiptData } from "@/components/agent/TxnReceipt";

export const Route = createFileRoute("/agent/deposit")({
  head: () => ({ meta: [
    { title: "Record Deposit | SafeBox Agent" },
    { name: "description", content: "Collect a trader's daily savings and credit their account instantly." },
    { property: "og:title", content: "Record Deposit | SafeBox Agent" },
    { property: "og:description", content: "Collect a trader's daily savings and credit their account instantly." },
  ]}),
  component: DepositFlow,
});


function DepositFlow() {
  const [step, setStep] = useState<1|2|3|4>(1);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [receipt, setReceipt] = useState<TxnReceiptData | null>(null);
  const navigate = useNavigate();
  const agentState = useAgentState();

  const trader = traders.find((t) => t.phone === phone) ?? traders[0];
  const amt = Number(amount || 0);
  const newBalance = trader.balance + amt;
  const exceedsFloat = amt > agentState.floatBalance;

  const reset = () => { setStep(1); setPhone(""); setAmount(""); setReceipt(null); };

  const process = () => {
    const res = agentStore.recordDeposit(amt, { name: trader.name, phone: trader.phone });
    if ("error" in res) { toast.error(res.error); return; }
    setReceipt({
      txnId: `TX-${Date.now().toString().slice(-7)}`,
      kind: "Deposit",
      traderName: trader.name,
      traderPhone: trader.phone,
      amount: amt,
      fee: 10,
      floatAfter: res.floatBalance,
      timestamp: new Date().toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }),
    });
    setStep(4);
    toast.success(`SafeBox SMS: ${trader.name.split(" ")[0]}, you saved ${formatNaira(amt)}. New balance: ${formatNaira(newBalance)}.`, { duration: 7000 });
  };

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
                <p className="font-display text-4xl font-bold mt-1">{formatNaira(amt)}</p>
              </div>
              {exceedsFloat && amt > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 text-destructive p-3 text-sm">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p>Insufficient float — you need {formatNaira(amt - agentState.floatBalance)} more.</p>
                    <Link to="/agent/topup" className="underline font-medium">Top up float</Link>
                  </div>
                </div>
              )}
              <NumPad onPress={(k) => setAmount(amount + k)} onBack={() => setAmount(amount.slice(0, -1))} />
              <Button disabled={!amount || amt <= 0 || exceedsFloat} className="w-full h-12 bg-success hover:bg-success/90" onClick={() => setStep(3)}>Confirm Deposit</Button>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold">Confirm transaction</h3>
              <div className="rounded-xl border bg-cream/50 p-4 space-y-3">
                <Row label="Trader" value={trader.name} />
                <Row label="Phone" value={trader.phone} />
                <Row label="Type" value="Deposit" />
                <Row label="Amount" value={formatNaira(amt)} bold />
                <Row label="New balance" value={formatNaira(newBalance)} bold />
              </div>
              {exceedsFloat && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 text-destructive p-3 text-sm">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p>Insufficient float — you need {formatNaira(amt - agentState.floatBalance)} more.</p>
                    <Link to="/agent/topup" className="underline font-medium">Top up float</Link>
                  </div>
                </div>
              )}
              <Button disabled={exceedsFloat} className="w-full h-12 bg-success hover:bg-success/90" onClick={process}>
                Process Deposit
              </Button>
            </Card>
          )}

          {step === 4 && receipt && (
            <div className="space-y-4">
              <Card className="p-6 text-center space-y-4 print:hidden">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success">
                  <CheckCircle2 className="h-10 w-10" />
                </motion.div>
                <div>
                  <h3 className="font-display text-2xl font-bold">Deposit Successful</h3>
                  <p className="text-sm text-muted-foreground mt-1">{formatNaira(amt)} saved for {trader.name}</p>
                </div>
              </Card>
              <TxnReceipt data={receipt} />
              <div className="grid grid-cols-2 gap-2 print:hidden">
                <Button variant="outline" onClick={reset}>New Deposit</Button>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate({ to: "/agent" })}>Home</Button>
              </div>
            </div>
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
