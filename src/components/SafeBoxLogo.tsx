import { ShieldCheck } from "lucide-react";

export function SafeBoxLogo({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`grid h-9 w-9 place-items-center rounded-lg ${inverted ? "bg-gold text-gold-foreground" : "bg-primary text-primary-foreground"}`}>
        <ShieldCheck className="h-5 w-5" />
      </div>
      <span className={`font-display text-xl font-bold ${inverted ? "text-white" : "text-foreground"}`}>
        Safe<span className="text-gradient-gold">Box</span>
      </span>
    </div>
  );
}
