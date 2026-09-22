import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";

type Item = { to: string; label: string; mobileLabel?: string; icon: LucideIcon; exact?: boolean };

export function DashboardMobileNav({ items, path, label, extra }: { items: Item[]; path: string; label: string; extra?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const primary = items.slice(0, 4);
  const active = (item: Item) => item.exact ? path === item.to : path.startsWith(item.to);
  return (
    <nav aria-label={label} className="fixed inset-x-0 bottom-0 z-40 border-t border-sidebar-border bg-sidebar text-sidebar-foreground md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {primary.map((item) => (
          <Link key={item.to} to={item.to} aria-current={active(item) ? "page" : undefined}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium ${active(item) ? "text-gold" : "text-sidebar-foreground"}`}>
            <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="w-full truncate text-center">{item.mobileLabel ?? item.label}</span>
          </Link>
        ))}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" aria-label="More navigation options" className={`h-auto min-w-0 flex-col gap-1 rounded-none px-1 py-2 text-[11px] font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground ${items.slice(4).some(active) ? "text-gold" : ""}`}>
              <Menu className="h-5 w-5 shrink-0" aria-hidden="true" /><span>More</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[75dvh] overflow-y-auto rounded-t-lg pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <SheetHeader><SheetTitle>{label}</SheetTitle></SheetHeader>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {items.map((item) => (
                <SheetClose asChild key={item.to}>
                  <Link to={item.to} aria-current={active(item) ? "page" : undefined} onClick={() => setOpen(false)}
                    className={`flex min-h-12 items-center gap-3 rounded-md border px-3 text-sm font-medium ${active(item) ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground"}`}>
                    <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />{item.label}
                  </Link>
                </SheetClose>
              ))}
            </div>
            {extra && <div className="mt-4 border-t pt-4">{extra}</div>}
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}