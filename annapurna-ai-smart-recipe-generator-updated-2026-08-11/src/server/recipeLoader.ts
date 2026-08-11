import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Recipe, RecipeIngredient, RecipeInstruction } from '../types';
import { generateMongoObjectId, enrichToMongoDocument } from '../data/mongoRecipeStore';
import { cleanRecipeTitle } from '../utils/titleCleaner';
import { parseSmartIngredient } from '../utils/ingredientParser';
import { findRecipeImageForDish } from '../utils/recipeImageMatcher';

const CSV_FILENAME = 'cuisine_updated.csv';

function deriveCourse(rawCourse: string, name: string): string {
  const c = (rawCourse || '').trim();
  if (c) return c;

  // Fallback heuristic when the course column is blank
  const n = name.toLowerCase();
  if (n.includes('juice') || n.includes('smoothie') || n.includes('shake') || n.includes('tea') || n.includes('coffee') || n.includes('lassi') || n.includes('drink')) return 'Beverage';
  if (n.includes('halwa') || n.includes('kheer') || n.includes('ladoo') || n.includes('sweet') || n.includes('dessert') || n.includes('barfi')) return 'Dessert';
  if (n.includes('samosa') || n.includes('pakora') || n.includes('tikka') || n.includes('kebab') || n.includes('snack')) return 'Appetizer';
  if (n.includes('dosa') || n.includes('idli') || n.includes('upma') || n.includes('poha') || n.includes('paratha') || n.includes('breakfast')) return 'Breakfast';
  return 'Main Course';
}

/**
 * Cleans the messy tab/whitespace-riddled ingredient block from the raw
 * scraped CSV into a clean list of one ingredient description per line.
 * Continuation lines that begin with a comma (e.g. ", diced") are merged
 * back into the previous ingredient line rather than treated as new items.
 */
