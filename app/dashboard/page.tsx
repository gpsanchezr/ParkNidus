import { getServerUser } from "@/lib/auth"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage() {
  console.log('--- INTENTANDO CARGAR DASHBOARD ---')
  const user = await getServerUser()
  console.log('Usuario encontrado:', user ? 'SÍ' : 'NO')
  
  if (!user) {
    console.log('No user - mostrando error en lugar de redirect')
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="card-neon p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-glow-red mb-4">Error: No se encontró sesión</h1>
          <p className="text-glow-violet mb-6">Cookie de sesión no encontrada o expirada.</p>
          <a href="/" className="btn-primary">
            Volver al Login
          </a>
        </div>
      </div>
    )
  }
  
  return <DashboardClient user={user} />
}
