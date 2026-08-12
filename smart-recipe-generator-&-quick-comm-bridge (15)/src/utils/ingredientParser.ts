import { IngredientCategory } from '../types';

export interface ParsedIngredient {
  canonicalName: string;
  regionalName: string;
  category: IngredientCategory;
  isNonVeg: boolean;
}

// Synonyms and Alias Dictionary for Smart Indian Kitchen Inventory
const ALIAS_MAP: {
  keywords: string[];
  canonicalName: string;
  regionalName: string;
  category: IngredientCategory;
  isNonVeg?: boolean;
}[] = [
  // --- NON-VEGETARIAN ---
  {
    keywords: ['chicken', 'murg', 'murgh', 'kukkad', 'murgi', 'hen', 'chiken', 'chickn'],
    canonicalName: 'Chicken',
    regionalName: 'Murgh',
    category: 'non_veg',
    isNonVeg: true,
  },
  {
    keywords: ['egg', 'eggs', 'anda', 'ande', 'andey'],
    canonicalName: 'Eggs',
    regionalName: 'Anda',
    category: 'non_veg',
    isNonVeg: true,
  },
  {
    keywords: ['mutton', 'lamb', 'meat', 'gosht', 'goat', 'kheema', 'keema', 'mince'],
    canonicalName: 'Mutton / Lamb',
    regionalName: 'Gosht',
    category: 'non_veg',
    isNonVeg: true,
  },
  {
    keywords: ['fish', 'machhi', 'machli', 'rohu', 'katla', 'salmon', 'surmai', 'pomfret'],
    canonicalName: 'Fish',
    regionalName: 'Machli',
    category: 'non_veg',
    isNonVeg: true,
  },
  {
    keywords: ['prawn', 'prawns', 'shrimp', 'jhinga', 'prawns fillet'],
    canonicalName: 'Prawns',
    regionalName: 'Jhinga',
    category: 'non_veg',
    isNonVeg: true,
  },
  {
    keywords: ['crab', 'squid', 'pork', 'bacon', 'turkey', 'duck'],
    canonicalName: 'Seafood / Meat',
    regionalName: 'Non-Veg',
    category: 'non_veg',
    isNonVeg: true,
  },

  // --- VEGETABLES ---
  {
    keywords: ['onion', 'pyaz', 'pyaaj', 'kanda', 'onions'],
    canonicalName: 'Onion',
    regionalName: 'Pyaz',
    category: 'vegetables',
  },
  {
    keywords: ['tomato', 'tamatar', 'tomatoes', 'tomatoe'],
    canonicalName: 'Tomato',
    regionalName: 'Tamatar',
    category: 'vegetables',
  },
  {
    keywords: ['potato', 'aalo', 'alu', 'aloo', 'batata', 'potatoes'],
    canonicalName: 'Potato',
    regionalName: 'Aalo',
    category: 'vegetables',
  },
  {
    keywords: ['peas', 'matar', 'muttar', 'green peas'],
    canonicalName: 'Green Peas',
    regionalName: 'Matar',
    category: 'vegetables',
  },
  {
    keywords: ['cauliflower', 'gobi', 'gobhi', 'phool gobi'],
    canonicalName: 'Cauliflower',
    regionalName: 'Gobi',
    category: 'vegetables',
  },
  {
    keywords: ['capsicum', 'shimla mirch', 'bell pepper', 'shimla'],
    canonicalName: 'Capsicum',
    regionalName: 'Shimla Mirch',
    category: 'vegetables',
  },
  {
    keywords: ['spinach', 'palak', 'paalak'],
    canonicalName: 'Spinach',
    regionalName: 'Palak',
    category: 'vegetables',
  },
  {
    keywords: ['coriander', 'dhania', 'dhaniya', 'dhanya', 'cilantro', 'dhania patta', 'dhaniya patta', 'coriander leaves', 'dhania danda', 'dhania dandi'],
    canonicalName: 'Coriander Leaves',
    regionalName: 'Dhania Patta',
    category: 'vegetables',
  },
  {
    keywords: ['ginger', 'adrak', 'adrakh'],
    canonicalName: 'Ginger',
    regionalName: 'Adrak',
    category: 'vegetables',
  },
  {
    keywords: ['garlic', 'lehsun', 'lahsun', 'lahson'],
    canonicalName: 'Garlic',
    regionalName: 'Lehsun',
    category: 'vegetables',
  },
  {
    keywords: ['ginger garlic', 'adrak lahsun', 'ginger garlic paste'],
    canonicalName: 'Ginger Garlic Paste',
    regionalName: 'Adrak Lahsun Paste',
    category: 'spices',
  },
  {
    keywords: ['green chilli', 'hari mirch', 'green chili', 'chilli', 'mirch'],
    canonicalName: 'Green Chilli',
    regionalName: 'Hari Mirch',
    category: 'vegetables',
  },
  {
    keywords: ['mushroom', 'khumbi', 'mushrooms'],
    canonicalName: 'Mushroom',
    regionalName: 'Khumbi',
    category: 'vegetables',
  },
  {
    keywords: ['lemon', 'nimbu', 'lime', 'numbu'],
    canonicalName: 'Lemon',
    regionalName: 'Nimbu',
    category: 'vegetables',
  },

  // --- DAIRY ---
  {
    keywords: ['paneer', 'cottage cheese'],
    canonicalName: 'Paneer',
    regionalName: 'Cottage Cheese',
    category: 'dairy',
  },
  {
    keywords: ['curd', 'dahi', 'yogurt', 'yoghurt'],
    canonicalName: 'Curd / Yogurt',
    regionalName: 'Dahi',
    category: 'dairy',
  },
  {
    keywords: ['cream', 'malai', 'fresh cream', 'amul cream'],
    canonicalName: 'Amul Fresh Cream',
    regionalName: 'Fresh Cream',
    category: 'dairy',
  },
  {
    keywords: ['butter', 'makhan', 'ghee'],
    canonicalName: 'Ghee / Butter',
    regionalName: 'Ghee / Makhan',
    category: 'dairy',
  },
  {
    keywords: ['milk', 'doodh'],
    canonicalName: 'Milk',
    regionalName: 'Doodh',
    category: 'dairy',
  },
  {
    keywords: ['cheese', 'cheese slice', 'cheese slices'],
    canonicalName: 'Cheese Slices',
    regionalName: 'Cheese',
    category: 'dairy',
  },

  // --- SPICES ---
  {
    keywords: ['turmeric', 'haldi', 'haldi powder'],
    canonicalName: 'Turmeric Powder',
    regionalName: 'Haldi',
    category: 'spices',
  },
  {
    keywords: ['red chilli', 'lal mirch', 'red chili powder', 'kashmiri mirch'],
    canonicalName: 'Red Chilli Powder',
    regionalName: 'Lal Mirch',
    category: 'spices',
  },
  {
    keywords: ['cumin', 'jeera', 'zeera'],
    canonicalName: 'Cumin Seeds',
    regionalName: 'Jeera',
    category: 'spices',
  },
  {
    keywords: ['garam masala', 'masala', 'all spices'],
    canonicalName: 'Garam Masala',
    regionalName: 'Garam Masala',
    category: 'spices',
  },
  {
    keywords: ['kasuri methi', 'dried fenugreek', 'methi'],
    canonicalName: 'Kasuri Methi',
    regionalName: 'Dried Fenugreek',
    category: 'spices',
  },
  {
    keywords: ['cashew', 'cashews', 'kaju'],
    canonicalName: 'Cashews',
    regionalName: 'Kaju',
    category: 'spices',
  },
  {
    keywords: ['mustard', 'sarson', 'rai'],
    canonicalName: 'Mustard Seeds',
    regionalName: 'Sarson',
    category: 'spices',
  },

  // --- GRAINS & STAPLES ---
  {
    keywords: ['rice', 'chawal', 'basmati'],
    canonicalName: 'Basmati Rice',
    regionalName: 'Chawal',
    category: 'grains',
  },
  {
    keywords: ['atta', 'wheat flour', 'wheat', 'flour'],
    canonicalName: 'Wheat Flour',
    regionalName: 'Atta',
    category: 'grains',
  },
  {
    keywords: ['dal', 'arhar dal', 'toor dal', 'yellow dal', 'moong dal', 'masoor dal', 'urad dal', 'lentils', 'pulses'],
    canonicalName: 'Arhar Dal',
    regionalName: 'Toor Dal',
    category: 'grains',
  },
  {
    keywords: ['chana', 'chole', 'chickpeas', 'kabuli chana'],
    canonicalName: 'Chickpeas',
    regionalName: 'Kabuli Chana',
    category: 'grains',
  },
  {
    keywords: ['poha', 'flattened rice'],
    canonicalName: 'Poha',
    regionalName: 'Flattened Rice',
    category: 'grains',
  },
  {
    keywords: ['besan', 'gram flour'],
    canonicalName: 'Gram Flour',
    regionalName: 'Besan',
    category: 'grains',
  },
  {
    keywords: ['suji', 'sooji', 'semolina', 'rava'],
    canonicalName: 'Semolina',
    regionalName: 'Suji / Rava',
    category: 'grains',
  },
  {
    keywords: ['maida', 'all purpose flour'],
    canonicalName: 'All Purpose Flour',
    regionalName: 'Maida',
    category: 'grains',
  },
  {
    keywords: ['rajma', 'kidney beans'],
    canonicalName: 'Kidney Beans',
    regionalName: 'Rajma',
    category: 'grains',
  },

  // --- SAUCES & OILS ---
  {
    keywords: ['oil', 'mustard oil', 'sarson oil', 'sarson ka tel', 'tel', 'cooking oil', 'refined oil'],
    canonicalName: 'Mustard Oil',
    regionalName: 'Sarson Ka Tel',
    category: 'sauces_oils',
  },
  {
    keywords: ['ghee', 'desi ghee'],
    canonicalName: 'Desi Ghee',
    regionalName: 'Ghee',
    category: 'sauces_oils',
  },
  {
    keywords: ['olive oil'],
    canonicalName: 'Olive Oil',
    regionalName: 'Jaitun Ka Tel',
    category: 'sauces_oils',
  },
  {
    keywords: ['sauce', 'tomato sauce', 'tomato ketchup', 'ketchup'],
    canonicalName: 'Tomato Ketchup',
    regionalName: 'Tomato Sauce',
    category: 'sauces_oils',
  },
  {
    keywords: ['soy sauce', 'soya sauce'],
    canonicalName: 'Soy Sauce',
    regionalName: 'Soya Sauce',
    category: 'sauces_oils',
  },
  {
    keywords: ['vinegar', 'sirka'],
    canonicalName: 'Vinegar',
    regionalName: 'Sirka',
    category: 'sauces_oils',
  },

  // --- EXTRA SPICES & INDIAN pantry staples ---
  {
    keywords: ['salt', 'namak'],
    canonicalName: 'Salt',
    regionalName: 'Namak',
    category: 'spices',
  },
  {
    keywords: ['sugar', 'chini', 'shakkar'],
    canonicalName: 'Sugar',
    regionalName: 'Chini',
    category: 'spices',
  },
  {
    keywords: ['jaggery', 'gur'],
    canonicalName: 'Jaggery',
    regionalName: 'Gur',
    category: 'spices',
  },
  {
    keywords: ['curry leaves', 'kadi patta', 'kadipatta'],
    canonicalName: 'Curry Leaves',
    regionalName: 'Kadi Patta',
    category: 'spices',
  },
  {
    keywords: ['bay leaf', 'tej patta', 'bay leaves'],
    canonicalName: 'Bay Leaf',
    regionalName: 'Tej Patta',
    category: 'spices',
  },
  {
    keywords: ['asafoetida', 'hing'],
    canonicalName: 'Asafoetida',
    regionalName: 'Hing',
    category: 'spices',
  },
  {
    keywords: ['cardamom', 'elaichi', 'choti elaichi'],
    canonicalName: 'Cardamom',
    regionalName: 'Elaichi',
    category: 'spices',
  },
  {
    keywords: ['cloves', 'laung'],
    canonicalName: 'Cloves',
    regionalName: 'Laung',
    category: 'spices',
  },
  {
    keywords: ['cinnamon', 'dalchini'],
    canonicalName: 'Cinnamon',
    regionalName: 'Dalchini',
    category: 'spices',
  },
  {
    keywords: ['black pepper', 'kali mirch'],
    canonicalName: 'Black Pepper',
    regionalName: 'Kali Mirch',
    category: 'spices',
  },

  // --- EXTRA VEGETABLES ---
  {
    keywords: ['mint', 'pudina', 'mint leaves'],
    canonicalName: 'Mint Leaves',
    regionalName: 'Pudina',
    category: 'vegetables',
  },
  {
    keywords: ['bhindi', 'okra', 'ladies finger'],
    canonicalName: 'Okra',
    regionalName: 'Bhindi',
    category: 'vegetables',
  },
  {
    keywords: ['baingan', 'brinjal', 'eggplant'],
    canonicalName: 'Brinjal',
    regionalName: 'Baingan',
    category: 'vegetables',
  },
  {
    keywords: ['carrot', 'gajar', 'gajjar'],
    canonicalName: 'Carrot',
    regionalName: 'Gajar',
    category: 'vegetables',
  },
  {
    keywords: ['coconut', 'nariyal'],
    canonicalName: 'Coconut',
    regionalName: 'Nariyal',
    category: 'vegetables',
  },
];

