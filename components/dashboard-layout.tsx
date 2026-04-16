"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Car,
  LogOut,
  LayoutDashboard,
  LogIn as LogInIcon,
  LogOut as LogOutIcon,
  ParkingSquare,
  DollarSign,
  Users,
  BarChart3,
  Menu,
  X,
} from "lucide-react"
import { WhatsAppButton } from "./whatsapp-button"

interface User {
  id: number
  nombre: string
  email: string
  rol_id: number
  rol_nombre: string
}

type View =
  | "dashboard"
  | "entrada"
  | "salida"
  | "cupos"
  | "tarifas"
  | "usuarios"
  | "reportes"

interface DashboardLayoutProps {
  children: React.ReactNode
  currentView: View
  onViewChange: (view: View) => void
  user: User | null
}

const operarioMenu: { view: View; label: string; icon: React.ReactNode }[] = [
  { view: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { view: "entrada", label: "Registrar Entrada", icon: <LogInIcon className="h-5 w-5" /> },
  { view: "salida", label: "Registrar Salida", icon: <LogOutIcon className="h-5 w-5" /> },
  { view: "cupos", label: "Consultar Cupos", icon: <ParkingSquare className="h-5 w-5" /> },
]

const adminMenu: { view: View; label: string; icon: React.ReactNode }[] = [
  { view: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { view: "tarifas", label: "Gestion de Tarifas", icon: <DollarSign className="h-5 w-5" /> },
  { view: "usuarios", label: "Gestion de Usuarios", icon: <Users className="h-5 w-5" /> },
  { view: "reportes", label: "Reportes", icon: <BarChart3 className="h-5 w-5" /> },
  { view: "entrada", label: "Registrar Entrada", icon: <LogInIcon className="h-5 w-5" /> },
  { view: "salida", label: "Registrar Salida", icon: <LogOutIcon className="h-5 w-5" /> },
  { view: "cupos", label: "Consultar Cupos", icon: <ParkingSquare className="h-5 w-5" /> },
]

export function DashboardLayout({ children, currentView, onViewChange, user }: DashboardLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const menu = user?.rol_id === 1 ? adminMenu : operarioMenu

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }, [router])

  useEffect(() => {
    setSidebarOpen(false)
  }, [currentView])

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => { if (e.key === "Escape") setSidebarOpen(false) }}
          role="button"
          tabIndex={0}
          aria-label="Cerrar menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Car className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold text-sidebar-foreground">ParkControl</h1>
            <p className="text-xs text-sidebar-foreground/60">Sistema de Parqueadero</p>
          </div>
          <button
            className="ml-auto lg:hidden text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-1">
            {menu.map((item) => (
              <button
                key={item.view}
                onClick={() => onViewChange(item.view)}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                  currentView === item.view
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 flex flex-col gap-0.5">
            <p className="text-sm font-medium text-sidebar-foreground">{user?.nombre}</p>
            <p className="text-xs text-sidebar-foreground/60">{user?.rol_nombre}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent bg-transparent"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesion
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <button
            className="lg:hidden text-foreground"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold text-foreground">
            {menu.find((m) => m.view === currentView)?.label || "Dashboard"}
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      <WhatsAppButton />
    </div>
  )
}
