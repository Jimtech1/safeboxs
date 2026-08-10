import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Upload, FileText } from "lucide-react";
import { getCurrentTrader, updateTrader, changeTraderPin, addKycDoc, removeKycDoc, type Trader, type KycDoc } from "@/lib/mockTraderData";
import { toast } from "sonner";

export const Route = createFileRoute("/trader/profile")({
  head: () => ({ meta: [
    { title: "My Profile | SafeBox" },
    { name: "description", content: "Manage your details, bank account, PIN and agent." },
    { property: "og:title", content: "My Profile | SafeBox" },
    { property: "og:description", content: "Manage your details, bank account, PIN and agent." },
  ]}),
  component: TraderProfile,
});

const KYC_KINDS: KycDoc["kind"][] = ["NIN slip", "Passport photo", "Utility bill", "Shop photo", "Other"];

function TraderProfile() {
  const [trader, setTrader] = useState<Trader | null>(null);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [kycKind, setKycKind] = useState<KycDoc["kind"]>("NIN slip");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const kycFileInputRef = useRef<HTMLInputElement>(null);

  const refresh = () => setTrader(getCurrentTrader());
  useEffect(() => {
    refresh();
    window.addEventListener("trader-store-change", refresh);
    return () => window.removeEventListener("trader-store-change", refresh);
  }, []);

  if (!trader) return null;

  const save = (patch: Partial<Trader>) => {
    updateTrader(patch);
    setTrader({ ...trader, ...patch });
    toast.success("Saved");
  };

  const onPhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    const reader = new FileReader();
    reader.onload = () => save({ photo: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onKycFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = addKycDoc(trader.id, { kind: kycKind, fileName: file.name });
    if (res && "error" in res) toast.error(res.error);
    else toast.success(`${file.name} uploaded for review`);
    e.target.value = "";
    refresh();
  };

  const kycStatusStyle: Record<KycDoc["status"], string> = {
    Uploaded: "bg-muted text-muted-foreground",
    "Under review": "bg-warning/15 text-warning",
    Verified: "bg-success/15 text-success",
    Rejected: "bg-destructive/15 text-destructive",
  };

  return (
    <div className="space-y-6 max-w-3xl mt-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal info, bank account, security, KYC and agent.</p>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="w-full grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
          <TabsTrigger value="bank">Bank</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="agent">Agent</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-primary-foreground font-bold text-xl">
                {trader.photo
                  ? <img src={trader.photo} alt={trader.name} className="h-full w-full object-cover" />
                  : trader.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
              </div>
              <div className="flex flex-wrap gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPhotoSelected} />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />Upload photo
                </Button>
                {trader.photo && (
                  <Button variant="ghost" className="text-destructive" onClick={() => save({ photo: undefined })}>Remove</Button>
                )}
              </div>
            </div>
            <div>
              <Label>Full name</Label>
              <Input className="mt-1" defaultValue={trader.name} onBlur={(e) => save({ name: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input className="mt-1" value={trader.phone} readOnly />
            </div>
            <div>
              <Label>Email</Label>
              <Input className="mt-1" type="email" defaultValue={trader.email ?? ""} onBlur={(e) => save({ email: e.target.value })} />
            </div>

            <div className="border-t pt-4 space-y-3">
              <p className="font-medium text-sm">Next of kin</p>
              <div>
                <Label>Full name</Label>
                <Input className="mt-1" defaultValue={trader.nextOfKin?.name ?? ""} placeholder="e.g. Musa Bello"
                  onBlur={(e) => save({ nextOfKin: { ...(trader.nextOfKin ?? { relationship: "", phone: "" }), name: e.target.value } })} />
              </div>
              <div>
                <Label>Relationship</Label>
                <Input className="mt-1" defaultValue={trader.nextOfKin?.relationship ?? ""} placeholder="e.g. Spouse"
                  onBlur={(e) => save({ nextOfKin: { ...(trader.nextOfKin ?? { name: "", phone: "" }), relationship: e.target.value } })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input className="mt-1" inputMode="numeric" maxLength={11} defaultValue={trader.nextOfKin?.phone ?? ""} placeholder="080..."
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val && !/^0\d{10}$/.test(val)) return toast.error("Phone must be 11 digits starting with 0");
                    save({ nextOfKin: { ...(trader.nextOfKin ?? { name: "", relationship: "" }), phone: val } });
                  }} />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="kyc">
          <Card className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">Verification status</p>
              <Badge variant={trader.kycStatus === "Verified" ? "default" : "secondary"}>{trader.kycStatus ?? "Tier 1"}</Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={kycKind} onValueChange={(v) => setKycKind(v as KycDoc["kind"])}>
                <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KYC_KINDS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
              <input ref={kycFileInputRef} type="file" className="hidden" onChange={onKycFileSelected} />
              <Button variant="outline" onClick={() => kycFileInputRef.current?.click()} className="min-h-11">
                <Upload className="h-4 w-4 mr-2" />Upload document
              </Button>
            </div>
            <div className="space-y-2">
              {(trader.kycDocs ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded yet.</p>
              )}
              {(trader.kycDocs ?? []).map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{d.fileName}</p>
                      <p className="text-xs text-muted-foreground">{d.kind} · {new Date(d.uploadedAt).toLocaleDateString("en-NG")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${kycStatusStyle[d.status]}`}>{d.status}</span>
                    <Button size="icon" variant="ghost" aria-label="Remove document" onClick={() => { removeKycDoc(trader.id, d.id); toast.success("Document removed"); refresh(); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card className="p-4 sm:p-6 space-y-4">
            <p className="text-sm text-muted-foreground">Add a bank account to receive withdrawals via transfer.</p>
            <div>
              <Label>Bank name</Label>
              <Input className="mt-1" defaultValue={trader.bankAccount?.bankName ?? ""} placeholder="e.g. GTBank"
                onBlur={(e) => save({ bankAccount: { ...(trader.bankAccount ?? { accountNumber: "", accountName: "" }), bankName: e.target.value } })} />
            </div>
            <div>
              <Label>Account number</Label>
              <Input className="mt-1" inputMode="numeric" maxLength={10} defaultValue={trader.bankAccount?.accountNumber ?? ""}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val && !/^\d{10}$/.test(val)) return toast.error("Account number must be 10 digits");
                  save({ bankAccount: { ...(trader.bankAccount ?? { bankName: "", accountName: "" }), accountNumber: val } });
                }} />
            </div>
            <div>
              <Label>Account name</Label>
              <Input className="mt-1" defaultValue={trader.bankAccount?.accountName ?? trader.name}
                onBlur={(e) => save({ bankAccount: { ...(trader.bankAccount ?? { bankName: "", accountNumber: "" }), accountName: e.target.value } })} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-4 sm:p-6 space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="currentpin">Current PIN</Label>
                <Input id="currentpin" className="mt-1" type="password" inputMode="numeric" maxLength={6}
                  autoComplete="current-password" placeholder="Current PIN"
                  value={currentPin} onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))} />
              </div>
              <div>
                <Label htmlFor="newpin">New PIN (4-6 digits)</Label>
                <Input id="newpin" className="mt-1" type="password" inputMode="numeric" maxLength={6}
                  autoComplete="new-password" placeholder="New PIN"
                  value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} />
              </div>
              <Button className="w-full min-h-11 sm:w-auto" onClick={() => {
                const res = changeTraderPin(currentPin, newPin);
                if ("error" in res) return toast.error(res.error);
                setCurrentPin(""); setNewPin("");
                toast.success("PIN updated");
              }}>Update PIN</Button>
            </div>
            <div className="flex items-center justify-between gap-4 border-t pt-4">
              <div><p className="font-medium">SMS alerts</p><p className="text-xs text-muted-foreground">Get an SMS for every transaction.</p></div>
              <Switch checked={trader.smsAlerts} onCheckedChange={(v) => save({ smsAlerts: v })} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div><p className="font-medium">Email alerts</p><p className="text-xs text-muted-foreground">Get an email summary daily.</p></div>
              <Switch checked={trader.emailAlerts} onCheckedChange={(v) => save({ emailAlerts: v })} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="agent">
          <Card className="p-4 sm:p-6 space-y-3">
            <p className="text-sm text-muted-foreground">Your assigned SafeBox agent</p>
            <Row label="Name" value={trader.agentName} />
            <Row label="Phone" value={trader.agentPhone} />
            <Row label="Location" value={trader.agentLocation} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
