import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { BrandNotFound, BrandRouteError } from "@/components/RouteFallbacks";

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
  notFoundComponent: BrandNotFound,
  errorComponent: BrandRouteError,
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
