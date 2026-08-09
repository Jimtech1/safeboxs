import { Link, useRouter } from "@tanstack/react-router";

function BrandMark() {
  return (
    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
      <span className="font-display text-xl font-extrabold">SB</span>
    </div>
  );
}

export function BrandNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-gradient px-4">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 text-center shadow-sm">
        <BrandMark />
        <p className="mt-6 font-display text-6xl font-extrabold text-primary">404</p>
        <h1 className="mt-2 font-display text-xl font-bold text-foreground">This page isn't in the ledger</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved. Your savings are safe.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to home
          </Link>
          <Link
            to="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-input bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Log in
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">Funds held by Nomba MFB (NDIC Insured)</p>
      </div>
    </div>
  );
}

export function BrandRouteError({ error, reset }: { error: Error; reset?: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-gradient px-4">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 text-center shadow-sm">
        <BrandMark />
        <h1 className="mt-6 font-display text-xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't load this page. No transaction was affected — try again or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset?.();
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-input bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