const NON_VEG_PATTERNS = [
  /\bchicken\b/i, /\bmurg\b/i, /\bmurgh\b/i, /\bkukkad\b/i, /\bmurgi\b/i, /\bhen\b/i, /\bchiken\b/i, /\bchick\b/i,
  /\begg\b/i, /\beggs\b/i, /\banda\b/i, /\bande\b/i, /\bandey\b/i,
  /\bmutton\b/i, /\bgosht\b/i, /\blamb\b/i, /\bgoat\b/i, /\bmeat\b/i, /\bkheema\b/i, /\bkeema\b/i, /\bmince\b/i,
  /\bfish\b/i, /\bmachhi\b/i, /\bmachli\b/i, /\bprawn\b/i, /\bprawns\b/i, /\bjhinga\b/i, /\bshrimp\b/i,
  /\bcrab\b/i, /\bsquid\b/i, /\bturkey\b/i, /\bpork\b/i, /\bbacon\b/i, /\bbeef\b/i, /\bduck\b/i, /\bham\b/i,
  /\bsausage\b/i, /\bpepperoni\b/i, /\bsalami\b/i
];

const VEG_OVERRIDES = [
  'eggless', 'egg-free', 'dhania', 'dhaniya', 'dhanya', 'coriander', 'cilantro', 'paneer', 'palak', 'spinach', 'gobi', 'cauliflower',
  'potato', 'aalo', 'alu', 'aloo', 'batata', 'onion', 'pyaz', 'pyaaj', 'kanda', 'tomato', 'tamatar',
  'matar', 'peas', 'capsicum', 'shimla', 'chilli', 'chili', 'mirch', 'adrak', 'ginger',
  'lahsun', 'lehsun', 'garlic', 'dal', 'rice', 'chawal', 'atta', 'wheat', 'ghee', 'butter',
  'makhan', 'milk', 'doodh', 'curd', 'dahi', 'yogurt', 'cream', 'malai', 'cashew', 'kaju',
  'methi', 'haldi', 'turmeric', 'jeera', 'cumin', 'masala', 'sarson', 'mustard', 'poha', 'chana', 'chole'
];

