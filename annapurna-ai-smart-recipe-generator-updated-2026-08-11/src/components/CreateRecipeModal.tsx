import React, { useState } from 'react';
import { ChefHat, X, Plus, Trash2, Sparkles, Check } from 'lucide-react';
import { Recipe, RecipeIngredient, RecipeInstruction } from '../types';

interface CreateRecipeModalProps {
  onClose: () => void;
  onAddCustomRecipe: (recipe: Recipe) => void;
}

export const CreateRecipeModal: React.FC<CreateRecipeModalProps> = ({
  onClose,
  onAddCustomRecipe,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [cuisine, setCuisine] = useState('North Indian');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(15);
  const [cookTimeMinutes, setCookTimeMinutes] = useState(25);
  const [dietType, setDietType] = useState<'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Jain'>('Vegetarian');
  const servings = 4;
  const difficulty: Recipe['difficulty'] = 'Easy';
  const image = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800';

  // Ingredients state
  const [ingredients, setIngredients] = useState<Array<{ name: string; regionalName: string; quantity: number; unit: string }>>([
    { name: 'Paneer', regionalName: 'Paneer', quantity: 200, unit: 'g' },
    { name: 'Onion', regionalName: 'Pyaz', quantity: 2, unit: 'medium' },
  ]);

  // Instructions state
  const [instructions, setInstructions] = useState<Array<{ title: string; description: string; durationMinutes?: number; proTip?: string }>>([
    { title: 'Prep', description: 'Chop onions and cube paneer into bite-sized pieces.' },
    { title: 'Cook', description: 'Sauté onions until golden brown, add spices, and simmer with paneer.' },
  ]);

  // Macros state
  const calories = 380;
  const proteinGrams = 18;
  const carbsGrams = 22;
  const fatGrams = 20;

  const [errorMsg, setErrorMsg] = useState('');

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', regionalName: '', quantity: 1, unit: 'unit' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, { title: `Step ${instructions.length + 1}`, description: '' }]);
  };

  const handleRemoveInstruction = (index: number) => {
    if (instructions.length <= 1) return;
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a recipe title');
      return;
    }

    const validIngredients: RecipeIngredient[] = ingredients
      .filter((ing) => ing.name.trim() !== '')
      .map((ing) => ({
        name: ing.name.trim(),
        regionalName: ing.regionalName.trim() || ing.name.trim(),
        quantity: Number(ing.quantity) || 1,
        unit: ing.unit || 'unit',
        isMissing: true,
      }));

    if (validIngredients.length === 0) {
      setErrorMsg('Please add at least one ingredient');
      return;
    }

    const validInstructions: RecipeInstruction[] = instructions
      .filter((ins) => ins.description.trim() !== '')
      .map((ins, idx) => ({
        stepNumber: idx + 1,
        title: ins.title.trim() || `Step ${idx + 1}`,
        description: ins.description.trim(),
        durationMinutes: ins.durationMinutes,
        proTip: ins.proTip,
      }));

    const newRecipe: Recipe = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      subtitle: subtitle.trim() || `${cuisine} culinary creation`,
      cuisine,
      prepTimeMinutes: Number(prepTimeMinutes) || 15,
      cookTimeMinutes: Number(cookTimeMinutes) || 20,
      difficulty,
      rating: 5.0,
      reviewsCount: 1,
      image,
      servings: Number(servings) || 4,
      tags: ['Custom Recipe', cuisine, dietType],
      ingredients: validIngredients,
      missingCount: validIngredients.length,
      matchPercentage: 0,
      instructions: validInstructions.length > 0 ? validInstructions : [
        { stepNumber: 1, title: 'Preparation', description: 'Prepare all ingredients and cook to taste.' }
      ],
      nutrition: {
        calories: Number(calories) || 350,
        proteinGrams: Number(proteinGrams) || 15,
        carbsGrams: Number(carbsGrams) || 25,
        fatGrams: Number(fatGrams) || 15,
      },
      isVegetarian: dietType === 'Vegetarian' || dietType === 'Vegan' || dietType === 'Jain',
      dietType,
      isCustomRecipe: true,
    };

    onAddCustomRecipe(newRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-[#181311] border border-[#2a221f] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#f0e6df] my-8 max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#2a221f] flex items-center justify-between bg-[#1f1816] sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ff6224]/10 border border-[#ff6224]/20 flex items-center justify-center text-[#ff6224]">
              <ChefHat className="w-5 h-5 text-[#ff6224]" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-lg text-white">Create Custom Recipe</h3>
              <p className="text-xs text-[#a09088]">Save your family recipes to Annapurna AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#2a221f] text-[#a09088] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Basic Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff6224] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Basic Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#a09088] mb-1">Recipe Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grandma's Special Paneer Butter Masala"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#120f0e] border border-[#2a221f] rounded-xl text-xs text-white placeholder-[#5c4f48] focus:border-[#ff6224] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a09088] mb-1">Subtitle / Short Description</label>
                <input
                  type="text"
                  placeholder="e.g. Rich, velvety gravy with aromatic kasuri methi"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#120f0e] border border-[#2a221f] rounded-xl text-xs text-white placeholder-[#5c4f48] focus:border-[#ff6224] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#a09088] mb-1">Cuisine</label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full px-3 py-2 bg-[#120f0e] border border-[#2a221f] rounded-xl text-xs text-white focus:border-[#ff6224] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a09088] mb-1">Diet Type</label>
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#120f0e] border border-[#2a221f] rounded-xl text-xs text-white focus:border-[#ff6224] focus:outline-none"
                >
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Jain">Jain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a09088] mb-1">Prep Time (mins)</label>
                <input
                  type="number"
                  min={1}
                  value={prepTimeMinutes}
                  onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#120f0e] border border-[#2a221f] rounded-xl text-xs text-white focus:border-[#ff6224] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a09088] mb-1">Cook Time (mins)</label>
                <input
                  type="number"
                  min={1}
                  value={cookTimeMinutes}
                  onChange={(e) => setCookTimeMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#120f0e] border border-[#2a221f] rounded-xl text-xs text-white focus:border-[#ff6224] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="space-y-3 pt-4 border-t border-[#2a221f]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff6224]">
                Ingredients List
              </h4>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="px-2.5 py-1 rounded-lg bg-[#241c19] text-[#ff6224] hover:bg-[#ff6224] hover:text-white border border-[#3d312c] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Ingredient
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#120f0e] p-2.5 rounded-xl border border-[#2a221f]">
                  <input
                    type="text"
                    placeholder="Name (e.g. Onion)"
                    value={ing.name}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[idx].name = e.target.value;
                      setIngredients(updated);
                    }}
                    className="flex-1 px-2.5 py-1.5 bg-[#181311] border border-[#2a221f] rounded-lg text-xs text-white focus:border-[#ff6224] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Hinglish (e.g. Pyaz)"
                    value={ing.regionalName}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[idx].regionalName = e.target.value;
                      setIngredients(updated);
                    }}
                    className="w-28 px-2.5 py-1.5 bg-[#181311] border border-[#2a221f] rounded-lg text-xs text-white focus:border-[#ff6224] focus:outline-none"
                  />
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={ing.quantity}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[idx].quantity = Number(e.target.value);
                      setIngredients(updated);
                    }}
                    className="w-16 px-2.5 py-1.5 bg-[#181311] border border-[#2a221f] rounded-lg text-xs text-white focus:border-[#ff6224] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Unit (e.g. g, tbsp)"
                    value={ing.unit}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[idx].unit = e.target.value;
                      setIngredients(updated);
                    }}
                    className="w-20 px-2.5 py-1.5 bg-[#181311] border border-[#2a221f] rounded-lg text-xs text-white focus:border-[#ff6224] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions Steps */}
          <div className="space-y-3 pt-4 border-t border-[#2a221f]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff6224]">
                Step-by-Step Cooking Instructions
              </h4>
              <button
                type="button"
                onClick={handleAddInstruction}
                className="px-2.5 py-1 rounded-lg bg-[#241c19] text-[#ff6224] hover:bg-[#ff6224] hover:text-white border border-[#3d312c] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Step
              </button>
            </div>

            <div className="space-y-3">
              {instructions.map((ins, idx) => (
                <div key={idx} className="bg-[#120f0e] p-3 rounded-xl border border-[#2a221f] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#a09088]">Step {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInstruction(idx)}
                      className="text-xs text-red-400 hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Step Title (e.g. Sauté Aromatics)"
                    value={ins.title}
                    onChange={(e) => {
                      const updated = [...instructions];
                      updated[idx].title = e.target.value;
                      setInstructions(updated);
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#181311] border border-[#2a221f] rounded-lg text-xs text-white focus:border-[#ff6224] focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    placeholder="Detailed step description..."
                    value={ins.description}
                    onChange={(e) => {
                      const updated = [...instructions];
                      updated[idx].description = e.target.value;
                      setInstructions(updated);
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#181311] border border-[#2a221f] rounded-lg text-xs text-white focus:border-[#ff6224] focus:outline-none resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-[#2a221f] flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#2a221f] text-xs font-semibold text-[#a09088] hover:text-white hover:bg-[#1a1412] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6224] to-[#e04f14] hover:from-[#ff733b] hover:to-[#ff6224] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Save Recipe
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
