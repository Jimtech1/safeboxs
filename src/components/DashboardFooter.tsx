import { Link } from "@tanstack/react-router";

export function DashboardFooter() {
  return (
    <footer className="border-t border-border bg-card px-4 py-6 text-card-foreground">
      <div className="mx-auto max-w-6xl space-y-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} SafeBox · Funds Held By Nombank MFB</span>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
        <p>Savings infrastructure and custodial services are provided by Nombank Microfinance Bank, which is fully licensed by the CBN and insured by the NDIC.</p>
      </div>
    </footer>
  );
}