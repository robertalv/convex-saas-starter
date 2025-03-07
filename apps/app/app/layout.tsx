import { Geist, Geist_Mono } from "next/font/google"
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"
import ConvexClientProvider from "@/components/providers/convex-client-provider";
import { Toaster } from "@workspace/ui/components/sonner";


const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
        >
          <Providers>
            <ConvexClientProvider>
              {children}
              <Toaster />
            </ConvexClientProvider>
          </Providers>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  )
}
