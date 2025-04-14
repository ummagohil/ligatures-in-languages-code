import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import TranslationDashboard from "@/components/translation-dashboard"

export default async function Dashboard() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).single()

  return <TranslationDashboard user={session.user} profile={profile} />
}
