import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import AuthForm from "@/components/auth-form"

export default async function Login() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthForm />
    </div>
  )
}
