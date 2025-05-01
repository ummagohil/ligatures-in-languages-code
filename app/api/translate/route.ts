import { NextResponse } from "next/server";
import { getMCPModelForLanguagePair } from "@/lib/mcp-config";

export async function POST(request: Request) {
  try {
    const { sourceText, sourceLang, targetLang } = await request.json();

    if (!sourceText || !sourceLang || !targetLang) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the appropriate model from MCP config
    const mcpModel = getMCPModelForLanguagePair(sourceLang, targetLang);

    // If no specific model is found, use the generic format
    const modelName = mcpModel
      ? mcpModel.modelId
      : `Helsinki-NLP/opus-mt-${sourceLang}-${targetLang}`;

    // Call Hugging Face API for translation
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${modelName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY || ""}`,
        },
        body: JSON.stringify({
          inputs: sourceText,
          options: {
            wait_for_model: true,
            use_cache: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: "Translation failed", details: error },
        { status: 500 }
      );
    }

    const result = await response.json();
    const translatedText = Array.isArray(result)
      ? result[0].translation_text
      : result.generated_text;

    return NextResponse.json({ translatedText, modelUsed: modelName });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