function splitRawIngredientBlock(rawBlock: string): string[] {
  if (!rawBlock) return [];

  const rawLines = rawBlock
    .split('\n')
    .map((line) => line.replace(/\t/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const merged: string[] = [];
  for (const line of rawLines) {
    if (line.startsWith(',') && merged.length > 0) {
      merged[merged.length - 1] = `${merged[merged.length - 1]}${line}`;
    } else {
      merged.push(line);
    }
  }

  // Drop section headers like "For marination" / "For tempering" (no quantity/comma info)
  return merged.filter((line) => !/^for\s+/i.test(line) || /\d/.test(line));
}

/**
 * Parses "Total in 45 M" (or similar) into a total minute count.
 */
function parseTotalMinutes(rawPrepTime: string): number {
  const match = (rawPrepTime || '').match(/(\d+)\s*M/i);
  if (match) return parseInt(match[1], 10);
  return 45;
}

/**
 * Splits a long instructions paragraph into discrete numbered steps.
 */
function splitInstructionSteps(rawInstructions: string): string[] {
  const cleaned = (rawInstructions || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  let steps = cleaned
    .split(/\.\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10)
    .map((s) => (s.endsWith('.') ? s : `${s}.`));

  // Guard against pathological single-sentence blocks
  if (steps.length === 0) steps = [cleaned];

  return Array.from(new Set(steps));
}

function mapDietType(rawDiet: string): { isVegetarian: boolean; dietType: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Jain' } {
  const d = (rawDiet || '').toLowerCase();
  if (d.includes('vegan')) return { isVegetarian: true, dietType: 'Vegan' };
  if (d.includes('non veg') || d.includes('non-veg') || d.includes('non vegeterian')) {
    return { isVegetarian: false, dietType: 'Non-Vegetarian' };
  }
  return { isVegetarian: true, dietType: 'Vegetarian' };
}

function normalizeCuisine(rawCuisine: string): string {
  const cuisine = (rawCuisine || 'Indian').replace(/\uFEFF/g, '').trim();
  const withoutSuffix = cuisine.replace(/\s+Recipes$/i, '').trim();
  return withoutSuffix || 'Indian';
}

export function loadRecipesFromCSV(): Recipe[] {
  const csvPath = path.join(process.cwd(), CSV_FILENAME);

  if (!fs.existsSync(csvPath)) {
    console.warn('Dataset file not found:', csvPath);
    return [];
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');

  let records: any[];
  try {
    records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
      trim: true,
    });
  } catch (err: any) {
    if (err.code === 'CSV_QUOTE_NOT_CLOSED') {
      console.warn('CSV quote not closed at end of file, attempting to fix...');
      records = parse(fileContent + '"', {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
        relax_quotes: true,
        trim: true,
      });
    } else {
      throw err;
    }
  }

  return records
    .filter((record) => (record.name || '').trim())
    .map((record: any, index: number) => {
      const rawTitle = record.name || 'Untitled Recipe';
      const cleanTitle = cleanRecipeTitle(rawTitle);

      const { isVegetarian, dietType } = mapDietType(record.diet || '');
      const finalCuisine = normalizeCuisine(record.cuisine);
      const course = deriveCourse(record.course || '', rawTitle);

      // Ingredients
      const rawIngredientLines = splitRawIngredientBlock(record.ingredients || '');
      const ingredients: RecipeIngredient[] = rawIngredientLines
        .map((fullDesc: string) => {
          const parsed = parseSmartIngredient(fullDesc);

          let quantity = 1;
          let unit = 'unit';
          const qtyMatch = fullDesc.match(/^(\d+(\/\d+)?|\d+\.\d+)\s*(tsp|teaspoon|tbsp|tablespoon|cup|cups|g|kg|ml|l|pinch|bunch|clove|cloves|piece|pieces|inch)?/i);
          if (qtyMatch) {
            const qtyStr = qtyMatch[1];
            if (qtyStr.includes('/')) {
              const [num, den] = qtyStr.split('/').map(Number);
              quantity = den ? num / den : num;
            } else {
              quantity = parseFloat(qtyStr);
            }
            unit = qtyMatch[3] || 'unit';
          }

          const name = parsed.canonicalName !== 'Ingredient' ? parsed.canonicalName : fullDesc.trim();
          const regionalName = parsed.regionalName || name;

          return {
            name,
            regionalName,
            quantity,
            unit,
            isMissing: false,
            priceInr: Math.floor(Math.random() * 40) + 10,
          };
        })
        .filter((ing) => ing.name && ing.name !== 'Ingredient');

      // Instructions
      const rawSteps = splitInstructionSteps(record.instructions || '');
      const totalTime = parseTotalMinutes(record.prep_time || '');
      const prepTime = Math.max(5, Math.floor(totalTime * 0.2));
      const cookTime = Math.max(5, totalTime - prepTime);

      const baseStepTime = Math.max(1, Math.floor(totalTime / (rawSteps.length || 1)));
      let remainingTime = totalTime;

      const instructions: RecipeInstruction[] = rawSteps.map((rawStep: string, idx: number) => {
        let cleanedStep = rawStep.replace(/^(Step\s*\d+\s*[:.]\s*|\d+\s*[:.)]\s*)/i, '').trim();
        if (!cleanedStep) cleanedStep = rawStep;

        const actionMatch = cleanedStep.match(/^(To begin|Add|Heat|Mix|Cook|Wash|Sieve|Grind|Whisk|Pour|Bake|Fry|Saut[ée]|Spread|Turn off|Pressure cook|Garnish|Serve|Drain|Soak|Blend|Roast|Peel|Marinate|Preheat)/i);
        let title = `Step ${idx + 1}`;
        if (actionMatch) {
          const words = cleanedStep.split(' ').slice(0, 5).join(' ');
          title = words.length < 50 ? words.replace(/[.,;:]$/, '') : title;
        }

        const isLast = idx === rawSteps.length - 1;
        let stepDuration = baseStepTime;
        if (idx % 4 === 0) stepDuration += 1;
        if (idx % 5 === 0) stepDuration += 2;

        if (isLast) {
          stepDuration = remainingTime;
        } else {
          stepDuration = Math.min(stepDuration, remainingTime - (rawSteps.length - 1 - idx));
        }

        stepDuration = Math.max(1, stepDuration);
        remainingTime = Math.max(0, remainingTime - stepDuration);

        return {
          stepNumber: idx + 1,
          title,
          description: cleanedStep,
          durationMinutes: stepDuration,
        };
      });

      const description = (record.description || '').trim();
      const hasImage = record.image_available === '1' || record.image_available === 1;
      const localImage = findRecipeImageForDish(cleanTitle, record.image_url);
      const image = localImage || (hasImage && record.image_url
        ? record.image_url.trim()
        : 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800');

      const baseRecipe: Recipe = {
        id: generateMongoObjectId('csv', index),
        title: cleanTitle,
        subtitle: description ? description.slice(0, 140) : `${finalCuisine} dish`,
        cuisine: finalCuisine,
        Course: course,
        prepTimeMinutes: prepTime,
        cookTimeMinutes: cookTime,
        difficulty: instructions.length > 10 ? 'Advanced' : instructions.length > 5 ? 'Medium' : 'Easy',
        rating: 0,
        reviewsCount: 0,
        image,
        servings: 4,
        tags: [finalCuisine, dietType, course].filter(Boolean),
        ingredients,
        instructions,
        missingCount: 0,
        matchPercentage: 100,
        isVegetarian,
        dietType,
        nutrition: {
          calories: 300 + Math.floor(Math.random() * 200),
          proteinGrams: isVegetarian ? 10 : 25,
          carbsGrams: 40,
          fatGrams: 15,
        },
      };

      return enrichToMongoDocument(baseRecipe, index + 200); // Offset to avoid ID collision with 105 set
    });
}
