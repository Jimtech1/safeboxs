import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Wallet, Banknote, Users, TrendingUp, MapPin } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import agentImg from "@/assets/agent-man.jpg";

export const Route = createFileRoute("/for-agents")({
  component: ForAgents,
  head: () => ({ meta: [
    { title: "For Agents — Earn Daily with SafeBox" },
    { name: "description", content: "Become a SafeBox agent. Use float capital to credit trader savings, earn commissions on every transaction." },
  ]}),
});

const steps = [
  { n: "01", title: "Top up your float", desc: "Load capital into your dedicated float account from any bank, card, or USSD." },
  { n: "02", title: "Collect cash from traders", desc: "Take their daily savings. System credits the trader, deducts the same amount from your float." },
  { n: "03", title: "Keep the cash you collected", desc: "The physical naira in your hand reimburses the float you spent. No end-of-day deposit." },
  { n: "04", title: "Earn commissions instantly", desc: "₦10 per deposit and ₦15 per withdrawal credited to your wallet in real time." },
];

function ForAgents() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-hero-gradient">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">For Agents</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-bold leading-tight">Earn daily. <span className="text-gradient-gold">Serve your market.</span></h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">SafeBox runs on a float-funded model. Deposit your capital, credit traders, keep the cash they hand you. Simple, transparent, profitable.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register"><Button size="lg" className="bg-primary hover:bg-primary/90">Become an Agent</Button></Link>
              <Link to="/login"><Button size="lg" variant="outline">Agent Login</Button></Link>
            </div>
          </div>
          <img src={agentImg} alt="Black African SafeBox agent in green polo holding a smartphone, smiling at customer" width={1024} height={1024} className="rounded-2xl shadow-xl object-cover aspect-square w-full" loading="lazy" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold">How the float model works</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">No more carrying cash to the bank at the end of every day.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <Card key={s.n} className="relative p-6">
              <span className="absolute right-5 top-5 font-display text-3xl font-bold text-cream">{s.n}</span>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-sidebar text-sidebar-foreground py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Why agents choose SafeBox</h2>
              <ul className="mt-6 space-y-3">
                {[
                  { i: Wallet, t: "Dedicated float account", d: "Top up from any bank, USSD, or card. Your capital, your control." },
                  { i: Banknote, t: "Daily commission settlement", d: "Earnings paid daily into your wallet." },
                  { i: Users, t: "Trusted by your community", d: "Branded polo, ID card, training, and ongoing support." },
                  { i: TrendingUp, t: "Performance dashboard", d: "See float utilization, commissions, and traders served in real time." },
                  { i: MapPin, t: "Work in your own market", d: "We assign zones to avoid agent overlap and protect your earnings." },
                ].map((b) => (
                  <li key={b.t} className="flex items-start gap-3 rounded-lg bg-white/5 border border-white/10 p-4">
                    <b.i className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{b.t}</p>
                      <p className="text-sm text-sidebar-foreground/70 mt-0.5">{b.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="p-6 bg-white text-foreground">
              <h3 className="font-display text-xl font-semibold">Apply to be an Agent</h3>
              <p className="mt-1 text-sm text-muted-foreground">Get a callback within 24 hours.</p>
              <div className="mt-5 space-y-3">
                {["Nigerian, 18+ with valid BVN", "Active in a market or commercial area", "Smartphone with internet", "₦50,000 minimum starting float"].map((r) => (
                  <div key={r} className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-success shrink-0" /><span className="text-sm">{r}</span></div>
                ))}
              </div>
              <Link to="/register"><Button className="mt-6 w-full bg-primary hover:bg-primary/90">Start Application</Button></Link>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
