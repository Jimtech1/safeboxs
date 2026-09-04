import { createFileRoute, Link } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, ShieldCheck, ShieldX, UserX, UserCheck, FileText } from "lucide-react";
import { toast } from "sonner";
import { platformStore } from "@/lib/platformStore";
import { findTraderById, getTransactions, subscribeTraderStore, formatNGN, relativeTime } from "@/lib/mockTraderData";

export const Route = createFileRoute("/admin/traders/$id")({
  head: () => ({ meta: [
    { title: "Trader Detail & KYC Review | SafeBox Admin" },
    { name: "description", content: "Review a trader's savings balance, KYC documents and transaction history." },
    { property: "og:title", content: "Trader Detail & KYC Review | SafeBox Admin" },
    { property: "og:description", content: "Review a trader's savings balance, KYC documents and transaction history." },
  ]}),
  component: TraderDetail,
});

function TraderDetail() {
  const { id } = Route.useParams();
  const version = useSyncExternalStore(subscribeTraderStore, () => JSON.stringify(findTraderById(id) ?? {}), () => "");
  void version;
  const trader = findTraderById(id);
  const txns = trader ? getTransactions(trader.id).slice(0, 15) : [];

  if (!trader) {
    return (
      <Card className="p-8 text-center">
        <p className="font-semibold">Trader not found</p>
        <Link to="/admin/traders"><Button className="mt-4" variant="outline">Back to traders</Button></Link>
      </Card>
    );
  }

  const kyc = trader.kycStatus ?? "Tier 1";
  const suspended = trader.status !== "active";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin/traders" aria-label="Back to traders">
            <Button variant="outline" size="icon" className="h-11 w-11"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{trader.name}</h1>
            <p className="text-sm text-muted-foreground">{trader.phone} • {trader.market ?? "—"} • <span className="font-mono text-xs">{trader.id}</span></p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ConfirmButton
            label="Verify KYC" icon={<ShieldCheck className="h-4 w-4 mr-2" />}
            title="Verify this trader's KYC?" body="The trader will be marked Verified and full limits apply."
            onConfirm={() => { platformStore.setTraderKyc(trader.id, "Verified"); toast.success("KYC verified"); }}
          />
          <ConfirmButton
            label="Reject KYC" variant="outline" icon={<ShieldX className="h-4 w-4 mr-2" />}
            title="Reject this trader's KYC?" body="The trader will be asked to re-submit documents."
            onConfirm={() => { platformStore.setTraderKyc(trader.id, "Rejected"); toast.error("KYC rejected"); }}
          />
          <ConfirmButton
            label={suspended ? "Reactivate" : "Suspend"} variant="outline"
            icon={suspended ? <UserCheck className="h-4 w-4 mr-2" /> : <UserX className="h-4 w-4 mr-2" />}
            title={suspended ? "Reactivate this trader?" : "Suspend this trader?"}
            body={suspended ? "The trader regains access to deposits and withdrawals." : "Deposits and withdrawals will be blocked until reactivated."}
            onConfirm={() => {
              platformStore.setTraderStatus(trader.id, suspended ? "active" : "suspended");
              toast.success(suspended ? "Trader reactivated" : "Trader suspended");
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Savings balance" value={formatNGN(trader.balance)} />
        <Stat label="Total saved" value={formatNGN(trader.totalSaved)} />
        <Stat label="Interest earned" value={formatNGN(trader.interestEarned ?? 0)} />
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge className={trader.status === "active" ? "bg-success" : ""} variant={trader.status === "active" ? "default" : "destructive"}>{trader.status}</Badge>
            <Badge variant="outline">{kyc}</Badge>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold">KYC documents</h2>
          <div className="mt-3 space-y-2">
            {(trader.kycDocs ?? []).length === 0 && <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>}
            {(trader.kycDocs ?? []).map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{d.kind}</p>
                  <p className="text-xs text-muted-foreground truncate">{d.fileName} • {relativeTime(d.uploadedAt)}</p>
                </div>
                <Badge variant="outline" className="shrink-0">{d.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold">Profile</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Bank" value={trader.bankAccount ? `${trader.bankAccount.bankName} • ${trader.bankAccount.accountNumber}` : "Not provided"} />
            <Row label="Account name" value={trader.bankAccount?.accountName ?? "—"} />
            <Row label="Next of kin" value={trader.nextOfKin ? `${trader.nextOfKin.name} (${trader.nextOfKin.relationship})` : "Not provided"} />
            <Row label="Next of kin phone" value={trader.nextOfKin?.phone ?? "—"} />
            <Row label="Agent" value={trader.agentName ?? "—"} />
          </dl>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent transactions</h2>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                <th className="py-2 pr-4">When</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 pr-4 text-right">Amount</th>
                <th className="py-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {txns.map((t) => (
                <tr key={t.id}>
                  <td className="py-2 pr-4 text-muted-foreground">{relativeTime(t.iso)}</td>
                  <td className="py-2 pr-4">{t.type}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{t.description}</td>
                  <td className={`py-2 pr-4 text-right font-semibold ${t.type === "Withdrawal" ? "text-destructive" : "text-success"}`}>
                    {t.type === "Withdrawal" ? "−" : "+"}{formatNGN(t.amount)}
                  </td>
                  <td className="py-2 text-right">{formatNGN(t.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {txns.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet.</p>}
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function ConfirmButton({
  label, title, body, onConfirm, variant = "default", icon,
}: {
  label: string; title: string; body: string; onConfirm: () => void;
  variant?: "default" | "outline"; icon?: React.ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} className="min-h-11">{icon}{label}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
