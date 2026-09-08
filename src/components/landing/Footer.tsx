import { useState } from "react";
import { SafeBoxLogo } from "@/components/SafeBoxLogo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Facebook, Instagram, Linkedin, MessageCircle } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) { setError("Enter your email address."); return; }
    if (!EMAIL_RE.test(value)) { setError("That email doesn't look right."); return; }
    setError("");
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2.5">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" />
        <p className="text-xs text-sidebar-foreground/80">You're on the list — updates coming to {email.trim()}.</p>
      </div>
    );
  }
  return (
    <form onSubmit={submit} noValidate>
      <div className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
          placeholder="your@email.com"
          aria-label="Email address for updates"
          aria-invalid={!!error}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
        <Button type="submit" className="bg-gold text-gold-foreground hover:bg-gold/90">Join</Button>
      </div>
      {error && <p className="mt-1.5 text-xs text-gold">{error}</p>}
    </form>
  );
}

const cols = [
  { title: "Product", items: ["For Traders", "For Agents", "Trader Login", "Agent Login", "Pricing"] },
  { title: "Company", items: ["About", "Blog", "Careers", "Press"] },
  { title: "Resources", items: ["FAQ", "Contact", "Agent Training", "Compliance"] },
  { title: "Legal", items: ["Privacy Policy", "Terms of Service", "Banking Partner"] },
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
              <NewsletterForm />
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
        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-sidebar-foreground/60">Funds Held By</p>
            <p className="mt-1 font-display text-base font-semibold">Nomba MFB (NDIC Insured)</p>
            <p className="mt-2 text-xs leading-relaxed text-sidebar-foreground/60">
              Savings infrastructure and custodial services are provided by Nombank Microfinance Bank, which is fully licensed by the CBN and insured by the NDIC.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-sidebar-foreground/60">© {new Date().getFullYear()} SafeBox. All rights reserved.</p>
            <div className="flex gap-3">
              {[MessageCircle, Facebook, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" aria-label="SafeBox social link" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-gold hover:text-gold-foreground transition">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
