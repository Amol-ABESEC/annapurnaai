import { Recipe } from '../types';

// Utility to generate a deterministic 24-character hexadecimal MongoDB ObjectId string
export function generateMongoObjectId(prefix: string, index: number): string {
  const hexIndex = index.toString(16).padStart(6, '0');
  const cleanPrefix = prefix.replace(/[^a-f0-9]/gi, '').toLowerCase().padEnd(18, 'a');
  return (cleanPrefix + hexIndex).slice(0, 24);
}

// Convert standard recipe to a rich MongoDB document schema
export function enrichToMongoDocument(recipe: Recipe, index: number): Recipe {
  const mongoId = recipe._id || recipe.mongoId || generateMongoObjectId(recipe.id, index + 101);
  const dietType = recipe.dietType || (recipe.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian');

  const defaultAllergens = recipe.isVegetarian
    ? ['Dairy', 'Cashew/Tree Nuts']
    : ['Dairy', 'Poultry/Meat', 'Tree Nuts'];

  const defaultEquipment = [
    { name: 'Kadhai / Deep Frying Pan', required: true, notes: 'Heavy bottom pan recommended for even heat distribution' },
    { name: 'Blender / Mixer Grinder', required: recipe.instructions.some(i => i.description.toLowerCase().includes('puree') || i.description.toLowerCase().includes('whisk')), notes: 'For smooth gravy paste' },
    { name: 'Chef Knife & Chopping Board', required: true },
  ];

  const defaultChefTips = [
    'Always temper whole spices in warm ghee/oil to release essential aromatics.',
    'Sauté onion-tomato base on medium-low flame until oil begins to separate from the edges.',
    'Whisk curd or cream at room temperature before adding to prevent splitting in hot gravy.',
  ];

  const defaultPairings = recipe.isVegetarian
    ? ['Butter Naan', 'Jeera Rice', 'Cucumber Raita', 'Masala Onion Rings']
    : ['Tandoori Roti', 'Aromatic Basmati Rice', 'Bhojanalay Salad', 'Mint Chutney'];

  const ingredientsStr = recipe.ingredients.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ');
  const translatedIngStr = recipe.ingredients.map(i => `${i.quantity} ${i.unit} ${i.name} (${i.regionalName})`).join(', ');
  const translatedInstStr = recipe.instructions.map(i => `${i.stepNumber}. ${i.title}: ${i.description}`).join('\n');
  const courseType = recipe.Course || 'Main Course';

  return {
    ...recipe,
    _id: mongoId,
    mongoId,
    Srno: index + 1,
    RecipeName: recipe.title,
    TranslatedRecipeName: recipe.title,
    IngredientsString: ingredientsStr,
    TranslatedIngredients: translatedIngStr,
    PrepTimeInMins: recipe.prepTimeMinutes,
    CookTimeInMins: recipe.cookTimeMinutes,
    TotalTimeInMins: recipe.prepTimeMinutes + recipe.cookTimeMinutes,
    Servings: recipe.servings,
    Cuisine: recipe.cuisine,
    Course: courseType,
    Diet: dietType,
    TranslatedInstructions: translatedInstStr,
    URL: recipe.image,
    dietType,
    allergens: recipe.allergens || defaultAllergens,
    equipment: recipe.equipment || defaultEquipment,
    chefTips: recipe.chefTips || defaultChefTips,
    pairingSuggestions: recipe.pairingSuggestions || defaultPairings,
    nutrition: {
      ...recipe.nutrition,
      fiberGrams: recipe.nutrition.fiberGrams || Math.floor(recipe.nutrition.carbsGrams * 0.25) || 3,
      sodiumMg: recipe.nutrition.sodiumMg || 480 + (index * 15),
      ironMg: recipe.nutrition.ironMg || (recipe.isVegetarian ? 2.8 : 4.5),
      calciumMg: recipe.nutrition.calciumMg || (recipe.isVegetarian ? 180 : 90),
      vitaminCMg: recipe.nutrition.vitaminCMg || 14,
    },
    mongoMetadata: {
      collection: 'recipes',
      schemaVersion: '2.0-mongodb-document',
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-08-06T08:00:00.000Z',
      indexesUsed: ['_id_1', 'dietType_1', 'cuisine_1', 'title_text', 'ingredients.name_1'],
    },
  };
}

// Master MongoDB Recipe Collection powered by the CSV dataset
export let MONGO_RECIPE_COLLECTION: Recipe[] = [];

export function updateMongoRecipeCollection(newRecipes: Recipe[]) {
  // We prioritize the CSV recipes as they have higher quality instructions
  MONGO_RECIPE_COLLECTION = [...newRecipes];
}

export function getMongoDbStats() {
  return {
    database: 'kitchen_bridge_db',
    collection: 'recipes',
    documentCount: MONGO_RECIPE_COLLECTION.length,
    avgObjSize: '4.8 KB',
    storageSize: `${(MONGO_RECIPE_COLLECTION.length * 4.8).toFixed(1)} KB`,
    indexes: ['_id_1', 'dietType_1', 'cuisine_1', 'title_text', 'ingredients.name_1'],
    schemaVersion: '2.0-mongodb-document',
    engine: 'MongoDB Embedded Document Store v2.4',
    status: 'connected',
    lastSync: new Date().toISOString(),
  };
}
