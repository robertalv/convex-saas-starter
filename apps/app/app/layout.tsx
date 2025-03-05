import { Geist, Geist_Mono } from "next/font/google"
import { fetchQuery } from 'convex/nextjs';
import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from '@workspace/backend/convex/_generated/api';
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"
import ConvexClientProvider from "@/components/providers/convex-client-provider";

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
  const isAuthenticated = isAuthenticatedNextjs();
  const user = await fetchQuery(
    api.users.viewer,
    {},
    { token: convexAuthNextjsToken() },
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>
          <ConvexAuthNextjsServerProvider>
            <ConvexClientProvider>
              {children}
            </ConvexClientProvider>
          </ConvexAuthNextjsServerProvider>
        </Providers>
      </body>
    </html>
  )
}
