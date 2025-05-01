"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, RotateCcw, Globe } from "lucide-react";

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
];

export default function TranslationDashboard() {
  const { toast } = useToast();

  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("ar");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);

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
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Translation failed");
      }

      setTranslatedText(data.translatedText);
    } catch (error: any) {
      toast({
        title: "Translation failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-center py-4">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6" />
            <span className="text-xl font-bold">Ligatures in Languages</span>
          </div>
        </div>
      </header>

      <main className="container py-6 grid justify-center">
        <Card className="max-h-[600px]">
          <CardContent className="p-4">
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSwapLanguages}
                >
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
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Enter text to translate"
                    className="min-h-[200px] cursor-text"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="relative">
                    <Textarea
                      value={translatedText}
                      readOnly
                      placeholder="Translation will appear here"
                      className="min-h-[200px] cursor-text"
                    />
                    {translatedText && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copy to clipboard</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <Button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="w-full hover:cursor-pointer"
              >
                {isTranslating ? "Translating..." : "Translate"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
