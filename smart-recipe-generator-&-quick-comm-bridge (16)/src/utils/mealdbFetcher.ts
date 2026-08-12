import { Recipe, RecipeIngredient, RecipeInstruction } from '../types';

/**
 * Interfaces for raw response from TheMealDB API
 */
export interface RawMealDBItem {
  idMeal: string;
  strMeal: string;
  strDrinkAlternate?: string | null;
  strCategory?: string | null;
  strArea?: string | null;
  strInstructions?: string | null;
  strMealThumb?: string | null;
  strTags?: string | null;
  strYoutube?: string | null;
  [key: string]: string | null | undefined; // For strIngredient1..20 and strMeasure1..20
}

export interface CleanMealDBIngredient {
  name: string;
  quantity: string;
}

export interface TransformedMealDBRecipe extends Recipe {
  rawMealDbId: string;
  mealDbCategory: string;
  mealDbArea: string;
  youtubeUrl?: string;
  tags: string[];
}

// In-Memory Cache with TTL (Time To Live = 1 hour)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Hour
const memoryCache = new Map<string, CacheEntry<any>>();

function getFromCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setToCache<T>(key: string, data: T): void {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

/**
 * 1. CLEANING & ZIPPING INGREDIENTS
 * Extracts strIngredient1..20 and strMeasure1..20, trims whitespace,
 * filters nulls/empty strings, and zips them into [{ name, quantity }]
 */
export function parseMealDBIngredients(meal: RawMealDBItem): CleanMealDBIngredient[] {
  const ingredients: CleanMealDBIngredient[] = [];

  for (let i = 1; i <= 20; i++) {
    const rawIng = meal[`strIngredient${i}`];
    const rawMeas = meal[`strMeasure${i}`];

    const cleanName = rawIng ? rawIng.trim() : '';
    const cleanQuantity = rawMeas ? rawMeas.trim() : '';

    // Filter out nulls, undefined, and empty string placeholders
    if (cleanName && cleanName.toLowerCase() !== 'null' && cleanName.length > 0) {
      ingredients.push({
        name: cleanName,
        quantity: cleanQuantity || 'To taste',
      });
    }
  }

  return ingredients;
}

/**
 * 2. PARSING UNSTRUCTURED INSTRUCTIONS
 * Splits unstructured text block into a sequential array of distinct cooking steps
 * using regex split on newlines, double linebreaks, or numbered lists.
 */
export function parseMealDBInstructions(instructionsText?: string | null): RecipeInstruction[] {
  if (!instructionsText || !instructionsText.trim()) {
    return [
      {
        stepNumber: 1,
        title: 'Preparation & Cooking',
        description: 'Follow general cooking guidelines for this recipe.',
      },
    ];
  }

  // Split on double linebreaks or newlines or numbered patterns (e.g. "1. ", "STEP 1")
  const rawSteps = instructionsText
    .split(/\r?\n|\r/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.toLowerCase().startsWith('step ') && s !== '.');

  const steps: RecipeInstruction[] = [];
  let stepCounter = 1;

  for (const step of rawSteps) {
    // Strip leading step numbers like "1. ", "1)", "[1]"
    const cleanDesc = step.replace(/^(\d+[\.\)]\s*|STEP\s*\d+:?\s*|[\-\*]\s*)/i, '').trim();

    if (cleanDesc.length >= 3) {
      // Derive a short descriptive title from the first 4-5 words
      const words = cleanDesc.split(' ');
      const shortTitle = words.slice(0, 4).join(' ').replace(/[\.\,\;\:]$/, '');

      steps.push({
        stepNumber: stepCounter++,
        title: shortTitle ? shortTitle.charAt(0).toUpperCase() + shortTitle.slice(1) : `Step ${stepCounter}`,
        description: cleanDesc,
        durationMinutes: Math.min(15, Math.max(2, Math.round(cleanDesc.length / 30))),
      });
    }
  }

  // Fallback if splitting produced single huge block
  if (steps.length === 0) {
    steps.push({
      stepNumber: 1,
      title: 'Cooking Instructions',
      description: instructionsText.trim(),
    });
  }

  return steps;
}

/**
 * Transforms raw MealDB meal record into App's native Recipe schema
 */
