import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Recipe } from '../types';

interface DeleteConfirmModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onConfirmDelete: (recipeId: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  recipe,
  onClose,
  onConfirmDelete,
}) => {
  if (!recipe) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#181311] border border-rose-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-[#f0e6df] space-y-5 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#a09088] hover:text-white p-1 rounded-full hover:bg-[#241c19] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold font-serif text-white">Delete Custom Dish?</h3>
            <p className="text-xs text-[#a09088] mt-0.5">This action will permanently remove the dish.</p>
          </div>
        </div>

        {/* Dish Info Card */}
        <div className="bg-[#120f0e] border border-[#2a221f] rounded-2xl p-3.5 flex items-center gap-3">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-12 h-12 rounded-xl object-cover border border-[#352a25] shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <p className="font-bold text-sm text-white truncate">{recipe.title}</p>
            <p className="text-xs text-[#a09088] truncate">{recipe.cuisine} • {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins</p>
          </div>
        </div>

        <p className="text-xs text-[#a09088] leading-relaxed">
          Are you sure you want to remove <strong className="text-white">"{recipe.title}"</strong> from your custom cookbook? It will also be removed from any saved favorites or meal plans.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#241c19] hover:bg-[#2e231f] text-[#a09088] hover:text-white font-semibold text-xs transition-all border border-[#382d28] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(recipe.id);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Delete Dish
          </button>
        </div>
      </div>
    </div>
  );
};
