"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "./dashboard-layout"

type View =
  | "dashboard"
  | "entrada"
  | "salida"
  | "cupos"
  | "tarifas"
  | "usuarios"
  | "reportes"

interface User {
  id: string | number
  nombre: string
  email: string
  rol_id: number
  rol_nombre: string
}

interface DashboardClientProps {
  user: User
}

export function DashboardClient({ user }: DashboardClientProps) {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const router = useRouter()

  function renderView() {
    switch (currentView) {
      case "dashboard":
        return <div className="text-2xl font-bold text-slate-900 p-8">Dashboard Overview - Cupos y Estadísticas</div>
      case "entrada":
        return (
          <iframe 
            src="/dashboard/entrada" 
            className="w-full h-[80vh] border-0 rounded-xl card-neon"
            title="Entrada de Vehículos"
          />
        )
      case "salida":
        return (
          <iframe 
            src="/dashboard/salida" 
            className="w-full h-[80vh] border-0 rounded-xl card-neon"
            title="Salida de Vehículos"
          />
        )
      case "cupos":
        return <div>Cupos Disponibles - Consulta espacios</div>
      case "tarifas":
        return user.rol_id === 1 ? <div>Tarifas Management</div> : <div>No autorizado</div>
      case "usuarios":
        return user.rol_id === 1 ? <div>User Management</div> : <div>No autorizado</div>
      case "reportes":
        return user.rol_id === 1 ? <div>Reports</div> : <div>No autorizado</div>
      default:
        return <div>Dashboard Overview</div>
    }
  }

  return (
    <DashboardLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      user={user}
    >
      {renderView()}
    </DashboardLayout>
  )
}
