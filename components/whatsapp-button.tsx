"use client"

import { MessageCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function WhatsAppButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href="https://wa.me/573173737373?text=Hola%21%20Necesito%20ayuda%20con%20ParkNidus"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-[100] flex size-16 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95 group"
            style={{
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              boxShadow: '0 10px 30px rgba(37, 211, 102, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              border: 'none'
            }}
          >
            <MessageCircle className="size-9 text-white drop-shadow-lg group-hover:animate-bounce" />
          </a>
        </TooltipTrigger>
        <TooltipContent side="left" className="card-neon text-glow-lime border-cyan-500/50">
          <p>Soporte Técnico ParkNidus</p>
          <p className="text-xs opacity-75">En línea 24/7</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

