import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TranslationDashboard from "./translation-dashboard";
import { describe, it, expect, vi } from "vitest";

// Mock the fetch API
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

describe("TranslationDashboard", () => {
  it("renders without crashing", () => {
    render(<TranslationDashboard />);
    expect(screen.getByText("Ligatures in Languages")).toBeInTheDocument();
  });

  it("translates text when the translate button is clicked", async () => {
    render(<TranslationDashboard />);

    const input = screen.getByPlaceholderText("Enter text to translate");
    const button = screen.getByText("Translate");

    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.click(button);

    const translatedText = await screen.findByDisplayValue("Translated text");
    expect(translatedText).toBeInTheDocument();
  });

  it("swaps languages when the swap button is clicked", async () => {
    render(<TranslationDashboard />);

    const swapButton = screen.getByRole("button", { name: /swap languages/i });
    fireEvent.click(swapButton);

    const sourceLang = await screen.findByDisplayValue("English");
    const targetLang = await screen.findByDisplayValue("Arabic");

    expect(sourceLang).toBeInTheDocument();
    expect(targetLang).toBeInTheDocument();
  });
});
