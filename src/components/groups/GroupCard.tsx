import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Repeat, Target as TargetIcon, MapPin } from "lucide-react";
import { formatNGN, type SavingsGroup } from "@/lib/groupStore";

export function GroupStatusBadge({ status }: { status: SavingsGroup["status"] }) {
  const cls =
    status === "Active" ? "bg-primary/10 text-primary border-primary/30"
    : status === "Recruiting" ? "bg-gold/15 text-gold-foreground border-gold/40"
    : status === "Paused" ? "bg-amber-100 text-amber-800 border-amber-300"
    : "bg-secondary text-secondary-foreground border-border";
  return <Badge variant="outline" className={cls}>{status}</Badge>;
}

export function GroupCard({ group, onOpen, footer }: {
  group: SavingsGroup;
  onOpen?: () => void;
  footer?: React.ReactNode;
}) {
  const active = group.members.filter((m) => m.status !== "Left");
  const pct = group.type === "Target" && group.targetAmount
    ? Math.min(100, (group.totalCollected / group.targetAmount) * 100)
    : Math.min(100, (active.length / group.maxMembers) * 100);

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <button onClick={onOpen} className="text-left">
          <p className="font-semibold leading-tight hover:underline">{group.name}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {group.market}
          </p>
        </button>
        <GroupStatusBadge status={group.status} />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          {group.type === "Rotational" ? <Repeat className="h-3 w-3" /> : <TargetIcon className="h-3 w-3" />}
          {group.type} • {group.frequency}
        </span>
        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {active.length}/{group.maxMembers} members</span>
        <span className="font-mono">Code {group.code}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Contribution</p>
          <p className="font-semibold">{formatNGN(group.contributionAmount)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pool</p>
          <p className="font-semibold">{formatNGN(group.pool)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Cycle</p>
          <p className="font-semibold">#{group.cycle}</p>
        </div>
      </div>

      <div>
        <Progress value={pct} />
        <p className="mt-1 text-[11px] text-muted-foreground">
          {group.type === "Target" && group.targetAmount
            ? `${formatNGN(group.totalCollected)} of ${formatNGN(group.targetAmount)} target`
            : `${active.length} of ${group.maxMembers} seats filled`}
        </p>
      </div>

      {footer}
    </Card>
  );
}
