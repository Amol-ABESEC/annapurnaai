import React from 'react';
import { ChefHat, Plus, Trash2, Sparkles, Clock, Flame, Utensils } from 'lucide-react';
import { Recipe, QuickCommPlatform } from '../types';
import { RecipeFeed } from './RecipeFeed';

interface CustomRecipesSectionProps {
  customRecipes: Recipe[];
  showHinglishNames?: boolean;
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenQuickCommExport: (recipe: Recipe) => void;
  selectedPlatform: QuickCommPlatform;
  onOpenCreateRecipeModal: () => void;
  onDeleteCustomRecipe: (recipeId: string) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (recipe: Recipe) => void;
  onOpenAddToMealPlan?: (recipe: Recipe) => void;
  onExploreAllRecipes: () => void;
}

export const CustomRecipesSection: React.FC<CustomRecipesSectionProps> = ({
  customRecipes,
  showHinglishNames = true,
  onSelectRecipe,
  onOpenQuickCommExport,
  selectedPlatform,
  onOpenCreateRecipeModal,
  onDeleteCustomRecipe,
  favoriteIds = [],
  onToggleFavorite,
  onOpenAddToMealPlan,
  onExploreAllRecipes,
}) => {
  if (customRecipes.length === 0) {
    return (
      <div className="bg-[#181311] border border-[#2a221f] rounded-2xl p-8 text-center space-y-4 max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-[#ff6224]/10 border border-[#ff6224]/20 flex items-center justify-center text-[#ff6224] mx-auto">
          <ChefHat className="w-8 h-8 text-[#ff6224]" />
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold font-serif text-xl text-white">No Custom Dishes Added Yet</h3>
          <p className="text-xs text-[#a09088] max-w-md mx-auto">
            You haven't created any custom dishes yet. Add your family secret recipes or regional specialties to calculate ingredient matches and quick-comm orders!
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenCreateRecipeModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6224] to-[#e04f14] hover:from-[#ff733b] text-white font-bold text-xs shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Custom Recipe
          </button>
          <button
            onClick={onExploreAllRecipes}
            className="px-4 py-2.5 rounded-xl bg-[#241c19] hover:bg-[#2e231f] text-[#a09088] hover:text-white font-semibold text-xs transition-all border border-[#382d28] cursor-pointer"
          >
            Explore Curated Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#1f1714] via-[#181311] to-[#241b18] p-6 rounded-2xl border border-[#2a221f] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#ff6224]/10 text-[#ff6224] border border-[#ff6224]/20">
            <ChefHat className="w-6 h-6 text-[#ff6224]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold font-serif text-white">My Custom Dishes</h2>
              <span className="bg-[#ff6224]/20 text-[#ff6224] text-[10px] font-black px-2 py-0.5 rounded-full border border-[#ff6224]/30 uppercase tracking-wider">
                Personal Cookbook
              </span>
            </div>
            <p className="text-xs text-[#a09088] mt-0.5">
              {customRecipes.length} custom user-created {customRecipes.length === 1 ? 'recipe' : 'recipes'} separate from curated database
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreateRecipeModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6224] to-[#e04f14] hover:from-[#ff733b] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Another Recipe
        </button>
      </div>

      {/* Recipe Feed filtered to custom recipes */}
      <RecipeFeed
        recipes={customRecipes}
        showHinglishNames={showHinglishNames}
        onSelectRecipe={onSelectRecipe}
        onOpenQuickCommExport={onOpenQuickCommExport}
        selectedPlatform={selectedPlatform}
        favoriteIds={favoriteIds}
        onToggleFavorite={onToggleFavorite}
        onOpenAddToMealPlan={onOpenAddToMealPlan}
        onDeleteCustomRecipe={onDeleteCustomRecipe}
      />
    </div>
  );
};
