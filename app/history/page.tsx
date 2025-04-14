import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import TranslationHistory from "@/components/translation-history"

export default async function History() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user's translation history
  const { data: translations } = await supabase
    .from("translations")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  return <TranslationHistory translations={translations || []} />
}
