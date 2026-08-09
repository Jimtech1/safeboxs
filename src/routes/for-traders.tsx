import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck, MessageSquare, TrendingUp, Wallet } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import traderImg from "@/assets/trader-woman.jpg";
import communityImg from "@/assets/community.jpg";

export const Route = createFileRoute("/for-traders")({
  component: ForTraders,
  head: () => ({ meta: [
    { title: "For Traders — Save Daily with SafeBox" },
    { name: "description", content: "SafeBox helps market traders save daily safely, earn yield, and withdraw anytime through trusted agents." },
  ]}),
});

const benefits = [
  { icon: ShieldCheck, title: "Funds Held By Nombank MFB", desc: "Banking partner: Nomba MFB (NDIC Insured). Your money is never held by the agent." },
  { icon: MessageSquare, title: "Instant SMS receipts", desc: "Every deposit and withdrawal sends an SMS to your phone. Proof always." },
  { icon: TrendingUp, title: "Earn up to 10% yield", desc: "Your savings grow with interest, paid monthly. Even on small balances." },
  { icon: Wallet, title: "Withdraw anytime", desc: "No fixed terms, no penalties. Cash out at any SafeBox agent." },
];

function ForTraders() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-hero-gradient">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">For Traders</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-bold leading-tight">Save daily. <span className="text-primary">Sleep peacefully.</span></h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">No more disappearing collectors or money under the mattress. SafeBox brings safe, simple, daily savings to your market stall.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register"><Button size="lg" className="bg-primary hover:bg-primary/90">Open Trader Account</Button></Link>
              <Link to="/contact"><Button size="lg" variant="outline">Find an Agent</Button></Link>
            </div>
          </div>
          <img src={traderImg} alt="Black African market trader smiling confidently at her stall" width={1024} height={1024} className="rounded-2xl shadow-xl object-cover aspect-square w-full" loading="lazy" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Built for the way traders save</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">Trusted by tens of thousands of market women and men across Nigeria.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {benefits.map((b) => (
            <Card key={b.title} className="p-6">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary"><b.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-semibold text-lg">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-cream py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:grid-cols-2 md:px-8">
          <img src={communityImg} alt="Diverse group of Black African community members smiling together" width={1280} height={768} className="rounded-2xl shadow-xl object-cover w-full" loading="lazy" />
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">A community of savers</h2>
            <p className="mt-4 text-muted-foreground">Over 100,000 traders save with SafeBox every week. Mothers planning school fees. Tailors buying new machines. Vendors building their next stall.</p>
            <ul className="mt-6 space-y-3">
              {["Free to open an account", "No minimum balance", "Daily, weekly, or monthly savings", "Yield paid every month"].map((b) => (
                <li key={b} className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 text-success shrink-0" /><span>{b}</span></li>
              ))}
            </ul>
            <Link to="/register"><Button className="mt-6 bg-primary hover:bg-primary/90" size="lg">Start Saving Today</Button></Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
