import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  MapPin, Banknote, Wallet, MessageSquare, TrendingUp, Clock,
  ShieldCheck, Phone, Users, Star, FileCheck, Lock, Building2,
  ArrowRight, CheckCircle2, Trophy, Gift, CalendarDays, Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";
import traderImg from "@/assets/trader-woman.jpg";
import agentImg from "@/assets/agent-man.jpg";
import communityImg from "@/assets/community.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
});

const heroSlides = [
  { eyebrow: "Daily Savings Collection", title: ["Your Daily Savings.", "Safe.", "Simple.", "Rewarding."], desc: "Save daily with a trusted SafeBox agent. Instant SMS receipt every time. Watch your balance grow.", chips: ["Instant SMS", "No Smartphone Needed", "Daily Pickup"], cta: { to: "/register" as const, label: "Start Saving Today" } },
  { eyebrow: "Withdraw Anytime", title: ["Need cash?", "Withdraw.", "Anywhere.", "Instantly."], desc: "Visit any SafeBox agent. Verify with OTP, paper card, or fingerprint. Walk out with your money.", chips: ["OTP Verified", "No Penalties", "Same Day Cash"], cta: { to: "/register" as const, label: "Start Saving Today" } },
  { eyebrow: "Transaction History", title: ["Every kobo.", "Tracked.", "Receipted.", "Yours."], desc: "Every deposit and withdrawal is logged and timestamped. Check your full history any time, any phone.", chips: ["SMS Receipts", "Live Ledger", "Audit Ready"], cta: { to: "/register" as const, label: "Start Saving Today" } },
  { eyebrow: "Float Management", title: ["For agents.", "Top up.", "Withdraw.", "Earn."], desc: "Fund your float from any bank, settle to your account any time. Earn commission on every transaction.", chips: ["USSD Top-up", "Bank Settlement", "Daily Commission"], cta: { to: "/register" as const, label: "Become an Agent" } },
  { eyebrow: "Security of Funds", title: ["CBN Compliant.", "Insured.", "Verified.", "Trusted."], desc: "SafeBox operates under CBN Agent Banking Guidelines. Your money is protected at every step.", chips: ["CBN Compliant", "NDIC Coverage", "Encrypted"], cta: { to: "/register" as const, label: "Start Saving Today" } },
  { eyebrow: "Monthly Jackpot", title: ["Save more.", "Win.", "₦300,000.", "Monthly."], desc: "One active trader wins ₦300,000 every month. No fees. The more you save, the higher your chances.", chips: ["₦300k Prize", "1 Winner / Month", "Zero Entry Fee"], cta: { to: "/register" as const, label: "Start Saving Today" } },
  { eyebrow: "Trader Dashboard", title: ["Track Your Savings.", "Anytime.", "Anywhere.", "Yours."], desc: "Log in to your personal dashboard. See your balance, view your full transaction history, and request withdrawals with one click.", chips: ["Real-Time Balance", "Transaction History", "Easy Withdrawals"], cta: { to: "/trader/login" as const, label: "Trader Login" } },
];

const features = [
  { icon: MessageSquare, title: "Instant SMS Receipts", desc: "Every deposit and withdrawal sends an instant SMS to your phone. You always have proof." },
  { icon: TrendingUp, title: "Earn Yield on Savings", desc: "Your savings don't just sit. They grow. Earn up to 10% annually on your balance." },
  { icon: Clock, title: "Withdraw Anytime", desc: "No fixed terms. No penalties. Get your money when you need it." },
  { icon: ShieldCheck, title: "CBN Compliant", desc: "SafeBox operates under CBN Agent Banking Guidelines. Your savings are protected." },
  { icon: Phone, title: "No Smartphone Required", desc: "Any phone works. Agents handle the technology. You just save." },
  { icon: Users, title: "5,000+ Agents Nationwide", desc: "Find a SafeBox agent in every major market. We're growing daily." },
];