export function transformMealDBToAppRecipe(meal: RawMealDBItem, inventoryList: string[] = []): TransformedMealDBRecipe {
  const rawIngs = parseMealDBIngredients(meal);
  const instructions = parseMealDBInstructions(meal.strInstructions);

  const inventoryLower = inventoryList.map((i) => i.toLowerCase().trim());

  // Map ingredients to RecipeIngredient schema
  const recipeIngredients: RecipeIngredient[] = rawIngs.map((ing) => {
    const isAvailable = inventoryLower.some((inv) =>
      ing.name.toLowerCase().includes(inv) || inv.includes(ing.name.toLowerCase())
    );

    // Try parsing numeric quantity if present
    const numMatch = ing.quantity.match(/^([\d\/\.]+)\s*(.*)$/);
    let qtyNum = 1;
    let unitStr = ing.quantity;

    if (numMatch) {
      const parsed = parseFloat(numMatch[1]);
      if (!isNaN(parsed)) qtyNum = parsed;
      unitStr = numMatch[2] || 'unit';
    }

    return {
      name: ing.name,
      regionalName: ing.name,
      quantity: qtyNum,
      unit: unitStr,
      isMissing: !isAvailable,
      targetBrand: 'Local Grocery',
      priceInr: Math.floor(Math.random() * 40) + 10,
    };
  });

  const tagsArray = meal.strTags
    ? meal.strTags.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
    : [];

  const isVegCategory =
    meal.strCategory?.toLowerCase() === 'vegetarian' ||
    meal.strCategory?.toLowerCase() === 'vegan' ||
    meal.strCategory?.toLowerCase() === 'starter' ||
    meal.strCategory?.toLowerCase() === 'side';

  const cookTime = Math.max(15, instructions.length * 5);
  const prepTime = 10;
  const imgUrl = meal.strMealThumb || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';

  const missingIngs = recipeIngredients.filter(i => i.isMissing).length;
  const matchPct = Math.round(((recipeIngredients.length - missingIngs) / Math.max(1, recipeIngredients.length)) * 100);

  return {
    id: `mealdb-${meal.idMeal}`,
    _id: `mongo-mealdb-${meal.idMeal}`,
    title: meal.strMeal,
    subtitle: `${meal.strArea || 'Global'} ${meal.strCategory || 'Specialty'} Dish`,
    cuisine: meal.strArea || 'International',
    dietType: isVegCategory ? 'Vegetarian' : 'Non-Vegetarian',
    isVegetarian: isVegCategory,
    difficulty: instructions.length > 5 ? 'Medium' : 'Easy',
    prepTimeMinutes: prepTime,
    cookTimeMinutes: cookTime,
    servings: 2,
    rating: 4.8,
    reviewsCount: Math.floor(Math.random() * 120) + 25,
    image: imgUrl,
    ingredients: recipeIngredients,
    missingCount: missingIngs,
    matchPercentage: matchPct,
    instructions,
    nutrition: {
      calories: 320 + recipeIngredients.length * 25,
      proteinGrams: isVegCategory ? 12 : 28,
      carbsGrams: 42,
      fatGrams: 14,
      fiberGrams: 6,
    },
    chefTips: [
      `Use fresh ingredients for optimal ${meal.strArea || 'regional'} flavor profile.`,
      `Simmer instructions thoroughly to ensure balanced spice distribution.`,
    ],
    equipment: [
      { name: 'Mixing Bowl', required: true },
      { name: 'Cooking Pan or Kadhai', required: true },
    ],
    mongoMetadata: {
      collection: 'recipes_mealdb',
      schemaVersion: '2.1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    rawMealDbId: meal.idMeal,
    mealDbCategory: meal.strCategory || 'General',
    mealDbArea: meal.strArea || 'Global',
    youtubeUrl: meal.strYoutube || undefined,
    tags: tagsArray,
  };
}

/**
 * 3. API FETCHING & CACHING INTEGRATION API
 */

const MEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

/**
 * Fetch full meal details by Meal ID
 */
export async function fetchMealDBById(id: string): Promise<RawMealDBItem | null> {
  const cacheKey = `mealdb_id_${id}`;
  const cached = getFromCache<RawMealDBItem>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${MEALDB_BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`TheMealDB HTTP error: status ${response.status}`);
    }

    const data = await response.json();
    if (data && Array.isArray(data.meals) && data.meals.length > 0) {
      const meal = data.meals[0] as RawMealDBItem;
      setToCache(cacheKey, meal);
      return meal;
    }
    return null;
  } catch (error) {
    console.error(`[TheMealDB API Error] Failed fetching meal id ${id}:`, error);
    return null;
  }
}

/**
 * Search meals by name query
 */
export async function searchMealDBByName(query: string): Promise<RawMealDBItem[]> {
  const cacheKey = `mealdb_search_${query.toLowerCase().trim()}`;
  const cached = getFromCache<RawMealDBItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${MEALDB_BASE_URL}/search.php?s=${encodeURIComponent(query)}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`TheMealDB HTTP error: status ${response.status}`);
    }

    const data = await response.json();
    if (data && Array.isArray(data.meals)) {
      const meals = data.meals as RawMealDBItem[];
      setToCache(cacheKey, meals);
      return meals;
    }
    return [];
  } catch (error) {
    console.error(`[TheMealDB API Error] Failed searching meals for "${query}":`, error);
    return [];
  }
}

/**
 * Fetch meals by Area (e.g. "Indian", "Italian", "Mexican", "Japanese")
 */
export async function fetchMealDBByArea(area: string = 'Indian'): Promise<RawMealDBItem[]> {
  const cacheKey = `mealdb_area_${area.toLowerCase()}`;
  const cached = getFromCache<RawMealDBItem[]>(cacheKey);
  if (cached) return cached;

  try {
    // 1. Fetch area list
    const listRes = await fetch(`${MEALDB_BASE_URL}/filter.php?a=${encodeURIComponent(area)}`, {
      headers: { Accept: 'application/json' },
    });

    if (!listRes.ok) {
      throw new Error(`TheMealDB HTTP error filter.php: status ${listRes.status}`);
    }

    const listData = await listRes.json();
    if (!listData || !Array.isArray(listData.meals)) {
      return [];
    }

    // Grab full details for the top 10 meals to preserve API quota
    const mealSummaries = listData.meals.slice(0, 10);
    const fullMeals: RawMealDBItem[] = [];

    for (const summary of mealSummaries) {
      if (summary.idMeal) {
        const fullMeal = await fetchMealDBById(summary.idMeal);
        if (fullMeal) {
          fullMeals.push(fullMeal);
        }
      }
    }

    setToCache(cacheKey, fullMeals);
    return fullMeals;
  } catch (error) {
    console.error(`[TheMealDB API Error] Failed fetching meals for area "${area}":`, error);
    return [];
  }
}

/**
 * Fetch and seed transform batch into native App Recipe format
 */
export async function fetchTransformedMealDBRecipes(
  area: string = 'Indian',
  inventoryList: string[] = []
): Promise<TransformedMealDBRecipe[]> {
  const rawMeals = await fetchMealDBByArea(area);
  return rawMeals.map((meal) => transformMealDBToAppRecipe(meal, inventoryList));
}
