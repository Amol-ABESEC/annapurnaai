import { streamText } from "ai";
import { z } from "zod";
import { generateFallbackAssistantReply } from "../utils/aiAssistantEngine";

export const ChatInput = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(4000),
    })
  ).min(1).max(24),
  pantry: z.array(z.string()).max(200).default([]),
  recipeTitle: z.string().max(200).optional(),
});

export type ChatInputType = z.infer<typeof ChatInput>;

export async function askChefHandler(data: ChatInputType) {
  const lastUserMsg = data.messages.filter((m) => m.role === "user").pop()?.content || "";

  const key = process.env["LOVABLE_API_KEY"];
  if (key) {
    try {
      const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
      const gateway = createLovableAiGatewayProvider(key);

      const system = [
        "You are Annapurna, a warm, sharp Indian home-cooking chef assistant.",
        "You speak in friendly Hinglish-flavoured English, short and practical.",
        "Give exact quantities, heat levels and timings for recipes. Suggest desi substitutes when something is missing.",
        "If asked general knowledge or non-culinary questions (like 'who is pm of india'), answer accurately and politely, then warmly pivot back to food.",
        "Keep answers under 180 words unless the user asks for a full recipe. Use short bullet lists.",
        data.pantry.length ? `The user's pantry right now: ${data.pantry.join(", ")}.` : "",
        data.recipeTitle ? `They are currently looking at the recipe: ${data.recipeTitle}.` : "",
      ]
        .filter(Boolean)
        .join(" ");

      const result = streamText({
        model: gateway("google/gemini-3.6-flash"),
        system,
        messages: data.messages,
      });
      return { reply: await result.text };
    } catch (error) {
      console.warn("Lovable AI Gateway error, falling back to Gemini/Local Engine:", error);
    }
  }

  // Check for OpenRouter API Key
  const openRouterKey = process.env["OPENROUTER_API_KEY"] || process.env["OPEN_ROUTER_API_KEY"];
  const system = [
    "You are Annapurna, a warm, sharp Indian home-cooking chef assistant.",
    "You speak in friendly Hinglish-flavoured English, short and practical.",
    "Give exact quantities, heat levels and timings for recipes. Suggest desi substitutes when something is missing.",
    "If asked general knowledge or non-culinary questions (like 'who is pm of india'), answer accurately and politely, then warmly pivot back to food.",
    "Keep answers under 180 words unless the user asks for a full recipe. Use short bullet lists.",
    data.pantry.length ? `The user's pantry right now: ${data.pantry.join(", ")}.` : "",
    data.recipeTitle ? `They are currently looking at the recipe: ${data.recipeTitle}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (openRouterKey && openRouterKey.trim() !== "" && openRouterKey !== "MY_OPENROUTER_API_KEY") {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey.trim()}`,
          "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
          "X-OpenRouter-Title": "Annapurna AI Assistant",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openrouter/auto",
          messages: [
            { role: "system", content: system },
            ...data.messages.map((m) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content,
            })),
          ],
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        const reply = resData.choices?.[0]?.message?.content;
        if (reply) return { reply };
      } else {
        // Retry with google/gemini-2.0-flash-001 if auto fails
        const fallbackRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterKey.trim()}`,
            "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
            "X-OpenRouter-Title": "Annapurna AI Assistant",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-001",
            messages: [
              { role: "system", content: system },
              ...data.messages.map((m) => ({
                role: m.role === "assistant" ? "assistant" : "user",
                content: m.content,
              })),
            ],
            temperature: 0.7,
          }),
        });

        if (fallbackRes.ok) {
          const resData = await fallbackRes.json();
          const reply = resData.choices?.[0]?.message?.content;
          if (reply) return { reply };
        }
      }
    } catch (openRouterErr) {
      console.warn("OpenRouter call failed in askChefHandler:", openRouterErr);
    }
  }

  // Fallback to Gemini API or built-in engine if LOVABLE_API_KEY and OPENROUTER_API_KEY are not set or failed
  const geminiKey = process.env["GEMINI_API_KEY"];

  if (geminiKey && geminiKey !== "MY_GEMINI_API_KEY" && geminiKey.trim() !== "") {
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const isAccessToken = geminiKey.startsWith('ya29.') || geminiKey.startsWith('ey');
      const headers: Record<string, string> = { 'User-Agent': 'aistudio-build' };
      if (isAccessToken) {
        headers['Authorization'] = `Bearer ${geminiKey}`;
      } else {
        headers['x-goog-api-key'] = geminiKey;
      }

      const ai = new GoogleGenAI({
        apiKey: isAccessToken ? undefined : geminiKey,
        httpOptions: { headers },
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: data.messages.map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
        config: {
          systemInstruction: system,
          temperature: 0.7,
        },
      });

      if (response.text) {
        return { reply: response.text };
      }
    } catch (geminiError) {
      console.warn("Gemini API call failed, falling back to smart local chef engine:", geminiError);
    }
  }

  // Smart domain-driven fallback response
  const fallbackReply = generateFallbackAssistantReply(
    lastUserMsg,
    data.recipeTitle ? { title: data.recipeTitle } : null,
    data.pantry,
    data.messages
  );

  return { reply: fallbackReply };
}