const parseCache = new Map<string, ParsedIngredient>();

/**
 * Smart parse function that cleans random input, detects synonyms/Hinglish slang,
 * assigns proper categories (vegetables, non_veg, dairy, spices, grains, sauces_oils),
 * and formats clean Display Name and Regional Name.
 */
export function parseSmartIngredient(inputRaw: string): ParsedIngredient {
  if (!inputRaw) {
    return {
      canonicalName: 'Ingredient',
      regionalName: 'Ingredient',
      category: 'vegetables',
      isNonVeg: false,
    };
  }
  const trimmed = inputRaw.trim();
  if (!trimmed) {
    return {
      canonicalName: 'Ingredient',
      regionalName: 'Ingredient',
      category: 'vegetables',
      isNonVeg: false,
    };
  }
  const cached = parseCache.get(trimmed);
  if (cached) return cached;

  const result = _parseSmartIngredientInternal(trimmed);
  parseCache.set(trimmed, result);
  return result;
}

function _parseSmartIngredientInternal(inputRaw: string): ParsedIngredient {
  if (!inputRaw || !inputRaw.trim()) {
    return {
      canonicalName: 'Ingredient',
      regionalName: 'Ingredient',
      category: 'vegetables',
      isNonVeg: false,
    };
  }

  // PASS 1: Clean numbers, quantities, punctuation, and common leading/trailing conversational filler verbs
  let cleanedPass1 = inputRaw
    .toLowerCase()
    // Remove numbers and standard units like "250g", "3 cups", "1kg"
    .replace(/\b(\d+)\s*(g|kg|gm|gms|ml|l|ltr|pcs|pc|pieces|cup|cups|tbsp|tsp|pack|packet|block|blocks|slice|slices)\b/gi, '')
    // Remove common conversational starting/ending filler phrases
    .replace(/^(please\s+add|can\s+you\s+add|i\s+want\s+to\s+add|i\s+want|i\s+need|i\s+have|add|put|get|buy|have|need|also)\b/gi, '')
    .replace(/\b(in\s+fridge|in\s+my\s+fridge|in\s+kitchen|in\s+my\s+kitchen|in\s+pantry|in\s+my\s+pantry|please|also)$/gi, '')
    .replace(/[^a-zA-Z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanedPass1) {
    return {
      canonicalName: 'Ingredient',
      regionalName: 'Ingredient',
      category: 'vegetables',
      isNonVeg: false,
    };
  }

  // Try to match with Pass 1 cleaned string (highly specific match, preserves descriptors like "leaves", "paste")
  for (const entry of ALIAS_MAP) {
    for (const kw of entry.keywords) {
      const isExact = cleanedPass1 === kw;
      const isWordMatch = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(cleanedPass1);
      if (isExact || isWordMatch) {
        return {
          canonicalName: entry.canonicalName,
          regionalName: entry.regionalName,
          category: entry.category,
          isNonVeg: !!entry.isNonVeg,
        };
      }
    }
  }

  // PASS 2: Deeper cleaning - remove condition and shape descriptors like "chopped", "fresh", "organic", "leaves", "paste"
  let cleanedPass2 = cleanedPass1
    .replace(/\b(fresh|organic|raw|ripe|boiled|fried|chopped|sliced|diced|grated|powdered|crushed|puree|pureed|purée|puréed|leaves|leaf|paste|cube|cubes|block|blocks|bunch|bunches|clove|cloves|piece|pieces|sprig|sprigs|sprinkled|some|any|a|an|the|of|with|and)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanedPass2) {
    // Try to match with Pass 2 deeply cleaned string (e.g. "chopped ginger" -> "ginger" -> matches Ginger)
    for (const entry of ALIAS_MAP) {
      for (const kw of entry.keywords) {
        const isExact = cleanedPass2 === kw;
        const isWordMatch = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(cleanedPass2);
        if (isExact || isWordMatch) {
          return {
            canonicalName: entry.canonicalName,
            regionalName: entry.regionalName,
            category: entry.category,
            isNonVeg: !!entry.isNonVeg,
          };
         }
       }
     }
  }

  // If still no match, check if it contains any known filler words. If the entire string is just filler, return 'Ingredient'
  const isTotalFiller = /^(please|add|want|need|have|also|get|buy|fridge|kitchen|pantry|stock|the|some|any|a|an|and|with|of|for|i|you|can|to|in)$/i.test(cleanedPass1);
  if (isTotalFiller) {
    return {
      canonicalName: 'Ingredient',
      regionalName: 'Ingredient',
      category: 'vegetables',
      isNonVeg: false,
    };
  }

  // Determine fallback category for unrecognized custom ingredients
  const checkTarget = cleanedPass2 || cleanedPass1;
  const isVegExplicit = VEG_OVERRIDES.some((v) => checkTarget.includes(v));
  const isNonVeg = !isVegExplicit && NON_VEG_PATTERNS.some((pattern) => pattern.test(checkTarget));

  let fallbackCategory: IngredientCategory = 'vegetables';
  if (isNonVeg) {
    fallbackCategory = 'non_veg';
  } else if (/\b(masala|powder|mirch|chilli|chili|haldi|salt|namak|jeera|cumin|rai|mustard|elaichi|cardamom|laung|cloves?|dalchini|cinnamon|hing|asafoetida|saffron|kesar|pepper|spices?|seeds?|jaggery|gur|sugar|chini|shakkar|kaju|cashews?|almonds?|badam|pista|pistachios?|walnut|akhrot|dryfruit|dry\s*fruits)\b/i.test(checkTarget)) {
    fallbackCategory = 'spices';
  } else if (/\b(paneer|cheese|dahi|curd|yogurt|yoghurt|milk|doodh|cream|malai|khoa|khoya|butter|makhan|lassi|chaas|buttermilk)\b/i.test(checkTarget)) {
    fallbackCategory = 'dairy';
  } else if (/\b(atta|wheat|flour|maida|suji|sooji|semolina|rice|chawal|basmati|poha|dal|lentils?|pulse|pulses|chana|chole|chickpeas?|rajma|kidney\s*beans|beans|barley|oats?|besan|gram\s*flour|rava|millet|ragi|bajra|jowar|grain|grains|pasta|noodle|noodles|bread|roti|paratha)\b/i.test(checkTarget)) {
    fallbackCategory = 'grains';
  } else if (/\b(oil|tel|ghee|sauce|vinegar|sirka|paste|mayo|mayonnaise|ketchup|liquid|syrup|honey|madhu|oil\s*seeds?)\b/i.test(checkTarget)) {
    fallbackCategory = 'sauces_oils';
  }

  // Format Title Case for unknown random ingredient
  const finalName = (cleanedPass2 || cleanedPass1)
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    canonicalName: finalName,
    regionalName: finalName,
    category: fallbackCategory,
    isNonVeg,
  };
}

