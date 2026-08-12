import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { generateFallbackAssistantReply, isCulinaryQuery } from "./src/utils/aiAssistantEngine";
import { MONGO_RECIPE_COLLECTION, getMongoDbStats, updateMongoRecipeCollection } from "./src/data/mongoRecipeStore";
import { RAW_INDIAN_RECIPES_105 } from "./src/data/indianRecipes105";
import { loadRecipesFromCSV } from "./src/server/recipeLoader";
import { askChefHandler, ChatInput } from "./src/lib/chef.functions";

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    // Ensure we have a real key and not the placeholder from .env.example
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      const headers: Record<string, string> = {
        'User-Agent': 'aistudio-build',
      };

      // Detect if the key is an OAuth/Bearer token (e.g. ya29. or ey...)
      const isAccessToken = apiKey.startsWith('ya29.') || apiKey.startsWith('ey');

      if (isAccessToken) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      } else {
        headers['x-goog-api-key'] = apiKey;
      }

      aiClient = new GoogleGenAI({
        apiKey: isAccessToken ? undefined : apiKey,
        httpOptions: {
          headers,
        },
      });
    }
  }
  return aiClient;
}

// API Health Check
app.get("/api/health", (_req, res) => {
  const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY;
  res.json({
    status: "ok",
    database: "MongoDB Document Engine",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasOpenRouterKey: Boolean(openRouterKey && openRouterKey.trim() !== ""),
    timestamp: new Date().toISOString(),
  });
});

// MongoDB Database Status endpoint
app.get("/api/db/status", (_req, res) => {
  res.json(getMongoDbStats());
});

// MongoDB Recipe Collection Query endpoint
app.get("/api/recipes", (req, res) => {
  try {
    const { search, dietType, cuisine, maxTime } = req.query;

    let results = [...MONGO_RECIPE_COLLECTION];

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      results = results.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.ingredients.some(i => i.name.toLowerCase().includes(q) || i.regionalName.toLowerCase().includes(q))
      );
    }

    if (dietType && typeof dietType === 'string' && dietType !== 'all') {
      if (dietType === 'vegetarian') {
        results = results.filter(r => r.isVegetarian);
      } else if (dietType === 'non-veg') {
        results = results.filter(r => !r.isVegetarian);
      }
    }

    if (cuisine && typeof cuisine === 'string' && cuisine !== 'all') {
      results = results.filter(r => r.cuisine.toLowerCase() === cuisine.toLowerCase());
    }

    if (maxTime && !isNaN(Number(maxTime))) {
      const timeLimit = Number(maxTime);
      results = results.filter(r => (r.prepTimeMinutes + r.cookTimeMinutes) <= timeLimit);
    }

    res.json({
      success: true,
      count: results.length,
      totalInDatabase: MONGO_RECIPE_COLLECTION.length,
      collectionName: "recipes",
      documents: results,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch MongoDB recipes", details: err?.message });
  }
});

// GET single recipe by MongoDB _id or id
app.get("/api/recipes/:id", (req, res) => {
  const { id } = req.params;
  const recipe = MONGO_RECIPE_COLLECTION.find(r => r._id === id || r.id === id || r.mongoId === id);
  if (!recipe) {
    return res.status(404).json({ error: "Recipe document not found in MongoDB collection" });
  }
  res.json({ success: true, document: recipe });
});

// Direct 105 Raw Indian Recipes JSON Array Endpoint
app.get("/api/recipes105", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(RAW_INDIAN_RECIPES_105);
});

// Annapurna AI Floating Chef Assistant endpoint
app.post("/api/chef", async (req, res) => {
  try {
    const parsed = ChatInput.parse(req.body);
    const result = await askChefHandler(parsed);
    res.json(result);
  } catch (err: any) {
    console.error("Annapurna Chef Error:", err);
    res.status(400).json({ error: err?.message || "The chef could not respond right now." });
  }
});

async function callOpenRouter(
  messages: Array<{ role: string; content: string }>,
  systemInstruction?: string
): Promise<string | null> {
  const openRouterKey =
    process.env.OPENROUTER_API_KEY ||
    process.env.OPEN_ROUTER_API_KEY ||
    process.env.VITE_OPENROUTER_API_KEY;

  if (!openRouterKey || openRouterKey.trim() === "" || openRouterKey === "MY_OPENROUTER_API_KEY") {
    return null;
  }

  try {
    const formattedMessages: Array<{ role: string; content: string }> = [];
    if (systemInstruction) {
      formattedMessages.push({ role: "system", content: systemInstruction });
    }
    messages.forEach((m) => {
      formattedMessages.push({
        role: m.role === "assistant" || m.role === "model" ? "assistant" : "user",
        content: m.content,
      });
    });

    // Try openrouter/auto as primary model
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
        messages: formattedMessages,
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return content;
    } else {
      // Fallback model if openrouter/auto returns non-200
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
          messages: formattedMessages,
          temperature: 0.7,
        }),
      });

      if (fallbackRes.ok) {
        const fbData = await fallbackRes.json();
        const fbContent = fbData.choices?.[0]?.message?.content;
        if (fbContent) return fbContent;
      }
    }
    return null;
  } catch (err) {
    console.warn("OpenRouter API Error:", err);
    return null;
  }
}

