import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "@tanstack/react-router";

const faqs = [
  {
    q: "Is my money safe with SafeBox?",
    a: "Yes. Your savings are held by our banking partner, Nomba MFB (NDIC Insured) — never by the agent and never by SafeBox. Every deposit is confirmed instantly by SMS.",
  },
  {
    q: "How do I deposit money?",
    a: "Give cash to your market's SafeBox agent. The agent credits your savings wallet immediately and you receive an SMS receipt with your new balance.",
  },
  {
    q: "How do I withdraw my savings?",
    a: "Visit any SafeBox agent. Verify with an SMS OTP, your paper savings card, in-person recognition, or a fingerprint scan in high-volume markets. You receive your cash on the spot.",
  },
  {
    q: "Do I need a smartphone?",
    a: "No. Everything works over SMS on any phone. Traders with smartphones can also log in to the trader dashboard to track balances, goals, and withdrawals.",
  },
  {
    q: "Do I earn interest on my savings?",
    a: "Yes. Deposits earn daily interest, credited to your wallet. Savings products like SafeGrowth and SafeLock offer higher rates for longer lock-in periods.",
  },
  {
    q: "How does the Monthly Jackpot work?",
    a: "Every month one active trader wins ₦300,000 — no entry fee. The more you save and the longer you avoid withdrawals, the more entries you earn. Winners are announced by SMS on the first day of each month.",
  },
  {
    q: "What are group contributions?",
    a: "SafeBox digitizes traditional ajo/esusu. Join a market contribution group, contribute on schedule, and receive your payout when it's your turn — all tracked with trust scores.",
  },
  {
    q: "How do I become an agent?",
    a: "Sign up on the registration page as an agent, complete onboarding, and fund your float. You'll earn commission on every deposit and withdrawal you process.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 py-20 md:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Questions &amp; Answers</p>
        <h2 className="mt-2 text-3xl font-bold md:text-4xl">Frequently asked questions</h2>
        <p className="mt-3 text-muted-foreground">Everything traders and agents ask us most.</p>
      </div>
      <Accordion type="single" collapsible className="mt-10">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Still have questions?{" "}
        <Link to="/contact" className="font-semibold text-primary underline underline-offset-4 hover:text-accent">
          Contact our team
        </Link>
      </p>
    </section>
  );
}
