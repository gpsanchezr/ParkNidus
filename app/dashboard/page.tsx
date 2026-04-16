import { redirect } from "next/navigation"
import { getServerUser } from "@/lib/auth"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage() {
  const user = await getServerUser()
  if (!user) {
    redirect("/")
  }
  return <DashboardClient user={user} />
}
