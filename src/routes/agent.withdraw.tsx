import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpFromLine, CheckCircle2, MessageSquare, Delete, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { traders, formatNaira } from "@/lib/mockData";
import { agentStore } from "@/lib/agentStore";
import { toast } from "sonner";

export const Route = createFileRoute("/agent/withdraw")({
  component: WithdrawFlow,
});

const DAILY_LIMIT = 100000;

function NumPad({ onPress, onBack }: { onPress: (s: string) => void; onBack: () => void }) {
  const keys = ["1","2","3","4","5","6","7","8","9","00","0","del"];
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((k) => (
        <button key={k} onClick={() => k === "del" ? onBack() : onPress(k)} className="rounded-xl bg-white border-2 border-border py-4 text-xl font-semibold hover:bg-cream active:scale-95 transition">
          {k === "del" ? <Delete className="h-5 w-5 mx-auto" /> : k}
        </button>
      ))}
    </div>
  );
}

function genOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function WithdrawFlow() {
  const [step, setStep] = useState<1|2|3|4|5>(1);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const navigate = useNavigate();
  const trader = traders.find((t) => t.phone === phone) ?? traders[0];
  const amt = Number(amount || 0);
  const exceedsBalance = amt > trader.balance;
  const exceedsLimit = amt > DAILY_LIMIT;
  const newBalance = trader.balance - amt;
  const reset = () => { setStep(1); setPhone(""); setAmount(""); setOtp(""); setGeneratedOtp(""); setOtpInput(""); setOtpError(""); };

  // Generate OTP when entering step 3
  useEffect(() => {
    if (step === 3 && !generatedOtp) {
      const code = genOTP();
      setGeneratedOtp(code);
      toast.success(`SafeBox: OTP ${code} sent to ${trader.phone}. Expires in 5 min.`, { duration: 8000 });
    }
  }, [step, generatedOtp, trader.phone]);

  const verifyOtp = () => {
    if (otpInput === generatedOtp) {
      setOtp(otpInput);
      setOtpError("");
      setStep(4);
    } else {
      setOtpError("Invalid OTP. Please try again.");
    }
  };

  const resendOtp = () => {
    const code = genOTP();
    setGeneratedOtp(code);
    setOtpInput("");
    setOtpError("");
    toast.success(`New OTP ${code} sent to ${trader.phone}.`, { duration: 8000 });
  };

  return (
    <div className="space-y-4">
      <Link to="/agent" className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Back</Link>
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-destructive/15 text-destructive"><ArrowUpFromLine /></div>
        <div>
          <h1 className="text-xl font-bold">Withdrawal</h1>
          <p className="text-xs text-muted-foreground">Step {step} of 5</p>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div className="h-full bg-destructive" animate={{ width: `${step*20}%` }} />
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
                      <span className="text-xs font-semibold text-primary">{formatNaira(t.balance)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Button disabled={!phone} className="w-full h-12 bg-primary hover:bg-primary/90" onClick={() => setStep(2)}>Check Balance</Button>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-5 space-y-4">
              <div className="rounded-xl bg-primary text-primary-foreground p-4">
                <p className="text-xs text-primary-foreground/70">{trader.name}</p>
                <p className="text-xs text-primary-foreground/70 mt-3">Available balance</p>
                <p className="font-display text-3xl font-bold">{formatNaira(trader.balance)}</p>
              </div>
              <div className="rounded-2xl bg-cream p-6 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Withdraw amount</p>
                <p className="font-display text-4xl font-bold mt-1">{formatNaira(amt)}</p>
              </div>
              {(exceedsBalance || exceedsLimit) && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive p-3 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {exceedsBalance ? "Amount exceeds trader balance." : `Exceeds CBN daily limit of ${formatNaira(DAILY_LIMIT)}.`}
                </div>
              )}
              <NumPad onPress={(k) => setAmount(amount + k)} onBack={() => setAmount(amount.slice(0, -1))} />
              <Button disabled={!amt || exceedsBalance || exceedsLimit} className="w-full h-12 bg-destructive hover:bg-destructive/90" onClick={() => setStep(3)}>Send OTP to Trader</Button>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-5 space-y-4">
              <div className="grid h-12 w-12 mx-auto place-items-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="h-6 w-6" /></div>
              <div className="text-center">
                <h3 className="font-semibold">Verify trader OTP</h3>
                <p className="text-xs text-muted-foreground mt-1">A 6-digit code was sent via SMS to {trader.phone}.</p>
              </div>

              <div className="rounded-lg bg-cream p-3 text-center">
                <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Demo OTP (shown for testing)</p>
                <p className="font-mono text-lg font-bold tracking-widest text-primary">{generatedOtp}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Enter the 6-digit OTP from trader</label>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  className="mt-1.5 h-14 text-center text-2xl font-mono tracking-[0.6em]"
                  placeholder="------"
                  value={otpInput}
                  onChange={(e) => { setOtpInput(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
                />
                {otpError && <p className="mt-2 text-xs text-destructive">{otpError}</p>}
              </div>

              <div className="flex items-center justify-between">
                <button onClick={resendOtp} className="flex items-center gap-1.5 text-xs text-primary font-medium">
                  <RefreshCw className="h-3 w-3" /> Resend OTP
                </button>
                <p className="text-[11px] text-muted-foreground">Expires in 5 min</p>
              </div>

              <Button disabled={otpInput.length !== 6} className="w-full h-12 bg-primary hover:bg-primary/90" onClick={verifyOtp}>Verify OTP</Button>
            </Card>
          )}

          {step === 4 && (
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold">Confirm & disburse cash</h3>
              <div className="rounded-xl border bg-cream/50 p-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Trader</span><span className="font-medium">{trader.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold">{formatNaira(amt)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">OTP verified</span><span className="font-mono text-success">✓ {otp}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">New balance</span><span className="font-bold">{formatNaira(newBalance)}</span></div>
              </div>
              <p className="text-xs text-muted-foreground text-center">Disburse cash to trader before confirming. Your float will be refunded by the same amount.</p>
              <Button className="w-full h-12 bg-destructive hover:bg-destructive/90" onClick={() => { agentStore.recordWithdrawal(amt, { name: trader.name, phone: trader.phone }); setStep(5); toast.success(`SafeBox SMS: ${trader.name.split(" ")[0]}, ${formatNaira(amt)} withdrawn. New balance: ${formatNaira(newBalance)}.`, { duration: 7000 }); }}>
                Process Withdrawal
              </Button>
            </Card>
          )}

          {step === 5 && (
            <Card className="p-6 text-center space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-10 w-10" />
              </motion.div>
              <div>
                <h3 className="font-display text-2xl font-bold">Withdrawal Successful</h3>
                <p className="text-sm text-muted-foreground mt-1">{formatNaira(amt)} disbursed to {trader.name}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-success"><MessageSquare className="h-4 w-4" /> SMS receipt sent</div>
              <div className="rounded-lg bg-cream p-3">
                <p className="text-xs text-muted-foreground">Trader's new balance</p>
                <p className="font-display text-xl font-bold text-primary">{formatNaira(newBalance)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={reset}>New Withdrawal</Button>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate({ to: "/agent" })}>Home</Button>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
