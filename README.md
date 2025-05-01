# 🗣️ Ligatures in Languages

This app is an experiment into how NLP models translate texts from non-ligature languages to ligature languages. Currently it is using a popular Hugging Face model to translate languages such as Russian, Arabic, Hindi and Chinese.

## 🤗 Hugging Face

Within this application, there is experimentation with MCP however this is not the main focus of the functionality for translations. The Hugging Face model being used here is the popular Helsinki-NLP. This isn't the most efficient model and there are probably smaller ones that could do the translations a lot faster but for learning purposes this is the one that is used within the application.

The `sourceLang` and `targetLang` are the values that are taken from the dropdown menus that the user selects.

```ts
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
```

This is the api for the MCP model, the functionality is limited and is used for experimenting purposes only. Not a real world scenario of MCP.

```ts
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
];

export function getMCPModelForLanguagePair(
  source: string,
  target: string
): MCPModelConfig | null {
  return (
    mcpModels.find((model) =>
      model.supportedLanguagePairs.some(
        (pair) => pair.source === source && pair.target === target
      )
    ) || null
  );
}
```

## 🗺️ Translation Component

The main focus of the application is the `translation-dashboard` component. The functionality for the translate takes place on the `onClick` handler with the `handleTranslate` function. The application uses Reacts `setState` to track value changes. The values are posted to the API via the route to the model. As stated above, the response posts the `body` and this is the text the user is trying to translate.

```ts
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
```

Swapping languages is set by the state and this data is sent to the api too.

```ts
const handleSwapLanguages = () => {
  setSourceLang(targetLang);
  setTargetLang(sourceLang);
  setSourceText(translatedText);
  setTranslatedText(sourceText);
};
```

## 🧪 Testing

`npm run test`

Vitest has been set up to handle unit tests within the application. The only current test is `translation-dashboard` and one of the them is currently failing. This is what the current config and set up looks like, all unit tests are within the same folder as the component being tested.

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
  },
});
```

```ts
// vitest.setup.ts
import "@testing-library/jest-dom";
```

The API is mocked within the unit test to check if the translations do work if an action is fired to the button.

```ts
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ translatedText: "Translated text" }),
    ok: true,
    headers: new Headers(),
    redirected: false,
    status: 200,
    statusText: "OK",
    type: "basic",
    url: "",
    clone: () => ({} as Response),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(""),
  } as Response)
);
```

```ts
it("translates text when the translate button is clicked", async () => {
  render(<TranslationDashboard />);

  const input = screen.getByPlaceholderText("Enter text to translate");
  const button = screen.getByText("Translate");

  fireEvent.change(input, { target: { value: "Hello" } });
  fireEvent.click(button);

  const translatedText = await screen.findByDisplayValue("Translated text");
  expect(translatedText).toBeInTheDocument();
});
```

The test that currently fails is the swapping over languages - the functionality of this within the application is a small button click however this also triggers state changes of the values in both input boxes and is not something that is currently mocked within the test suite.

```ts
it("swaps languages when the swap button is clicked", async () => {
  render(<TranslationDashboard />);

  const swapButton = screen.getByRole("button", { name: /swap languages/i });
  fireEvent.click(swapButton);

  const sourceLang = await screen.findByDisplayValue("English");
  const targetLang = await screen.findByDisplayValue("Arabic");

  expect(sourceLang).toBeInTheDocument();
  expect(targetLang).toBeInTheDocument();
});
```

## 🧠 Other Considerations

### MCP

It would be nice in the future to better understand how MCP could be used within a small application like this.

### Supabase

Although this app was created with a Supabase integration, it has been taken out. The files for the functionality have been left in if you would like to view them and maybe a feature to look at bring back if there are users who use the app.
