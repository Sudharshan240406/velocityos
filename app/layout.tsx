import type { Metadata } from "next";
import Script from "next/script";
import { Orbitron, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PWARegister } from "@/components/pwa-register";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getSupabaseEnv } from "@/lib/env";

const displayFont = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
});

const bodyFont = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://velocityos.app"),
  title: {
    default: "VelocityOS",
    template: "%s | VelocityOS",
  },
  description:
    "VelocityOS is an automotive-inspired deep work platform with a supercar focus dashboard, garage progression, AI coaching, and offline-first productivity.",
  applicationName: "VelocityOS",
  keywords: [
    "VelocityOS",
    "pomodoro app",
    "productivity platform",
    "deep work",
    "focus timer",
    "garage gamification",
  ],
  alternates: {
    canonical: "https://velocityos.app",
  },
  openGraph: {
    title: "VelocityOS",
    description: "Gamified Deep Work for Future Builders",
    url: "https://velocityos.app",
    siteName: "VelocityOS",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "VelocityOS automotive-inspired productivity platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VelocityOS",
    description: "Gamified Deep Work for Future Builders",
    images: ["/twitter-image"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VelocityOS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { gaId } = getSupabaseEnv();

  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "VelocityOS",
              "url": "https://velocityos.app",
              "description": "VelocityOS is an automotive-inspired deep work platform with a supercar focus dashboard, garage progression, AI coaching, and offline-first productivity.",
              "applicationCategory": "ProductivityApplication",
              "operatingSystem": "All",
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
            }),
          }}
        />
      </head>
      <body className="min-h-full">
        <Providers>
          {children}
          <PWARegister />
          <Analytics />
          <SpeedInsights />
        </Providers>
        {gaId ? (
          <>
            <Script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga-boot" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} window.gtag = gtag; gtag('js', new Date()); gtag('config', '${gaId}', { send_page_view: false });`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
