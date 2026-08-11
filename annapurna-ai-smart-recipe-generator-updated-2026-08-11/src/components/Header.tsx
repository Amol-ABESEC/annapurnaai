import React from 'react';
import { Flame, Utensils, Menu, Heart, Calendar, ChefHat } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onToggleMobileSidebar,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#120f0e]/95 backdrop-blur-md border-b border-[#261e1b] text-[#f0e6df] shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 py-3">
          
          {/* Brand & App Title */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => setActiveTab('app')}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff6224] to-[#d63f00] flex items-center justify-center text-white font-bold shadow-md shadow-[#ff6224]/30 shrink-0 border border-amber-400/20">
              <Flame className="w-4 h-4 fill-amber-200/40 text-amber-100" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-extrabold text-lg sm:text-xl text-white tracking-tight leading-none">
                  Annapurna
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-[#ff6224] to-amber-500 text-white uppercase tracking-wider inline-flex items-center justify-center leading-none">
                  AI
                </span>
              </div>
              <span className="text-[9px] font-bold text-[#a09088] tracking-widest uppercase mt-0.5 leading-none text-left">
                CULINARY COPILOT
              </span>
            </div>
          </div>

          {/* Center/Right Nav Links */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Kitchen Nav Button */}
            <button
              onClick={() => setActiveTab('app')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'app'
                  ? 'bg-[#261f1c] text-white border-[#3d312c] shadow-xs'
                  : 'bg-transparent text-[#a09088] border-transparent hover:text-white hover:bg-[#1a1412]'
              }`}
            >
              <Utensils className="w-3.5 h-3.5 text-[#ff6224]" />
              <span className="hidden sm:inline">Kitchen</span>
            </button>

            {/* Favorites Nav Button */}
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'favorites'
                  ? 'bg-[#261f1c] text-white border-[#3d312c] shadow-xs'
                  : 'bg-transparent text-[#a09088] border-transparent hover:text-white hover:bg-[#1a1412]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${activeTab === 'favorites' ? 'text-rose-400 fill-rose-400' : 'text-rose-400'}`} />
              <span className="hidden sm:inline">Favorites</span>
            </button>

            {/* Meal Planner Nav Button */}
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'planner'
                  ? 'bg-[#261f1c] text-white border-[#3d312c] shadow-xs'
                  : 'bg-transparent text-[#a09088] border-transparent hover:text-white hover:bg-[#1a1412]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Planner</span>
            </button>

            {/* Custom Recipes Nav Button */}
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'custom'
                  ? 'bg-[#261f1c] text-white border-[#3d312c] shadow-xs'
                  : 'bg-transparent text-[#a09088] border-transparent hover:text-white hover:bg-[#1a1412]'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 text-[#ff6224]" />
              <span className="hidden sm:inline">My Dishes</span>
            </button>


            {/* Mobile Sidebar Toggle */}
            {onToggleMobileSidebar && (
              <button
                onClick={onToggleMobileSidebar}
                className="lg:hidden p-2 rounded-full bg-[#1c1614] hover:bg-[#261f1c] text-[#a09088] hover:text-white border border-[#2a221f] transition-colors cursor-pointer ml-1"
                aria-label="Toggle menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};


