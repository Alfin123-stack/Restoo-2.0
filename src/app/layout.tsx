import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@fontsource-variable/inter";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/instrument-serif/400.css";
import "./globals.css";
import { OfflineIndicator } from "@/components/layout/offline-indicator";
import { RouteProgress } from "@/components/layout/route-progress";
import { ScrollReveal } from "@/components/layout/scroll-reveal";
import { SerwistProvider } from "@/components/layout/serwist-provider";
import { SkipLink } from "@/components/layout/skip-link";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// Departure Mono (OFL): hanya untuk grid huruf dan angka, tidak pernah untuk paragraf.
const departure = localFont({
  src: "./fonts/DepartureMono-Regular.woff2",
  variable: "--font-departure",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: find places to eat`, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: `${SITE_NAME}: find places to eat`,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f2" },
    { media: "(prefers-color-scheme: dark)", color: "#121216" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Apply the animation preference before first paint to avoid flicker.
const themeScript = `try{var t=localStorage.getItem("restoo-theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}`;
const motionScript = `try{if(localStorage.getItem("restoo-motion")==="off")document.documentElement.dataset.motion="off"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={departure.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript + motionScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <SkipLink />
        <SerwistProvider
          swUrl="/serwist/sw.js"
          disable={process.env.NODE_ENV === "development"}
        >
          <RouteProgress />
          <ScrollReveal />
          {children}
        </SerwistProvider>
        <OfflineIndicator />
      </body>
    </html>
  );
}
