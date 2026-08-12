import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Recipe, RecipeIngredient, RecipeInstruction } from '../types';
import { generateMongoObjectId, enrichToMongoDocument } from '../data/mongoRecipeStore';
import { cleanRecipeTitle } from '../utils/titleCleaner';
import { parseSmartIngredient } from '../utils/ingredientParser';
import { getRecipeFallbackImage } from '../utils/recipeImageMapper';

function deriveCourse(name: string, ingredients: string): string {
  const n = name.toLowerCase();
  const i = ingredients.toLowerCase();

  if (n.includes('juice') || n.includes('smoothie') || n.includes('shake') || n.includes('tea') || n.includes('coffee') || n.includes('lassi') || n.includes('sharbath') || n.includes('drink')) return 'Beverage';
  if (n.includes('halwa') || n.includes('kheer') || n.includes('ladoo') || n.includes('sweet') || (n.includes('cake') && !n.includes('pancake')) || n.includes('pudding') || n.includes('dessert') || n.includes('barfi')) return 'Dessert';
  if (n.includes('samosa') || n.includes('pakora') || n.includes('tikka') || n.includes('kabab') || n.includes('kebab') || n.includes('fry') || n.includes('snack') || n.includes('starter') || n.includes('cutlet') || n.includes('vada') || n.includes('tikki')) return 'Appetizer / Snack';
  if (n.includes('dosa') || n.includes('idli') || n.includes('upma') || n.includes('poha') || n.includes('paratha') || n.includes('breakfast') || n.includes('omelette') || n.includes('pancake') || n.includes('thepla') || n.includes('cheela')) return 'Breakfast';
  if (n.includes('chutney') || n.includes('raita') || n.includes('pickle') || n.includes('achar') || n.includes('salad') || n.includes('papad')) return 'Side Dish';
  if (n.includes('biryani') || n.includes('pulao') || n.includes('rice') || n.includes('curry') || n.includes('dal') || n.includes('sabzi') || n.includes('gravy') || n.includes('roti') || n.includes('naan') || n.includes('kulcha')) return 'Main Course';

  // Default heuristic based on common ingredients
  if (i.includes('sugar') && i.includes('milk') && !i.includes('salt')) return 'Dessert';
  
  return 'Main Course'; // Default
}

