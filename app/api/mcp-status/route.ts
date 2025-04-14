import { NextResponse } from "next/server"
import { mcpModels } from "@/lib/mcp-config"

export async function GET() {
  try {
    // Check the status of all models in the MCP configuration
    const modelStatuses = await Promise.all(
      mcpModels.map(async (model) => {
        try {
          const response = await fetch(`https://api-inference.huggingface.co/models/${model.modelId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY || ""}`,
            },
          })

          const status = await response.json()

          return {
            modelId: model.modelId,
            status: response.ok ? "available" : "error",
            details: status,
            supportedLanguagePairs: model.supportedLanguagePairs,
            specialization: model.specialization,
          }
        } catch (error) {
          return {
            modelId: model.modelId,
            status: "error",
            error: "Failed to fetch model status",
            supportedLanguagePairs: model.supportedLanguagePairs,
            specialization: model.specialization,
          }
        }
      }),
    )

    return NextResponse.json({
      status: "operational",
      models: modelStatuses,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: "Failed to check MCP status",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
