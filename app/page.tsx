import { redirect } from "next/navigation"
import { getServerUser } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"

export default async function Page() {
  const user = await getServerUser()
  if (user) {
    redirect("/dashboard")
  }
  return <LoginForm />
}
