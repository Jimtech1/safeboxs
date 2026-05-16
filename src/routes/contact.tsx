import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({ meta: [
    { title: "Contact SafeBox" },
    { name: "description", content: "Get in touch with SafeBox — support, partnerships, and agent inquiries." },
  ]}),
});

function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-hero-gradient">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold">Talk to us</h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Questions, partnerships, or support — we're here to help.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          {[
            { icon: Phone, t: "Call us", d: "+234 800 SAFEBOX (800 723 3269)", sub: "Mon–Sat, 8am–6pm WAT" },
            { icon: MessageSquare, t: "WhatsApp", d: "+234 901 234 5678", sub: "Reply within 1 hour" },
            { icon: Mail, t: "Email", d: "hello@safebox.ng", sub: "We reply within 24 hours" },
            { icon: MapPin, t: "Head office", d: "12B Awolowo Road, Ikoyi, Lagos", sub: "By appointment only" },
          ].map((c) => (
            <Card key={c.t} className="p-5 flex items-start gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary shrink-0"><c.icon className="h-5 w-5" /></div>
              <div>
                <p className="font-semibold">{c.t}</p>
                <p className="text-sm">{c.d}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h3 className="font-display text-xl font-semibold">Send a message</h3>
          <form className="mt-5 space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Message sent. We'll get back within 24 hours."); }}>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input placeholder="Full name" required />
              <Input type="email" placeholder="Email" required />
            </div>
            <Input placeholder="Phone number" type="tel" />
            <Input placeholder="Subject" required />
            <Textarea placeholder="How can we help?" rows={5} required />
            <Button className="w-full bg-primary hover:bg-primary/90">Send Message</Button>
          </form>
        </Card>
      </section>

      <Footer />
    </div>
  );
}
