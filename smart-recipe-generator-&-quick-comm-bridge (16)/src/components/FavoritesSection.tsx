import React from 'react';
import { Bookmark, Heart, ChefHat, Sparkles } from 'lucide-react';
import { Recipe, QuickCommPlatform } from '../types';
import { RecipeFeed } from './RecipeFeed';

interface FavoritesSectionProps {
  favoriteRecipes: Recipe[];
  showHinglishNames?: boolean;
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenQuickCommExport: (recipe: Recipe) => void;
  selectedPlatform: QuickCommPlatform;
  selectedCuisine?: string;
  onSelectCuisine?: (cuisine: string) => void;
  onExploreAllRecipes: () => void;
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({
  favoriteRecipes,
  showHinglishNames = true,
  onSelectRecipe,
  onOpenQuickCommExport,
  selectedPlatform,
  selectedCuisine,
  onSelectCuisine,
  onExploreAllRecipes,
}) => {
  if (favoriteRecipes.length === 0) {
    return (
      <div className="bg-[#181311] border border-[#2a221f] rounded-2xl p-8 text-center space-y-4 max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-[#ff6224]/10 border border-[#ff6224]/20 flex items-center justify-center text-[#ff6224] mx-auto">
          <Heart className="w-8 h-8 text-[#ff6224]" />
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold font-serif text-xl text-white">No Favorite Recipes Saved Yet</h3>
          <p className="text-xs text-[#a09088] max-w-md mx-auto">
            Click the heart icon on any recipe card or detail modal to save your go-to dishes for fast access anytime!
          </p>
        </div>
        <button
          onClick={onExploreAllRecipes}
          className="px-5 py-2.5 rounded-xl bg-[#ff6224] hover:bg-[#e04f14] text-white font-bold text-xs shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <ChefHat className="w-4 h-4" /> Explore Kitchen Feed
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#181311] p-6 rounded-2xl border border-[#2a221f] shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <Heart className="w-6 h-6 fill-rose-500" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold font-serif text-white">Your Saved Favorites</h2>
            <p className="text-xs text-[#a09088]">
              {favoriteRecipes.length} saved {favoriteRecipes.length === 1 ? 'recipe' : 'recipes'} in your personal cookbook
            </p>
          </div>
        </div>
      </div>

      <RecipeFeed
        recipes={favoriteRecipes}
        showHinglishNames={showHinglishNames}
        onSelectRecipe={onSelectRecipe}
        onOpenQuickCommExport={onOpenQuickCommExport}
        selectedPlatform={selectedPlatform}
        selectedCuisine={selectedCuisine}
        onSelectCuisine={onSelectCuisine}
      />
    </div>
  );
};
