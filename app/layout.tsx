import type React from "react"
import type { Metadata } from "next"
import { Geist, Poppins } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })
const poppins = Poppins({ weight: ["400", "500", "600", "700", "800"], subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LR(1) Parser Analyzer",
  description: "Analiza gramáticas y cadenas usando el método LR(1)",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${geist.className}`}>{children}</body>
    </html>
  )
}
