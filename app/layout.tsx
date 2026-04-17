import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css';
import { WhatsAppButton } from "@/components/whatsapp-button"


const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ParkNidus - Giseella Sanchez',
  description: 'Sistema web de control de parqueadero con gestión de entradas, salidas, tarifas y reportes - Desarrollado por Giseella Sanchez',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
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
