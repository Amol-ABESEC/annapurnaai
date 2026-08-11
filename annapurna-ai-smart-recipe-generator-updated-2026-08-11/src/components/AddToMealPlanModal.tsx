import React, { useState } from 'react';
import { Calendar, Clock, X, Plus, Check, Flame } from 'lucide-react';
import { Recipe, DayOfWeek, MealSlot, MealPlanItem } from '../types';

interface AddToMealPlanModalProps {
  recipe: Recipe;
  onClose: () => void;
  onAddMealPlan: (item: MealPlanItem) => void;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_SLOTS: { slot: MealSlot; label: string; icon: string }[] = [
  { slot: 'Breakfast', label: 'Breakfast (Subah)', icon: '🌅' },
  { slot: 'Lunch', label: 'Lunch (Dopahar)', icon: '☀️' },
  { slot: 'Dinner', label: 'Dinner (Raat)', icon: '🌙' },
  { slot: 'Snacks', label: 'Snacks (Shaam)', icon: '☕' },
];

export const AddToMealPlanModal: React.FC<AddToMealPlanModalProps> = ({
  recipe,
  onClose,
  onAddMealPlan,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('Dinner');
  const [servings, setServings] = useState<number>(recipe.servings || 4);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleSave = () => {
    const newItem: MealPlanItem = {
      id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      recipeImage: recipe.image,
      day: selectedDay,
      mealSlot: selectedSlot,
      servings,
      addedAt: Date.now(),
    };

    onAddMealPlan(newItem);
    setAddedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#181311] border border-[#2a221f] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#f0e6df]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#2a221f] flex items-center justify-between bg-[#1f1816]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ff6224]/10 border border-[#ff6224]/20 flex items-center justify-center text-[#ff6224]">
              <Calendar className="w-5 h-5 text-[#ff6224]" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-lg text-white">Add to Weekly Meal Plan</h3>
              <p className="text-xs text-[#a09088]">Organize your weekly cooking schedule</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#2a221f] text-[#a09088] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipe Summary */}
        <div className="p-4 bg-[#120f0e] border-b border-[#2a221f] flex items-center gap-3">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-14 h-14 rounded-xl object-cover border border-[#2a221f]"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-white truncate">{recipe.title}</h4>
            <div className="flex items-center gap-2 text-xs text-[#a09088] mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#ff6224]" />
                {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" />
                {recipe.nutrition?.calories || 320} kcal
              </span>
            </div>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="p-5 space-y-4">
          
          {/* Day of Week */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#a09088] mb-2">
              Select Day of Week
            </label>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                    selectedDay === day
                      ? 'bg-[#ff6224] text-white border-[#ff6224] shadow-md'
                      : 'bg-[#120f0e] text-[#a09088] border-[#2a221f] hover:border-white/20 hover:text-white'
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Slot */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#a09088] mb-2">
              Select Meal Slot
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_SLOTS.map((m) => (
                <button
                  key={m.slot}
                  type="button"
                  onClick={() => setSelectedSlot(m.slot)}
                  className={`p-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center gap-2 cursor-pointer ${
                    selectedSlot === m.slot
                      ? 'bg-[#ff6224]/15 text-[#ff6224] border-[#ff6224] shadow-xs'
                      : 'bg-[#120f0e] text-[#a09088] border-[#2a221f] hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span className="text-base">{m.icon}</span>
                  <span>{m.slot}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Servings */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#a09088] mb-2">
              Servings
            </label>
            <div className="flex items-center gap-3 bg-[#120f0e] p-2 rounded-xl border border-[#2a221f]">
              <button
                type="button"
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="w-8 h-8 rounded-lg bg-[#241c19] hover:bg-[#2e231f] text-white font-bold text-lg flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <span className="flex-1 text-center font-bold text-white text-sm">
                {servings} {servings === 1 ? 'person' : 'people'}
              </span>
              <button
                type="button"
                onClick={() => setServings(servings + 1)}
                className="w-8 h-8 rounded-lg bg-[#241c19] hover:bg-[#2e231f] text-white font-bold text-lg flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#2a221f] bg-[#120f0e] flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#2a221f] text-xs font-semibold text-[#a09088] hover:text-white hover:bg-[#1a1412] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={addedSuccess}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              addedSuccess
                ? 'bg-emerald-600 border border-emerald-500'
                : 'bg-gradient-to-r from-[#ff6224] to-[#e04f14] hover:from-[#ff733b] hover:to-[#ff6224]'
            }`}
          >
            {addedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to {selectedDay}!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Schedule Dish</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