// AI Chat endpoint for recipe context, substitutes, scaling, and culinary assistance
app.post("/api/chat", async (req, res) => {
  try {
    const { message, recipeContext, inventory, conversationHistory } = req.body;

    // Check if there are any matching recipes in MongoDB store for context enrichment
    let matchedDatabaseRecipes: any[] = [];
    if (message && typeof message === 'string') {
      const q = message.toLowerCase();
      matchedDatabaseRecipes = MONGO_RECIPE_COLLECTION.filter(r => 
        q.includes(r.title.toLowerCase()) || 
        r.title.toLowerCase().split(' ').some(word => word.length > 3 && q.includes(word))
      ).slice(0, 2);
    }

    const systemInstruction = `You are "Annapurna AI", the ultimate culinary copilot and expert AI chef. You provide high-precision cooking advice, meal planning, and kitchen troubleshooting.

STRICT OPERATIONAL DIRECTIVES:
1. NO FLUFF: Start answers immediately. Never say "I am an AI," "As an AI model," or "Here is your recipe."
2. PORTION SCALING: If the user asks for a specific serving size (e.g., "for 1 person"), scale all ingredient quantities precisely from the active recipe context.
3. RECIPE STRUCTURE: Always use bold headers, bulleted ingredients with regional names in parentheses (e.g., "Haldi (Turmeric)"), and numbered cooking steps.
4. TROUBLESHOOTING & FOLLOW-UP: If there is an "Active Recipe" in the Context, you MUST answer all cooking questions, ingredient substitutions, timing inquiries, and troubleshooting (such as "how to make it softer", "less spicy", "what to serve it with") specifically for that Active Recipe.
5. VERCEL READY: Keep responses concise to ensure fast execution and avoid serverless timeouts.
6. GENERAL KNOWLEDGE: Answer general knowledge and non-culinary queries (such as "who is PM of India") accurately and politely in your Annapurna persona, then offer to help with cooking.

Context:
- Inventory: ${JSON.stringify(inventory || [])}
- Active Recipe: ${recipeContext ? JSON.stringify(recipeContext) : "None"}
- Database Matches: ${matchedDatabaseRecipes.length > 0 ? JSON.stringify(matchedDatabaseRecipes.map(r => r.title)) : "None"}`;

    // 1. First check if OpenRouter API Key is provided and usable
    const historyForOpenRouter: Array<{ role: string; content: string }> = [];
    if (Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: { role?: string; text?: string }) => {
        if (msg.text) {
          historyForOpenRouter.push({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.text,
          });
        }
      });
    }
    historyForOpenRouter.push({ role: "user", content: message });

    const openRouterReply = await callOpenRouter(historyForOpenRouter, systemInstruction);
    if (openRouterReply) {
      return res.json({
        reply: openRouterReply,
        source: "openrouter",
      });
    }

    // 2. Fall back to Gemini API if available
    const ai = getAIClient();

    if (!ai) {
      // Fallback domain response if neither OpenRouter nor Gemini key is set
      return res.json({
        reply: generateFallbackAssistantReply(message, recipeContext, inventory, conversationHistory),
        source: "simulated_fallback",
      });
    }

    // Format chat history for Gemini multi-turn conversation
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: { role?: string; text?: string }) => {
        if (msg.text) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }],
          });
        }
      });
    }

    // Append the latest user query
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I processed your query, but could not generate a response. Please try asking again!";

    return res.json({
      reply: replyText,
      source: "gemini",
    });
  } catch (error: any) {
    console.warn("Gemini API call skipped or failed, using local fallback response engine:", error?.message || error);
    return res.json({
      reply: generateFallbackAssistantReply(req.body?.message || "", req.body?.recipeContext, req.body?.inventory || [], req.body?.conversationHistory || []),
      source: "simulated_fallback",
    });
  }
});

// YouTube Search helpers
function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

function formatViews(count: string): string {
  const n = parseInt(count, 10);
  if (Number.isNaN(n)) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K views`;
  return `${n} views`;
}

// YouTube Search API endpoint
app.get("/api/youtube-search", async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  if (!q) return res.status(400).json({ error: 'Missing query' });

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return res.json({ configured: false, videos: [] });
  }

  try {
    // Search for videos
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: `${q} authentic recipe cooking tutorial`,
      type: 'video',
      videoEmbeddable: 'true',
      maxResults: '6', // Get a few more to filter if needed
      key: apiKey,
    });

    const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`);
    if (!searchRes.ok) throw new Error('YouTube search failed');
    const searchData = await searchRes.json() as any;
    const items = searchData.items || [];

    if (items.length === 0) {
      return res.json({ configured: true, videos: [] });
    }

    const videoIds = items.map((item: any) => item.id.videoId).filter(Boolean);

    // Get details (duration, views)
    const detailsParams = new URLSearchParams({
      part: 'contentDetails,statistics',
      id: videoIds.join(','),
      key: apiKey,
    });

    const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?${detailsParams.toString()}`);
    const detailsData = detailsRes.ok ? await detailsRes.json() as any : { items: [] };
    const detailsById = new Map(detailsData.items.map((d: any) => [d.id, d]));

    const videos = items.map((item: any) => {
      const details = detailsById.get(item.id.videoId) as any;
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        channelName: item.snippet.channelTitle,
        publishedTime: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        duration: details ? formatDuration(details.contentDetails.duration) : '',
        views: details ? formatViews(details.statistics.viewCount) : '',
        youtubeUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      };
    }).slice(0, 4); // Limit to top 4

    res.json({ configured: true, videos });
  } catch (err) {
    console.error('YouTube API error:', err);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

async function startServer() {
  // Load extra recipes from CSV if available
  try {
    console.log("Loading recipes from CSV...");
    const csvRecipes = loadRecipesFromCSV();
    if (csvRecipes.length > 0) {
      updateMongoRecipeCollection(csvRecipes);
      console.log(`Loaded ${csvRecipes.length} recipes from CSV. Total: ${MONGO_RECIPE_COLLECTION.length}`);
    }
  } catch (err) {
    console.error("Failed to load CSV recipes:", err);
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only start the listener if we are not running on Vercel as a Serverless function
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();

export default app;

