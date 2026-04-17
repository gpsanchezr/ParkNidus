import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css';
import { WhatsAppButton } from "@/components/whatsapp-button"


const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "ParkNidus",
  description: "Sistema de Control de Parqueadero SENA",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚗</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
<html lang="es" suppressHydrationWarning={true}>
<body className="font-sans antialiased" suppressHydrationWarning={true}>
        {children}
        <WhatsAppButton />
        <script suppressHydrationWarning dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const style = document.createElement('style');
              style.textContent = 'html { scroll-behavior: smooth; } body { overscroll-behavior: none; }';
              document.head.appendChild(style);
            })();
          `
        }} />
      </body>
    </html>
  )
}
