"use client"

import { useState } from "react"
import { DashboardLayout } from "./dashboard-layout"
import { DashboardOverview } from "./dashboard-overview"
import { VehicleEntryForm } from "./vehicle-entry-form"
import { VehicleExitForm } from "./vehicle-exit-form"
import { SpaceAvailability } from "./space-availability"
import { TariffManagement } from "./tariff-management"
import { UserManagement } from "./user-management"
import { ReportsView } from "./reports-view"

type View =
  | "dashboard"
  | "entrada"
  | "salida"
  | "cupos"
  | "tarifas"
  | "usuarios"
  | "reportes"

interface User {
  id: number
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

  function renderView() {
    switch (currentView) {
      case "dashboard":
        return <DashboardOverview isAdmin={user.rol_id === 1} />
      case "entrada":
        return <VehicleEntryForm />
      case "salida":
        return <VehicleExitForm />
      case "cupos":
        return <SpaceAvailability />
      case "tarifas":
        return user.rol_id === 1 ? <TariffManagement /> : <DashboardOverview isAdmin={false} />
      case "usuarios":
        return user.rol_id === 1 ? <UserManagement /> : <DashboardOverview isAdmin={false} />
      case "reportes":
        return user.rol_id === 1 ? <ReportsView /> : <DashboardOverview isAdmin={false} />
      default:
        return <DashboardOverview isAdmin={user.rol_id === 1} />
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
