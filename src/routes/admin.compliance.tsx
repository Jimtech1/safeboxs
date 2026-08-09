import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck, FileText } from "lucide-react";
import { agents, transactions } from "@/lib/mockData";

export const Route = createFileRoute("/admin/compliance")({
  component: Compliance,
});

const flagged = transactions.slice(0, 6).map((t, i) => ({
  ...t,
  reason: ["Velocity spike", "Structuring suspected", "Location anomaly", "Unusual hour", "Round-figure pattern", "New trader high amount"][i],
}));

const auditLogs = [
  { who: "Operations Team", action: "Approved agent AG-2011", when: "10 mins ago" },
  { who: "Compliance Officer", action: "Flagged transaction TX-500041 for review", when: "27 mins ago" },
  { who: "Operations Team", action: "Reversed transaction TX-500032", when: "1h ago" },
  { who: "Super Admin", action: "Updated SMS template for deposits", when: "3h ago" },
];

function Compliance() {
  const pending = agents.filter((a) => a.status === "Pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-primary" /> Compliance
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Monitoring, KYC and audit trails. Funds held by Nombank MFB.</p>
      </div>

      <Tabs defaultValue="agent-kyc">
        <TabsList className="bg-cream">
          <TabsTrigger value="agent-kyc">Agent KYC</TabsTrigger>
          <TabsTrigger value="trader-kyc">Trader KYC</TabsTrigger>
          <TabsTrigger value="monitoring">Transaction Monitoring</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="agent-kyc" className="mt-4">
          <Card className="p-5">
            <h3 className="font-semibold">Pending agent verifications</h3>
            <div className="mt-3 divide-y">
              {pending.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{a.name} <span className="text-xs text-muted-foreground">• {a.id}</span></p>
                    <p className="text-xs text-muted-foreground">BVN ✓ NIN ✓ Guarantor ✓ Criminal record check ✓ • {a.market}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-destructive text-destructive">Reject</Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">Approve</Button>
                  </div>
                </div>
              ))}
              {pending.length === 0 && <p className="py-3 text-sm text-muted-foreground">No pending agents.</p>}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trader-kyc" className="mt-4">
          <Card className="p-5">
            <h3 className="font-semibold">Tier-upgrade verifications</h3>
            <p className="mt-2 text-sm text-muted-foreground">Traders exceeding Tier 1 cumulative limits awaiting full KYC.</p>
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border bg-cream/50 p-3">
                  <div>
                    <p className="font-medium text-sm">Trader TR-1003{i}</p>
                    <p className="text-xs text-muted-foreground">NIN submitted • Awaiting verification</p>
                  </div>
                  <Button size="sm" variant="outline">Review</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="mt-4">
          <Card className="p-5">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Flagged transactions
            </h3>
            <div className="mt-3 divide-y">
              {flagged.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-sm">{t.id} • {t.type} • ₦{t.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t.reason} — agent {t.agentName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-warning text-warning">{t.reason}</Badge>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card className="p-5">
            <h3 className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Audit log</h3>
            <div className="mt-3 divide-y">
              {auditLogs.map((l, i) => (
                <div key={i} className="flex justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{l.who}</p>
                    <p className="text-xs text-muted-foreground">{l.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{l.when}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
