import React, { useState } from 'react';
import { Clock, ChefHat, ShoppingCart, Sparkles, CheckCircle2, ChevronRight, Search, X, Filter, Utensils, Heart, Calendar, Trash2 } from 'lucide-react';
import { Recipe } from '../types';
import { RecipeHeaderBanner } from './RecipeHeaderBanner';
import { cleanRecipeTitle } from '../utils/titleCleaner';

interface RecipeFeedProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenQuickCommExport: (recipe: Recipe) => void;
  selectedCuisine?: string;
  onSelectCuisine?: (cuisine: string) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (recipe: Recipe) => void;
  onOpenAddToMealPlan?: (recipe: Recipe) => void;
  onDeleteCustomRecipe?: (recipeId: string) => void;
}

const CUISINE_OPTIONS = [
  'All Cuisines',
  'Indian',
  'North Indian',
  'South Indian',
  'Punjabi',
  'Mughlai',
  'Street Food',
  'Indo Chinese',
  'Bengali',
  'Rajasthani',
  'Maharashtrian',
  'Gujarati',
  'Kerala',
  'Tamil Nadu',
  'Andhra',
  'Chettinad',
  'Goan',
  'Kashmiri',
  'Hyderabadi',
  'Karnataka',
  'Continental',
  'Italian',
  'Mexican',
  'Asian',
  'Fusion'
];

const COURSE_OPTIONS = [
  'All Courses',
  'Main Course',
  'Breakfast',
  'Appetizer / Snack',
  'Side Dish',
  'Dessert',
  'Beverage',
];

const QUICK_SEARCH_CHIPS = [
  'Paneer',
  'Chicken',
  'Mutton / Gosht',
  'Laal Maas',
  'Rogan Josh',
  'Litti Chokha',
  'Fish',
  'Dosa',
  'Dal',
  'Spicy',
];

