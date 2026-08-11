import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Mic, 
  MicOff, 
  RefreshCw, 
  Languages, 
  Sparkles, 
  Check, 
  PackageCheck, 
  Volume2,
  Drumstick,
  Carrot,
  Milk,
  Flame,
  Wheat,
  Droplet
} from 'lucide-react';
import { PantryIngredient, IngredientCategory } from '../types';
import { CATEGORY_QUICK_ADD } from '../data/mockData';
import { parseConversationalItems, isNonVegIngredient } from '../utils/ingredientParser';
import { useSpeechToText } from '../hooks/useSpeechToText';

interface InventorySectionProps {
  pantryItems: PantryIngredient[];
  onAddIngredient: (name: string, regionalName?: string, category?: IngredientCategory) => void;
  onRemoveIngredient: (id: string) => void;
  onResetDefaultPantry: () => void;
  showHinglishNames: boolean;
  setShowHinglishNames: (val: boolean) => void;
}

const CATEGORY_CONFIG: Record<
  IngredientCategory,
  { label: string; icon: React.FC<{ className?: string }>; color: string; badge: string }
> = {
  non_veg: { label: 'Meat & Eggs', icon: Drumstick, color: 'text-rose-400', badge: 'bg-rose-500/15 border-rose-500/30' },
  vegetables: { label: 'Vegetables', icon: Carrot, color: 'text-emerald-400', badge: 'bg-emerald-500/15 border-emerald-500/30' },
  dairy: { label: 'Dairy & Paneer', icon: Milk, color: 'text-amber-300', badge: 'bg-amber-500/15 border-amber-500/30' },
  spices: { label: 'Spices & Masalas', icon: Flame, color: 'text-orange-400', badge: 'bg-orange-500/15 border-orange-500/30' },
  grains: { label: 'Grains & Atta', icon: Wheat, color: 'text-yellow-300', badge: 'bg-yellow-500/15 border-yellow-500/30' },
  sauces_oils: { label: 'Oils & Sauces', icon: Droplet, color: 'text-cyan-400', badge: 'bg-cyan-500/15 border-cyan-500/30' },
};

