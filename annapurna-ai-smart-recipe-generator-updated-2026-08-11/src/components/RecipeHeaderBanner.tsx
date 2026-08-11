import React from 'react';
import {
  Clock,
  Flame,
  Sparkles,
} from 'lucide-react';
import { Recipe } from '../types';
import { cleanRecipeTitle } from '../utils/titleCleaner';

interface RecipeHeaderBannerProps {
  recipe: Recipe;
  size?: 'card' | 'modal';
}

// Food Photography mapper by recipe title / cuisine keywords
function getRecipeImageUrl(recipe: Recipe): string {
  if (recipe.image && (recipe.image.startsWith('http') || recipe.image.startsWith('/'))) {
    return recipe.image;
  }

  const title = recipe.title.toLowerCase();
  
  if (title.includes('butter chicken') || title.includes('chicken curry') || title.includes('tikka masala')) {
    return 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('paneer') || title.includes('matar paneer') || title.includes('kadai paneer')) {
    return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('chole') || title.includes('bhature') || title.includes('chana')) {
    return 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('dal makhani') || title.includes('dal tadka') || title.includes('dal')) {
    return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('palak') || title.includes('saag')) {
    return 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('paratha') || title.includes('naan') || title.includes('roti')) {
    return 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('rajma') || title.includes('rice') || title.includes('pulao')) {
    return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('biryani')) {
    return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('dosa') || title.includes('idli') || title.includes('sambar') || title.includes('uttapam')) {
    return 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('fish') || title.includes('prawn') || title.includes('machli') || title.includes('seafood')) {
    return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('mutton') || title.includes('rogan josh') || title.includes('gosht') || title.includes('laal maas')) {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('sweet') || title.includes('kheer') || title.includes('halwa') || title.includes('jamun') || title.includes('laddu')) {
    return 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80';
  }

  // Generic rich Indian food photography
  return 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80';
}

export const RecipeHeaderBanner: React.FC<RecipeHeaderBannerProps> = ({
  recipe,
  size = 'card',
}) => {
  const isModal = size === 'modal';
  const imageUrl = getRecipeImageUrl(recipe);

  // Calculate match percentage
  const totalIngs = recipe.ingredients.length || 1;
  const inStockIngs = recipe.ingredients.filter((i) => !i.isMissing).length;
  const matchPct = Math.round((inStockIngs / totalIngs) * 100);

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-[#281b16] via-[#1b120e] to-[#120d0b] text-white flex flex-col justify-between group ${
        isModal
          ? 'min-h-[260px] rounded-t-2xl sm:rounded-t-3xl -mx-5 -mt-5 mb-5 sm:-mx-6 sm:-mt-6 sm:mb-6'
          : 'h-48 rounded-t-2xl'
      }`}
    >
      {/* Ambient Copper Lighting Glow in Background */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#ff6224]/20 rounded-full blur-2xl group-hover:bg-[#ff6224]/35 transition-all duration-500 pointer-events-none z-0" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-amber-500/15 rounded-full blur-xl group-hover:bg-amber-500/25 transition-all duration-500 pointer-events-none z-0" />

      {/* Vibrant Food Photography Image */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 brightness-[1.03] contrast-[1.02] z-0"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      {/* Soft Vignette Overlay to highlight food without darkening it into black */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/25 z-0" />

      {/* Top Overlay Row: % Match Badge & Veg / Non-Veg Indicator */}
      <div className="relative z-10 p-3.5 sm:p-4 flex items-center justify-between gap-2">
        {/* Match Percentage Pill with Copper Glow */}
        <span className="bg-gradient-to-r from-[#ff6224] to-[#ea580c] text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md shadow-[#ff6224]/30 border border-amber-300/30 tracking-wide flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-200" />
          {matchPct}% match
        </span>

        {/* Pure Veg / Non-Veg Standard Indicator */}
        <div className="flex items-center gap-1.5 bg-[#120f0e]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#352a25] shadow-xs">
          <span
            className={`w-3.5 h-3.5 border-2 ${
              recipe.isVegetarian ? 'border-emerald-500' : 'border-red-500'
            } bg-white p-0.5 flex items-center justify-center rounded-xs shrink-0`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                recipe.isVegetarian ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            />
          </span>
          <span className="text-[11px] font-bold text-[#f0e6df]">
            {recipe.isVegetarian ? 'Pure Veg' : 'Non-Veg'}
          </span>
        </div>
      </div>

      {/* Modal Bottom Title Overlay on Banner (Only for Modal size, cards display clean title below image) */}
      {isModal && (
        <div className="relative z-10 p-4 sm:p-5 mt-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#ff6224]/20 text-[#ff6224] border border-[#ff6224]/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              {recipe.cuisine}
            </span>
            {recipe.Course && (
              <span className="bg-[#241c19] text-[#d0c4bd] border border-[#352a25] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                {recipe.Course}
              </span>
            )}
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-tight leading-tight">
            {cleanRecipeTitle(recipe.title)}
          </h3>

          <div className="flex items-center gap-3 mt-2 text-xs text-[#d0c4bd]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#ff6224]" />
              <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>{recipe.difficulty || 'Easy'}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
