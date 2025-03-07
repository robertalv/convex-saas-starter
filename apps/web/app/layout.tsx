import { Geist, Geist_Mono } from "next/font/google"
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"
import ConvexClientProvider from "./convex-client-provider";
import { Metadata } from "next";
import { baseUrl } from "./sitemap";
import { cn } from "@workspace/ui/lib/utils";
import { Header } from "@/components/header";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Convex Saas Starter",
    template: "%s | Convex Saas Starter",
  },
  description:
    "Convex Saas Starter is a template for building SaaS applications on Convex.",
  openGraph: {
    title: "Convex Saas Starter",
    description:
      "Convex Saas Starter is a template for building SaaS applications on Convex.",
    url: baseUrl,
    siteName:
      "Convex Saas Starter is a template for building SaaS applications on Convex.",
    locale: "en_US",
    type: "website",
    // TODO: Create images
    // images: [
    //   {
    //     url: "https://cdn.midday.ai/opengraph-image.jpg",
    //     width: 800,
    //     height: 600,
    //   },
    //   {
    //     url: "https://cdn.midday.ai/opengraph-image.jpg",
    //     width: 1800,
    //     height: 1600,
    //   },
    // ],
  },
  twitter: {
    title: "Convex Saas Starter",
    description:
      "Convex Saas Starter is a template for building SaaS applications on Convex.",
    // TODO: Create images
    // images: [
    //   {
    //     url: "https://cdn.midday.ai/opengraph-image.jpg",
    //     width: 800,
    //     height: 600,
    //   },
    //   {
    //     url: "https://cdn.midday.ai/opengraph-image.jpg",
    //     width: 1800,
    //     height: 1600,
    //   },
    // ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)" },
    { media: "(prefers-color-scheme: dark)" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            `${fontSans.variable} ${fontMono.variable}`,
            "bg-[#fbfbfb] dark:bg-[#0C0C0C] overflow-x-hidden antialiased",
          )}
        >
          <Providers>
            <ConvexClientProvider>
              <Header />
                <main className="container mx-auto px-4 overflow-hidden md:overflow-visible">
                  {children}
                </main>
            </ConvexClientProvider>
          </Providers>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  )
}
