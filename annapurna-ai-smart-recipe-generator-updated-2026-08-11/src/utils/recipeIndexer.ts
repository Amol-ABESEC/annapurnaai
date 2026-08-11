import { PantryIngredient, Recipe } from '../types';
import { parseSmartIngredient } from './ingredientParser';

interface CleanedPantryItem {
  canonical: string;
  nameLower: string;
  regional: string;
}

// Inverted index map for ultra-fast recipe ingredient lookup
const ingredientInvertedIndex = new Map<string, Set<string>>();

export function buildRecipeInvertedIndex(recipes: Recipe[]): void {
  ingredientInvertedIndex.clear();
  
  for (const recipe of recipes) {
    const rId = recipe.id;
    for (const ing of recipe.ingredients) {
      const parsed = parseSmartIngredient(ing.name);
      const canonical = parsed.canonicalName.toLowerCase().trim();
      const rawName = ing.name.toLowerCase().trim();
      const regional = (ing.regionalName || parsed.regionalName || '').toLowerCase().trim();

      if (canonical) {
        if (!ingredientInvertedIndex.has(canonical)) {
          ingredientInvertedIndex.set(canonical, new Set());
        }
        ingredientInvertedIndex.get(canonical)!.add(rId);
      }

      if (rawName && rawName !== canonical) {
        if (!ingredientInvertedIndex.has(rawName)) {
          ingredientInvertedIndex.set(rawName, new Set());
        }
        ingredientInvertedIndex.get(rawName)!.add(rId);
      }

      if (regional && regional !== canonical) {
        if (!ingredientInvertedIndex.has(regional)) {
          ingredientInvertedIndex.set(regional, new Set());
        }
        ingredientInvertedIndex.get(regional)!.add(rId);
      }
    }
  }
}

export function computeRecipesWithIndexedPantry(
  recipes: Recipe[],
  pantryItems: PantryIngredient[]
): Recipe[] {
  // Pre-clean pantry items once
  const pantryCleaned: CleanedPantryItem[] = pantryItems.map((p) => {
    const parsed = parseSmartIngredient(p.name);
    return {
      canonical: parsed.canonicalName.toLowerCase().trim(),
      nameLower: p.name.toLowerCase().trim(),
      regional: (p.regionalName || parsed.regionalName || '').toLowerCase().trim(),
    };
  });

  const pantryCanonicalSet = new Set<string>();
  const pantryNameSet = new Set<string>();
  const pantryRegionalSet = new Set<string>();

  for (const item of pantryCleaned) {
    if (item.canonical) pantryCanonicalSet.add(item.canonical);
    if (item.nameLower) pantryNameSet.add(item.nameLower);
    if (item.regional) pantryRegionalSet.add(item.regional);
  }

  return recipes.map((recipe) => {
    let missingCount = 0;
    const updatedIngredients = recipe.ingredients.map((ing) => {
      const ingParsed = parseSmartIngredient(ing.name);
      const ingCanonical = ingParsed.canonicalName.toLowerCase().trim();
      const ingNameLower = ing.name.toLowerCase().trim();
      const ingRegionalLower = (ing.regionalName || ingParsed.regionalName || '').toLowerCase().trim();

      // Staples assumption
      if (
        ingCanonical === 'water' ||
        ingCanonical === 'salt' ||
        ingCanonical === 'ingredient' ||
        ingNameLower === 'water' ||
        ingNameLower === 'salt' ||
        ingNameLower === 'water as required' ||
        ingNameLower === 'salt to taste'
      ) {
        return { ...ing, isMissing: false };
      }

      // 1. Direct O(1) set lookups
      let isPresent =
        pantryCanonicalSet.has(ingCanonical) ||
        pantryNameSet.has(ingNameLower) ||
        (ingRegionalLower && pantryRegionalSet.has(ingRegionalLower)) ||
        pantryCanonicalSet.has(ingRegionalLower) ||
        pantryRegionalSet.has(ingCanonical);

      // 2. Partial compound word check if direct lookup failed
      if (!isPresent && ingCanonical.length >= 4) {
        for (const pItem of pantryCleaned) {
          if (pItem.canonical.length >= 4) {
            const ingWords = ingCanonical.split(/[\s\/,-]+/);
            const pantryWords = pItem.canonical.split(/[\s\/,-]+/);
            if (ingWords.some((w) => w.length >= 4 && pantryWords.includes(w))) {
              isPresent = true;
              break;
            }
          }
        }
      }

      const isMissing = !isPresent;
      if (isMissing) missingCount++;

      return {
        ...ing,
        isMissing,
      };
    });

    const matchedCount = updatedIngredients.length - missingCount;
    const matchPercentage =
      updatedIngredients.length > 0
        ? Math.round((matchedCount / updatedIngredients.length) * 100)
        : 100;

    return {
      ...recipe,
      ingredients: updatedIngredients,
      missingCount,
      matchPercentage,
    };
  });
}
