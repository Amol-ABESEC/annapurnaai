import React, { useState } from 'react';
import { X, Clock, Users, Flame, ChefHat, ShoppingCart, Sparkles, Check, AlertCircle, Play, Wrench, ShieldAlert, Utensils, BookOpen, Zap, Youtube, Heart, Calendar, Trash2 } from 'lucide-react';
import { Recipe, QuickCommPlatform } from '../types';
import { PLATFORM_INFO } from '../data/mockData';
import { isNonVegIngredient } from '../utils/ingredientParser';
import { generateTailoredInstructions } from '../utils/datasetLoader';
import { RecipeHeaderBanner } from './RecipeHeaderBanner';
import { YouTubeRecipeVideos } from './YouTubeRecipeVideos';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  showHinglishNames?: boolean;
  onClose: () => void;
  onOpenQuickCommExport: (recipe: Recipe) => void;
  onOpenAIChatWithRecipe: (recipe: Recipe) => void;
  selectedPlatform: QuickCommPlatform;
  isFavorite?: boolean;
  onToggleFavorite?: (recipe: Recipe) => void;
  onOpenAddToMealPlan?: (recipe: Recipe) => void;
  onDeleteCustomRecipe?: (recipeId: string) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  showHinglishNames = true,
  onClose,
  onOpenQuickCommExport,
  onOpenAIChatWithRecipe,
  selectedPlatform,
  isFavorite = false,
  onToggleFavorite,
  onOpenAddToMealPlan,
  onDeleteCustomRecipe,
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [viewMode, setViewMode] = useState<'brief' | 'detailed'>('brief');

  // We should initialize servings with recipe.servings (fallback to 4 if not set)
  const initialServings = recipe?.servings || 4;
  const [servings, setServings] = useState(initialServings);

  if (!recipe) return null;

  const baseServings = recipe.originalServings || recipe.servings || 4;
  const scaleFactor = servings / baseServings;

  const scaledIngredients = recipe.ingredients.map((ing) => {
    const quantityNum = typeof ing.quantity === 'number' ? ing.quantity : Number(ing.quantity) || 0;
    return {
      ...ing,
      quantity: quantityNum > 0 ? Math.round(quantityNum * scaleFactor * 10) / 10 : ing.quantity,
    };
  });

  const scaledRecipe: Recipe = {
    ...recipe,
    servings,
    ingredients: scaledIngredients,
    scaleFactor,
    originalServings: baseServings,
  };

  const platformInfo = PLATFORM_INFO[selectedPlatform];
  const isFreshToHome = selectedPlatform === 'freshtohome';
  const missingItems = scaledIngredients.filter((ing) => {
    if (!ing.isMissing) return false;
    if (isFreshToHome) {
      return isNonVegIngredient(ing.name);
    }
    return true;
  });

  const displayInstructions = (recipe.instructions && recipe.instructions.length > 0)
    ? recipe.instructions
    : generateTailoredInstructions(
        recipe.cuisine || 'Indian',
        recipe.title,
        recipe.title,
        recipe.subtitle || '',
        'Classic',
        scaledIngredients.map(i => i.name),
        recipe.isVegetarian
      );

  const handleDecrement = () => {
    setServings((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setServings((prev) => Math.min(24, prev + 1));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#181311] border border-[#2a221f] rounded-t-3xl sm:rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl relative text-[#f0e6df] max-h-[92vh] sm:max-h-[88vh] overflow-y-auto animate-fadeIn">
        
        {/* Top Control Action Buttons */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(recipe)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border shadow-xl cursor-pointer hover:scale-105 ${
                isFavorite
                  ? 'bg-rose-500/20 text-rose-500 border-rose-500/40'
                  : 'bg-[#120f0e] hover:bg-[#241c19] text-[#f0e6df] border-[#2a221f]'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}

          {onOpenAddToMealPlan && (
            <button
              type="button"
              onClick={() => onOpenAddToMealPlan(recipe)}
              className="w-9 h-9 rounded-full bg-[#120f0e] hover:bg-[#241c19] text-[#f0e6df] flex items-center justify-center transition-all border border-[#2a221f] shadow-xl cursor-pointer hover:scale-105"
              title="Add to weekly meal plan"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
            </button>
          )}

          {recipe.isCustomRecipe && onDeleteCustomRecipe && (
            <button
              type="button"
              onClick={() => {
                onDeleteCustomRecipe(recipe.id);
              }}
              className="w-9 h-9 rounded-full bg-rose-950 hover:bg-rose-600 text-rose-300 hover:text-white flex items-center justify-center transition-all border border-rose-500/40 shadow-xl cursor-pointer hover:scale-105"
              title="Delete custom recipe"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#120f0e] hover:bg-[#241c19] text-[#f0e6df] flex items-center justify-center transition-all border border-[#2a221f] shadow-xl cursor-pointer hover:scale-105"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Culinary Header Banner */}
        <RecipeHeaderBanner recipe={recipe} size="modal" />

        {/* Quick Stat Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
          <div className="bg-[#241c19] border border-[#352a25] p-3 rounded-xl text-center">
            <span className="text-[10px] font-bold text-[#a09088] uppercase tracking-wider block">Total time</span>
            <span className="font-extrabold text-sm text-white mt-0.5 block flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#ff6224]" />
              {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min
            </span>
          </div>

          <div className="bg-[#241c19] border border-[#352a25] p-3 rounded-xl text-center">
            <span className="text-[10px] font-bold text-[#a09088] uppercase tracking-wider block">Difficulty</span>
            <span className="font-extrabold text-sm text-[#ff6224] mt-0.5 block">
              {recipe.difficulty || 'Easy'}
            </span>
          </div>

          <div className="bg-[#241c19] border border-[#352a25] p-3 rounded-xl text-center">
            <span className="text-[10px] font-bold text-[#a09088] uppercase tracking-wider block">Rating</span>
            <span className="font-extrabold text-sm text-amber-400 mt-0.5 block">
              ⭐ 4.8 (150)
            </span>
          </div>

          <div className="bg-[#241c19] border border-[#352a25] p-3 rounded-xl text-center">
            <span className="text-[10px] font-bold text-[#a09088] uppercase tracking-wider block">Serves</span>
            <span className="font-extrabold text-sm text-white mt-0.5 block">
              {servings} pax
            </span>
          </div>
        </div>

        {/* Dynamic Serving Adjuster Panel */}
        <div className="mb-6 bg-[#241c19] border border-[#352a25] p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff6224]/10 text-[#ff6224] border border-[#ff6224]/20 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5 font-serif">
                Adjust Portion Scale
              </h4>
              <p className="text-[11px] text-[#a09088] font-medium">
                Ingredients & quantities scale automatically
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stepper */}
            <div className="flex items-center bg-[#120f0e] border border-[#2a221f] rounded-xl p-1 shadow-sm">
              <button
                onClick={handleDecrement}
                disabled={servings <= 1}
                className="w-8 h-8 rounded-lg bg-[#241c19] hover:bg-[#302521] disabled:opacity-40 text-white font-bold flex items-center justify-center transition-all cursor-pointer border border-[#2a221f]"
                title="Decrease Servings"
              >
                -
              </button>
              <div className="px-4 text-center min-w-[60px]">
                <span className="font-extrabold text-sm text-[#ff6224] block">{servings}</span>
                <span className="text-[9px] text-[#a09088] uppercase font-bold block leading-none">
                  {servings === 1 ? 'Serves' : 'Serves'}
                </span>
              </div>
              <button
                onClick={handleIncrement}
                disabled={servings >= 24}
                className="w-8 h-8 rounded-lg bg-[#241c19] hover:bg-[#302521] disabled:opacity-40 text-white font-bold flex items-center justify-center transition-all cursor-pointer border border-[#2a221f]"
                title="Increase Servings"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Ingredients & Order Action Section */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-serif text-base text-white flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-[#ff6224]" />
              Required Ingredients ({scaledIngredients.length})
            </h3>

            {missingItems.length > 0 && (
              <button
                onClick={() => onOpenQuickCommExport(scaledRecipe)}
                className="px-4 py-2 rounded-xl bg-[#ff6224] hover:bg-[#e85418] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Get {missingItems.length} missing in 10 min</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {scaledIngredients.map((ing, idx) => {
              const isNonVeg = isNonVegIngredient(ing.name);

              return (
                <div
                  key={`${ing.name}-${idx}`}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    ing.isMissing
                      ? 'bg-red-950/20 border-red-500/30 text-white'
                      : 'bg-[#241c19] border-[#352a25] text-[#f0e6df]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isNonVeg ? (
                      <span className="w-3.5 h-3.5 border border-red-500 rounded-xs bg-[#120f0e] flex items-center justify-center shrink-0" title="Non-Vegetarian">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 border border-emerald-500 rounded-xs bg-[#120f0e] flex items-center justify-center shrink-0" title="Vegetarian">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </span>
                    )}

                    <div className="min-w-0">
                      <span className="font-semibold block truncate">
                        {showHinglishNames && ing.regionalName && ing.regionalName.toLowerCase() !== ing.name.toLowerCase()
                          ? `${ing.regionalName} / ${ing.name}`
                          : ing.name}
                      </span>
                      {ing.isMissing ? (
                        <span className="text-[10px] text-red-400 font-bold block">
                          Missing • Tap to order
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-medium block">
                          In pantry
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="font-bold text-[#ff6224] shrink-0 ml-2">
                    {ing.quantity} {ing.unit}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Per Serving Nutrition Breakdown */}
        <div className="mb-6 bg-[#241c19] p-4 rounded-2xl border border-[#352a25]">
          <h4 className="text-xs font-bold font-serif text-white uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#ff6224]" />
            Per Serving Nutrition
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-[#120f0e] p-2.5 rounded-xl border border-[#2a221f] text-center">
              <span className="text-[10px] text-[#a09088] uppercase font-semibold block">Calories</span>
              <span className="font-bold text-orange-400 text-sm">{recipe.nutrition.calories} kcal</span>
            </div>
            <div className="bg-[#120f0e] p-2.5 rounded-xl border border-[#2a221f] text-center">
              <span className="text-[10px] text-[#a09088] uppercase font-semibold block">Protein</span>
              <span className="font-bold text-[#ff6224] text-sm">{Math.round(recipe.nutrition.proteinGrams)}g</span>
            </div>
            <div className="bg-[#120f0e] p-2.5 rounded-xl border border-[#2a221f] text-center">
              <span className="text-[10px] text-[#a09088] uppercase font-semibold block">Carbs</span>
              <span className="font-bold text-white text-sm">{Math.round(recipe.nutrition.carbsGrams)}g</span>
            </div>
            <div className="bg-[#120f0e] p-2.5 rounded-xl border border-[#2a221f] text-center">
              <span className="text-[10px] text-[#a09088] uppercase font-semibold block">Fat</span>
              <span className="font-bold text-[#a09088] text-sm">{Math.round(recipe.nutrition.fatGrams)}g</span>
            </div>
          </div>
        </div>

        {/* Method / Cooking Steps */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-serif text-base text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-[#ff6224] fill-[#ff6224]" />
              Cooking Instructions ({displayInstructions.length} Steps)
            </h3>

            <button
              onClick={() => onOpenAIChatWithRecipe(recipe)}
              className="px-3 py-1.5 bg-[#241c19] hover:bg-[#302521] text-[#ff6224] border border-[#ff6224]/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start cook mode</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {displayInstructions.map((step) => (
              <div
                key={step.stepNumber}
                className="p-4 rounded-2xl border border-[#2a221f] bg-[#241c19] text-[#f0e6df] flex items-start gap-3.5"
              >
                <div className="w-7 h-7 rounded-full bg-[#ff6224] text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                  {step.stepNumber}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">
                      {step.title && !step.title.toLowerCase().startsWith('step') ? step.title : `Step ${step.stepNumber}`}
                    </span>
                    {step.durationMinutes && (
                      <span className="text-[10px] text-[#a09088] bg-[#120f0e] border border-[#2a221f] px-2 py-0.5 rounded-md font-semibold">
                        ~{step.durationMinutes} mins
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-[#d0c4bd]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* YouTube Recommended Video Chef Guides */}
        <div className="mt-6">
          <YouTubeRecipeVideos recipe={recipe} compact />
        </div>

        {/* AI Assistant Banner */}
        <div className="mt-6 p-4 bg-[#241c19] border border-[#352a25] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#ff6224] shrink-0" />
            <div className="text-xs text-[#f0e6df] font-medium">
              <b>Need step-by-step guidance?</b> Ask Annapurna AI for substitute ratios, spice tweaks, or voice guidance!
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenAIChatWithRecipe(recipe);
            }}
            className="px-4 py-2 bg-[#ff6224] hover:bg-[#e85418] text-white font-bold text-xs rounded-xl transition-all shrink-0 shadow-sm cursor-pointer"
          >
            Ask Annapurna AI
          </button>
        </div>

      </div>
    </div>
  );
};