/**
 * Check if ingredient name or category represents non-veg item
 */
export function isNonVegIngredient(name: string, category?: string): boolean {
  if (!name) return false;
  const lower = name.toLowerCase().trim();

  // 1. Known vegetarian items can NEVER be non-veg
  if (VEG_OVERRIDES.some((v) => lower.includes(v))) {
    return false;
  }

  // 2. Check non-veg patterns
  if (NON_VEG_PATTERNS.some((pattern) => pattern.test(lower))) {
    return true;
  }

  // 3. Check category as fallback only if not in VEG_OVERRIDES
  if (category === 'non_veg') {
    return true;
  }

  // Also verify using parseSmartIngredient
  const parsed = parseSmartIngredient(name);
  if (parsed.isNonVeg) return true;

  return false;
}

/**
 * Parse conversational string with multiple items (e.g. "I have 2 eggs, murg, tomato, and butter")
 */
export function parseConversationalItems(text: string): ParsedIngredient[] {
  if (!text) return [];

  // Replace common separators and conjunctions with comma
  const cleanedText = text
    .replace(/\b(and|with|as\s+well\s+as|along\s+with)\b/gi, ',')
    .replace(/[\n\r.]+/g, ',');

  const rawTokens = cleanedText.split(',').map((t) => t.trim()).filter((t) => t.length > 0);

  const results: ParsedIngredient[] = [];
  for (const token of rawTokens) {
    const parsed = parseSmartIngredient(token);
    // Skip garbage/empty tokens that got resolved to 'Ingredient' fallback due to containing only filler words
    if (
      parsed.canonicalName && 
      parsed.canonicalName !== 'Ingredient' &&
      parsed.canonicalName.toLowerCase() !== 'please add' &&
      parsed.canonicalName.toLowerCase() !== 'i have' &&
      parsed.canonicalName.length > 1
    ) {
      // Double-check: if the token was entirely conversational filler, skip it
      const isFillerOnly = /^(please|add|want|need|have|also|get|buy|fridge|kitchen|pantry|stock|the|some|any|a|an|and|with|of|for|i|you|can|to|in)$/i.test(parsed.canonicalName);
      if (!isFillerOnly && !results.some((r) => r.canonicalName.toLowerCase() === parsed.canonicalName.toLowerCase())) {
        results.push(parsed);
      }
    }
  }

  return results;
}
