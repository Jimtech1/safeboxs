import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Target, Users, Heart } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import communityImg from "@/assets/community.jpg";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({ meta: [
    { title: "About SafeBox — Financial Inclusion for Market Traders" },
    { name: "description", content: "SafeBox is a digital reconciliation platform helping market traders save daily through trusted agent banking. Funds held by Nombank MFB." },
  ]}),
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-hero-gradient">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center md:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">About SafeBox</p>
          <h1 className="mt-2 text-4xl md:text-6xl font-bold leading-tight">Banking that meets traders <span className="text-primary">where they are.</span></h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">SafeBox was built to replace unsafe daily savings collectors with a technology-driven agent network. Funds held by our banking partner, Nomba MFB (NDIC Insured).</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <img src={communityImg} alt="Black African community members smiling together" width={1280} height={768} className="rounded-2xl shadow-xl object-cover w-full" loading="lazy" />
      </section>

      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8 grid gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Our Mission</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold">Bring 10 million traders into the financial system by 2030.</h2>
            <p className="mt-4 text-muted-foreground">Over 38 million Nigerian adults remain financially excluded. Most are market traders who save daily through informal collectors who sometimes vanish with their money. SafeBox changes that.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, t: "Funds Held By", d: "Nomba MFB (NDIC Insured) — our banking partner." },
              { icon: Target, t: "Daily savings", d: "Designed for ₦100 to ₦100,000 daily." },
              { icon: Users, t: "Agent network", d: "5,000+ trained agents in major markets." },
              { icon: Heart, t: "Community-led", d: "Built with traders, not just for them." },
            ].map((v) => (
              <Card key={v.t} className="p-5">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><v.icon className="h-5 w-5" /></div>
                <p className="mt-3 font-semibold">{v.t}</p>
                <p className="text-sm text-muted-foreground mt-1">{v.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Join the movement</h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Whether you're a trader, an aspiring agent, or a partner bank — there's a place for you in SafeBox.</p>
        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          <Link to="/register"><Button size="lg" className="bg-primary hover:bg-primary/90">Open an Account</Button></Link>
          <Link to="/contact"><Button size="lg" variant="outline">Contact Us</Button></Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
