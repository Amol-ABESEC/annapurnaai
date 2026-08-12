import React, { useState } from 'react';
import { Calendar as CalendarIcon, ShoppingCart, Trash2, Clock, Flame, Sparkles, Plus, ChevronRight, CheckCircle2, Utensils, Zap } from 'lucide-react';
import { MealPlanItem, DayOfWeek, MealSlot, Recipe, QuickCommPlatform } from '../types';

interface MealPlannerSectionProps {
  mealPlanItems: MealPlanItem[];
  allRecipes: Recipe[];
  onRemoveMealPlanItem: (id: string) => void;
  onClearMealPlan: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onExportWeeklyGroceryCart: (aggregatedMissingIngredients: Array<{ name: string; regionalName: string; quantity: number; unit: string }>) => void;
  selectedPlatform: QuickCommPlatform;
  onOpenAddRecipeToPlan: () => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOTS: MealSlot[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export const MealPlannerSection: React.FC<MealPlannerSectionProps> = ({
  mealPlanItems,
  allRecipes,
  onRemoveMealPlanItem,
  onClearMealPlan,
  onSelectRecipe,
  onExportWeeklyGroceryCart,
  selectedPlatform,
  onOpenAddRecipeToPlan,
}) => {
  const [selectedDayTab, setSelectedDayTab] = useState<DayOfWeek>('Monday');

  // Compute aggregated missing ingredients for the entire week
  const aggregatedWeeklyGrocery = React.useMemo(() => {
    const map = new Map<string, { name: string; regionalName: string; quantity: number; unit: string }>();

    mealPlanItems.forEach((planItem) => {
      const fullRecipe = allRecipes.find((r) => r.id === planItem.recipeId);
      if (!fullRecipe) return;

      const scale = (planItem.servings || 4) / (fullRecipe.servings || 4);

      fullRecipe.ingredients.forEach((ing) => {
        if (ing.isMissing) {
          const key = ing.name.toLowerCase().trim();
          const existing = map.get(key);
          const scaledQty = Math.round((ing.quantity * scale) * 10) / 10;

          if (existing) {
            existing.quantity = Math.round((existing.quantity + scaledQty) * 10) / 10;
          } else {
            map.set(key, {
              name: ing.name,
              regionalName: ing.regionalName || ing.name,
              quantity: scaledQty,
              unit: ing.unit || 'unit',
            });
          }
        }
      });
    });

    return Array.from(map.values());
  }, [mealPlanItems, allRecipes]);

  // Compute daily macros
  const dailyNutrition = React.useMemo(() => {
    const itemsForDay = mealPlanItems.filter((m) => m.day === selectedDayTab);
    let totalCal = 0;
    let totalProt = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    itemsForDay.forEach((m) => {
      const recipe = allRecipes.find((r) => r.id === m.recipeId);
      if (recipe && recipe.nutrition) {
        totalCal += recipe.nutrition.calories || 0;
        totalProt += recipe.nutrition.proteinGrams || 0;
        totalCarbs += recipe.nutrition.carbsGrams || 0;
        totalFat += recipe.nutrition.fatGrams || 0;
      }
    });

    return { totalCal, totalProt, totalCarbs, totalFat };
  }, [mealPlanItems, selectedDayTab, allRecipes]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#1f1714] via-[#181311] to-[#251b17] p-6 sm:p-8 rounded-2xl border border-[#2a221f] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff6224]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#ff6224]/20 border border-[#ff6224]/30 text-[#ff6224]">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-tight">
                Weekly Meal Planner & Grocery Engine
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#a09088] max-w-2xl">
              Schedule your meals for the week. Missing ingredients across all planned dishes are automatically merged into a single 1-Click Quick Commerce order!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddRecipeToPlan}
              className="px-4 py-2.5 rounded-xl bg-[#2a201c] hover:bg-[#ff6224] text-white font-bold text-xs border border-[#3d302a] transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Dish to Plan
            </button>

            {aggregatedWeeklyGrocery.length > 0 && (
              <button
                onClick={() => onExportWeeklyGroceryCart(aggregatedWeeklyGrocery)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6224] to-[#e04f14] hover:from-[#ff733b] hover:to-[#ff6224] text-white font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all border border-amber-400/20 animate-pulseGlow"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Order Weekly Ingredients ({aggregatedWeeklyGrocery.length})</span>
              </button>
            )}

            {mealPlanItems.length > 0 && (
              <button
                onClick={onClearMealPlan}
                className="p-2.5 rounded-xl bg-[#120f0e] text-[#a09088] hover:text-red-400 hover:bg-red-500/10 border border-[#2a221f] transition-colors cursor-pointer"
                title="Clear Entire Plan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Days Selector Tabs */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-[#2a221f]">
          {DAYS.map((day) => {
            const countForDay = mealPlanItems.filter((m) => m.day === day).length;
            const isSelected = selectedDayTab === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDayTab(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-[#ff6224] text-white border-[#ff6224] shadow-md font-extrabold'
                    : 'bg-[#120f0e] text-[#a09088] border-[#2a221f] hover:border-white/20 hover:text-white'
                }`}
              >
                <span>{day}</span>
                {countForDay > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-black/20 text-white' : 'bg-[#241c19] text-[#ff6224]'
                  }`}>
                    {countForDay}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Nutrition Summary Pill */}
      <div className="bg-[#181311] p-4 rounded-xl border border-[#2a221f] flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-white">{selectedDayTab}'s Planned Nutrition:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-semibold text-[#a09088]">
          <span className="px-2.5 py-1 rounded-lg bg-[#120f0e] border border-[#2a221f] text-white">
            Calories: <strong className="text-amber-400">{dailyNutrition.totalCal} kcal</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#120f0e] border border-[#2a221f] text-white">
            Protein: <strong className="text-emerald-400">{dailyNutrition.totalProt}g</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#120f0e] border border-[#2a221f] text-white">
            Carbs: <strong className="text-blue-400">{dailyNutrition.totalCarbs}g</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#120f0e] border border-[#2a221f] text-white">
            Fat: <strong className="text-rose-400">{dailyNutrition.totalFat}g</strong>
          </span>
        </div>
      </div>

      {/* Meal Slots Grid for Selected Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SLOTS.map((slot) => {
          const itemsInSlot = mealPlanItems.filter((m) => m.day === selectedDayTab && m.mealSlot === slot);

          return (
            <div
              key={slot}
              className="bg-[#181311] border border-[#2a221f] rounded-2xl p-4 flex flex-col min-h-[220px] shadow-md"
            >
              {/* Slot Title */}
              <div className="flex items-center justify-between pb-3 border-b border-[#2a221f] mb-3">
                <span className="font-serif font-bold text-sm text-white flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-[#ff6224]" />
                  {slot}
                </span>
                <span className="text-[10px] font-bold text-[#a09088] bg-[#120f0e] px-2 py-0.5 rounded-full border border-[#2a221f]">
                  {itemsInSlot.length} {itemsInSlot.length === 1 ? 'dish' : 'dishes'}
                </span>
              </div>

              {/* Slot Dishes */}
              <div className="flex-1 space-y-3">
                {itemsInSlot.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[#5c4f48]">
                    <Sparkles className="w-6 h-6 mb-1 opacity-40 text-[#a09088]" />
                    <p className="text-xs font-medium">No dish scheduled</p>
                    <button
                      onClick={onOpenAddRecipeToPlan}
                      className="mt-2 text-[11px] font-bold text-[#ff6224] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add recipe
                    </button>
                  </div>
                ) : (
                  itemsInSlot.map((item) => {
                    const fullRecipe = allRecipes.find((r) => r.id === item.recipeId);

                    return (
                      <div
                        key={item.id}
                        className="bg-[#120f0e] p-3 rounded-xl border border-[#2a221f] hover:border-[#ff6224]/50 transition-all group relative flex flex-col gap-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.recipeImage}
                            alt={item.recipeTitle}
                            className="w-12 h-12 rounded-lg object-cover border border-[#2a221f]"
                          />
                          <div className="min-w-0 flex-1">
                            <h5
                              onClick={() => fullRecipe && onSelectRecipe(fullRecipe)}
                              className="font-bold text-xs text-white truncate cursor-pointer hover:text-[#ff6224] transition-colors"
                            >
                              {item.recipeTitle}
                            </h5>
                            <p className="text-[10px] text-[#a09088] mt-0.5">
                              {item.servings} {item.servings === 1 ? 'serving' : 'servings'}
                            </p>
                          </div>
                          <button
                            onClick={() => onRemoveMealPlanItem(item.id)}
                            className="text-[#a09088] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Remove from plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {fullRecipe && (
                          <div className="flex items-center justify-between text-[10px] text-[#a09088] pt-2 border-t border-[#1c1614]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#ff6224]" />
                              {fullRecipe.prepTimeMinutes + fullRecipe.cookTimeMinutes}m
                            </span>
                            <span className="text-amber-400 font-semibold">
                              {fullRecipe.nutrition?.calories || 320} kcal
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Consolidated Master Grocery List Drawer / Banner */}
      {aggregatedWeeklyGrocery.length > 0 && (
        <div className="bg-[#181311] border border-[#ff6224]/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2a221f] pb-4">
            <div>
              <h3 className="font-extrabold font-serif text-lg text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#ff6224]" />
                Aggregated Weekly Grocery Shopping List
              </h3>
              <p className="text-xs text-[#a09088] mt-0.5">
                {aggregatedWeeklyGrocery.length} unique ingredients needed for your weekly meal plan
              </p>
            </div>

            <button
              onClick={() => onExportWeeklyGroceryCart(aggregatedWeeklyGrocery)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff6224] to-[#e04f14] hover:from-[#ff733b] text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Checkout via {selectedPlatform.toUpperCase()}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {aggregatedWeeklyGrocery.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#120f0e] p-2.5 rounded-xl border border-[#2a221f] text-xs flex flex-col justify-between"
              >
                <div>
                  <span className="font-bold text-white block truncate">{item.name}</span>
                  {item.regionalName && item.regionalName !== item.name && (
                    <span className="text-[10px] text-[#a09088] block truncate">({item.regionalName})</span>
                  )}
                </div>
                <div className="mt-1.5 pt-1 border-t border-[#1a1412] text-[11px] font-bold text-[#ff6224]">
                  {item.quantity} {item.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
