import React, { useState, useEffect, useMemo } from 'react';
import { ActiveTab, PantryIngredient, Recipe, QuickCommPlatform, IngredientCategory, MealPlanItem } from './types';
import { INITIAL_PANTRY_ITEMS, MOCK_RECIPES } from './data/mockData';
import { fetchLargeRecipeDataset } from './utils/datasetLoader';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { InventorySection } from './components/InventorySection';
import { RecipeFeed } from './components/RecipeFeed';
import { QuickCommModal } from './components/QuickCommModal';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { AICookingAssistant } from './components/AICookingAssistant';
import { ChefChat } from './components/ChefChat';
import { MealPlannerSection } from './components/MealPlannerSection';
import { FavoritesSection } from './components/FavoritesSection';
import { CustomRecipesSection } from './components/CustomRecipesSection';
import { AddToMealPlanModal } from './components/AddToMealPlanModal';
import { CreateRecipeModal } from './components/CreateRecipeModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { parseSmartIngredient } from './utils/ingredientParser';
import { Plus, ChefHat } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('app');
  const [pantryItems, setPantryItems] = useState<PantryIngredient[]>(INITIAL_PANTRY_ITEMS);
  const [showHinglishNames, setShowHinglishNames] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<QuickCommPlatform>('blinkit');
  const [location, setLocation] = useState('Bengaluru (Indiranagar 560038)');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All Cuisines');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Favorites state persisted in LocalStorage
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('annapurna_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Weekly Meal Plan state persisted in LocalStorage
  const [mealPlanItems, setMealPlanItems] = useState<MealPlanItem[]>(() => {
    try {
      const saved = localStorage.getItem('annapurna_meal_plan');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Custom User Recipes state persisted in LocalStorage
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem('annapurna_custom_recipes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [selectedRecipeForDetail, setSelectedRecipeForDetail] = useState<Recipe | null>(null);
  const [selectedRecipeForExport, setSelectedRecipeForExport] = useState<Recipe | null>(null);
  const [recipeForMealPlan, setRecipeForMealPlan] = useState<Recipe | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [chatRecipeContext, setChatRecipeContext] = useState<Recipe | null>(null);
  const [baseRecipes, setBaseRecipes] = useState<Recipe[]>(MOCK_RECIPES);

  useEffect(() => {
    localStorage.setItem('annapurna_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  useEffect(() => {
    localStorage.setItem('annapurna_meal_plan', JSON.stringify(mealPlanItems));
  }, [mealPlanItems]);

  useEffect(() => {
    localStorage.setItem('annapurna_custom_recipes', JSON.stringify(customRecipes));
  }, [customRecipes]);

  useEffect(() => {
    fetchLargeRecipeDataset().then((dataset) => {
      if (dataset && dataset.length > 0) {
        setBaseRecipes(dataset);
      }
    });
  }, []);

  const handleToggleFavorite = (recipe: Recipe) => {
    setFavoriteIds((prev) =>
      prev.includes(recipe.id) ? prev.filter((id) => id !== recipe.id) : [...prev, recipe.id]
    );
  };

  const handleAddMealPlanItem = (item: MealPlanItem) => {
    setMealPlanItems((prev) => [item, ...prev]);
  };

  const handleRemoveMealPlanItem = (id: string) => {
    setMealPlanItems((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearMealPlan = () => {
    setMealPlanItems([]);
  };

  const handleAddCustomRecipe = (newRecipe: Recipe) => {
    const customWithFlag: Recipe = { ...newRecipe, isCustomRecipe: true };
    setCustomRecipes((prev) => [customWithFlag, ...prev]);
    setActiveTab('custom');
  };

  const handleRequestDeleteCustomRecipe = (recipeId: string) => {
    const recipe = customRecipes.find((r) => r.id === recipeId) || computedRecipes.find((r) => r.id === recipeId);
    if (recipe) {
      setRecipeToDelete(recipe);
    }
  };

  const handleConfirmDeleteCustomRecipe = (recipeId: string) => {
    setCustomRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    setFavoriteIds((prev) => prev.filter((id) => id !== recipeId));
    setMealPlanItems((prev) => prev.filter((m) => m.recipeId !== recipeId));
    if (selectedRecipeForDetail?.id === recipeId) {
      setSelectedRecipeForDetail(null);
    }
    setRecipeToDelete(null);
  };

  const handleExportWeeklyGroceryCart = (
    aggregatedItems: Array<{ name: string; regionalName: string; quantity: number; unit: string }>
  ) => {
    // Create a composite dummy recipe to trigger the QuickCommModal for the aggregated list
    const compositeRecipe: Recipe = {
      id: 'weekly-grocery-export',
      title: 'Weekly Meal Plan Grocery Cart',
      subtitle: `${aggregatedItems.length} combined ingredients for your weekly menu`,
      cuisine: 'Indian',
      prepTimeMinutes: 0,
      cookTimeMinutes: 0,
      difficulty: 'Easy',
      rating: 5,
      reviewsCount: 1,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
      servings: 4,
      tags: ['Grocery Basket'],
      ingredients: aggregatedItems.map((item) => ({
        name: item.name,
        regionalName: item.regionalName,
        quantity: item.quantity,
        unit: item.unit,
        isMissing: true,
      })),
      missingCount: aggregatedItems.length,
      matchPercentage: 0,
      instructions: [],
      nutrition: { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 },
      isVegetarian: true,
    };

    setSelectedRecipeForExport(compositeRecipe);
  };

  // Dynamic calculation of recipe match percentages based on current active pantryItems
  const computedRecipes: Recipe[] = useMemo(() => {
    const pantryItemsCleaned = pantryItems.map((p) => {
      const parsed = parseSmartIngredient(p.name);
      return {
        ...p,
        canonical: parsed.canonicalName.toLowerCase().trim(),
        nameLower: p.name.toLowerCase().trim(),
        regional: (p.regionalName || parsed.regionalName || '').toLowerCase().trim(),
      };
    });

    const customIds = new Set(customRecipes.map((r) => r.id));
    const combinedRecipes = [...customRecipes, ...baseRecipes.filter((r) => !customIds.has(r.id))];

    return combinedRecipes.map((recipe) => {
      let missingCount = 0;
      const updatedIngredients = recipe.ingredients.map((ing) => {
        const ingParsed = parseSmartIngredient(ing.name);
        const ingCanonical = ingParsed.canonicalName.toLowerCase().trim();
        const ingNameLower = ing.name.toLowerCase().trim();
        const ingRegionalLower = (ing.regionalName || ingParsed.regionalName || '').toLowerCase().trim();

        // 1. Basic staples (water, salt) and filler tags are assumed available
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

        // 2. Strict matching against active pantry items
        const isPresent = pantryItemsCleaned.some((p) => {
          // Exact canonical, full name, or regional match
          if (p.canonical === ingCanonical) return true;
          if (p.nameLower === ingNameLower) return true;
          if (p.regional && ingRegionalLower && p.regional === ingRegionalLower) return true;
          if (p.regional && p.regional === ingCanonical) return true;
          if (p.canonical === ingRegionalLower) return true;

          // Word boundary match for compound names (min 4 chars to prevent short substring false matches)
          if (ingCanonical.length >= 4 && p.canonical.length >= 4) {
            const ingWords = ingCanonical.split(/[\s\/,-]+/);
            const pantryWords = p.canonical.split(/[\s\/,-]+/);
            const wordOverlap = ingWords.some((w) => w.length >= 4 && pantryWords.includes(w));
            if (wordOverlap) return true;
          }

          return false;
        });

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
  }, [baseRecipes, customRecipes, pantryItems]);

  const computedBaseRecipes = useMemo(
    () => computedRecipes.filter((r) => !r.isCustomRecipe),
    [computedRecipes]
  );

  const computedCustomRecipes = useMemo(
    () => computedRecipes.filter((r) => r.isCustomRecipe),
    [computedRecipes]
  );

  // Smart Inventory handlers
  const handleAddIngredient = (rawName: string, customRegionalName?: string, customCategory?: IngredientCategory) => {
    if (!rawName || !rawName.trim()) return;

    const parsed = parseSmartIngredient(rawName);
    const canonicalLower = parsed.canonicalName.toLowerCase();

    // Prevent duplicates
    const alreadyExists = pantryItems.some(
      (p) => p.name.toLowerCase() === canonicalLower || p.regionalName.toLowerCase() === canonicalLower
    );
    if (alreadyExists) return;

    const newId = `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newItem: PantryIngredient = {
      id: newId,
      name: parsed.canonicalName,
      regionalName: customRegionalName || parsed.regionalName,
      category: parsed.isNonVeg ? 'non_veg' : (customCategory && customCategory !== 'non_veg' ? customCategory : parsed.category),
      inStock: true,
      quantity: 'In pantry',
      isCustom: true,
      addedAt: Date.now(),
    };
    setPantryItems((prev) => [newItem, ...prev]);
  };

  const handleRemoveIngredient = (id: string) => {
    setPantryItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetDefaultPantry = () => {
    setPantryItems(INITIAL_PANTRY_ITEMS);
  };

  const readyToCookCount = computedBaseRecipes.filter((r) => r.missingCount === 0).length;

  return (
    <div className="min-h-screen font-sans flex flex-col lg:flex-row relative bg-[#120f0e] text-[#f0e6df] selection:bg-[#ff6224]/30 selection:text-[#ff6224]">
      
      {/* Dynamic Ambient Dark Background & Particle Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#181311] via-[#120f0e] to-[#0c0a09]"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#ff6224]/10 rounded-full blur-3xl animate-pulseGlow"></div>
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#ff6224]/5 rounded-full blur-3xl animate-pulseGlow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pantryCount={pantryItems.length}
        readyToCookCount={readyToCookCount}
        totalRecipeCount={computedBaseRecipes.length}
        favoritesCount={favoriteIds.length}
        mealPlanCount={mealPlanItems.length}
        customRecipesCount={computedCustomRecipes.length}
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
        location={location}
        setLocation={setLocation}
        onOpenChat={() => {
          setChatRecipeContext(null);
          setIsAIChatOpen(true);
        }}
        selectedCuisine={selectedCuisine}
        setSelectedCuisine={setSelectedCuisine}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        recipes={computedBaseRecipes}
      />

      {/* Main Right Dashboard Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        
        {/* Top Header Bar */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pantryCount={pantryItems.length}
          recipeCount={computedBaseRecipes.length}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          location={location}
          setLocation={setLocation}
          onOpenChat={() => {
            setChatRecipeContext(null);
            setIsAIChatOpen(true);
          }}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Workspace Canvas */}
        <main className="flex-1 pb-16 px-3 sm:px-6 lg:px-8 pt-6">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Top Quick Action Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#181311] border border-[#2a221f] p-3.5 rounded-2xl">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-[#ff6224]" />
                <span className="font-bold text-sm text-white">Culinary Studio</span>
                <span className="text-xs text-[#a09088] hidden sm:inline">• Custom Recipe Creation & Meal Planning</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateRecipeOpen(true)}
                className="px-4 py-2 bg-[#ff6224] hover:bg-[#e85418] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Create Custom Recipe</span>
              </button>
            </div>

            {/* TAB 1: Main Explore & Kitchen App */}
            {activeTab === 'app' && (
              <>
                {/* Kitchen Pantry Inventory Section */}
                <div id="pantry-inventory-section">
                  <InventorySection
                    pantryItems={pantryItems}
                    onAddIngredient={handleAddIngredient}
                    onRemoveIngredient={handleRemoveIngredient}
                    onResetDefaultPantry={handleResetDefaultPantry}
                    showHinglishNames={showHinglishNames}
                    setShowHinglishNames={setShowHinglishNames}
                  />
                </div>

                {/* Recipe Feed Section (Explored Dishes strictly base recipes) */}
                <RecipeFeed
                  recipes={computedBaseRecipes}
                  showHinglishNames={showHinglishNames}
                  onSelectRecipe={(recipe) => setSelectedRecipeForDetail(recipe)}
                  onOpenQuickCommExport={(recipe) => setSelectedRecipeForExport(recipe)}
                  selectedPlatform={selectedPlatform}
                  selectedCuisine={selectedCuisine}
                  onSelectCuisine={setSelectedCuisine}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenAddToMealPlan={(recipe) => setRecipeForMealPlan(recipe)}
                  onDeleteCustomRecipe={handleRequestDeleteCustomRecipe}
                />
              </>
            )}

            {/* TAB 2: Favorites View */}
            {activeTab === 'favorites' && (
              <FavoritesSection
                favoriteRecipes={computedRecipes.filter((r) => favoriteIds.includes(r.id))}
                showHinglishNames={showHinglishNames}
                onSelectRecipe={(recipe) => setSelectedRecipeForDetail(recipe)}
                onOpenQuickCommExport={(recipe) => setSelectedRecipeForExport(recipe)}
                selectedPlatform={selectedPlatform}
                onExploreAllRecipes={() => setActiveTab('app')}
              />
            )}

            {/* TAB 3: Weekly Meal Planner View */}
            {activeTab === 'planner' && (
              <MealPlannerSection
                mealPlanItems={mealPlanItems}
                allRecipes={computedRecipes}
                onRemoveMealPlanItem={handleRemoveMealPlanItem}
                onClearMealPlan={handleClearMealPlan}
                onSelectRecipe={(recipe) => setSelectedRecipeForDetail(recipe)}
                onExportWeeklyGroceryCart={handleExportWeeklyGroceryCart}
                selectedPlatform={selectedPlatform}
                onOpenAddRecipeToPlan={() => setActiveTab('app')}
              />
            )}

            {/* TAB 4: Custom Recipes View */}
            {activeTab === 'custom' && (
              <CustomRecipesSection
                customRecipes={computedCustomRecipes}
                showHinglishNames={showHinglishNames}
                onSelectRecipe={(recipe) => setSelectedRecipeForDetail(recipe)}
                onOpenQuickCommExport={(recipe) => setSelectedRecipeForExport(recipe)}
                selectedPlatform={selectedPlatform}
                onOpenCreateRecipeModal={() => setIsCreateRecipeOpen(true)}
                onDeleteCustomRecipe={handleRequestDeleteCustomRecipe}
                favoriteIds={favoriteIds}
                onToggleFavorite={handleToggleFavorite}
                onOpenAddToMealPlan={(recipe) => setRecipeForMealPlan(recipe)}
                onExploreAllRecipes={() => setActiveTab('app')}
              />
            )}

          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#2a221f] bg-[#120f0e]/90 backdrop-blur-md py-5 text-center text-xs text-[#a09088] shadow-2xs">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="font-semibold text-[#f0e6df] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff6224] animate-pulse"></span>
              <span><b>Annapurna AI</b> • Smart Recipe Engine</span>
            </div>
            <div className="text-[#a09088] font-medium flex flex-wrap items-center gap-2">
              <span>1-Click Redirection via</span>
              <span className="px-2 py-0.5 rounded-md bg-[#ff6224]/10 text-[#ff6224] border border-[#ff6224]/20 font-bold text-[11px]">Blinkit</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold text-[11px]">Zepto</span>
              <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold text-[11px]">Instamart</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[11px]">FreshToHome</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Create Custom Recipe Modal */}
      {isCreateRecipeOpen && (
        <CreateRecipeModal
          onClose={() => setIsCreateRecipeOpen(false)}
          onAddCustomRecipe={handleAddCustomRecipe}
        />
      )}

      {/* Delete Confirmation Modal */}
      {recipeToDelete && (
        <DeleteConfirmModal
          recipe={recipeToDelete}
          onClose={() => setRecipeToDelete(null)}
          onConfirmDelete={handleConfirmDeleteCustomRecipe}
        />
      )}

      {/* Add To Meal Plan Modal */}
      {recipeForMealPlan && (
        <AddToMealPlanModal
          recipe={recipeForMealPlan}
          onClose={() => setRecipeForMealPlan(null)}
          onAddMealPlan={handleAddMealPlanItem}
        />
      )}

      {/* Quick Comm Cart Bridge Modal */}
      {selectedRecipeForExport && (
        <QuickCommModal
          recipe={selectedRecipeForExport}
          onClose={() => setSelectedRecipeForExport(null)}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
        />
      )}

      {/* Recipe Detail Step-by-Step Modal */}
      {selectedRecipeForDetail && (
        <RecipeDetailModal
          recipe={selectedRecipeForDetail}
          showHinglishNames={showHinglishNames}
          onClose={() => setSelectedRecipeForDetail(null)}
          onOpenQuickCommExport={(recipe) => {
            setSelectedRecipeForDetail(null);
            setSelectedRecipeForExport(recipe);
          }}
          onOpenAIChatWithRecipe={(recipe) => {
            setChatRecipeContext(recipe);
            setIsAIChatOpen(true);
          }}
          selectedPlatform={selectedPlatform}
          isFavorite={favoriteIds.includes(selectedRecipeForDetail.id)}
          onToggleFavorite={handleToggleFavorite}
          onOpenAddToMealPlan={(recipe) => {
            setSelectedRecipeForDetail(null);
            setRecipeForMealPlan(recipe);
          }}
          onDeleteCustomRecipe={handleRequestDeleteCustomRecipe}
        />
      )}

      {/* Annapurna AI Cooking Assistant Chatbot Drawer */}
      <AICookingAssistant
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        recipeContext={chatRecipeContext}
        pantryItems={pantryItems}
        onOpenQuickComm={(recipe) => {
          setSelectedRecipeForExport(recipe);
        }}
        onAddIngredient={handleAddIngredient}
      />

      {/* Annapurna Floating AI Chef Chat Widget */}
      {!isAIChatOpen && !selectedRecipeForDetail && !selectedRecipeForExport && !isCreateRecipeOpen && (
        <ChefChat
          pantry={pantryItems.map((p) => p.name)}
          recipeTitle={selectedRecipeForDetail?.title}
        />
      )}

    </div>
  );
}