export const RecipeFeed: React.FC<RecipeFeedProps> = ({
  recipes,
  onSelectRecipe,
  onOpenQuickCommExport,
  selectedCuisine: selectedCuisineProp,
  onSelectCuisine: onSelectCuisineProp,
  favoriteIds = [],
  onToggleFavorite,
  onOpenAddToMealPlan,
  onDeleteCustomRecipe,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'custom' | 'veg' | 'nonveg' | 'ready' | 'missing' | 'quick'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [internalCuisine, setInternalCuisine] = useState('All Cuisines');
  const [selectedCourse, setSelectedCourse] = useState('All Courses');
  const [displayLimit, setDisplayLimit] = useState(24);

  const activeCuisine = selectedCuisineProp !== undefined ? selectedCuisineProp : internalCuisine;
  const setActiveCuisine = (c: string) => {
    if (onSelectCuisineProp) {
      onSelectCuisineProp(c);
    }
    setInternalCuisine(c);
  };

  // Dynamically compute cuisine counts and filter out empty cuisines
  const { availableCuisines, cuisineCounts } = React.useMemo(() => {
    const counts: Record<string, number> = { 'All Cuisines': recipes.length };

    const activeList = CUISINE_OPTIONS.filter((c) => {
      if (c === 'All Cuisines') return true;
      const matchCount = recipes.filter((recipe) => {
        const rCuisine = (recipe.cuisine || '').toLowerCase().trim();
        const activeLower = c.toLowerCase().trim();
        if (activeLower === 'indian') {
          const isExplicitNonIndian = ['mexican', 'continental', 'italian', 'chinese', 'thai', 'asian', 'european', 'mediterranean', 'middle eastern', 'american', 'french', 'japanese', 'spanish'].some((non) => rCuisine.includes(non));
          if (isExplicitNonIndian) return false;
          return rCuisine.includes('indian') || recipe.tags.some((t) => t.toLowerCase() === 'indian cuisine' || t.toLowerCase() === 'indian');
        }
        return (
          rCuisine === activeLower ||
          rCuisine.includes(activeLower) ||
          activeLower.includes(rCuisine) ||
          recipe.tags.some((t) => t.toLowerCase() === activeLower)
        );
      }).length;

      if (matchCount > 0) {
        counts[c] = matchCount;
        return true;
      }
      return false;
    });

    return { availableCuisines: activeList, cuisineCounts: counts };
  }, [recipes]);

  const customCount = React.useMemo(() => recipes.filter((r) => r.isCustomRecipe).length, [recipes]);

  const filteredRecipes = recipes.filter((recipe) => {
    // Cuisine filter
    if (activeCuisine !== 'All Cuisines') {
      const activeLower = activeCuisine.toLowerCase().trim();
      const rCuisine = (recipe.cuisine || '').toLowerCase().trim();
      if (activeLower === 'indian') {
        const isExplicitNonIndian = ['mexican', 'continental', 'italian', 'chinese', 'thai', 'asian', 'european', 'mediterranean', 'middle eastern', 'american', 'french', 'japanese', 'spanish'].some((non) => rCuisine.includes(non));
        if (isExplicitNonIndian) return false;
        const isIndian = rCuisine.includes('indian') || recipe.tags.some((t) => t.toLowerCase() === 'indian cuisine' || t.toLowerCase() === 'indian');
        if (!isIndian) return false;
      } else {
        const matchExact = rCuisine === activeLower;
        const matchContains = rCuisine.includes(activeLower) || activeLower.includes(rCuisine);
        const matchTag = recipe.tags.some((t) => t.toLowerCase() === activeLower);
        if (!matchExact && !matchContains && !matchTag) return false;
      }
    }

    // Course filter
    if (selectedCourse !== 'All Courses' && recipe.Course !== selectedCourse) {
      return false;
    }

    // Search query match
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = recipe.title.toLowerCase().includes(q);
      const matchSubtitle = recipe.subtitle.toLowerCase().includes(q);
      const matchCuisine = recipe.cuisine.toLowerCase().includes(q);
      const matchTags = recipe.tags.some((t) => t.toLowerCase().includes(q));
      const matchIngredients = recipe.ingredients.some(
        (ing) => ing.name.toLowerCase().includes(q) || (ing.regionalName && ing.regionalName.toLowerCase().includes(q))
      );

      if (!matchTitle && !matchSubtitle && !matchCuisine && !matchTags && !matchIngredients) {
        return false;
      }
    }

    // Dietary & Inventory Status filter
    if (filterTab === 'custom') return recipe.isCustomRecipe;
    if (filterTab === 'veg') return recipe.isVegetarian;
    if (filterTab === 'nonveg') return !recipe.isVegetarian;
    if (filterTab === 'ready') return recipe.missingCount === 0;
    if (filterTab === 'missing') return recipe.missingCount > 0 && recipe.missingCount <= 2;
    if (filterTab === 'quick') return recipe.cookTimeMinutes + recipe.prepTimeMinutes <= 25;

    return true;
  });

  const readyToCookCount = React.useMemo(() => recipes.filter((r) => r.missingCount === 0).length, [recipes]);
  const almostReadyCount = React.useMemo(() => recipes.filter((r) => r.missingCount > 0 && r.missingCount <= 2).length, [recipes]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterTab('all');
    setActiveCuisine('All Cuisines');
    setSelectedCourse('All Courses');
    setDisplayLimit(24);
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome Banner */}
      <div className="bg-[#181311] border border-[#2a221f] rounded-2xl p-6 sm:p-8 text-[#f0e6df] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff6224]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#ff6224]" />
            <span className="text-xs font-bold text-[#ff6224] uppercase tracking-wider">
              Smart Recipe Engine • Quick-Comm Bridge
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight leading-tight mb-3">
            Cook what's <span className="italic font-serif text-[#ff6224]">already</span> in your kitchen.
          </h1>

          <p className="text-sm sm:text-base text-[#a09088] leading-relaxed mb-6">
            Explore authentic dishes matched live against your pantry ingredients. Missing something? One tap fills the basket on Blinkit, Zepto, Instamart or FreshToHome.
          </p>

          {/* 3 Interactive Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setFilterTab('ready')}
              className={`text-left rounded-xl p-4 transition-all cursor-pointer border ${
                filterTab === 'ready'
                  ? 'bg-[#241c19] border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg'
                  : 'bg-[#241c19] border-[#352a25] hover:border-emerald-500/50 hover:bg-[#2e231f]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-3xl font-extrabold text-emerald-400 font-serif">
                  {readyToCookCount}
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {filterTab === 'ready' ? 'Active' : 'Click to view'}
                </span>
              </div>
              <div className="text-xs font-semibold text-[#f0e6df] mt-1 flex items-center gap-1">
                <span>Cook right now</span>
                <span className="text-[10px] text-emerald-400 font-bold">(0 missing)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('missing')}
              className={`text-left rounded-xl p-4 transition-all cursor-pointer border ${
                filterTab === 'missing'
                  ? 'bg-[#241c19] border-[#ff6224] ring-2 ring-[#ff6224]/50 shadow-lg'
                  : 'bg-[#241c19] border-[#352a25] hover:border-[#ff6224]/50 hover:bg-[#2e231f]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-3xl font-extrabold text-[#ff6224] font-serif">
                  {almostReadyCount}
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-[#ff6224]/10 text-[#ff6224] border border-[#ff6224]/30">
                  {filterTab === 'missing' ? 'Active' : 'Click to view'}
                </span>
              </div>
              <div className="text-xs font-semibold text-[#a09088] mt-1 flex items-center gap-1">
                <span>1–2 items away</span>
                <span className="text-[10px] text-[#ff6224] font-bold">(Almost ready)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`text-left rounded-xl p-4 transition-all cursor-pointer border ${
                filterTab === 'all'
                  ? 'bg-[#241c19] border-white/40 ring-2 ring-white/30 shadow-lg'
                  : 'bg-[#241c19] border-[#352a25] hover:border-white/30 hover:bg-[#2e231f]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-3xl font-extrabold text-white font-serif">
                  {recipes.length}
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/20">
                  {filterTab === 'all' ? 'Active' : 'Click to view'}
                </span>
              </div>
              <div className="text-xs font-semibold text-[#a09088] mt-1">Total Recipes</div>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#181311] p-5 sm:p-6 rounded-2xl border border-[#2a221f] shadow-lg space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-[#ff6224]/10 text-[#ff6224] border border-[#ff6224]/20">
                <ChefHat className="w-5 h-5 text-[#ff6224]" />
              </div>
              <h2 className="text-xl font-bold font-serif text-white">Explore & Search Recipes</h2>
            </div>
            <p className="text-xs text-[#a09088] mt-1">
              Search across {recipes.length}+ authentic recipes by dish name, cuisine, diet, or key ingredients
            </p>
          </div>

          <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#ff6224]/10 border border-[#ff6224]/20 text-[#ff6224] self-start md:self-auto shadow-2xs">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'Dish Available' : 'Dishes Available'}
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#73635b]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes, ingredients (e.g. Paneer, Chicken, Dhania), or regional styles..."
            className="w-full pl-10 pr-10 py-2.5 bg-[#120f0e] border border-[#2a221f] rounded-xl text-xs sm:text-sm text-[#f0e6df] placeholder-[#73635b] focus:outline-none focus:border-[#ff6224] focus:ring-1 focus:ring-[#ff6224] transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#73635b] hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center gap-2 pb-1 text-xs">
          <span className="text-[#a09088] font-medium whitespace-nowrap flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-[#ff6224]" />
            Popular:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x py-1">
            {QUICK_SEARCH_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => setSearchQuery(chip)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all whitespace-nowrap cursor-pointer snap-start ${
                  searchQuery.toLowerCase() === chip.toLowerCase()
                    ? 'bg-[#ff6224] text-white border-[#ff6224] font-bold'
                    : 'bg-[#120f0e] text-[#a09088] border-[#2a221f] hover:bg-[#241c19] hover:text-white'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Regional Cuisine Tabs & Status Filters */}
        <div className="pt-3 border-t border-[#2a221f] space-y-3">
          
            {/* Cuisines */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 pb-1">
              <span className="text-[#a09088] text-xs font-medium whitespace-nowrap flex items-center gap-1 shrink-0">
                <Utensils className="w-3 h-3 text-[#ff6224]" />
                Cuisine:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar snap-x py-1 w-full">
                {availableCuisines.map((cuisine) => {
                  const count = cuisineCounts[cuisine];
                  return (
                    <button
                      key={cuisine}
                      onClick={() => setActiveCuisine(cuisine)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer snap-start flex items-center gap-1.5 ${
                        activeCuisine === cuisine
                          ? 'bg-[#ff6224] text-white shadow-xs font-bold'
                          : 'bg-[#120f0e] text-[#a09088] border border-[#2a221f] hover:bg-[#241c19] hover:text-white'
                      }`}
                    >
                      <span>{cuisine}</span>
                      {count !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                          activeCuisine === cuisine
                            ? 'bg-black/20 text-white'
                            : 'bg-[#241c19] text-[#ff6224]'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Course / Category */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 pb-1">
              <span className="text-[#a09088] text-xs font-medium whitespace-nowrap flex items-center gap-1 shrink-0">
                <ChefHat className="w-3 h-3 text-[#ff6224]" />
                Category:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar snap-x py-1 w-full">
                {COURSE_OPTIONS.map((course) => (
                  <button
                    key={course}
                    onClick={() => setSelectedCourse(course)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer snap-start ${
                      selectedCourse === course
                        ? 'bg-[#ff6224] text-white shadow-xs font-bold'
                        : 'bg-[#120f0e] text-[#a09088] border border-[#2a221f] hover:bg-[#241c19] hover:text-white'
                    }`}
                  >
                    {course}
                  </button>
                ))}
              </div>
            </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            <span className="text-[#a09088] text-xs font-medium whitespace-nowrap mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#ff6224]" />
              Match & Diet:
            </span>
            {[
              { id: 'all', label: `All Recipes (${recipes.length})` },
              ...(customCount > 0 ? [{ id: 'custom', label: `⭐ Custom Dishes (${customCount})` }] : []),
              { id: 'ready', label: `🍳 Ready to Cook (${readyToCookCount})` },
              { id: 'missing', label: `🛒 1–2 Items Away (${almostReadyCount})` },
              { id: 'veg', label: '🟢 Pure Veg' },
              { id: 'nonveg', label: '🔴 Non-Veg' },
              { id: 'quick', label: '⚡ <25 Mins' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterTab === tab.id
                    ? 'bg-[#ff6224] text-white shadow-xs font-bold ring-1 ring-[#ff6224]'
                    : 'bg-[#120f0e] text-[#a09088] border border-[#2a221f] hover:bg-[#241c19] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Active Filter Info Banner when Ready to Cook or 1-2 Items Away is selected */}
      {filterTab === 'ready' && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-200 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div>
              <strong className="text-emerald-300 text-sm">Cook Right Now ({filteredRecipes.length} dishes):</strong>
              <span className="ml-1 text-emerald-100/90">
                These recipes require 0 missing ingredients based on items currently in your kitchen pantry!
              </span>
            </div>
          </div>
          <button
            onClick={() => setFilterTab('all')}
            className="self-start sm:self-auto px-3 py-1.5 bg-emerald-800/50 hover:bg-emerald-800/80 border border-emerald-500/50 rounded-lg text-white font-bold transition-all text-xs cursor-pointer shrink-0"
          >
            Show All Recipes
          </button>
        </div>
      )}

      {filterTab === 'missing' && (
        <div className="bg-orange-950/40 border border-[#ff6224]/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-orange-200 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#ff6224] shrink-0" />
            <div>
              <strong className="text-[#ff6224] text-sm">1–2 Items Away ({filteredRecipes.length} dishes):</strong>
              <span className="ml-1 text-orange-100/90">
                You're almost there! Order just 1 or 2 missing ingredients on Quick-Comm (Blinkit/Zepto/Instamart) to cook these.
              </span>
            </div>
          </div>
          <button
            onClick={() => setFilterTab('all')}
            className="self-start sm:self-auto px-3 py-1.5 bg-[#ff6224]/30 hover:bg-[#ff6224]/50 border border-[#ff6224]/50 rounded-lg text-white font-bold transition-all text-xs cursor-pointer shrink-0"
          >
            Show All Recipes
          </button>
        </div>
      )}

      {/* Zero State if search or filters match nothing */}
      {filteredRecipes.length === 0 && (
        <div className="bg-[#181311] border border-[#2a221f] rounded-2xl p-10 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#120f0e] border border-[#2a221f] flex items-center justify-center mx-auto text-[#73635b]">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold font-serif text-white">No matching Indian dishes found</h3>
          <p className="text-xs text-[#a09088] max-w-md mx-auto">
            We couldn't find any recipes matching "{searchQuery || activeCuisine}" with your active filter selections.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#ff6224] text-white text-xs font-bold rounded-xl hover:bg-[#e85418] transition-all shadow-sm cursor-pointer"
          >
            Clear Search & Reset Filters
          </button>
        </div>
      )}

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRecipes.slice(0, displayLimit).map((recipe) => {
          const missingItems = recipe.ingredients.filter((ing) => ing.isMissing);

          return (
            <div
              key={recipe.id}
              className="bg-gradient-to-b from-[#1c1613] to-[#140e0c] border border-[#332722] rounded-2xl overflow-hidden shadow-xl hover:border-[#ff6224]/60 hover:shadow-2xl hover:shadow-[#ff6224]/15 transition-all duration-300 flex flex-col group cursor-pointer hover:-translate-y-1.5 text-[#f0e6df] relative"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest('button')) return;
                onSelectRecipe(recipe);
              }}
            >
              {/* Card Banner */}
              <div className="relative">
                <RecipeHeaderBanner recipe={recipe} size="card" />

                {/* Custom Recipe Badge on Top Left */}
                {recipe.isCustomRecipe && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-[#ff6224] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border border-orange-400 flex items-center gap-1 uppercase tracking-wider">
                      <ChefHat className="w-3 h-3" /> Custom
                    </span>
                  </div>
                )}

                {/* Card Quick Actions Overlay */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                  {onToggleFavorite && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(recipe);
                      }}
                      className={`p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer shadow-lg hover:scale-110 ${
                        favoriteIds.includes(recipe.id)
                          ? 'bg-rose-500/80 text-white border-rose-400'
                          : 'bg-black/60 text-white/80 border-white/20 hover:text-rose-400 hover:bg-black/80'
                      }`}
                      title={favoriteIds.includes(recipe.id) ? 'Saved in favorites' : 'Save to favorites'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${favoriteIds.includes(recipe.id) ? 'fill-white text-white' : ''}`} />
                    </button>
                  )}

                  {onOpenAddToMealPlan && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAddToMealPlan(recipe);
                      }}
                      className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-amber-300 border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-110"
                      title="Add to weekly meal plan"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {recipe.isCustomRecipe && onDeleteCustomRecipe && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCustomRecipe(recipe.id);
                      }}
                      className="p-2 rounded-full bg-rose-950/80 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition-all cursor-pointer shadow-lg hover:scale-110"
                      title="Delete custom recipe"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  {/* Full Recipe Name */}
                  <h3 className="text-base sm:text-lg font-extrabold font-serif text-white group-hover:text-[#ff6224] transition-colors leading-snug">
                    {cleanRecipeTitle(recipe.title)}
                  </h3>

                  {/* Cuisine & Cooking Meta Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {recipe.isCustomRecipe && (
                      <span className="bg-[#ff6224]/20 text-[#ff6224] border border-[#ff6224]/40 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ChefHat className="w-3 h-3 text-[#ff6224]" /> Custom Dish
                      </span>
                    )}
                    <span className="bg-[#241c19] text-[#ff6224] border border-[#ff6224]/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {recipe.cuisine}
                    </span>
                    {recipe.Course && (
                      <span className="bg-[#241c19] text-[#a09088] border border-[#352a25] text-[10px] font-medium px-2 py-0.5 rounded-md">
                        {recipe.Course}
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-[#a09088] flex items-center gap-1 ml-auto">
                      <Clock className="w-3.5 h-3.5 text-[#ff6224]" />
                      {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins
                    </span>
                  </div>

                  {recipe.subtitle && (
                    <p className="text-xs text-[#a09088] mt-2 leading-relaxed">
                      {recipe.subtitle}
                    </p>
                  )}

                  {/* Missing Items Highlight Box */}
                  {missingItems.length > 0 ? (
                    <div className="mt-3 p-3 bg-[#241c19] border border-[#352a25] rounded-xl flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-red-400 block line-clamp-1">
                          Missing {missingItems.length}: {missingItems.map(m => m.name).join(', ')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenQuickCommExport(recipe);
                        }}
                        className="px-3 py-1.5 bg-[#ff6224] hover:bg-[#e85418] text-white text-xs font-bold rounded-lg transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Basket</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 p-2.5 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        100% ingredients in pantry
                      </span>
                    </div>
                  )}
                </div>

                {/* Card CTA Actions */}
                <div className="pt-3 border-t border-[#2a221f] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectRecipe(recipe)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#241c19] hover:bg-[#302521] text-[#f0e6df] text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer border border-[#2a221f]"
                  >
                    <span>View Recipe Steps</span>
                    <ChevronRight className="w-4 h-4 text-[#a09088]" />
                  </button>

                  {missingItems.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => onOpenQuickCommExport(recipe)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#ff6224] hover:bg-[#e85418] text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Order Missing</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectRecipe(recipe)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Start Cooking</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button for large dataset */}
      {filteredRecipes.length > displayLimit && (
        <div className="text-center pt-6 pb-2">
          <button
            type="button"
            onClick={() => setDisplayLimit((prev) => prev + 24)}
            className="px-6 py-3 bg-[#241c19] hover:bg-[#302521] text-[#f0e6df] border border-[#2a221f] font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Load More Indian Recipes ({filteredRecipes.length - displayLimit} Remaining)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
