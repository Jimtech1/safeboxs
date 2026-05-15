import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { SafeBoxLogo } from "@/components/SafeBoxLogo";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "For Traders", href: "#traders" },
    { label: "For Agents", href: "#agents" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all ${scrolled ? "bg-white/85 backdrop-blur-md shadow-sm border-b" : "bg-transparent"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link to="/"><SafeBoxLogo /></Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/agent"><Button variant="outline">Agent Login</Button></Link>
          <Link to="/admin"><Button className="bg-gold text-gold-foreground hover:bg-gold/90">Open Account</Button></Link>
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 text-foreground/80">{l.label}</a>
          ))}
          <div className="flex gap-2 pt-2">
            <Link to="/agent" className="flex-1"><Button variant="outline" className="w-full">Agent Login</Button></Link>
            <Link to="/admin" className="flex-1"><Button className="w-full bg-gold text-gold-foreground hover:bg-gold/90">Open Account</Button></Link>
          </div>
        </div>
      )}
    </header>
  );
}
