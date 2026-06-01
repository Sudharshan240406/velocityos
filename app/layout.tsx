import type { Metadata } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PWARegister } from "@/components/pwa-register";

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
    "VelocityOS is an automotive-inspired supercar digital cockpit focus timer built for deep work and Pomodoro sprints.",
  applicationName: "VelocityOS",
  keywords: [
    "VelocityOS",
    "pomodoro app",
    "productivity platform",
    "deep work",
    "focus timer",
    "racing timer",
  ],
  alternates: {
    canonical: "https://velocityos.app",
  },
  openGraph: {
    title: "VelocityOS",
    description: "Ultimate Automotive Pomodoro Timer",
    url: "https://velocityos.app",
    siteName: "VelocityOS",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "VelocityOS supercar-inspired focus timer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VelocityOS",
    description: "Ultimate Automotive Pomodoro Timer",
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
              "description": "VelocityOS is an automotive-inspired supercar digital cockpit focus timer built for deep work and Pomodoro sprints.",
              "applicationCategory": "ProductivityApplication",
              "operatingSystem": "All",
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
            }),
          }}
        />
      </head>
      <body className="min-h-full bg-slate-950 text-white">
        <Providers>
          {children}
          <PWARegister />
        </Providers>
      </body>
    </html>
  );
}
