export type IngredientCategory =
  | 'vegetables'
  | 'non_veg'
  | 'spices'
  | 'dairy'
  | 'grains'
  | 'sauces_oils';

export interface PantryIngredient {
  id: string;
  name: string;
  regionalName: string; // Hinglish / Hindi name (e.g., "Pyaz", "Aalo")
  category: IngredientCategory;
  inStock: boolean;
  quantity?: string;
  isCustom?: boolean;
  addedAt?: number;
  isExpiringSoon?: boolean;
}

export interface RecipeIngredient {
  name: string;
  regionalName: string;
  quantity: number;
  unit: string;
  isMissing: boolean;
  targetBrand?: string;
  packSize?: string;
  priceInr?: number;
  substituteOption?: string;
}

export interface RecipeInstruction {
  stepNumber: number;
  title: string;
  description: string;
  durationMinutes?: number;
  proTip?: string;
}

export interface NutritionInfo {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  sodiumMg?: number;
  ironMg?: number;
  calciumMg?: number;
  vitaminCMg?: number;
}

export interface EquipmentItem {
  name: string;
  required: boolean;
  notes?: string;
}

export interface MongoDBMetadata {
  collection: string;
  schemaVersion: string;
  createdAt: string;
  updatedAt: string;
  indexesUsed?: string[];
}

export interface YouTubeVideoRecommendation {
  id: string;
  title: string;
  channelName: string;
  channelAvatar?: string;
  duration: string;
  views: string;
  publishedTime?: string;
  youtubeUrl: string;
  embedVideoId?: string;
  thumbnailUrl: string;
  chefStyle: string;
  highlights: string[];
}

// Database schema derived from Ankan-cyber/indian-recipe-finder MongoDB collection
export interface Recipe {
  id: string;
  _id?: string; // MongoDB BSON ObjectId (e.g., "63f2b1a89c...")
  mongoId?: string;
  
  // Ankan-cyber/indian-recipe-finder MongoDB fields
  Srno?: number;
  RecipeName?: string;
  TranslatedRecipeName?: string;
  IngredientsString?: string;
  TranslatedIngredients?: string;
  PrepTimeInMins?: number;
  CookTimeInMins?: number;
  TotalTimeInMins?: number;
  Servings?: number;
  Cuisine?: string;
  Course?: string;
  Diet?: string;
  TranslatedInstructions?: string;
  URL?: string;

  // Standard structured application fields
  title: string;
  subtitle: string;
  cuisine: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  rating: number;
  reviewsCount: number;
  image: string;
  servings: number;
  scaleFactor?: number;
  originalServings?: number;
  tags: string[];
  ingredients: RecipeIngredient[];
  missingCount: number;
  matchPercentage: number;
  instructions: RecipeInstruction[];
  nutrition: NutritionInfo;
  isVegetarian: boolean;
  dietType?: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Jain';
  allergens?: string[];
  equipment?: EquipmentItem[];
  chefTips?: string[];
  pairingSuggestions?: string[];
  youtubeVideos?: YouTubeVideoRecommendation[];
  mongoMetadata?: MongoDBMetadata;
  isFavorite?: boolean;
  isCustomRecipe?: boolean;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export interface MealPlanItem {
  id: string;
  recipeId: string;
  recipeTitle: string;
  recipeImage: string;
  day: DayOfWeek;
  mealSlot: MealSlot;
  servings: number;
  addedAt: number;
}

export type QuickCommPlatform = 'blinkit' | 'zepto' | 'instamart' | 'freshtohome';

export interface CartItem {
  ingredientName: string;
  regionalName: string;
  targetBrand: string;
  packSize: string;
  priceInr: number;
  quantity: number;
  platform: QuickCommPlatform;
  deepLink: string;
  webLink: string;
  inStock: boolean;
  substituteAvailable?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recipeContextTitle?: string;
  suggestedActions?: string[];
  source?: 'gemini' | 'simulated_fallback';
}

export type ActiveTab = 'app' | 'favorites' | 'planner' | 'custom' | 'prd';

export type AppTheme = 'saffron' | 'emerald' | 'dark' | 'terracotta';

export interface SubstituteOption {
  originalIngredient: string;
  substituteName: string;
  regionalSubstituteName: string;
  ratioText: string;
  culinaryNotes: string;
  isAvailableInPantry?: boolean;
}

export type AutoPlanStrategy = 'zero_waste' | 'high_protein' | 'balanced';

export interface AutoPlanPreferences {
  strategy: AutoPlanStrategy;
  targetDailyCalories: number;
  targetDailyProtein: number;
  dietFilter: 'all' | 'vegetarian' | 'non-veg';
  selectedDays?: DayOfWeek[];
}

export interface DailyNutritionSummary {
  day: DayOfWeek;
  totalCalories: number;
  totalProteinGrams: number;
  totalCarbsGrams: number;
  totalFatGrams: number;
  mealCount: number;
}

