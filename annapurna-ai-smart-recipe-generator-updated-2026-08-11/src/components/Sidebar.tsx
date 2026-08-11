import React from 'react';
import { 
  PackageCheck, 
  Sparkles, 
  ShoppingBag, 
  Compass, 
  Flame, 
  CheckCircle2, 
  Heart,
  Calendar,
  ChefHat
} from 'lucide-react';
import { ActiveTab, QuickCommPlatform } from '../types';
import { PLATFORM_INFO } from '../data/mockData';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pantryCount: number;
  readyToCookCount: number;
  totalRecipeCount: number;
  favoritesCount?: number;
  mealPlanCount?: number;
  customRecipesCount?: number;
  selectedPlatform: QuickCommPlatform;
  setSelectedPlatform: (p: QuickCommPlatform) => void;
  onOpenChat: () => void;
  selectedCuisine: string;
  setSelectedCuisine: (cuisine: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  recipes?: any[];
}

const CUISINES_LIST = [
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

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pantryCount,
  readyToCookCount,
  totalRecipeCount,
  favoritesCount = 0,
  mealPlanCount = 0,
  customRecipesCount = 0,
  selectedPlatform,
  setSelectedPlatform,
  onOpenChat,
  selectedCuisine,
  setSelectedCuisine,
  isOpenMobile = false,
  onCloseMobile,
  recipes = [],
}) => {
  // Dynamically compute cuisine dish counts and filter out empty cuisines
  const { availableCuisines, cuisineCounts } = React.useMemo(() => {
    const counts: Record<string, number> = { 'All Cuisines': recipes.length || totalRecipeCount };

    const activeList = CUISINES_LIST.filter((c) => {
      if (c === 'All Cuisines') return true;
      const matchCount = recipes.filter((r) => {
        const rCuisine = (r.cuisine || '').toLowerCase().trim();
        const searchCuisine = c.toLowerCase().trim();
        if (searchCuisine === 'indian') {
          const isExplicitNonIndian = ['mexican', 'continental', 'italian', 'chinese', 'thai', 'asian', 'european', 'mediterranean', 'middle eastern', 'american', 'french', 'japanese', 'spanish'].some((non) => rCuisine.includes(non));
          if (isExplicitNonIndian) return false;
          return rCuisine.includes('indian') || (r.tags && r.tags.some((t: string) => t.toLowerCase() === 'indian cuisine' || t.toLowerCase() === 'indian'));
        }
        return rCuisine === searchCuisine || rCuisine.includes(searchCuisine) || searchCuisine.includes(rCuisine);
      }).length;

      if (matchCount > 0) {
        counts[c] = matchCount;
        return true;
      }
      return false;
    });

    return { availableCuisines: activeList, cuisineCounts: counts };
  }, [recipes, totalRecipeCount]);

  const content = (
    <div className="flex flex-col h-full lg:h-screen lg:sticky lg:top-0 bg-[#120f0e] border-r border-[#2a221f] text-[#f0e6df] shadow-2xl w-full lg:w-72 shrink-0 select-none">
      
      {/* Brand Header */}
      <div className="p-4 border-b border-[#2a221f] shrink-0 bg-gradient-to-b from-[#181311] to-[#120f0e]">
        <button
          type="button"
          onClick={() => setActiveTab('app')}
          className="w-full text-left group flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#1e1714] via-[#281f1a] to-[#1a1311] border border-[#ff6224]/30 hover:border-[#ff6224]/60 transition-all duration-300 shadow-xl shadow-black/40 cursor-pointer relative overflow-hidden"
        >
          {/* Subtle Ambient Copper Glow in Background */}
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#ff6224]/15 rounded-full blur-xl group-hover:bg-[#ff6224]/30 transition-all pointer-events-none" />

          {/* Vibrant Orange Flame Badge Logo */}
          <div className="relative shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#ff6224] via-[#ea580c] to-[#c2410c] flex items-center justify-center text-white shadow-lg shadow-[#ff6224]/30 border border-amber-300/30 group-hover:scale-105 group-hover:shadow-[#ff6224]/50 transition-all">
            <Flame className="w-6 h-6 fill-amber-200/40 text-amber-100" />
          </div>

          {/* Brand Typography & Badge */}
          <div className="flex flex-col min-w-0 flex-1 text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-extrabold text-lg text-white tracking-tight group-hover:text-amber-200 transition-colors leading-none">
                Annapurna
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#ff6224] to-amber-500 text-white shadow-xs uppercase tracking-wider inline-flex items-center justify-center leading-none">
                AI
              </span>
            </div>
            <span className="text-[9.5px] font-bold text-[#a09088] tracking-wider uppercase group-hover:text-[#c4b3a9] transition-colors flex items-center gap-1 mt-1 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
              Culinary Copilot
            </span>
          </div>
        </button>
      </div>

      {/* Navigation Main Links */}
      <div className="p-4 space-y-1.5 flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar overscroll-contain pb-24 touch-pan-y">
        
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#a09088] px-3 pt-2 pb-1">
          Menu Navigation
        </div>

        {/* Explore Recipes */}
        <button
          onClick={() => {
            setActiveTab('app');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
            activeTab === 'app'
              ? 'bg-[#ff6224] text-white border-[#ff6224] font-extrabold shadow-md shadow-[#ff6224]/20 scale-[1.01]'
              : 'text-[#a09088] bg-transparent border-transparent hover:bg-[#241c19] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Compass className={`w-4 h-4 ${activeTab === 'app' ? 'text-white' : 'text-[#ff6224]'}`} />
            <span>Explore Dishes</span>
          </div>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
            activeTab === 'app' ? 'bg-black/20 text-white' : 'bg-[#241c19] border border-[#352a25] text-[#f0e6df]'
          }`}>
            {totalRecipeCount}
          </span>
        </button>

        {/* Favorites */}
        <button
          onClick={() => {
            setActiveTab('favorites');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
            activeTab === 'favorites'
              ? 'bg-[#ff6224] text-white border-[#ff6224] font-extrabold shadow-md shadow-[#ff6224]/20 scale-[1.01]'
              : 'text-[#a09088] bg-transparent border-transparent hover:bg-[#241c19] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Heart className={`w-4 h-4 ${activeTab === 'favorites' ? 'text-white fill-white' : 'text-rose-400'}`} />
            <span>Saved Favorites</span>
          </div>
          {favoritesCount !== undefined && favoritesCount > 0 && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              activeTab === 'favorites' ? 'bg-black/20 text-white' : 'bg-[#241c19] border border-[#352a25] text-rose-400'
            }`}>
              {favoritesCount}
            </span>
          )}
        </button>

        {/* Weekly Meal Planner */}
        <button
          onClick={() => {
            setActiveTab('planner');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
            activeTab === 'planner'
              ? 'bg-[#ff6224] text-white border-[#ff6224] font-extrabold shadow-md shadow-[#ff6224]/20 scale-[1.01]'
              : 'text-[#a09088] bg-transparent border-transparent hover:bg-[#241c19] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Calendar className={`w-4 h-4 ${activeTab === 'planner' ? 'text-white' : 'text-amber-400'}`} />
            <span>Weekly Meal Planner</span>
          </div>
          {mealPlanCount !== undefined && mealPlanCount > 0 && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              activeTab === 'planner' ? 'bg-black/20 text-white' : 'bg-[#241c19] border border-[#352a25] text-amber-400'
            }`}>
              {mealPlanCount}
            </span>
          )}
        </button>

        {/* My Custom Dishes */}
        <button
          onClick={() => {
            setActiveTab('custom');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
            activeTab === 'custom'
              ? 'bg-[#ff6224] text-white border-[#ff6224] font-extrabold shadow-md shadow-[#ff6224]/20 scale-[1.01]'
              : 'text-[#a09088] bg-transparent border-transparent hover:bg-[#241c19] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <ChefHat className={`w-4 h-4 ${activeTab === 'custom' ? 'text-white' : 'text-[#ff6224]'}`} />
            <span>My Custom Dishes</span>
          </div>
          {customRecipesCount !== undefined && customRecipesCount > 0 && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              activeTab === 'custom' ? 'bg-black/20 text-white' : 'bg-[#241c19] border border-[#352a25] text-[#ff6224]'
            }`}>
              {customRecipesCount}
            </span>
          )}
        </button>

        {/* Kitchen Pantry */}
        <button
          onClick={() => {
            setActiveTab('app');
            // Scroll to pantry section
            const el = document.getElementById('pantry-inventory-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[#a09088] hover:bg-[#241c19] hover:text-white transition-all cursor-pointer border border-transparent"
        >
          <div className="flex items-center gap-3">
            <PackageCheck className="w-4 h-4 text-[#ff6224]" />
            <span>My Kitchen Pantry</span>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#241c19] border border-[#352a25] text-[#ff6224]">
            {pantryCount} items
          </span>
        </button>

        {/* Annapurna AI Copilot */}
        <button
          onClick={() => {
            onOpenChat();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-[#ff6224] hover:bg-[#e85418] text-white shadow-md shadow-[#ff6224]/20 transition-all cursor-pointer mt-1"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-white fill-white animate-pulse" />
            <span className="font-extrabold">Annapurna AI Copilot</span>
          </div>
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-black/20 text-white uppercase">
            Ask AI
          </span>
        </button>

        {/* Pantry Quick Match Card */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#241c19] border border-[#352a25] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#f0e6df]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Pantry Status
            </span>
            <span className="text-[11px] font-extrabold text-[#ff6224]">{readyToCookCount} Ready</span>
          </div>
          <p className="text-[11px] text-[#a09088] leading-snug">
            You have <strong className="text-white">{pantryCount} ingredients</strong> stored. We matched <strong className="text-[#ff6224]">{readyToCookCount} dishes</strong> ready to cook!
          </p>
        </div>

        {/* Cuisines Category Shortcut List */}
        <div className="pt-4 space-y-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#a09088] px-3 pb-1 flex items-center justify-between">
            <span>Regional Cuisines</span>
            <Flame className="w-3 h-3 text-[#ff6224]" />
          </div>
          <div className="space-y-0.5">
            {availableCuisines.map((cuisine) => {
              const isSelected = selectedCuisine === cuisine;
              const count = cuisineCounts[cuisine] || 0;
              return (
                <button
                  key={cuisine}
                  onClick={() => {
                    setSelectedCuisine(cuisine);
                    setActiveTab('app');
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#ff6224] text-white font-extrabold shadow-sm'
                      : 'text-[#a09088] hover:bg-[#241c19] hover:text-white'
                  }`}
                >
                  <span className="truncate">{cuisine}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-black/20 text-white' : 'bg-[#181311] border border-[#2a221f] text-[#ff6224]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Delivery App Selector */}
        <div className="pt-4 space-y-2 border-t border-[#2a221f] mt-4">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#a09088] px-3 flex items-center justify-between">
            <span>Preferred App (Redirection)</span>
            <ShoppingBag className="w-3 h-3 text-[#ff6224]" />
          </div>
          <p className="text-[10px] text-[#a09088] px-3 font-medium leading-normal">
            Select an app for 1-click quick-commerce redirection.
          </p>
          <div className="grid grid-cols-2 gap-1.5 px-1.5">
            {(['blinkit', 'zepto', 'instamart', 'freshtohome'] as QuickCommPlatform[]).map((p) => {
              const info = PLATFORM_INFO[p];
              const isActive = selectedPlatform === p;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center border cursor-pointer ${
                    isActive
                      ? 'bg-[#ff6224] text-white border-[#ff6224] shadow-sm font-extrabold'
                      : 'bg-[#181311] text-[#a09088] border-[#2a221f] hover:bg-[#241c19] hover:text-white'
                  }`}
                >
                  {info.name}
                </button>
              );
            })}
          </div>
          {selectedPlatform === 'freshtohome' && (
            <p className="text-[9px] text-[#ff6224] px-3 font-semibold mt-1.5 leading-normal">
              🍗 FreshToHome orders only non-veg items (chicken, meat, fish, eggs) and filters out vegetarian ingredients.
            </p>
          )}
        </div>

      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 z-30">
        {content}
      </aside>

      {/* Mobile Backdrop Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-[100dvh] flex flex-col animate-fadeIn w-[80vw] max-w-[18rem]">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
