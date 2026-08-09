import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import { Toaster } from "sonner";

import appCss from "../styles.css?url";

function BrandMark() {
  return (
    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
      <span className="font-display text-xl font-extrabold">SB</span>
    </div>
  );
}

function NotFoundComponent() {
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

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
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
              reset();
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

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SafeBox — Your Daily Savings. Secured. Tracked. Growing." },
      { name: "description", content: "SafeBox is the digital reconciliation platform for market traders. Save daily with trusted agents, get instant SMS receipts, and earn yield on your balance." },
      { property: "og:title", content: "SafeBox — Your Daily Savings. Secured. Tracked. Growing." },
      { property: "og:description", content: "SafeBox is the digital reconciliation platform for market traders. Save daily with trusted agents, get instant SMS receipts, and earn yield on your balance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SafeBox — Your Daily Savings. Secured. Tracked. Growing." },
      { name: "twitter:description", content: "SafeBox is the digital reconciliation platform for market traders. Save daily with trusted agents, get instant SMS receipts, and earn yield on your balance." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2cfdbbc4-688f-4f21-8e73-7ea0fe005767/id-preview-3da9b64a--0ddc8507-e3d1-4c0b-a4eb-7b9e222f5939.lovable.app-1778833040755.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2cfdbbc4-688f-4f21-8e73-7ea0fe005767/id-preview-3da9b64a--0ddc8507-e3d1-4c0b-a4eb-7b9e222f5939.lovable.app-1778833040755.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('safebox-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}if(t==='dark'){document.documentElement.classList.add('dark')}document.documentElement.style.colorScheme=t;}catch(e){}`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