export const InventorySection: React.FC<InventorySectionProps> = ({
  pantryItems,
  onAddIngredient,
  onRemoveIngredient,
  onResetDefaultPantry,
  showHinglishNames,
  setShowHinglishNames,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory>('vegetables');
  const [conversationalPrompt, setConversationalPrompt] = useState('');
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // Main Bar Voice Recognition
  const mainSpeech = useSpeechToText({
    onResult: (text) => {
      setInputText(text);
    },
  });

  // Modal Voice Recognition
  const modalSpeech = useSpeechToText({
    onResult: (text) => {
      setConversationalPrompt(text);
    },
  });

  // Handle submitting from main input bar (or when voice stops with text)
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    // Check if input has multiple conversational items
    const parsedItems = parseConversationalItems(inputText);
    if (parsedItems.length > 0) {
      parsedItems.forEach((item) => {
        onAddIngredient(item.canonicalName, item.regionalName, item.category);
      });
    } else {
      onAddIngredient(inputText.trim());
    }
    
    setInputText('');
    if (mainSpeech.isListening) {
      mainSpeech.stopListening();
    }
  };

  const handleProcessVoiceInput = (textOverride?: string) => {
    const textToProcess = textOverride || conversationalPrompt;
    if (!textToProcess.trim()) return;
    const parsedItems = parseConversationalItems(textToProcess);

    parsedItems.forEach((item) => {
      onAddIngredient(item.canonicalName, item.regionalName, item.category);
    });

    setConversationalPrompt('');
    setShowVoiceModal(false);
    if (modalSpeech.isListening) {
      modalSpeech.stopListening();
    }
  };

  const openVoiceModal = () => {
    setShowVoiceModal(true);
    setConversationalPrompt('');
    modalSpeech.startListening();
  };



  return (
    <div className="bg-[#181311] border border-[#2a221f] rounded-2xl p-5 sm:p-6 text-[#f0e6df] shadow-lg transition-all">
      
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#2a221f]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <PackageCheck className="w-5 h-5 text-[#ff6224] shrink-0" />
            <h2 className="text-lg font-bold font-serif text-white leading-snug">Your pantry</h2>
            <span className="bg-[#ff6224]/10 text-[#ff6224] border border-[#ff6224]/20 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center justify-center leading-none">
              {pantryItems.length} of {pantryItems.length} items in stock
            </span>
          </div>
          <p className="text-xs text-[#a09088] mt-1">
            Matching updates live against 500+ Indian dishes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Hinglish Regional Synonym Toggle */}
          <button
            type="button"
            onClick={() => setShowHinglishNames(!showHinglishNames)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-xs cursor-pointer ${
              showHinglishNames
                ? 'bg-[#ff6224] text-white border-[#ff6224]'
                : 'bg-[#120f0e] text-[#a09088] border-[#2a221f] hover:bg-[#241c19] hover:text-white'
            }`}
            title="Toggle Hinglish / Regional Indian Names (e.g. Pyaz, Aalo, Haldi, Jeera)"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Hinglish: {showHinglishNames ? 'ON' : 'OFF'}</span>
          </button>

          {/* Reset Pantry Button */}
          <button
            type="button"
            onClick={onResetDefaultPantry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#120f0e] text-[#a09088] hover:text-white hover:bg-[#241c19] border border-[#2a221f] transition-all shadow-xs cursor-pointer"
            title="Reset to default sample Indian pantry ingredients"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Free-Text Input & Conversational Voice Trigger */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <form onSubmit={handleAddSubmit} className="md:col-span-2 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                mainSpeech.isListening
                  ? "🎙️ Listening... Speak ingredients (e.g. '2 pyaz, paneer')"
                  : 'Type like you talk — "2 pyaz"...'
              }
              className={`w-full bg-[#120f0e] border rounded-xl pl-4 pr-10 py-2.5 text-sm text-[#f0e6df] placeholder-[#73635b] focus:outline-none transition-all ${
                mainSpeech.isListening
                  ? 'border-red-500/50 ring-1 ring-red-500/20 bg-red-950/20'
                  : 'border-[#2a221f] focus:border-[#ff6224] focus:ring-1 focus:ring-[#ff6224]'
              }`}
            />
            {/* Inline Mic Toggle */}
            <button
              type="button"
              onClick={mainSpeech.toggleListening}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer ${
                mainSpeech.isListening
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'text-[#73635b] hover:text-[#ff6224] hover:bg-[#241c19]'
              }`}
              title={mainSpeech.isListening ? 'Stop Listening' : 'Click to Speak & Dictate Ingredients'}
            >
              {mainSpeech.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#ff6224] hover:bg-[#e85418] text-white font-bold text-sm rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        {/* Conversational / Voice Parser Modal Button */}
        <button
          onClick={openVoiceModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#241c19] hover:bg-[#302521] border border-[#2a221f] text-[#d0c4bd] text-xs sm:text-sm font-semibold rounded-xl transition-all group cursor-pointer"
        >
          <div className="w-2 h-2 rounded-full bg-[#ff6224] group-hover:scale-125 transition-transform" />
          <Mic className="w-4 h-4 text-[#ff6224]" />
          <span>Quick Voice Tag</span>
        </button>
      </div>

      {/* Structured Category Quick-Add Chips */}
      <div className="mb-4 bg-[#120f0e] p-3.5 rounded-xl border border-[#2a221f]">
        <div className="flex flex-col gap-2.5 mb-2.5">
          <span className="text-[11px] font-bold text-[#a09088] uppercase tracking-wider">
            Quick Add Categories:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#2a221f]">
            {(Object.keys(CATEGORY_CONFIG) as IngredientCategory[]).map((catId) => {
              const config = CATEGORY_CONFIG[catId];
              const Icon = config.icon;
              const isSelected = selectedCategory === catId;
              return (
                <button
                  key={catId}
                  type="button"
                  onClick={() => setSelectedCategory(catId)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                    isSelected
                      ? 'bg-[#ff6224] text-white border-[#ff6224] shadow-md shadow-[#ff6224]/20'
                      : 'bg-[#181311] text-[#c0b0a8] hover:text-white border-[#2a221f] hover:border-[#3d312c] hover:bg-[#201916]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-black/25 border-white/20 text-white'
                        : `${config.badge} ${config.color}`
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                  </span>
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chips for Selected Category */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {CATEGORY_QUICK_ADD[selectedCategory]?.map((item, idx) => {
            const alreadyExists = pantryItems.some(
              (p) => p.name.toLowerCase() === item.name.toLowerCase()
            );
            const isNonVeg = isNonVegIngredient(item.name, selectedCategory);

            return (
              <button
                key={`${item.name}-${idx}`}
                disabled={alreadyExists}
                onClick={() => onAddIngredient(item.name, item.regionalName, selectedCategory)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  alreadyExists
                    ? 'bg-[#181311] text-[#554740] border border-[#221a17] cursor-not-allowed'
                    : 'bg-[#241c19] hover:bg-[#302521] text-[#d0c4bd] border border-[#2a221f] hover:border-[#ff6224]/50 cursor-pointer'
                }`}
              >
                {alreadyExists ? (
                  <Check className="w-3 h-3 text-[#ff6224]" />
                ) : isNonVeg ? (
                  <span className="w-2.5 h-2.5 border border-red-500 rounded-xs bg-[#120f0e] flex items-center justify-center shrink-0" title="Non-Veg">
                    <span className="w-1 h-1 rounded-full bg-red-500" />
                  </span>
                ) : (
                  <Plus className="w-3 h-3 text-[#ff6224]" />
                )}
                <span>
                  {showHinglishNames && item.regionalName && item.regionalName.toLowerCase() !== item.name.toLowerCase()
                    ? `${item.regionalName} / ${item.name}`
                    : showHinglishNames && item.regionalName
                    ? item.regionalName
                    : item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Inventory Tag List */}
      <div className="flex flex-wrap gap-2 pt-1">
        {[...pantryItems]
          .sort((a, b) => {
            if (a.isCustom && !b.isCustom) return -1;
            if (!a.isCustom && b.isCustom) return 1;
            if (a.isCustom && b.isCustom) {
              return (b.addedAt || 0) - (a.addedAt || 0);
            }
            return 0;
          })
          .map((item) => {
            const isNonVeg = isNonVegIngredient(item.name, item.category);

            return (
              <div
                key={item.id}
                className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl text-xs font-medium group transition-all shadow-2xs ${
                  isNonVeg
                    ? 'border-red-500/50 bg-red-950/30 text-red-200 hover:border-red-400'
                    : item.isCustom
                    ? 'border-[#ff6224]/50 bg-[#ff6224]/10 text-[#f0e6df] ring-1 ring-[#ff6224]/30 hover:border-[#ff6224]'
                    : 'border-[#2a221f] bg-[#241c19] text-[#f0e6df] hover:border-[#ff6224]/50'
                }`}
              >
                {isNonVeg ? (
                  <span className="w-3.5 h-3.5 border border-red-500 rounded-xs bg-[#120f0e] flex items-center justify-center shrink-0" title="Non-Vegetarian Ingredient">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  </span>
                ) : (
                  <span className="w-3.5 h-3.5 border border-emerald-500 rounded-xs bg-[#120f0e] flex items-center justify-center shrink-0" title="Vegetarian Ingredient">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </span>
                )}

                {item.isCustom && (
                  <span title="Custom Added Item">
                    <Sparkles className="w-3 h-3 text-[#ff6224] shrink-0" />
                  </span>
                )}

                <span>
                  {showHinglishNames && item.regionalName && item.regionalName.toLowerCase() !== item.name.toLowerCase()
                    ? `${item.regionalName} / ${item.name}`
                    : showHinglishNames && item.regionalName
                    ? item.regionalName
                    : item.name}
                </span>

                <button
                  onClick={() => onRemoveIngredient(item.id)}
                  className="text-[#73635b] hover:text-red-400 transition-colors ml-0.5 p-0.5 cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
      </div>

      {/* Conversational Voice / Multi-Item Tag Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3>Quick Voice & Multi-Item Tag</h3>
              </div>
              <button
                onClick={() => {
                  if (modalSpeech.isListening) modalSpeech.stopListening();
                  setShowVoiceModal(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Language Switcher & Mic Record Button */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-center">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600" /> Speech Language:
                </span>
                <div className="flex bg-white rounded-lg p-0.5 border border-slate-200 text-xs font-medium">
                  <button
                    onClick={() => modalSpeech.setSelectedLang('en-IN')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      modalSpeech.selectedLang === 'en-IN' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    English (IN)
                  </button>
                  <button
                    onClick={() => modalSpeech.setSelectedLang('hi-IN')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      modalSpeech.selectedLang === 'hi-IN' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Hindi (हिंदी)
                  </button>
                </div>
              </div>

              {/* Mic Circle Button */}
              <div className="flex flex-col items-center justify-center my-3">
                <button
                  type="button"
                  onClick={modalSpeech.toggleListening}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md ${
                    modalSpeech.isListening
                      ? 'bg-rose-600 text-white ring-4 ring-rose-200 scale-105'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105'
                  }`}
                  title={modalSpeech.isListening ? 'Click to Stop Recording' : 'Click to Start Voice Recording'}
                >
                  {modalSpeech.isListening ? (
                    <MicOff className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                  {modalSpeech.isListening && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full shadow-xs" />
                  )}
                </button>

                <p className="text-xs font-semibold mt-3.5 text-slate-700">
                  {modalSpeech.isListening ? (
                    <span className="text-rose-600 font-bold flex flex-col items-center gap-1.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600" />
                        Listening... Speak ingredients clearly
                      </span>
                      {/* Audio Level Waveform Indicator */}
                      <span className="flex items-center gap-1 h-4 mt-1">
                        {[0.4, 0.8, 1.2, 0.6, 1.0, 0.5, 0.9].map((multiplier, idx) => (
                          <span
                            key={idx}
                            className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                            style={{
                              height: `${Math.max(4, Math.min(20, (modalSpeech.audioLevel || 10) * multiplier))}px`,
                            }}
                          />
                        ))}
                      </span>
                    </span>
                  ) : (
                    'Tap microphone to speak ingredients'
                  )}
                </p>
              </div>

              {modalSpeech.error && (
                <div className="mt-2 text-xs font-medium text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {modalSpeech.error}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 mb-2">
              Spoken words or typed text (e.g. <i>"I have tomatoes, paneer, green peas, chicken, and butter"</i>):
            </p>

            <textarea
              rows={3}
              value={conversationalPrompt}
              onChange={(e) => setConversationalPrompt(e.target.value)}
              placeholder="e.g. 2 tomatoes, paneer block, garlic paste, anda, chicken..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 mb-4"
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setConversationalPrompt('')}
                className="text-xs font-medium text-slate-400 hover:text-slate-600"
              >
                Clear Text
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (modalSpeech.isListening) modalSpeech.stopListening();
                    setShowVoiceModal(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleProcessVoiceInput()}
                  disabled={!conversationalPrompt.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-sm"
                >
                  Auto-Parse & Add To Kitchen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
