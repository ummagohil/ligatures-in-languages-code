"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Globe, LogOut, Settings, Star, Trash2, Copy, Check } from "lucide-react"

interface Translation {
  id: string
  source_text: string
  translated_text: string
  source_language: string
  target_language: string
  is_favorite: boolean
  created_at: string
}

interface TranslationHistoryProps {
  translations: Translation[]
}

export default function TranslationHistory({ translations }: TranslationHistoryProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [copied, setCopied] = useState<string | null>(null)

  // Filter translations based on search term
  const filteredTranslations = translations.filter((translation) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      translation.source_text.toLowerCase().includes(searchLower) ||
      translation.translated_text.toLowerCase().includes(searchLower)
    )
  })

  // Group by favorites and all
  const favorites = filteredTranslations.filter((t) => t.is_favorite)

  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("translations").update({ is_favorite: !currentStatus }).eq("id", id)

      if (error) throw error

      // Update local state
      router.refresh()

      toast({
        title: currentStatus ? "Removed from favorites" : "Added to favorites",
        description: "Your translation history has been updated",
      })
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("translations").delete().eq("id", id)

      if (error) throw error

      // Update local state
      router.refresh()

      toast({
        title: "Translation deleted",
        description: "The translation has been removed from your history",
      })
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Get language name from code
  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      ar: "Arabic",
      bn: "Bengali",
      hi: "Hindi",
      ja: "Japanese",
      ko: "Korean",
      ta: "Tamil",
      th: "Thai",
      zh: "Chinese",
      en: "English",
      fr: "French",
      de: "German",
      es: "Spanish",
      ru: "Russian",
    }
    return languages[code] || code
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
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Translator
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
          <CardHeader>
            <CardTitle>Translation History</CardTitle>
            <CardDescription>View and manage your past translations</CardDescription>
            <div className="mt-4">
              <Input
                placeholder="Search translations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Translations</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {filteredTranslations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {searchTerm ? "No translations match your search" : "No translations yet"}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filteredTranslations.map((translation) => (
                      <Card key={translation.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm text-muted-foreground">
                              {getLanguageName(translation.source_language)} →{" "}
                              {getLanguageName(translation.target_language)}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleFavorite(translation.id, translation.is_favorite)}
                              >
                                <Star
                                  className={`h-4 w-4 ${translation.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`}
                                />
                                <span className="sr-only">
                                  {translation.is_favorite ? "Remove from favorites" : "Add to favorites"}
                                </span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(translation.id)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="relative p-3 border rounded-md">
                              <div className="text-sm font-medium mb-1">Source</div>
                              <p>{translation.source_text}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2"
                                onClick={() => handleCopy(translation.source_text, `source-${translation.id}`)}
                              >
                                {copied === `source-${translation.id}` ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                                <span className="sr-only">Copy source</span>
                              </Button>
                            </div>

                            <div className="relative p-3 border rounded-md">
                              <div className="text-sm font-medium mb-1">Translation</div>
                              <p>{translation.translated_text}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2"
                                onClick={() => handleCopy(translation.translated_text, `translation-${translation.id}`)}
                              >
                                {copied === `translation-${translation.id}` ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                                <span className="sr-only">Copy translation</span>
                              </Button>
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-muted-foreground">{formatDate(translation.created_at)}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="favorites">
                {favorites.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {searchTerm ? "No favorite translations match your search" : "No favorite translations yet"}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {favorites.map((translation) => (
                      <Card key={translation.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm text-muted-foreground">
                              {getLanguageName(translation.source_language)} →{" "}
                              {getLanguageName(translation.target_language)}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleFavorite(translation.id, translation.is_favorite)}
                              >
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="sr-only">Remove from favorites</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(translation.id)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="relative p-3 border rounded-md">
                              <div className="text-sm font-medium mb-1">Source</div>
                              <p>{translation.source_text}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2"
                                onClick={() => handleCopy(translation.source_text, `source-${translation.id}`)}
                              >
                                {copied === `source-${translation.id}` ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                                <span className="sr-only">Copy source</span>
                              </Button>
                            </div>

                            <div className="relative p-3 border rounded-md">
                              <div className="text-sm font-medium mb-1">Translation</div>
                              <p>{translation.translated_text}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2"
                                onClick={() => handleCopy(translation.translated_text, `translation-${translation.id}`)}
                              >
                                {copied === `translation-${translation.id}` ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                                <span className="sr-only">Copy translation</span>
                              </Button>
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-muted-foreground">{formatDate(translation.created_at)}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
