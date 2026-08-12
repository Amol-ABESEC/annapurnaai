import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, X, Bot, User, RefreshCw, ChefHat, ShoppingCart, 
  Trash2, Mic, MicOff, Volume2, VolumeX, Copy, Check, Scale, Flame, Wrench,
  Brain, Database
} from 'lucide-react';
import Markdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage, Recipe, PantryIngredient } from '../types';
import { generateFallbackAssistantReply } from '../utils/aiAssistantEngine';
import { useSpeechToText } from '../hooks/useSpeechToText';

// The Gemini client is now initialized and handled on the server side in server.ts

interface AICookingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  recipeContext: Recipe | null;
  pantryItems: PantryIngredient[];
  onOpenQuickComm?: (recipe: Recipe) => void;
  onAddIngredient?: (name: string, regionalName?: string) => void;
}

type PromptCategory = 'recipes' | 'fixes' | 'hacks' | 'substitutes';

export const AICookingAssistant: React.FC<AICookingAssistantProps> = ({
  isOpen,
  onClose,
  recipeContext,
  pantryItems,
  onOpenQuickComm,
  onAddIngredient,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Namaste! I am **Annapurna AI**, your expert culinary assistant. 🥘\n\nAsk me anything about:\n- **Cooking**: Direct recipes, tips, and portion scaling.\n- **Fixes**: Quick solutions for salty, spicy, or burnt dishes.\n- **Inventory**: Planning with your current ingredients.\n\n*What would you like to cook or fix today?*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<PromptCategory>('recipes');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const assistantSpeech = useSpeechToText({
    onResult: (text) => {
      setInputMessage(text);
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Stop speech synthesis on unmount or close
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleToggleSpeech = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text for speech output
    const cleanText = text
      .replace(/[*#_`-]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    // Build conversation history for multi-turn Gemini API
    const historyPayload = messages
      .filter((m) => m.id !== 'msg-1')
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          recipeContext: recipeContext ? { title: recipeContext.title, ingredients: recipeContext.ingredients } : null,
          inventory: pantryItems.map(i => i.name),
          conversationHistory: historyPayload
        })
      });

      if (!response.ok) {
        throw new Error('API response was not ok');
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || data.fallbackReply || "Sorry, I could not process that.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.info('Backend API unavailable (e.g., Netlify static host), using client-side AI engine:', err);
      const fallbackReply = generateFallbackAssistantReply(
        query,
        recipeContext ? { title: recipeContext.title, ingredients: recipeContext.ingredients } : null,
        pantryItems.map((i) => i.name),
        historyPayload
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          sender: 'assistant',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'simulated_fallback',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared! What else would you like to cook or adjust?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const categorisedPrompts: Record<PromptCategory, string[]> = {
    recipes: [
      'How to make Paneer Butter Masala?',
      'Authentic Masala Chai recipe with tips',
      'Dal Makhani dhaba-style recipe',
      'Quick 10-min breakfast recipe',
      'Hyderabadi Dum Biryani step-by-step',
    ],
    fixes: [
      'How to fix over-salty curry?',
      'How to fix burnt gravy smell?',
      'How to fix watery dal?',
      'How to make curry less spicy?',
      'How to make soft rotis that stay soft?',
    ],
    hacks: [
      'Flame control & tadka tempering tips',
      'How to store coriander fresh for weeks?',
      'Secrets to crisp dosa batter',
      'Best marination time for Paneer & Meat',
      'Oil smoke points & healthiest cooking oils',
    ],
    substitutes: [
      'Substitute for Amul Fresh Cream / Malai',
      'Substitute for Tomatoes in curry',
      'Substitute for Paneer in gravies',
      'Egg substitutes for baking',
      'Substitute for Garlic / Onion in Jain style',
    ],
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white border-l border-slate-200 shadow-2xl flex flex-col text-slate-900 animate-fadeIn">
      
      {/* Drawer Header */}
      <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white shadow-lg flex items-center justify-center shrink-0 border border-emerald-400/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <span>Annapurna AI</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
                <span>Cooking Copilot</span>
              </span>
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Instant Culinary Recipes & Kitchen Solutions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            title="Clear Chat History"
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Active Context Banner */}
      {recipeContext && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-emerald-900">
          <div className="flex items-center gap-2 truncate">
            <ChefHat className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="truncate font-semibold">Active Recipe: {recipeContext.title}</span>
          </div>
          {onOpenQuickComm && (
            <button
              onClick={() => onOpenQuickComm(recipeContext)}
              className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow-xs"
            >
              <ShoppingCart className="w-3 h-3" />
              <span>Order Missing</span>
            </button>
          )}
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white shadow-sm flex items-center justify-center shrink-0 text-xs font-bold">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white font-medium rounded-tr-none shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none space-y-2 shadow-xs'
              }`}
            >
              <div className="markdown-body prose max-w-none text-xs text-slate-800">
                <Markdown>{msg.text}</Markdown>
              </div>

              {/* Toolbar for Assistant Messages */}
              {msg.sender === 'assistant' && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                  
                  {/* Speech & Copy buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleSpeech(msg.id, msg.text)}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${
                        speakingMsgId === msg.id
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 font-bold animate-pulse'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                      title={speakingMsgId === msg.id ? 'Stop Speech' : 'Listen Hands-Free (Read Aloud)'}
                    >
                      {speakingMsgId === msg.id ? (
                        <>
                          <VolumeX className="w-3 h-3 text-amber-700" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-indigo-600" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition-all"
                      title="Copy response to clipboard"
                    >
                      {copiedMsgId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Interactive Quick Action Chips */}
                  {msg.id !== 'msg-1' && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        onClick={() => handleSendMessage('Scale this recipe for 6 guests')}
                        className="px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-semibold border border-indigo-200 flex items-center gap-1"
                      >
                        <Scale className="w-3 h-3 text-indigo-600" />
                        <span>Scale 6 Servings</span>
                      </button>
                      <button
                        onClick={() => handleSendMessage('How to make this less spicy and milder?')}
                        className="px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-semibold border border-rose-200 flex items-center gap-1"
                      >
                        <Flame className="w-3 h-3 text-rose-600" />
                        <span>Fix Spice</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Order missing ingredients action button */}
              {msg.sender === 'assistant' && recipeContext && onOpenQuickComm && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onOpenQuickComm(recipeContext)}
                    className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Order Missing Ingredients on Quick-Comm</span>
                  </button>
                </div>
              )}

              <div
                className={`text-[10px] mt-1 text-right ${
                  msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 text-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-indigo-700 p-3 bg-white rounded-xl border border-indigo-200 w-fit shadow-xs">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            <span>Consulting Annapurna AI...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Categorized Quick Prompts Bar */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <button
            onClick={() => setActiveCategory('recipes')}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
              activeCategory === 'recipes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            🍳 Recipes
          </button>
          <button
            onClick={() => setActiveCategory('fixes')}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
              activeCategory === 'fixes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            🛠️ Fixes
          </button>
          <button
            onClick={() => setActiveCategory('hacks')}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
              activeCategory === 'hacks'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            💡 Pro Hacks
          </button>
          <button
            onClick={() => setActiveCategory('substitutes')}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
              activeCategory === 'substitutes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            🔄 Substitutes
          </button>
        </div>

        {/* Prompt Chips */}
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {categorisedPrompts[activeCategory].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-[11px] font-medium text-slate-700 hover:text-indigo-700 transition-all text-left shadow-2xs"
            >
              + {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Field */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (assistantSpeech.isListening) assistantSpeech.stopListening();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                assistantSpeech.isListening
                  ? '🎙️ Listening... Speak your cooking question...'
                  : 'Ask any recipe, cooking tip, substitute, or question...'
              }
              className={`w-full bg-slate-50 border rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                assistantSpeech.isListening
                  ? 'border-rose-500 ring-2 ring-rose-100 bg-rose-50/30 font-semibold text-rose-900 animate-pulse'
                  : 'border-slate-200 focus:border-indigo-500 focus:bg-white'
              }`}
            />
            <button
              type="button"
              onClick={assistantSpeech.toggleListening}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                assistantSpeech.isListening
                  ? 'bg-rose-600 text-white ring-2 ring-rose-200 animate-bounce'
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
              }`}
              title={assistantSpeech.isListening ? 'Stop Voice Input' : 'Voice Input (Hands-Free)'}
            >
              {assistantSpeech.isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 transition-all shadow-sm shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
    </>
  );
};

