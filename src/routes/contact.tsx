import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Fields = { name: string; email: string; phone: string; subject: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;
const empty: Fields = { name: "", email: "", phone: "", subject: "", message: "" };

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Full name is required.";
  else if (f.name.trim().length < 2) e.name = "Name is too short.";
  if (!f.email.trim()) e.email = "Email is required.";
  else if (!EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (f.phone.trim() && !/^\+?[\d\s-]{7,16}$/.test(f.phone.trim())) e.phone = "Enter a valid phone number.";
  if (!f.subject.trim()) e.subject = "Subject is required.";
  if (!f.message.trim()) e.message = "Tell us how we can help.";
  else if (f.message.trim().length < 10) e.message = "Message should be at least 10 characters.";
  return e;
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return <p id={id} className="text-xs text-destructive mt-1">{msg}</p>;
}

function ContactForm() {
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSent(true);
  };

  if (sent) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[380px]">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="font-display text-xl font-semibold">Message sent</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Thanks {fields.name.trim().split(" ")[0]} — we've received your message and will reply within 24 hours.
        </p>
        <Button variant="outline" onClick={() => { setFields(empty); setSent(false); }}>Send another message</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-display text-xl font-semibold">Send a message</h3>
      <form className="mt-5 space-y-4" onSubmit={submit} noValidate>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Input placeholder="Full name" value={fields.name} onChange={set("name")} aria-invalid={!!errors.name} aria-describedby="err-name" />
            <FieldError id="err-name" msg={errors.name} />
          </div>
          <div>
            <Input type="email" placeholder="Email" value={fields.email} onChange={set("email")} aria-invalid={!!errors.email} aria-describedby="err-email" />
            <FieldError id="err-email" msg={errors.email} />
          </div>
        </div>
        <div>
          <Input placeholder="Phone number (optional)" type="tel" value={fields.phone} onChange={set("phone")} aria-invalid={!!errors.phone} aria-describedby="err-phone" />
          <FieldError id="err-phone" msg={errors.phone} />
        </div>
        <div>
          <Input placeholder="Subject" value={fields.subject} onChange={set("subject")} aria-invalid={!!errors.subject} aria-describedby="err-subject" />
          <FieldError id="err-subject" msg={errors.subject} />
        </div>
        <div>
          <Textarea placeholder="How can we help?" rows={5} value={fields.message} onChange={set("message")} aria-invalid={!!errors.message} aria-describedby="err-message" />
          <FieldError id="err-message" msg={errors.message} />
        </div>
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Send Message</Button>
      </form>
    </Card>
  );
}

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

        <ContactForm />
      </section>

      <Footer />
    </div>
  );
}
