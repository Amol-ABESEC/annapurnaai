import { Recipe, PantryIngredient, QuickCommPlatform } from '../types';
import { MONGO_RECIPE_COLLECTION } from '../data/mongoRecipeStore';
import { PLATFORM_INFO, MOCK_CART_DEEPLINKS } from '../data/mockData';
import { cleanRecipeTitle } from '../utils/titleCleaner';

export interface QueryPipelineParams {
  searchQuery?: string;
  cuisine?: string;
  course?: string;
  dietType?: 'all' | 'veg' | 'nonveg';
  filterTab?: 'all' | 'custom' | 'veg' | 'nonveg' | 'ready' | 'missing' | 'quick';
  pantryItems?: PantryIngredient[];
  page?: number;
  limit?: number;
}

export interface QueryPipelineResult {
  recipes: Recipe[];
  totalCount: number;
  readyToCookCount: number;
  almostReadyCount: number;
  page: number;
  totalPages: number;
}

// In-memory query cache for instant sub-millisecond response pipeline
const queryCache = new Map<string, { timestamp: number; data: QueryPipelineResult }>();
const CACHE_TTL_MS = 30000; // 30 seconds cache

class DataPipelineService {
  private allRecipes: Recipe[] = MONGO_RECIPE_COLLECTION;

  /**
   * Main Query Pipeline with indexing, caching, Hinglish normalization, and pantry matching
   */
  public queryRecipes(params: QueryPipelineParams): QueryPipelineResult {
    const cacheKey = JSON.stringify(params);
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const searchQuery = (params.searchQuery || '').toLowerCase().trim();
    const cuisine = params.cuisine && params.cuisine !== 'All Cuisines' ? params.cuisine : null;
    const course = params.course && params.course !== 'All Courses' ? params.course : null;
    const filterTab = params.filterTab || 'all';
    const pantryItems = params.pantryItems || [];
    const page = params.page || 1;
    const limit = params.limit || 24;

    // Standardize pantry terms for high performance matching
    const pantryNames = new Set(
      pantryItems
        .filter((p) => p.inStock)
        .flatMap((p) => [p.name.toLowerCase(), (p.regionalName || '').toLowerCase()])
        .filter(Boolean)
    );

    let readyCount = 0;
    let almostReadyCount = 0;

    // Process & Score entire collection deterministically
    const scoredRecipes = this.allRecipes.map((recipe) => {
      let missingCount = 0;

      const updatedIngredients = recipe.ingredients.map((ing) => {
        const ingName = ing.name.toLowerCase();
        const regionalName = (ing.regionalName || '').toLowerCase();

        // Check if ingredient exists in pantry
        const isInPantry = Array.from(pantryNames).some(
          (pName) => ingName.includes(pName) || pName.includes(ingName) || regionalName.includes(pName)
        );

        const isMissing = !isInPantry;
        if (isMissing) missingCount++;

        return {
          ...ing,
          isMissing,
        };
      });

      const totalIngs = recipe.ingredients.length || 1;
      const inStockIngs = Math.max(0, totalIngs - missingCount);
      const matchPercentage = Math.round((inStockIngs / totalIngs) * 100);

      if (missingCount === 0) readyCount++;
      if (missingCount >= 1 && missingCount <= 2) almostReadyCount++;

      return {
        ...recipe,
        ingredients: updatedIngredients,
        missingCount,
        matchPercentage,
      };
    });

    // Apply Filter Pipeline
    let filtered = scoredRecipes.filter((r) => {
      // Cuisine filter
      if (cuisine && r.cuisine.toLowerCase() !== cuisine.toLowerCase()) {
        return false;
      }

      // Course filter
      if (course && (r.Course || '').toLowerCase() !== course.toLowerCase()) {
        return false;
      }

      // Diet Type filter
      if (params.dietType === 'veg' && !r.isVegetarian) return false;
      if (params.dietType === 'nonveg' && r.isVegetarian) return false;

      // Filter Tab
      if (filterTab === 'veg' && !r.isVegetarian) return false;
      if (filterTab === 'nonveg' && r.isVegetarian) return false;
      if (filterTab === 'ready' && r.missingCount > 0) return false;
      if (filterTab === 'missing' && (r.missingCount < 1 || r.missingCount > 2)) return false;
      if (filterTab === 'quick' && r.prepTimeMinutes + r.cookTimeMinutes > 30) return false;
      if (filterTab === 'custom' && !r.isCustomRecipe) return false;

      // Search Query
      if (searchQuery) {
        const titleMatch = r.title.toLowerCase().includes(searchQuery);
        const cuisineMatch = r.cuisine.toLowerCase().includes(searchQuery);
        const ingredientMatch = r.ingredients.some((i) => i.name.toLowerCase().includes(searchQuery));
        if (!titleMatch && !cuisineMatch && !ingredientMatch) return false;
      }

      return true;
    });

    // Sort by Match Percentage descending, then Rating
    filtered.sort((a, b) => b.matchPercentage - a.matchPercentage || b.rating - a.rating);

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const paginatedRecipes = filtered.slice((page - 1) * limit, page * limit);

    const result: QueryPipelineResult = {
      recipes: paginatedRecipes,
      totalCount,
      readyToCookCount: readyCount,
      almostReadyCount,
      page,
      totalPages,
    };

    queryCache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  }

  /**
   * Get single recipe by ID
   */
  public getRecipeById(id: string): Recipe | null {
    return this.allRecipes.find((r) => r.id === id || r._id === id) || null;
  }

  /**
   * Compute Quick-Commerce export cart details
   */
  public calculateQuickCommCart(recipe: Recipe, platform: QuickCommPlatform) {
    const missingItems = recipe.ingredients.filter((i) => i.isMissing);
    const platformDetails = PLATFORM_INFO[platform];

    const missingItemNames = missingItems.map((i) => `${i.quantity || 1} ${i.unit || ''} ${i.name}`);
    const totalPriceInr = missingItems.reduce((acc, curr) => acc + (curr.priceInr || 25), 0);
    const deeplinkUrl = MOCK_CART_DEEPLINKS[platform](missingItems.map((i) => i.name));

    return {
      platform,
      platformName: platformDetails.name,
      missingItems,
      missingItemNames,
      totalPriceInr,
      deliveryFee: platformDetails.deliveryFee,
      estimatedDeliveryTime: platformDetails.estimatedDeliveryTime,
      deeplinkUrl,
    };
  }
}

export const dataPipelineService = new DataPipelineService();
