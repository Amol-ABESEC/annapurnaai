import React, { useState, useEffect } from 'react';
import { Recipe, RecipeInstruction } from '../types';
import { X, Volume2, VolumeX, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Clock, ChefHat, CheckCircle2, Sparkles } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';

interface CookingModeModalProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({ recipe, isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAIChefHelp, setShowAIChefHelp] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const instructions: RecipeInstruction[] = recipe.instructions && recipe.instructions.length > 0
    ? recipe.instructions
    : [
        {
          stepNumber: 1,
          title: 'Preparation & Tempering',
          description: 'Gather all measured ingredients, chop vegetables coarsely, and heat oil/ghee in a heavy-bottomed pan over medium heat.',
          durationMinutes: 5,
        },
        {
          stepNumber: 2,
          title: 'Sautéing & Cooking',
          description: 'Add whole spices, onions, ginger-garlic paste, and tomatoes. Sauté until spices release aromatic oil.',
          durationMinutes: 10,
        },
        {
          stepNumber: 3,
          title: 'Simmering & Finishing',
          description: 'Add main ingredients, water, and simmer covered until tender. Garnish with fresh cilantro (hara dhania) and serve hot.',
          durationMinutes: 15,
        },
      ];

  const currentStep = instructions[currentStepIndex] || instructions[0];
  const stepDurationMins = currentStep.durationMinutes || 10;
  const { isActive, startTimer, pauseTimer, resetTimer, addMinutes, formatTime } = useTimer(stepDurationMins * 60);

  // Sync timer duration whenever step changes
  useEffect(() => {
    resetTimer((currentStep.durationMinutes || 10) * 60);
    stopSpeech();
  }, [currentStepIndex]);

  // Keyboard navigation listener (Left/Right arrow)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (currentStepIndex < instructions.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          setCurrentStepIndex((prev) => prev - 1);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, instructions.length]);

  const speakStep = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      stopSpeech();
      return;
    }
    const textToRead = `Step ${currentStepIndex + 1}: ${currentStep.title || ''}. ${currentStep.description}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleAskAIChef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `In Step ${currentStepIndex + 1} (${currentStep.title}) of recipe "${recipe.title}": ${aiQuery}`,
          recipeContext: recipe,
        }),
      });
      const data = await res.json();
      setAiResponse(data.reply || 'Check step temperature and stir gently.');
    } catch {
      setAiResponse('Reduce flame to medium-low, add 2 tbsp warm water, and stir well.');
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!isOpen) return null;

  const progressPercent = Math.round(((currentStepIndex + 1) / instructions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white overflow-hidden animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight line-clamp-1">{recipe.title}</h2>
            <p className="text-xs text-amber-400/90 font-medium">Hands-Free Interactive Cooking Mode</p>
          </div>
        </div>

        {/* Progress Pill */}
        <div className="hidden sm:flex items-center space-x-3 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700">
          <div className="w-32 bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <span className="text-xs font-semibold text-slate-300">
            Step {currentStepIndex + 1} of {instructions.length} ({progressPercent}%)
          </span>
        </div>

        <button
          onClick={() => {
            stopSpeech();
            onClose();
          }}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          title="Exit Cooking Mode"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Cooking Canvas */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Step View */}
        <div className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto justify-between">
          <div className="max-w-3xl mx-auto w-full space-y-6">
            {/* Step Counter Tag */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full">
                Step {currentStepIndex + 1} of {instructions.length}
              </span>
              <button
                onClick={speakStep}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSpeaking
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSpeaking ? 'Pause Voice' : '🔊 Read Step Aloud'}</span>
              </button>
            </div>

            {/* Step Title & Big Description */}
            <div className="space-y-4">
              {currentStep.title && (
                <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{currentStep.title}</h3>
              )}
              <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-medium">
                {currentStep.description}
              </p>
            </div>

            {/* Pro Tip Box if available */}
            {currentStep.proTip && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-sm flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-400 font-bold">Chef Pro-Tip</strong>
                  <span>{currentStep.proTip}</span>
                </div>
              </div>
            )}

            {/* Quick AI Chef Helper Trigger */}
            <div className="pt-2">
              <button
                onClick={() => setShowAIChefHelp(!showAIChefHelp)}
                className="inline-flex items-center space-x-2 text-xs font-semibold text-orange-400 hover:text-orange-300 underline underline-offset-4"
              >
                <ChefHat className="w-4 h-4" />
                <span>Having trouble with this step? Ask Annapurna Chef</span>
              </button>

              {showAIChefHelp && (
                <div className="mt-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 animate-in fade-in duration-150">
                  <form onSubmit={handleAskAIChef} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., How do I know when the onions are browned?"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={isAiLoading}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs"
                    >
                      {isAiLoading ? 'Asking...' : 'Ask Chef'}
                    </button>
                  </form>
                  {aiResponse && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200">
                      <strong>Chef Advice:</strong> {aiResponse}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="max-w-3xl mx-auto w-full pt-8 flex items-center justify-between border-t border-slate-800">
            <button
              onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentStepIndex === 0}
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous Step</span>
            </button>

            <span className="text-xs text-slate-500 hidden sm:inline">Use ← Left & Right → Keys</span>

            {currentStepIndex < instructions.length - 1 ? (
              <button
                onClick={() => setCurrentStepIndex((prev) => Math.min(instructions.length - 1, prev + 1))}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all"
              >
                <span>Next Step</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Finish Cooking!</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Step Timer & Ingredients Widget */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between space-y-6">
          {/* Active Step Timer Widget */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Active Step Timer</span>
            </div>

            <div className="font-mono text-5xl font-extrabold tracking-tight text-white py-2">
              {formatTime()}
            </div>

            <div className="flex items-center justify-center gap-2">
              {!isActive ? (
                <button
                  onClick={() => startTimer()}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Start</span>
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold rounded-xl text-xs hover:bg-amber-500/30 transition-colors"
                >
                  <Pause className="w-4 h-4 fill-amber-400" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={() => resetTimer()}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => addMinutes(1)}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 rounded-xl border border-slate-700 transition-colors"
                title="Add 1 Minute"
              >
                +1m
              </button>
            </div>
          </div>

          {/* Quick Recipe Ingredients Checklist */}
          <div className="flex-1 flex flex-col space-y-3 min-h-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Ingredients</h4>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {recipe.ingredients.map((ing, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex justify-between items-center">
                  <span className="text-slate-200 font-medium">{ing.name}</span>
                  <span className="text-amber-400 font-bold">{ing.quantity} {ing.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
