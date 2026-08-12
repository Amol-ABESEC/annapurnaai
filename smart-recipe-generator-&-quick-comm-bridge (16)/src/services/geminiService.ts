import { GoogleGenAI } from '@google/genai';
import { Recipe, PantryIngredient } from '../types';

let genAIClient: GoogleGenAI | null = null;

function getGenAIClient(): GoogleGenAI | null {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY || (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY);
    if (apiKey) {
      genAIClient = new GoogleGenAI({ apiKey });
    }
  }
  return genAIClient;
}

/**
 * Deterministic local fallback responses when AI API key is not present or offline
 */
function buildDeterministicChefResponse(
  userQuery: string,
  recipe?: Recipe | null,
  pantryItems?: PantryIngredient[]
): string {
  const query = userQuery.toLowerCase();

  if (recipe) {
    if (query.includes('substitute') || query.includes('replace') || query.includes('instead of')) {
      const missingIngs = recipe.ingredients.filter((i) => i.isMissing).map((i) => i.name).join(', ');
      return `👨‍🍳 **Culinary Substitutions for ${recipe.title}**:\n\n` +
        `• **Cream / Dahi**: You can use fresh whisked curd or cashew paste for creamy richness.\n` +
        `• **Garlic / Onion**: Use Asafoetida (Hing) and Ginger paste for a satvik alternative.\n` +
        `• **Paneer**: Tofu or soaked boiled potatoes work well as an alternative.\n` +
        (missingIngs ? `\nMissing items in your pantry: *${missingIngs}*. You can add them to your Quick-Commerce 1-click cart!` : '');
    }

    if (query.includes('step') || query.includes('how to cook') || query.includes('instruction')) {
      const stepsFormatted = recipe.instructions
        .map((s) => `**Step ${s.stepNumber}. ${s.title}**\n${s.description}`)
        .join('\n\n');
      return `🍳 **Step-by-Step Cooking Guide for ${recipe.title}**:\n\n${stepsFormatted}\n\n*Pro-Tip*: Sauté spices on medium heat until ghee separates!`;
    }

    if (query.includes('nutrition') || query.includes('calories') || query.includes('health')) {
      const nut = recipe.nutrition;
      return `🥗 **Nutritional Profile for ${recipe.title}**:\n\n` +
        `• **Calories**: ${nut.calories} kcal\n` +
        `• **Protein**: ${nut.proteinGrams}g\n` +
        `• **Carbs**: ${nut.carbsGrams}g\n` +
        `• **Fats**: ${nut.fatGrams}g\n` +
        `• **Fiber**: ${nut.fiberGrams}g\n\n` +
        `This dish is a balanced ${recipe.dietType || (recipe.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian')} meal!`;
    }
  }

  // General culinary response
  return `👨‍🍳 **Annapurna Culinary Copilot**:\n\n` +
    `I am ready to help you cook! You can ask me for:\n` +
    `1. Ingredient substitutions & allergen-free variations\n` +
    `2. Step-by-step cooking techniques & heat control\n` +
    `3. Wine, raita, and naan pairings\n` +
    `4. Quick-commerce ingredient restock recommendations\n\n` +
    `How can I assist with your cooking today?`;
}

/**
 * Main AI Assistant service with automatic fallback
 */
export async function askAnnapurnaChef(
  userQuery: string,
  recipe?: Recipe | null,
  pantryItems: PantryIngredient[] = []
): Promise<string> {
  const client = getGenAIClient();

  if (!client) {
    console.log('Gemini API Key missing or client unavailable — using deterministic culinary fallback engine');
    return buildDeterministicChefResponse(userQuery, recipe, pantryItems);
  }

  try {
    const pantrySummary = pantryItems.map((p) => p.name).join(', ');
    const recipeSummary = recipe
      ? `Recipe: ${recipe.title} (${recipe.cuisine})\nIngredients: ${recipe.ingredients.map((i) => i.name).join(', ')}`
      : 'General Indian Kitchen Inquiry';

    const systemPrompt = `You are Annapurna AI, an expert Indian Culinary Copilot.
You assist users with cooking, ingredient substitutions, regional Hinglish terminology, heat control, and zero-waste kitchen management.
Keep responses warm, concise, and structured with clear markdown bullet points.

User Pantry: ${pantrySummary}
Current Context: ${recipeSummary}
User Question: ${userQuery}`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
    });

    return response.text || buildDeterministicChefResponse(userQuery, recipe, pantryItems);
  } catch (error) {
    console.warn('Gemini API call failed, switching to local culinary engine:', error);
    return buildDeterministicChefResponse(userQuery, recipe, pantryItems);
  }
}