export function loadRecipesFromCSV(): Recipe[] {
  let csvPath = path.join(process.cwd(), 'cuisine_updated.csv');
  if (!fs.existsSync(csvPath)) {
    csvPath = path.join(process.cwd(), 'Cleaned_Indian_Food_Dataset.csv');
  }
  
  if (!fs.existsSync(csvPath)) {
    console.warn('Dataset file not found:', csvPath);
    return [];
  }

  console.log(`Loading dataset from: ${csvPath}`);
  let fileContent = fs.readFileSync(csvPath, 'utf-8');
  console.log(`CSV File size: ${fileContent.length} bytes`);
  
  let records: any[] = [];
  try {
    records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
      trim: true
    });
  } catch (err: any) {
    if (err.code === 'CSV_QUOTE_NOT_CLOSED') {
      console.warn('CSV quote not closed at end of file, attempting to fix...');
      try {
        records = parse(fileContent + '"', {
          columns: true,
          skip_empty_lines: true,
          relax_column_count: true,
          relax_quotes: true,
          trim: true
        });
      } catch (err2) {
        console.error('Failed to parse CSV even with closing quote:', err2);
        return [];
      }
    } else {
      console.error('Error parsing CSV:', err);
      return [];
    }
  }
  console.log(`Parsed ${records.length} records from CSV`);

  return records.map((record: any, index: number) => {
    const rawName = record.name || record.TranslatedRecipeName || record.title || 'Untitled Recipe';
    const rawCuisine = record.cuisine || record.Cuisine || 'Indian';
    const rawCourse = record.course || record.Course || '';
    const rawDiet = record.diet || record.Diet || '';
    const rawPrepTime = (record.prep_time || record.TotalTimeInMins || record.prep_time_mins || '').toString();
    const rawIngredients = record.ingredients || record.TranslatedIngredients || record['Cleaned-Ingredients'] || '';
    const rawInstructions = record.instructions || record.TranslatedInstructions || '';
    const rawImageUrl = record.image_url || record['image-url'] || record.URL || '';

    const recipeNameLower = rawName.toLowerCase();
    const ingredientsTextLower = rawIngredients.toLowerCase();
    const dietLower = rawDiet.toLowerCase();
    
    // Simple heuristic to detect non-vegetarian dishes in Indian cuisine
    const nonVegKeywords = [
      'chicken', 'mutton', 'fish', 'prawn', 'shrimp', 'meat', 'beef', 'pork', 
      'lamb', 'egg', 'keema', 'machli', 'murgh', 'gosht', 'duck', 'crab', 
      'squid', 'lobster', 'ham', 'bacon', 'turkey', 'non veg', 'non-veg',
      'salmon', 'tuna', 'prawns', 'pomfret', 'surmai'
    ];
    
    const vegExceptions = ['eggless', 'egg-free', 'vegetable', 'veg ', 'veg-', 'vegetarian'];

    let isVeg = true;
    if (dietLower.includes('non vegetarian') || dietLower.includes('non-vegetarian') || dietLower.includes('non veg') || dietLower.includes('eggetarian')) {
      isVeg = false;
    } else {
      for (const kw of nonVegKeywords) {
        if (recipeNameLower.includes(kw) || ingredientsTextLower.includes(kw)) {
          isVeg = false;
          for (const ex of vegExceptions) {
            if (recipeNameLower.includes(ex)) {
              isVeg = true;
              break;
            }
          }
          if (!isVeg) break;
        }
      }
    }

    const dietType = isVeg ? 'Vegetarian' : 'Non-Vegetarian';

    // Parse prep time / total time
    let totalTime = 30;
    if (rawPrepTime) {
      let hrs = 0;
      let mins = 0;
      const hrMatch = rawPrepTime.match(/(\d+)\s*H/i);
      const minMatch = rawPrepTime.match(/(\d+)\s*M/i);
      if (hrMatch) hrs = parseInt(hrMatch[1], 10);
      if (minMatch) mins = parseInt(minMatch[1], 10);
      if (hrs > 0 || mins > 0) {
        totalTime = hrs * 60 + mins;
      } else {
        const numMatch = rawPrepTime.match(/\d+/);
        if (numMatch) totalTime = parseInt(numMatch[0], 10);
      }
    }
    const prepTime = Math.max(5, Math.floor(totalTime * 0.2));
    const cookTime = Math.max(5, totalTime - prepTime);
    
    // Parse ingredients
    const cleanedIngsText = rawIngredients.replace(/\t/g, ' ').replace(/\r/g, '');
    const rawIngLines = cleanedIngsText
      .split('\n')
      .map((s: string) => s.replace(/\s+/g, ' ').trim())
      .filter((s: string) => s.length > 0 && !s.toLowerCase().endsWith(':') && !s.toLowerCase().startsWith('for '));

    const finalIngLines: string[] = [];
    rawIngLines.forEach((line: string) => {
      if (line.includes(',') && line.length > 100) {
        line.split(',').forEach((sub) => {
          const cleanedSub = sub.trim();
          if (cleanedSub) finalIngLines.push(cleanedSub);
        });
      } else {
        finalIngLines.push(line);
      }
    });

    const ingredients: RecipeIngredient[] = finalIngLines
      .map((fullDesc: string) => {
        const parsed = parseSmartIngredient(fullDesc);

        let quantity = 1;
        let unit = 'unit';
        const qtyMatch = fullDesc.match(/^(\d+(\/\d+)?|\d+\.\d+)\s*(tsp|teaspoon|tbsp|tablespoon|cup|cups|g|grams|kg|ml|l|pinch|bunch|clove|cloves|piece|pieces|inch|sprig|sprigs)?/i);
        if (qtyMatch) {
          const qtyStr = qtyMatch[1];
          if (qtyStr.includes('/')) {
            const [num, den] = qtyStr.split('/').map(Number);
            quantity = den ? num / den : 1;
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
          priceInr: Math.floor(Math.random() * 40) + 10
        };
      })
      .filter((ing) => ing.name && ing.name !== 'Ingredient');

    // Parse instructions
    const cleanedInstText = rawInstructions.replace(/\t/g, ' ').replace(/\r/g, '');
    let rawSteps = cleanedInstText.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 5);
    
    if (rawSteps.length < 4 || rawSteps.some((s: string) => s.length > 150)) {
      const moreSteps: string[] = [];
      rawSteps.forEach((block: string) => {
        if (block.length > 80 || rawSteps.length < 4) {
          const split = block.split(/\.\s+/).map((s: string) => s.trim()).filter((s: string) => s.length > 10);
          split.forEach((s: string) => {
            const finalS = s.endsWith('.') ? s : s + '.';
            moreSteps.push(finalS);
          });
        } else {
          moreSteps.push(block);
        }
      });
      rawSteps = moreSteps;
    }

    rawSteps = Array.from(new Set(rawSteps));

    const baseStepTime = Math.max(1, Math.floor(totalTime / (rawSteps.length || 1)));
    let remainingTime = totalTime;

    const instructions: RecipeInstruction[] = rawSteps.map((rawStep: string, idx: number) => {
      let cleanedStep = rawStep.replace(/^(Step\s*\d+\s*[:\.]\s*|\d+\s*[:\.\)]\s*)/i, '').trim();
      if (!cleanedStep) cleanedStep = rawStep;

      const actionMatch = cleanedStep.match(/^(To begin|Add|Heat|Mix|Cook|Wash|Sieve|Grind|Whisk|Pour|Bake|Fry|Sauté|Spread|Turn off|Pressure cook|Garnish|Serve|Drain|Soak|Blend|Roast|Peel)/i);
      let title = `Step ${idx + 1}`;
      if (actionMatch) {
        const words = cleanedStep.split(' ').slice(0, 5).join(' ');
        title = words.length < 50 ? words.replace(/[\.\,\;\:]$/, '') : title;
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
        durationMinutes: stepDuration
      };
    });

    const cuisineClean = rawCuisine.replace(/\s+Recipes$/i, '').trim();
    let finalCuisine = cuisineClean || 'Indian';
    if (cuisineClean.toLowerCase().includes('north indian')) finalCuisine = 'North Indian';
    if (cuisineClean.toLowerCase().includes('south indian')) finalCuisine = 'South Indian';

    const nonIndianCuisines = [
      'mexican', 'continental', 'italian', 'chinese', 'thai', 'asian', 
      'mediterranean', 'middle eastern', 'european', 'french', 'japanese', 
      'greek', 'american', 'spanish', 'vietnamese', 'fusion'
    ];
    const isNonIndian = nonIndianCuisines.some((c) => finalCuisine.toLowerCase().includes(c));

    const cleanTitle = cleanRecipeTitle(rawName);

    const derivedCourseVal = rawCourse ? rawCourse : deriveCourse(rawName, rawIngredients);

    // Resolve Image URL by original filename or local /images folder
    let imageUrl = '';
    const cwd = process.cwd();
    const publicImagesDir = path.join(cwd, 'public', 'images');
    const distImagesDir = path.join(cwd, 'dist', 'images');
    const imagesDir = fs.existsSync(publicImagesDir) ? publicImagesDir : (fs.existsSync(distImagesDir) ? distImagesDir : '');
    
    // Create image map lazily once
    if (!(global as any)._imageMap && imagesDir) {
      const mapByStem = new Map<string, string>();
      const mapByNum = new Map<string, string>();
      try {
        const files = fs.readdirSync(imagesDir);
        for (const file of files) {
          if (file.startsWith('.')) continue;
          const match = file.match(/^(\d+)\.(.+)\.(webp|jpg|png|jpeg)$/i);
          if (match) {
            const num = match[1];
            const stem = match[2].toLowerCase();
            mapByStem.set(stem, `/images/${file}`);
            mapByNum.set(num, `/images/${file}`);
          } else {
            const ext = path.extname(file);
            const stem = path.basename(file, ext).toLowerCase();
            mapByStem.set(stem, `/images/${file}`);
          }
        }
      } catch (err) {
        console.warn('Error reading images directory:', err);
      }
      (global as any)._imageMap = { mapByStem, mapByNum };
    }

    const imageMapObj = (global as any)._imageMap;
    if (imageMapObj) {
      if (rawImageUrl) {
        const cleanUrl = rawImageUrl.split('?')[0];
        const stem = path.basename(cleanUrl, path.extname(cleanUrl)).toLowerCase();
        if (imageMapObj.mapByStem.has(stem)) {
          imageUrl = imageMapObj.mapByStem.get(stem);
        }
      }
      
      if (!imageUrl && imageMapObj.mapByNum) {
        const numStr = String(index + 1);
        if (imageMapObj.mapByNum.has(numStr)) {
          imageUrl = imageMapObj.mapByNum.get(numStr);
        }
      }
    }

    if (!imageUrl) {
      if (rawImageUrl && (rawImageUrl.startsWith('http://') || rawImageUrl.startsWith('https://'))) {
        imageUrl = rawImageUrl;
      } else {
        imageUrl = getRecipeFallbackImage(rawName);
      }
    }

    const baseRecipe: Recipe = {
      id: generateMongoObjectId('csv', index),
      title: cleanTitle,
      subtitle: `${finalCuisine} dish`,
      cuisine: finalCuisine,
      Course: derivedCourseVal,
      prepTimeMinutes: prepTime,
      cookTimeMinutes: cookTime,
      difficulty: instructions.length > 10 ? 'Advanced' : (instructions.length > 5 ? 'Medium' : 'Easy'),
      rating: 0,
      reviewsCount: 0,
      image: imageUrl,
      servings: parseInt(record.Servings || record.servings) || 4,
      tags: [finalCuisine, dietType, isNonIndian ? `${finalCuisine} Cuisine` : 'Indian Cuisine', derivedCourseVal].filter(Boolean),
      ingredients,
      instructions,
      missingCount: 0,
      matchPercentage: 100,
      isVegetarian: isVeg,
      dietType: dietType as any,
      nutrition: {
        calories: 300 + Math.floor(Math.random() * 200),
        proteinGrams: isVeg ? 10 : 25,
        carbsGrams: 40,
        fatGrams: 15
      }
    };

    return enrichToMongoDocument(baseRecipe, index + 200);
  });
}

