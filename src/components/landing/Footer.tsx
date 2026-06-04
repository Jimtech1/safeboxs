import { SafeBoxLogo } from "@/components/SafeBoxLogo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Linkedin, MessageCircle } from "lucide-react";

const cols = [
  { title: "Product", items: ["For Traders", "For Agents", "Trader Login", "Agent Login", "Pricing"] },
  { title: "Company", items: ["About", "Blog", "Careers", "Press"] },
  { title: "Resources", items: ["FAQ", "Contact", "Agent Training", "Compliance"] },
  { title: "Legal", items: ["Privacy Policy", "Terms of Service", "CBN Compliance"] },
];

export function Footer() {
  return (
    <footer id="contact" className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <SafeBoxLogo inverted />
            <p className="mt-4 text-sm text-sidebar-foreground/70 max-w-xs">
              Daily savings for market traders. Secured. Tracked. Growing.
            </p>
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wide text-sidebar-foreground/60 mb-2">Get updates</p>
              <div className="flex gap-2">
                <Input placeholder="your@email.com" className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                <Button className="bg-gold text-gold-foreground hover:bg-gold/90">Join</Button>
              </div>
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-display text-sm font-semibold mb-3">{c.title}</h4>
              <ul className="space-y-2 text-sm text-sidebar-foreground/70">
                {c.items.map((i) => (
                  <li key={i}><a href="#" className="hover:text-gold transition">{i}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-sidebar-foreground/60">© {new Date().getFullYear()} SafeBox. All rights reserved.</p>
          <div className="flex gap-3">
            {[MessageCircle, Facebook, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-gold hover:text-gold-foreground transition">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
