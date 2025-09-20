import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthGuard } from "@/components/auth-guard"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Shiv Accounts Dashboard",
  description: "Professional accounting software for your business",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthGuard>{children}</AuthGuard>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
