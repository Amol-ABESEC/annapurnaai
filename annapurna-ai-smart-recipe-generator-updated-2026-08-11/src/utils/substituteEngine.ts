import { PantryIngredient, SubstituteOption } from '../types';

export const INDIAN_INGREDIENT_SUBSTITUTES: Record<string, SubstituteOption[]> = {
  curd: [
    {
      originalIngredient: 'Curd / Dahi',
      substituteName: 'Lemon Juice + Milk',
      regionalSubstituteName: 'Nimbu ka Ras + Doodh',
      ratioText: '1 tbsp Lemon Juice + 1 cup Milk (let sit 5 mins)',
      culinaryNotes: 'Provides necessary acidity and curdling effect in gravies or marination.',
    },
    {
      originalIngredient: 'Curd / Dahi',
      substituteName: 'Greek Yogurt or Cream',
      regionalSubstituteName: 'Malai / Greek Yogurt',
      ratioText: '1:1 replacement ratio',
      culinaryNotes: 'Rich texture, slightly less tangy; add a drop of lemon for acidity.',
    },
  ],
  tomato: [
    {
      originalIngredient: 'Tomato / Tamatar',
      substituteName: 'Tamarind Paste (Imli)',
      regionalSubstituteName: 'Imli Paste',
      ratioText: '1 tsp Tamarind Paste per 1 cup Tomato',
      culinaryNotes: 'Delivers authentic sourness for curries and dal tadka.',
    },
    {
      originalIngredient: 'Tomato / Tamatar',
      substituteName: 'Amchur (Dry Mango Powder)',
      regionalSubstituteName: 'Amchur Powder',
      ratioText: '1/2 tsp Amchur + 1/4 tsp sugar',
      culinaryNotes: 'Great tanginess boost without adding moisture to dry vegetables (sabzi).',
    },
  ],
  paneer: [
    {
      originalIngredient: 'Paneer',
      substituteName: 'Tofu (Extra Firm)',
      regionalSubstituteName: 'Tofu',
      ratioText: '1:1 ratio by weight',
      culinaryNotes: 'Press well before frying. Absorbs gravies similarly with higher protein.',
    },
    {
      originalIngredient: 'Paneer',
      substituteName: 'Boiled Potatoes or Boiled Chana',
      regionalSubstituteName: 'Aloo / Kabuli Chana',
      ratioText: '1:1 ratio',
      culinaryNotes: 'Hearty fallback for North Indian curry bases.',
    },
  ],
  ghee: [
    {
      originalIngredient: 'Ghee',
      substituteName: 'Mustard Oil / Vegetable Oil + Pinch of Butter',
      regionalSubstituteName: 'Sarson ka Tel / Butter',
      ratioText: '1:1 ratio',
      culinaryNotes: 'Mustard oil gives authentic spicy aroma; add butter for richness.',
    },
  ],
  'coconut milk': [
    {
      originalIngredient: 'Coconut Milk',
      substituteName: 'Cashew Paste (Kaju Paste)',
      regionalSubstituteName: 'Kaju Paste',
      ratioText: '2 tbsp Cashew Paste mixed with 1/2 cup warm water',
      culinaryNotes: 'Creates rich, velvety royal Indian gravy base.',
    },
  ],
  hing: [
    {
      originalIngredient: 'Hing (Asafoetida)',
      substituteName: 'Garlic + Onion Powder',
      regionalSubstituteName: 'Lehsun + Pyaz Powder',
      ratioText: '1/4 tsp Garlic powder per pinch of Hing',
      culinaryNotes: 'Replicates umami pungent flavor profile for digestive tempering.',
    },
  ],
  kasuri_methi: [
    {
      originalIngredient: 'Kasuri Methi',
      substituteName: 'Celery leaves or Mustard Greens + Coriander',
      regionalSubstituteName: 'Hara Dhania + Mustard leaves',
      ratioText: '1:1 crushed ratio',
      culinaryNotes: 'Provides herbal aroma at the end of cooking.',
    },
  ],
};

export function getSubstitutesForIngredient(
  ingredientName: string,
  pantryItems: PantryIngredient[]
): SubstituteOption[] {
  const cleanName = ingredientName.toLowerCase().trim();
  const pantryNames = new Set(pantryItems.map((p) => p.name.toLowerCase().trim()));
  const pantryRegionals = new Set(pantryItems.map((p) => (p.regionalName || '').toLowerCase().trim()));

  let matches: SubstituteOption[] = [];

  for (const [key, options] of Object.entries(INDIAN_INGREDIENT_SUBSTITUTES)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      matches = options;
      break;
    }
  }

  if (matches.length === 0) {
    // Dynamic smart fallback substitute
    matches = [
      {
        originalIngredient: ingredientName,
        substituteName: `Similar ${ingredientName} spice/herb alternative`,
        regionalSubstituteName: `Alternate for ${ingredientName}`,
        ratioText: 'Adjust to taste (start with 1/2 measure)',
        culinaryNotes: 'Use equal parts herbs or mild seasoning to maintain dish balance.',
      },
    ];
  }

  return matches.map((opt) => {
    const subNameLower = opt.substituteName.toLowerCase();
    const isAvail = Array.from(pantryNames).some((p) => subNameLower.includes(p)) ||
      Array.from(pantryRegionals).some((r) => r.length > 3 && subNameLower.includes(r));
    return {
      ...opt,
      isAvailableInPantry: isAvail,
    };
  });
}
