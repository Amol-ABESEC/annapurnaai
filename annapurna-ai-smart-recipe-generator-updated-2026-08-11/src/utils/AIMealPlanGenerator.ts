import { AutoPlanPreferences, DailyNutritionSummary, DayOfWeek, MealPlanItem, MealSlot, Recipe } from '../types';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOTS: MealSlot[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export function generateSmartWeeklyMealPlan(
  recipes: Recipe[],
  preferences: AutoPlanPreferences
): { generatedItems: MealPlanItem[]; dailySummaries: DailyNutritionSummary[] } {
  const { strategy, dietFilter } = preferences;

  // Filter recipes by diet preference
  let pool = recipes.filter((r) => {
    if (dietFilter === 'vegetarian') return r.isVegetarian;
    if (dietFilter === 'non-veg') return !r.isVegetarian;
    return true;
  });

  if (pool.length === 0) pool = recipes;

  // Sort pool according to selected strategy
  const sortedPool = [...pool].sort((a, b) => {
    if (strategy === 'zero_waste') {
      // Prioritize highest pantry match percentage and fewest missing ingredients
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      return a.missingCount - b.missingCount;
    } else if (strategy === 'high_protein') {
      // Prioritize highest protein
      return (b.nutrition?.proteinGrams || 0) - (a.nutrition?.proteinGrams || 0);
    } else {
      // Balanced: rating & fast prep time
      return b.rating - a.rating;
    }
  });

  const generatedItems: MealPlanItem[] = [];
  let poolIndex = 0;

  for (const day of DAYS) {
    for (const slot of SLOTS) {
      if (sortedPool.length === 0) break;
      const recipe = sortedPool[poolIndex % sortedPool.length];
      poolIndex++;

      generatedItems.push({
        id: `auto-${day.toLowerCase()}-${slot.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        recipeImage: recipe.image,
        day,
        mealSlot: slot,
        servings: 2,
        addedAt: Date.now(),
      });
    }
  }

  const dailySummaries = computeDailyNutritionSummaries(generatedItems, recipes);

  return { generatedItems, dailySummaries };
}

export function computeDailyNutritionSummaries(
  mealPlanItems: MealPlanItem[],
  recipes: Recipe[]
): DailyNutritionSummary[] {
  const recipeMap = new Map<string, Recipe>(recipes.map((r) => [r.id, r]));

  return DAYS.map((day) => {
    const dayItems = mealPlanItems.filter((m) => m.day === day);
    let totalCalories = 0;
    let totalProteinGrams = 0;
    let totalCarbsGrams = 0;
    let totalFatGrams = 0;

    for (const item of dayItems) {
      const rec = recipeMap.get(item.recipeId);
      if (rec && rec.nutrition) {
        const factor = (item.servings || 2) / (rec.servings || 2);
        totalCalories += Math.round((rec.nutrition.calories || 250) * factor);
        totalProteinGrams += Math.round((rec.nutrition.proteinGrams || 10) * factor);
        totalCarbsGrams += Math.round((rec.nutrition.carbsGrams || 30) * factor);
        totalFatGrams += Math.round((rec.nutrition.fatGrams || 8) * factor);
      } else {
        // Sensible Indian meal default estimates if recipe nutrition is missing
        totalCalories += 320;
        totalProteinGrams += 12;
        totalCarbsGrams += 42;
        totalFatGrams += 10;
      }
    }

    return {
      day,
      totalCalories,
      totalProteinGrams,
      totalCarbsGrams,
      totalFatGrams,
      mealCount: dayItems.length,
    };
  });
}
