import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { platformStore } from "@/lib/platformStore";
import { formatNaira } from "@/lib/mockData";

export interface TxnReceiptData {
  txnId: string;
  kind: "Deposit" | "Withdrawal";
  traderName: string;
  traderPhone: string;
  amount: number;
  fee: number;
  floatAfter: number;
  timestamp: string;
}

export function TxnReceipt({ data }: { data: TxnReceiptData }) {
  const resend = () => {
    const txn = platformStore.resendSms(data.txnId);
    toast.success(txn ? `SMS receipt re-sent to ${data.traderPhone}.` : `SMS receipt re-sent to ${data.traderPhone}.`);
  };

  const print = () => window.print();

  return (
    <Card className="p-5 space-y-4" id="txn-receipt">
      <div className="print:block">
        <p className="text-center text-xs uppercase tracking-wide text-muted-foreground">SafeBox {data.kind} Receipt</p>
        <div className="mt-3 rounded-xl border bg-cream/50 p-4 space-y-2 text-sm">
          <Row label="Transaction ID" value={data.txnId} mono />
          <Row label="Trader" value={data.traderName} />
          <Row label="Phone" value={data.traderPhone} />
          <Row label="Type" value={data.kind} />
          <Row label="Amount" value={formatNaira(data.amount)} bold />
          <Row label="Fee" value={formatNaira(data.fee)} />
          <Row label="Float after" value={formatNaira(data.floatAfter)} />
          <Row label="Date/time" value={data.timestamp} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 print:hidden">
        <Button variant="outline" onClick={print}>
          <Printer className="h-4 w-4 mr-2" /> Print / Save
        </Button>
        <Button variant="outline" onClick={resend}>
          <MessageSquareText className="h-4 w-4 mr-2" /> Re-send SMS
        </Button>
      </div>
    </Card>
  );
}

function Row({ label, value, bold, mono }: { label: string; value: string; bold?: boolean; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right ${bold ? "font-bold" : "font-medium"} ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
