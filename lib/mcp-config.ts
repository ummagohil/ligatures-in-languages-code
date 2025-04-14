// MCP (Model Control Protocol) Configuration
// This allows for better management of Hugging Face models

export interface MCPModelConfig {
  modelId: string
  version: string
  maxTokens: number
  supportedLanguagePairs: Array<{
    source: string
    target: string
  }>
  specialization?: string
}

export const mcpModels: MCPModelConfig[] = [
  {
    modelId: "Helsinki-NLP/opus-mt-ar-en",
    version: "1.0",
    maxTokens: 512,
    supportedLanguagePairs: [{ source: "ar", target: "en" }],
    specialization: "ligature",
  },
  {
    modelId: "Helsinki-NLP/opus-mt-en-ar",
    version: "1.0",
    maxTokens: 512,
    supportedLanguagePairs: [{ source: "en", target: "ar" }],
    specialization: "ligature",
  },
  {
    modelId: "Helsinki-NLP/opus-mt-hi-en",
    version: "1.0",
    maxTokens: 512,
    supportedLanguagePairs: [{ source: "hi", target: "en" }],
    specialization: "ligature",
  },
  {
    modelId: "Helsinki-NLP/opus-mt-en-hi",
    version: "1.0",
    maxTokens: 512,
    supportedLanguagePairs: [{ source: "en", target: "hi" }],
    specialization: "ligature",
  },
  // Add more language pairs as needed
]

export function getMCPModelForLanguagePair(source: string, target: string): MCPModelConfig | null {
  return (
    mcpModels.find((model) =>
      model.supportedLanguagePairs.some((pair) => pair.source === source && pair.target === target),
    ) || null
  )
}

export function getAllSupportedLanguages(): string[] {
  const languages = new Set<string>()

  mcpModels.forEach((model) => {
    model.supportedLanguagePairs.forEach((pair) => {
      languages.add(pair.source)
      languages.add(pair.target)
    })
  })

  return Array.from(languages)
}
