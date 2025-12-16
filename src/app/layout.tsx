import type { Metadata } from "next"
import "./globals.css"
import SiteHeader from "@/components/SiteHeader"
import SiteFooter from "@/components/SiteFooter"
import ThemeProvider from "@/components/ThemeProvider"

export const metadata: Metadata = {
  title: "XV Kanteerava",
  description: "XV Kanteerava — Open Scout Unit | Since 1950",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="xvk-watermark">
        <ThemeProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  )
}