const testimonials = [
  { name: "Mama Ngozi", role: "Trader", location: "Mile 12 Market, Lagos", quote: "I used to hide my savings under my mattress. Now I save with SafeBox. I can see my balance grow every day.", rating: 5 },
  { name: "Fatima", role: "Trader", location: "Bodija Market, Ibadan", quote: "I can see my savings grow every day. SafeBox gives me peace of mind.", rating: 5 },
  { name: "Chinedu", role: "Trader", location: "Onitsha Main Market", quote: "The SMS alerts and online dashboard help me track my money. I trust my collector more now.", rating: 5 },
  { name: "Adebayo O.", role: "SafeBox Agent", location: "Bodija Market, Ibadan", quote: "Being a SafeBox agent gives me steady income. My community trusts me.", rating: 5 },
];

function Landing() {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 4000);
    return () => clearInterval(id);
  }, []);
  const current = heroSlides[slide];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="bg-hero-gradient">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> {current.eyebrow}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="mt-5 text-4xl font-bold leading-[1.05] md:text-6xl min-h-[8rem] md:min-h-[12rem]">
                  {current.title[0]}{" "}
                  <span className="text-primary">{current.title[1]}</span>{" "}
                  <span className="text-gradient-gold">{current.title[2]}</span>{" "}
                  <span className="text-accent">{current.title[3]}</span>
                </h1>
                <p className="mt-5 max-w-lg text-lg text-muted-foreground min-h-[5rem]">
                  {current.desc}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {current.chips.map((p) => (
                    <span key={p} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-foreground/80 shadow-sm border">
                      {p}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="mt-6 flex items-center gap-1.5">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === slide ? "w-8 bg-primary" : "w-2 bg-primary/30"}`}
                />
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={current.cta.to}><Button size="lg" className="bg-primary hover:bg-primary/90">
                {current.cta.label} <ArrowRight className="ml-2 h-4 w-4" />
              </Button></Link>
              <Link to="/trader/login"><Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Trader Login
              </Button></Link>
            </div>
          </motion.div>

          {/* Right illustration */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
            <div className="relative mx-auto h-[460px] sm:h-[500px] md:aspect-square md:h-auto max-w-md">
              {/* Agent + trader card */}
              <div className="absolute left-0 top-0 md:top-6 w-[72%] rounded-2xl bg-white p-4 md:p-5 shadow-xl border">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 md:h-12 md:w-12 place-items-center rounded-full bg-primary/10 text-primary"><Users /></div>
                  <div>
                    <p className="font-semibold text-sm md:text-base">Trader → Agent</p>
                    <p className="text-[11px] md:text-xs text-muted-foreground">Cash handed safely</p>
                  </div>
                </div>
                <div className="mt-3 md:mt-4 rounded-lg bg-cream p-3">
                  <p className="text-[11px] md:text-xs text-muted-foreground">Today's deposit</p>
                  <p className="font-display text-xl md:text-2xl font-bold text-primary">₦1,000</p>
                </div>
              </div>

              {/* Phone SMS card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute right-0 top-[170px] md:top-32 w-[64%] md:w-[60%] rounded-2xl bg-sidebar text-sidebar-foreground p-3 md:p-4 shadow-2xl"
              >
                <div className="flex items-center gap-2 text-[11px] md:text-xs text-sidebar-foreground/70">
                  <MessageSquare className="h-3.5 w-3.5" /> SafeBox SMS
                </div>
                <p className="mt-2 text-xs md:text-sm leading-snug">You saved <span className="font-bold text-gold">₦1,000</span>. New balance: ₦24,500. Thank you!</p>
              </motion.div>

              {/* Growth bar */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute bottom-0 left-0 md:left-6 w-[92%] md:w-[88%] rounded-2xl bg-white p-4 md:p-5 shadow-xl border"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Savings growing</p>
                  <span className="text-xs font-semibold text-success">+8.4% YTD</span>
                </div>
                <div className="mt-3 flex items-end gap-1 h-14 md:h-16">
                  {[30, 45, 38, 60, 72, 80, 95].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.6 }}
                      className="flex-1 rounded-t bg-gradient-to-t from-primary to-accent"
                    />
                  ))}
                </div>
              </motion.div>

              {/* Floating badges */}
              <div className="absolute -top-2 right-2 rounded-full bg-gold px-3 py-1 text-[11px] md:text-xs font-bold text-gold-foreground shadow-lg">₦50B+ Saved</div>
              <div className="absolute bottom-[88px] md:-bottom-2 right-2 md:right-10 rounded-full bg-primary px-3 py-1 text-[11px] md:text-xs font-bold text-primary-foreground shadow-lg">100k+ Traders</div>
              <div className="absolute top-[130px] md:top-1/2 -left-1 md:-left-3 rounded-full bg-accent px-3 py-1 text-[11px] md:text-xs font-bold text-accent-foreground shadow-lg">5k+ Agents</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* COMMUNITY STRIP */}
      <section className="bg-cream py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8 grid gap-10 md:grid-cols-2 items-center">
          <img src={communityImg} alt="Diverse Black African market community members smiling together" width={1280} height={768} className="rounded-2xl shadow-xl object-cover w-full" loading="lazy" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Our Community</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold">A network built by — and for — the markets we serve.</h2>
            <p className="mt-4 text-muted-foreground">From the vendors of Mile 12 to the tailors of Aba, SafeBox is owned by the trust of the people who use it every day.</p>
            <Link to="/about"><Button className="mt-6 bg-primary hover:bg-primary/90">Read our story</Button></Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="traders" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">How It Works</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Three simple steps to save daily</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", icon: MapPin, title: "Find a SafeBox Agent", desc: "Visit any SafeBox agent in your market. They are trained, verified, and ready to help." },
            { n: "02", icon: Banknote, title: "Save Daily", desc: "Give your daily savings to the agent. Receive an instant SMS receipt. Watch your balance grow." },
            { n: "03", icon: Wallet, title: "Withdraw Anytime", desc: "Need cash? Visit any SafeBox agent. Withdraw instantly. No paperwork. No delays." },
          ].map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="relative h-full p-6 border-2 hover:border-primary/40 transition-colors">
                <span className="absolute right-5 top-5 font-display text-4xl font-bold text-cream">{s.n}</span>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><s.icon /></div>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Why SafeBox</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Built for traders. Trusted by communities.</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="h-full p-6 hover:shadow-lg transition-shadow">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-gold/15 text-gold-foreground">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR TRADERS */}
      <section id="traders-portrait" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <img src={traderImg} alt="Black African market trader smiling at her stall" width={1024} height={1024} className="rounded-2xl shadow-xl object-cover aspect-square w-full" loading="lazy" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">For Traders</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">"My savings are <span className="text-primary">finally safe.</span>"</h2>
            <p className="mt-4 text-muted-foreground">Mama Ngozi sells fabric at Mile 12. She used to fear her daily collector. Today, SafeBox sends her an SMS every time she saves — and her balance earns yield every month.</p>
            <Link to="/for-traders"><Button size="lg" className="mt-6 bg-primary hover:bg-primary/90">See trader benefits <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* FOR AGENTS */}
      <section id="agents" className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">For Agents</p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">Become a SafeBox Agent. <span className="text-gradient-gold">Earn Daily.</span></h2>
              <p className="mt-4 text-muted-foreground">
                Top up your float, credit traders from your capital, keep the cash they pay you. Earn commissions on every transaction — no end-of-day cash deposit.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Earn ₦10 per deposit and ₦15 per withdrawal",
                  "Daily commission settlement",
                  "Dedicated float account, USSD / bank top-up",
                  "Free training and ongoing support",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-success shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-3 flex-wrap">
                <Link to="/register"><Button size="lg" className="bg-primary hover:bg-primary/90">Become an Agent</Button></Link>
                <Link to="/for-agents"><Button size="lg" variant="outline">How it works</Button></Link>
              </div>
            </div>
            <img src={agentImg} alt="Black African SafeBox agent in green polo holding a smartphone" width={1024} height={1024} className="rounded-2xl shadow-xl object-cover aspect-square w-full order-1 md:order-2" loading="lazy" />
          </div>
        </div>
      </section>

      {/* WITHDRAWAL AUTHENTICATION */}
      <section id="security" className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Withdrawal Security</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Layered authentication. <span className="text-primary">Nobody is excluded.</span></h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground md:text-lg">
              SafeBox supports multiple withdrawal authentication methods to serve traders across all literacy and technology levels. For phone users, we use SMS OTP. For non-phone users, agents verify identity through in-person recognition. Traders also receive a paper savings card that serves as a physical record and can be used for verification. In high-volume markets, we deploy biometric fingerprint scanners as the most secure option.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MessageSquare, label: "SMS OTP", desc: "Secure codes for traders who own or share a phone." },
              { icon: Users, label: "Agent recognition", desc: "Trusted field agents verify familiar non-phone users in person." },
              { icon: FileCheck, label: "Paper savings card", desc: "A physical savings record supports identity checks and receipts." },
              { icon: ShieldCheck, label: "Biometric fingerprint", desc: "Fingerprint checks support busy, high-volume market locations." },
            ].map((f) => (
              <Card key={f.label} className="h-full p-5 shadow-sm">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{f.label}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-primary/20 bg-primary/10 px-5 py-4 text-sm font-semibold text-primary">
            Result: every withdrawal is verified before cash leaves the agent.
          </div>
        </div>
      </section>

      {/* MONTHLY JACKPOT */}
      <section id="jackpot" className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[#063b22] py-20 text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden>
          <div className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-gold blur-3xl" />
          <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                <Sparkles className="h-3.5 w-3.5" /> Monthly Jackpot
              </div>
              <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold leading-tight">
                Win <span className="text-gradient-gold">₦300,000</span> Every Month
              </h2>
              <p className="mt-4 text-white/80 text-lg">
                One lucky trader wins ₦300,000 every single month. No extra fees. No purchase required.
              </p>
              <p className="mt-4 text-white/70 leading-relaxed">
                Each month, SafeBox randomly selects one active trader from a different market location across Nigeria. The winner is someone who saves consistently and avoids unnecessary withdrawals.
              </p>
              <p className="mt-3 text-white/70 leading-relaxed">
                The more you save, the more entries you earn. The longer you save without withdrawing, the higher your chance of winning.
              </p>
              <p className="mt-3 text-white/70 leading-relaxed">
                Winners are announced on the first day of each month via SMS and on our website.
              </p>
              <div className="mt-7">
                <Link to="/register">
                  <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
                    Start Saving to Win <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative mx-auto max-w-md rounded-3xl bg-white/5 backdrop-blur-sm border border-white/15 p-6 shadow-2xl">
                <div className="rounded-2xl bg-gradient-to-br from-gold to-[#b8902c] p-6 text-gold-foreground shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-6 w-6" />
                      <span className="text-xs font-bold uppercase tracking-widest">Grand Prize</span>
                    </div>
                    <CalendarDays className="h-5 w-5 opacity-70" />
                  </div>
                  <p className="mt-4 font-display text-5xl font-extrabold">₦300,000</p>
                  <p className="mt-1 text-sm font-medium opacity-80">Every month · One winner</p>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  {[
                    { v: "1", l: "Winner / month" },
                    { v: "₦0", l: "Entry fee" },
                    { v: "36", l: "States eligible" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl bg-white/10 border border-white/10 p-3">
                      <p className="font-display text-xl font-bold text-gold">{s.v}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-white/70">{s.l}</p>
                    </div>
                  ))}
                </div>

                <ul className="mt-5 space-y-3 text-sm">
                  {[
                    { icon: Gift, t: "More savings = more entries" },
                    { icon: ShieldCheck, t: "Avoid withdrawals to boost odds" },
                    { icon: MessageSquare, t: "Winners notified via SMS" },
                  ].map((r) => (
                    <li key={r.t} className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-gold/15 text-gold">
                        <r.icon className="h-4 w-4" />
                      </span>
                      <span className="text-white/85">{r.t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="absolute -top-3 -right-3 rotate-6 rounded-full bg-accent px-3 py-1 text-[11px] font-bold text-accent-foreground shadow-lg">
                Next draw: 1st of month
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Voices from the market</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Trusted by traders, agents, and partners</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full p-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="mt-4 text-foreground/90">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3 border-t pt-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role} • {t.location}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CBN COMPLIANCE BANNER */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
            <div className="flex gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10"><FileCheck className="h-5 w-5" /></div>
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10"><Lock className="h-5 w-5" /></div>
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10"><Building2 className="h-5 w-5" /></div>
            </div>
            <p className="text-sm md:text-base">
              <span className="font-semibold">SafeBox operates in full compliance</span> with the Central Bank of Nigeria Guidelines for the Operations of Agent Banking (October 2025).
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
