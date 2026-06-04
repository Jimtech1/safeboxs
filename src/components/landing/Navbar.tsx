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
    { label: "For Traders", to: "/for-traders" as const },
    { label: "For Agents", to: "/for-agents" as const },
    { label: "About", to: "/about" as const },
    { label: "Contact", to: "/contact" as const },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all ${scrolled ? "bg-white/85 backdrop-blur-md shadow-sm border-b" : "bg-transparent"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <SafeBoxLogo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors" activeProps={{ className: "text-primary font-semibold" }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/trader/login"><Button variant="ghost">Trader Login</Button></Link>
          <Link to="/login"><Button variant="outline">Agent Login</Button></Link>
          <Link to="/register"><Button className="bg-gold text-gold-foreground hover:bg-gold/90">Open Account</Button></Link>
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block py-2 text-foreground/80">{l.label}</Link>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/trader/login" onClick={() => setOpen(false)}><Button variant="ghost" className="w-full">Trader Login</Button></Link>
            <div className="flex gap-2">
              <Link to="/login" className="flex-1" onClick={() => setOpen(false)}><Button variant="outline" className="w-full">Agent Login</Button></Link>
              <Link to="/register" className="flex-1" onClick={() => setOpen(false)}><Button className="w-full bg-gold text-gold-foreground hover:bg-gold/90">Open Account</Button></Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
