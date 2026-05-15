import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Banknote, CheckCircle2, Building2, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { currentAgent, formatNaira } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/agent/eod")({
  component: EOD,
});

function EOD() {
  const [step, setStep] = useState<1|2|3|4|5>(1);
  const [ref, setRef] = useState("");
  const navigate = useNavigate();
  const net = currentAgent.todayDeposits - currentAgent.todayWithdrawals;

  return (
    <div className="space-y-4">
      <Link to="/agent" className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Back</Link>
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/15 text-gold-foreground"><Banknote /></div>
        <div>
          <h1 className="text-xl font-bold">End of Day Settlement</h1>
          <p className="text-xs text-muted-foreground">Step {step} of 5</p>
        </div>
      </div>
      <Progress value={step * 20} />

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
          {step === 1 && (
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold">Initiate settlement</h3>
              <p className="text-sm text-muted-foreground">Reconcile today's deposits and withdrawals. Cash net of withdrawals goes to your principal account.</p>
              <Button className="w-full h-12 bg-primary hover:bg-primary/90" onClick={() => setStep(2)}>Start Settlement</Button>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold">Today's reconciliation</h3>
              <div className="rounded-xl bg-cream p-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total deposits</span><span className="font-semibold text-success">+{formatNaira(currentAgent.todayDeposits)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total withdrawals</span><span className="font-semibold text-destructive">−{formatNaira(currentAgent.todayWithdrawals)}</span></div>
                <hr />
                <div className="flex justify-between"><span className="font-medium">Net cash to deposit</span><span className="font-display text-xl font-bold">{formatNaira(net)}</span></div>
              </div>
              <div className="rounded-xl border-2 border-primary/20 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Building2 className="h-3 w-3" /> Principal account</div>
                <p className="font-semibold mt-1">Licensed MFB Alpha</p>
                <p className="font-mono text-sm text-primary">2034 567 890</p>
                <p className="text-xs text-muted-foreground">SafeBox Settlement Pool</p>
              </div>
              <Button className="w-full h-12 bg-primary hover:bg-primary/90" onClick={() => setStep(3)}>I'll deposit this cash</Button>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold">Confirm cash deposit</h3>
              <p className="text-sm text-muted-foreground">Once you've deposited {formatNaira(net)} to the principal account, confirm below.</p>
              <Button className="w-full h-12 bg-success hover:bg-success/90" onClick={() => setStep(4)}>I have made the deposit</Button>
            </Card>
          )}

          {step === 4 && (
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold">Enter reference number</h3>
              <Input className="h-12 text-lg" placeholder="e.g. NIBSS-9837421" value={ref} onChange={(e) => setRef(e.target.value)} />
              <Button disabled={ref.length < 5} className="w-full h-12 bg-primary hover:bg-primary/90" onClick={() => { setStep(5); toast.success(`Settlement complete. ${formatNaira(net)} reconciled.`); }}>Reconcile & Reset Float</Button>
            </Card>
          )}

          {step === 5 && (
            <Card className="p-6 text-center space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-10 w-10" />
              </motion.div>
              <div>
                <h3 className="font-display text-2xl font-bold">Settlement Complete</h3>
                <p className="text-sm text-muted-foreground mt-1">Reference: {ref}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-success"><MessageSquare className="h-4 w-4" /> Confirmation SMS sent</div>
              <div className="rounded-lg bg-cream p-3">
                <p className="text-xs text-muted-foreground">Float reset for tomorrow</p>
                <p className="font-display text-xl font-bold text-primary">₦0</p>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => navigate({ to: "/agent" })}>Back to Home</Button>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
