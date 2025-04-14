"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle } from "lucide-react"

interface MCPStatusProps {
  className?: string
}

interface ModelStatus {
  modelId: string
  status: "available" | "error"
  supportedLanguagePairs: Array<{
    source: string
    target: string
  }>
  specialization?: string
}

interface MCPStatusData {
  status: "operational" | "error"
  models: ModelStatus[]
  timestamp: string
}

export function MCPStatus({ className }: MCPStatusProps) {
  const [status, setStatus] = useState<MCPStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/mcp-status")
        if (!response.ok) {
          throw new Error("Failed to fetch MCP status")
        }
        const data = await response.json()
        setStatus(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          MCP Server Status
          {!loading &&
            status &&
            (status.status === "operational" ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ))}
        </CardTitle>
        <CardDescription>Model Control Protocol server status for translation models</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : status ? (
          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium">System Status</div>
              <Badge variant={status.status === "operational" ? "outline" : "destructive"} className="w-fit">
                {status.status === "operational" ? "Operational" : "Error"}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Ligature Language Models</div>
              <div className="grid gap-2">
                {status.models
                  .filter((model) => model.specialization === "ligature")
                  .map((model) => (
                    <div key={model.modelId} className="flex items-center justify-between text-sm">
                      <div>
                        {model.supportedLanguagePairs.map((pair) => (
                          <span key={`${pair.source}-${pair.target}`}>
                            {getLanguageName(pair.source)} → {getLanguageName(pair.target)}
                          </span>
                        ))}
                      </div>
                      <Badge variant={model.status === "available" ? "outline" : "destructive"} className="w-fit">
                        {model.status === "available" ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(status.timestamp).toLocaleString()}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
