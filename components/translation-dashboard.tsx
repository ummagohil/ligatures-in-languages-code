"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Copy, Check, RotateCcw, LogOut, History, Settings, Globe } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { MCPStatus } from "./mcp-status"

// Supported languages with ligatures
const LANGUAGES = [
  { code: "ar", name: "Arabic" },
  { code: "bn", name: "Bengali" },
  { code: "hi", name: "Hindi" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ta", name: "Tamil" },
  { code: "th", name: "Thai" },
  { code: "zh", name: "Chinese" },
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
  { code: "ru", name: "Russian" },
]

interface TranslationDashboardProps {
  user: User
  profile: any
}

export default function TranslationDashboard({ user, profile }: TranslationDashboardProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const [sourceText, setSourceText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [sourceLang, setSourceLang] = useState(profile?.preferred_source_language || "en")
  const [targetLang, setTargetLang] = useState(profile?.preferred_target_language || "ar")
  const [isTranslating, setIsTranslating] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleTranslate = async () => {
    if (!sourceText.trim()) return

    setIsTranslating(true)

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceText,
          sourceLang,
          targetLang,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Translation failed")
      }

      setTranslatedText(data.translatedText)

      // Update user preferences if they've changed
      if (sourceLang !== profile?.preferred_source_language || targetLang !== profile?.preferred_target_language) {
        await supabase
          .from("user_profiles")
          .update({
            preferred_source_language: sourceLang,
            preferred_target_language: targetLang,
          })
          .eq("id", user.id)
      }
    } catch (error: any) {
      toast({
        title: "Translation failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsTranslating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSwapLanguages = () => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setSourceText(translatedText)
    setTranslatedText(sourceText)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6" />
            <span className="text-xl font-bold">Ligature Translator</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/history")}>
              <History className="h-5 w-5" />
              <span className="sr-only">History</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push("/settings")}>
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Sign out</span>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container flex-1 py-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid gap-2">
                  <Select value={sourceLang} onValueChange={setSourceLang}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Source language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="icon" onClick={handleSwapLanguages}>
                  <RotateCcw className="h-4 w-4" />
                  <span className="sr-only">Swap languages</span>
                </Button>
                <div className="grid gap-2">
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Target language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Textarea
                    placeholder="Enter text to translate"
                    className="min-h-[200px] resize-none"
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="relative">
                    <Textarea
                      placeholder="Translation will appear here"
                      className="min-h-[200px] resize-none"
                      value={translatedText}
                      readOnly
                    />
                    {translatedText && (
                      <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="sr-only">Copy to clipboard</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Button onClick={handleTranslate} disabled={isTranslating || !sourceText.trim()} className="w-full">
                {isTranslating ? "Translating..." : "Translate"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <MCPStatus />
        </div>
      </main>
    </div>
  )
}
