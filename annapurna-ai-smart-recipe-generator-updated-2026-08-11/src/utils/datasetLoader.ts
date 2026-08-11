import { Recipe, RecipeIngredient, RecipeInstruction } from '../types';
import { enrichToMongoDocument } from '../data/mongoRecipeStore';
import { cleanRecipeTitle } from './titleCleaner';
import { findRecipeImageForDish } from './recipeImageMatcher';

/**
 * Normalizes dish titles to canonical keys to prevent duplicate dishes
 */
export function getCanonicalDishKey(title: string): string {
  const lower = title.toLowerCase().trim().replace(/[^a-z0-9 ]/g, ' ');
  // Clean up extra spaces
  const cleaned = lower.replace(/\s+/g, '_');
  return cleaned;
}

/**
 * Deterministic string hash function for title-based variation
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Curated Unsplash food photo pools by dish type
const IMAGE_POOLS = {
  karelaGourd: [
    'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  ],
  alooPotato: [
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=800&q=80',
  ],
  bhindiOkra: [
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  ],
  gobiCauliflower: [
    'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  ],
  bainganEggplant: [
    'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  ],
  mushroom: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  ],
  paneer: [
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
  ],
  choleChana: [
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
  ],
  rajma: [
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
  ],
  dalLentils: [
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80',
  ],
  sambarRasam: [
    'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  ],
  seasonedRice: [
    'https://images.unsplash.com/photo-1596797882870-8c33deeac224?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80',
  ],
  biryaniPulao: [
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1642821373181-696a14044e63?auto=format&fit=crop&w=800&q=80',
  ],
  upmaPoha: [
    'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
  ],
  dosaUttapam: [
    'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
  ],
  idliVada: [
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
  ],
  breadsParatha: [
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
  ],
  chicken: [
    'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
  ],
  muttonLamb: [
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=800&q=80',
  ],
  seafoodFish: [
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559742811-8228636d253b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
  ],
  eggDishes: [
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
  ],
  chutneyPachadi: [
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80',
  ],
  sweetsDesserts: [
    'https://images.unsplash.com/photo-1621236378699-8597faf6a176?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  ],
  soupShorba: [
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  ],
  saladRaita: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  ],
  noodlesPasta: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
  ],
  sandwichWrap: [
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80',
  ],
  beveragesDrinks: [
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
  ],
  streetFoodChaat: [
    'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  ],
  vegCurrySabzi: [
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  ],
  momosDumplings: [
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1625220194771-7eb5a3a68d0c?auto=format&fit=crop&w=800&q=80',
  ],
  generalFallback: [
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  ]
};

/**
 * Assigns high-definition food photos matching dish types using hash distribution
 */
export function getAccurateFoodImage(title: string, _cuisine?: string): string {
  const localImage = findRecipeImageForDish(title);
  if (localImage) return localImage;

  const lower = title.toLowerCase();
  const hash = hashString(title);

  const getFromPool = (pool: string[]) => pool[hash % pool.length];

  if (lower.includes('karela') || lower.includes('bitter gourd')) return getFromPool(IMAGE_POOLS.karelaGourd);
  if (lower.includes('aloo') || lower.includes('potato') || lower.includes('batata')) return getFromPool(IMAGE_POOLS.alooPotato);
  if (lower.includes('bhindi') || lower.includes('okra')) return getFromPool(IMAGE_POOLS.bhindiOkra);
  if (lower.includes('gobi') || lower.includes('cauliflower') || lower.includes('broccoli')) return getFromPool(IMAGE_POOLS.gobiCauliflower);
  if (lower.includes('baingan') || lower.includes('eggplant') || lower.includes('brinjal')) return getFromPool(IMAGE_POOLS.bainganEggplant);
  if (lower.includes('mushroom')) return getFromPool(IMAGE_POOLS.mushroom);
  if (lower.includes('paneer')) return getFromPool(IMAGE_POOLS.paneer);
  if (lower.includes('chole') || lower.includes('chana') || lower.includes('bhature') || lower.includes('chickpea')) return getFromPool(IMAGE_POOLS.choleChana);
  if (lower.includes('rajma') || lower.includes('kidney bean') || lower.includes('lobia')) return getFromPool(IMAGE_POOLS.rajma);
  if (lower.includes('dal') || lower.includes('lentil') || lower.includes('tadka') || lower.includes('kadi') || lower.includes('dalma') || lower.includes('pithla')) return getFromPool(IMAGE_POOLS.dalLentils);
  if (lower.includes('sambar') || lower.includes('rasam') || lower.includes('kuzhambu')) return getFromPool(IMAGE_POOLS.sambarRasam);
  if (lower.includes('tomato rice') || lower.includes('lemon rice') || lower.includes('curd rice') || lower.includes('khichdi') || lower.includes('pongal') || lower.includes('thakkali') || lower.includes('vangi bath') || lower.includes('rice')) return getFromPool(IMAGE_POOLS.seasonedRice);
  if (lower.includes('biryani') || lower.includes('pulao') || lower.includes('tehri') || lower.includes('fried rice')) return getFromPool(IMAGE_POOLS.biryaniPulao);
  if (lower.includes('upma') || lower.includes('semiya') || lower.includes('vermicelli') || lower.includes('poha') || lower.includes('idiyappam') || lower.includes('shavige')) return getFromPool(IMAGE_POOLS.upmaPoha);
  if (lower.includes('dosa') || lower.includes('uttapam') || lower.includes('cheela') || lower.includes('crepe')) return getFromPool(IMAGE_POOLS.dosaUttapam);
  if (lower.includes('idli') || lower.includes('vada') || lower.includes('appam') || lower.includes('puttu') || lower.includes('paniyaram')) return getFromPool(IMAGE_POOLS.idliVada);
  if (lower.includes('paratha') || lower.includes('roti') || lower.includes('naan') || lower.includes('puri') || lower.includes('thepla') || lower.includes('bhakri') || lower.includes('kulcha') || lower.includes('phulka') || lower.includes('litti')) return getFromPool(IMAGE_POOLS.breadsParatha);
  if (lower.includes('chicken')) return getFromPool(IMAGE_POOLS.chicken);
  if (lower.includes('mutton') || lower.includes('lamb') || lower.includes('gosht') || lower.includes('pork') || lower.includes('duck')) return getFromPool(IMAGE_POOLS.muttonLamb);
  if (lower.includes('fish') || lower.includes('prawn') || lower.includes('seafood') || lower.includes('crab') || lower.includes('ilish') || lower.includes('meen') || lower.includes('shrimp')) return getFromPool(IMAGE_POOLS.seafoodFish);
  if (lower.includes('egg') || lower.includes('bhurji') || lower.includes('omelette')) return getFromPool(IMAGE_POOLS.eggDishes);
  if (lower.includes('chutney') || lower.includes('pachadi') || lower.includes('pickle') || lower.includes('thokku') || lower.includes('dip') || lower.includes('sauce')) return getFromPool(IMAGE_POOLS.chutneyPachadi);
  if (lower.includes('sweet') || lower.includes('halwa') || lower.includes('kheer') || lower.includes('jamun') || lower.includes('laddu') || lower.includes('barfi') || lower.includes('jalebi') || lower.includes('payasam') || lower.includes('sukhdi') || lower.includes('sheera') || lower.includes('sandesh') || lower.includes('doi') || lower.includes('rasgulla') || lower.includes('kulfi') || lower.includes('cake') || lower.includes('cookie') || lower.includes('muffin') || lower.includes('pudding')) return getFromPool(IMAGE_POOLS.sweetsDesserts);
  if (lower.includes('soup') || lower.includes('shorba') || lower.includes('stew')) return getFromPool(IMAGE_POOLS.soupShorba);
  if (lower.includes('salad') || lower.includes('kosambari') || lower.includes('raita') || lower.includes('koshimbir')) return getFromPool(IMAGE_POOLS.saladRaita);
  if (lower.includes('noodle') || lower.includes('chowmein') || lower.includes('pasta') || lower.includes('macaroni') || lower.includes('hakka') || lower.includes('thukpa')) return getFromPool(IMAGE_POOLS.noodlesPasta);
  if (lower.includes('sandwich') || lower.includes('burger') || lower.includes('toast') || lower.includes('wrap') || lower.includes('roll') || lower.includes('frankie')) return getFromPool(IMAGE_POOLS.sandwichWrap);
  if (lower.includes('tea') || lower.includes('chai') || lower.includes('lassi') || lower.includes('drink') || lower.includes('sharbat') || lower.includes('coffee') || lower.includes('juice') || lower.includes('sol kadhi')) return getFromPool(IMAGE_POOLS.beveragesDrinks);
  if (lower.includes('chaat') || lower.includes('samosa') || lower.includes('kachori') || lower.includes('pakora') || lower.includes('dhokla') || lower.includes('tikki') || lower.includes('bhajji') || lower.includes('cutlet') || lower.includes('kebab') || lower.includes('tikka') || lower.includes('tandoori')) return getFromPool(IMAGE_POOLS.streetFoodChaat);
  if (lower.includes('sabzi') || lower.includes('curry') || lower.includes('poriyal') || lower.includes('palya') || lower.includes('thoran') || lower.includes('gravy') || lower.includes('fry') || lower.includes('roast') || lower.includes('saag') || lower.includes('palak') || lower.includes('corn') || lower.includes('spinach') || lower.includes('methi') || lower.includes('beans') || lower.includes('lauki') || lower.includes('tindora') || lower.includes('turai') || lower.includes('arbi') || lower.includes('kaddu') || lower.includes('kofta') || lower.includes('makhani') || lower.includes('kadai') || lower.includes('subzi') || lower.includes('bharta') || lower.includes('jackfruit') || lower.includes('raw banana')) return getFromPool(IMAGE_POOLS.vegCurrySabzi);
  if (lower.includes('momo') || lower.includes('dumpling') || lower.includes('dim sum')) return getFromPool(IMAGE_POOLS.momosDumplings);

  return getFromPool(IMAGE_POOLS.generalFallback);
}

export function generateTailoredInstructions(
  _cuisine: string,
  baseIngredient: string,
  styleName: string,
  styleDesc: string,
  _variation: string,
  baseIngs: string[] = [],
  _isVeg: boolean = true
): { stepNumber: number; title: string; description: string; durationMinutes: number; proTip?: string }[] {
  const sName = styleName.toLowerCase();
  const bIng = baseIngredient || 'main ingredients';
  const keySpices = baseIngs.length > 1 ? baseIngs.slice(1, 4).join(', ') : 'aromatic spices';

  if (sName.includes('biryani') || sName.includes('pulao')) {
    return [
      {
        stepNumber: 1,
        title: 'Step 1: Basic Prep & Rice Soaking',
        description: `Rinse Basmati rice 3 times until water runs clear; soak in clean water for 20 mins. Wash and cut ${bIng} into uniform pieces.`,
        durationMinutes: 20,
        proTip: `Soaking Basmati rice expands the grains to double their length during cooking.`
      },
      {
        stepNumber: 2,
        title: 'Step 2: Parboil Basmati Rice',
        description: `Boil 4 cups water with green cardamom, cloves, bay leaf, and 1 tsp salt. Cook soaked rice till 70% done (firm core), then drain water completely and keep aside.`,
        durationMinutes: 10
      },
      {
        stepNumber: 3,
        title: `Step 3: Cook Spiced ${bIng} Base`,
        description: `Heat ghee in a heavy pot. Sauté thinly sliced onions till golden brown. Add ginger-garlic paste, ${bIng}, whisked curd, and biryani spices; cook until fragrant and oil separates.`,
        durationMinutes: 15
      },
      {
        stepNumber: 4,
        title: 'Step 4: Dum Layering & Slow Steaming',
        description: `Spread parboiled rice evenly over the cooked ${bIng} base. Drizzle saffron milk, 1 tbsp ghee, mint leaves & fried onions. Cover tightly and slow-steam (dum) on low heat for 12 mins.`,
        durationMinutes: 12,
        proTip: `Place a flat tawa under the pot to prevent bottom scorching during dum.`
      },
      {
        stepNumber: 5,
        title: 'Step 5: Rest & Serve Hot',
        description: `Turn off heat and let dum rest for 5 mins unopened. Gently fluff rice from edges with a fork and serve hot with chilled raita and salan.`,
        durationMinutes: 5
      }
    ];
  }

  if (sName.includes('paratha')) {
    return [
      {
        stepNumber: 1,
        title: 'Step 1: Basic Dough Kneading & Prep',
        description: `In a mixing bowl, knead whole wheat flour (atta) with warm water, 1 tsp oil, and a pinch of salt into a soft, smooth dough. Rest covered for 10 mins.`,
        durationMinutes: 10
      },
      {
        stepNumber: 2,
        title: 'Step 2: Prepare Flavorful Stuffing',
        description: `Wash and finely mash/chop ${bIng}. Mix thoroughly with green chilies, chopped coriander, amchur (dry mango powder), roasted cumin powder & salt.`,
        durationMinutes: 8
      },
      {
        stepNumber: 3,
        title: 'Step 3: Stuff & Roll Flatbread',
        description: `Pinch a lemon-sized dough ball, flatten into a small disc, place 2 tbsp stuffing in center, seal edges tight into a pouch, and gently roll out into a 6-inch circle.`,
        durationMinutes: 8
      },
      {
        stepNumber: 4,
        title: 'Step 4: Tawa Roasting with Ghee',
        description: `Place rolled paratha on hot tawa. Flip when small bubbles form, spread desi ghee or butter generously on both sides, and press edges till golden brown & crisp.`,
        durationMinutes: 6,
        proTip: `Roasting on medium-high heat with ghee yields the flakiest, crispest parathas.`
      },
      {
        stepNumber: 5,
        title: 'Step 5: Serve Hot',
        description: `Serve sizzling hot topped with a slab of fresh butter, thick curd, and spicy mango pickle!`,
        durationMinutes: 2
      }
    ];
  }

  if (sName.includes('bhurji') || sName.includes('scramble')) {
    return [
      {
        stepNumber: 1,
        title: 'Step 1: Basic Prep & Fine Chopping',
        description: `Wash and finely chop onions, tomatoes, green chilies, ginger, and coriander. Crumble or chop ${bIng} into uniform bite pieces.`,
        durationMinutes: 8
      },
      {
        stepNumber: 2,
        title: 'Step 2: Sauté Aromatics in Pan',
        description: `Heat 1 tbsp butter or oil in a pan. Add cumin seeds, then sauté chopped onions, ginger, and green chilies for 3-4 mins until light golden.`,
        durationMinutes: 5
      },
      {
        stepNumber: 3,
        title: 'Step 3: Add Spices & Tomatoes',
        description: `Stir in chopped tomatoes, turmeric powder, red chili powder, and salt. Cook on medium flame for 3 mins until tomatoes turn soft and juicy.`,
        durationMinutes: 4
      },
      {
        stepNumber: 4,
        title: `Step 4: Add ${bIng} & Scramble`,
        description: `Add crumbled ${bIng}. Toss continuously on medium-high flame for 4-5 mins until moisture evaporates and spices blend thoroughly.`,
        durationMinutes: 5
      },
      {
        stepNumber: 5,
        title: 'Step 5: Garnish & Serve Hot',
        description: `Sprinkle 1/4 tsp garam masala, squeeze fresh lemon juice, and toss in chopped coriander leaves. Serve piping hot with buttered pav or toasts.`,
        durationMinutes: 2
      }
    ];
  }

  if (sName.includes('tandoori') || sName.includes('kebab') || sName.includes('grill') || sName.includes('koliwada') || sName.includes('cafreal')) {
    return [
      {
        stepNumber: 1,
        title: 'Step 1: Basic Cleaning & Scoring',
        description: `Clean and pat dry ${bIng}. Make light diagonal scores or cuts on pieces so the marinade penetrates deeply.`,
        durationMinutes: 8
      },
      {
        stepNumber: 2,
        title: 'Step 2: Spiced Yogurt Marination',
        description: `Whisk thick hung curd with mustard oil, ginger-garlic paste, Kashmiri red chili powder, chaat masala, lemon juice & salt. Coat ${bIng} thoroughly and rest for 20 mins.`,
        durationMinutes: 20,
        proTip: `Using mustard oil in marination gives an authentic smoky tandoori flavor.`
      },
      {
        stepNumber: 3,
        title: 'Step 3: Preheat Oven / Grill Pan',
        description: `Preheat oven to 220°C or heat a heavy-bottomed grill pan on medium flame with 1 tbsp oil.`,
        durationMinutes: 5
      },
      {
        stepNumber: 4,
        title: 'Step 4: Grill & Char',
        description: `Place marinated pieces on skewers/grill pan without overcrowding. Cook for 12-15 mins, flipping halfway and basting with butter until edges turn charred & tender.`,
        durationMinutes: 15
      },
      {
        stepNumber: 5,
        title: 'Step 5: Baste & Serve Hot',
        description: `Dust generously with chaat masala, garnish with lemon wedges and onion rings, and serve hot with spicy green mint chutney.`,
        durationMinutes: 2
      }
    ];
  }

  if (sName.includes('butter') || sName.includes('lababdar') || sName.includes('tikka masala')) {
    return [
      {
        stepNumber: 1,
        title: 'Step 1: Basic Prep & Pan-Searing',
        description: `Cut ${bIng} into uniform cubes. Heat 1 tbsp butter/ghee in a pan and lightly sear ${bIng} on high heat for 3-4 mins until golden on edges; set aside.`,
        durationMinutes: 6
      },
      {
        stepNumber: 2,
        title: 'Step 2: Cook Velvet Tomato Base',
        description: `In the same pan, cook chopped tomatoes, onions, garlic, cashews, and whole spices in 1 tbsp butter with 1/2 cup water for 8 mins until soft.`,
        durationMinutes: 8
      },
      {
        stepNumber: 3,
        title: 'Step 3: Blend & Strain Silky Gravy',
        description: `Cool mixture slightly and blend in a mixer until smooth. Strain through a fine sieve back into the pan for an ultra-velvety restaurant texture.`,
        durationMinutes: 5
      },
      {
        stepNumber: 4,
        title: `Step 4: Simmer ${bIng} with Cream`,
        description: `Add seared ${bIng}, Kashmiri red chili powder, crushed Kasuri Methi, and 2 tbsp fresh cream. Simmer gently on low heat for 5 mins until sauce thickens.`,
        durationMinutes: 5,
        proTip: `Crush Kasuri Methi between your palms before adding to release maximum aromatics.`
      },
      {
        stepNumber: 5,
        title: 'Step 5: Final Touch & Serve',
        description: `Drizzle a swirl of fresh cream and chopped coriander on top. Serve hot with garlic butter naan or basmati rice.`,
        durationMinutes: 2
      }
    ];
  }

  if (sName.includes('kadhai')) {
    return [
      {
        stepNumber: 1,
        title: 'Step 1: Basic Chop & Prep',
        description: `Cut ${bIng}, bell peppers, and onions into 1-inch square dice. Finely chop tomatoes and ginger juliennes.`,
        durationMinutes: 8
      },
      {
        stepNumber: 2,
        title: 'Step 2: Roast & Grind Kadhai Masala',
        description: `Dry-roast whole coriander seeds, cumin, black pepper, and dried red chilies in a skillet for 2 mins; coarsely crush in a mortar.`,
        durationMinutes: 5
      },
      {
        stepNumber: 3,
        title: 'Step 3: Flash-Fry Veggies',
        description: `Heat 1.5 tbsp oil in a kadhai (wok). Flash-fry cubed bell peppers and onion petals on high heat for 3 mins to keep crunch; set aside.`,
        durationMinutes: 4
      },
      {
        stepNumber: 4,
        title: 'Step 4: Cook Semi-Dry Masala',
        description: `Sauté ginger-garlic paste and tomato puree in kadhai, add ground kadhai masala and ${bIng}, and simmer for 6 mins until masala coats well.`,
        durationMinutes: 6
      },
      {
        stepNumber: 5,
        title: 'Step 5: Toss Veggies & Serve',
        description: `Toss flash-fried bell peppers and onions back into the kadhai. Simmer for 2 mins, garnish with ginger juliennes and coriander, and serve hot.`,
        durationMinutes: 3
      }
    ];
  }

  if (sName.includes('saag')) {
    return [
      {
        stepNumber: 1,
        title: 'Step 1: Blanch & Purée Greens',
        description: `Wash spinach/saag thoroughly. Blanch in boiling salted water for 2 mins, shock in ice water to lock green color, then blend to a smooth purée with green chilies.`,
        durationMinutes: 10
      },
      {
        stepNumber: 2,
        title: 'Step 2: Prep Main Ingredient',
        description: `Cut ${bIng} into uniform pieces. Lightly pan-fry in 1 tsp ghee for 3 mins if desired, then set aside.`,
        durationMinutes: 5
      },
      {
        stepNumber: 3,
        title: 'Step 3: Golden Garlic Onion Tadka',
        description: `Heat 2 tbsp desi ghee in a wok. Add finely diced garlic, ginger, and onions. Sauté on medium flame until light golden brown and fragrant.`,
        durationMinutes: 7
      },
      {
        stepNumber: 4,
        title: `Step 4: Simmer ${bIng} in Saag`,
        description: `Pour green spinach purée into garlic tadka, add ${bIng}, salt, a pinch of garam masala, and 1 tbsp butter. Slow simmer for 8 mins.`,
        durationMinutes: 8
      },
      {
        stepNumber: 5,
        title: 'Step 5: Finish & Serve',
        description: `Top with a dollop of fresh butter or cream, garnish with ginger juliennes, and serve piping hot with makki ki roti or naan.`,
        durationMinutes: 2
      }
    ];
  }

  if (sName.includes('kadhi')) {
    return [
      {
        stepNumber: 1,
        title: 'Step 1: Whisk Besan Curd Base',
        description: `In a deep bowl, whisk fresh sour curd with besan (gram flour), turmeric powder, red chili powder, salt, and 3 cups water until completely smooth without lumps.`,
        durationMinutes: 8
      },
      {
        stepNumber: 2,
        title: `Step 2: Prep ${bIng} / Fritters`,
        description: `Prepare ${bIng} or besan pakodas and keep ready for adding to kadhi.`,
        durationMinutes: 8
      },
      {
        stepNumber: 3,
        title: 'Step 3: Slow Simmer Kadhi',
        description: `Pour whisked curd mixture into pot. Stir continuously on medium flame until it comes to a gentle boil, then turn flame to low and simmer for 15 mins.`,
        durationMinutes: 15,
        proTip: `Continuous stirring before first boil prevents curd from curdling.`
      },
      {
        stepNumber: 4,
        title: `Step 4: Add ${bIng}`,
        description: `Drop ${bIng} into the simmering kadhi. Cook gently for 5 mins so flavors absorb thoroughly into the gravy.`,
        durationMinutes: 5
      },
      {
        stepNumber: 5,
        title: 'Step 5: Sizzling Ghee Tadka & Serve',
        description: `Heat ghee in a tadka pan, crackle mustard seeds, cumin, hing (asafoetida), curry leaves & dried red chilies. Pour sizzling hot over kadhi and serve with steamed rice.`,
        durationMinutes: 3
      }
    ];
  }

  // Technique hints for preparation styles that don't have a fully dedicated
  // template above. Each hint overrides the masala-building step (3), the
  // main-cook/simmer step (4), and the finish/garnish step (5) so dishes like
  // Vindaloo, Korma, Nihari, Shorba, etc. no longer collapse into one
  // identical generic curry — only steps 1 (basic prep) and the tadka style
  // in step 2 stay shared, since chopping/tempering genuinely is similar
  // across most of these.
  const styleHints: Record<string, { masala: string; mainCook: string; finish: string; tip?: string }> = {
    'vindaloo': {
      masala: `Grind soaked Kashmiri red chilies, garlic, cumin, and 2 tbsp palm/malt vinegar into a smooth marinade paste; coat ${bIng} in it and rest 30 mins before cooking. Sauté onions until deep brown, then add the marinated ${bIng} straight into the pan.`,
      mainCook: `Add a pinch of jaggery and enough water to loosen the marinade into a gravy. Cover and simmer on low for 15-18 mins until the vinegar tang mellows and ${bIng} is fully tender.`,
      finish: `Taste and balance the tang with a little extra jaggery if needed. Serve hot — Vindaloo tastes even better the next day once the vinegar mellows further.`,
      tip: `Never rush the marination — the vinegar needs time to actually penetrate ${bIng}, not just coat it.`
    },
    'korma': {
      masala: `Grind 10-12 soaked cashews and 1 tbsp almonds with a splash of warm milk into a smooth paste. Sauté onions until golden, add ginger-garlic paste, then stir in the cashew-almond paste on low heat so it doesn't split.`,
      mainCook: `Add ${bIng} and a few strands of saffron soaked in warm milk. Cover and simmer gently on low flame for 10-12 mins, stirring occasionally so the rich gravy doesn't catch at the bottom.`,
      finish: `Finish with a drizzle of fresh cream and a pinch of ground cardamom. Serve mild and creamy alongside naan or jeera rice.`,
      tip: `Keep the flame low once the nut paste goes in — high heat will split a Korma gravy.`
    },
    'rogan josh': {
      masala: `Bloom a pinch of Ratanjot (alkanet root) in hot oil for its signature red color, then sauté sliced onions until deep brown. Add Kashmiri chili powder, ginger powder, and fennel powder — the classic Kashmiri spice base, no garlic or fresh tomato.`,
      mainCook: `Add ${bIng} and whisked curd a spoon at a time, stirring continuously so it doesn't split. Cover and slow-simmer for 20-25 mins until the oil rises to the surface and ${bIng} is deeply tender.`,
      finish: `Garnish with a touch more Ratanjot oil for color and serve with steamed basmati rice.`,
      tip: `Add the curd off direct high heat, one spoon at a time, stirring constantly — that's what keeps a Rogan Josh gravy smooth.`
    },
    'do pyaza': {
      masala: `Sauté half the onions (finely chopped) until deep golden for the base masala, along with ginger-garlic paste, tomatoes, and standard spices.`,
      mainCook: `Add ${bIng} and simmer until nearly done, then stir in the second batch of onions — cut into thick petals/cubes — so they stay slightly crunchy rather than melting into the gravy.`,
      finish: `Simmer just 3-4 more minutes so the second onion batch keeps its bite, then garnish with coriander and serve.`,
      tip: `The whole point of Do Pyaza is texture contrast — one onion batch melts in, the second stays crunchy. Don't overcook after adding it.`
    },
    'handi': {
      masala: `Build the onion-tomato masala directly in a handi (clay/heavy-bottomed pot) rather than a regular pan — the thick walls hold heat evenly and prevent scorching during the long cook.`,
      mainCook: `Add ${bIng}, cover the handi with a tight lid (seal the rim with dough if using a traditional clay pot), and slow-cook on low flame for 20-25 mins undisturbed so the aromas concentrate.`,
      finish: `Open carefully, stir gently, and serve straight from the handi — that earthy, slow-cooked aroma is the whole point of this style.`,
      tip: `Resist lifting the lid to check — every peek lets the concentrated aroma escape.`
    },
    'sukka': {
      masala: `Skip the watery gravy — sauté onions, curry leaves, and grated coconut in oil until the coconut turns light golden and fragrant.`,
      mainCook: `Toss in ${bIng} and dry roast on medium-high, stirring frequently for 10-12 mins with no added water, until everything is coated in a dry, roasted masala rather than a gravy.`,
      finish: `Finish with a squeeze of lime and extra curry leaves fried crisp on top. Serve as a dry side, not with rice gravy.`,
      tip: `Keep stirring — a dry "sukka" preparation catches and burns much faster than a gravy dish.`
    },
    'ghee roast': {
      masala: `Marinate ${bIng} briefly in a ground red-chili and tamarind paste. Heat a generous amount of pure ghee — this style depends on it, don't substitute oil.`,
      mainCook: `Sear the marinated ${bIng} directly in the hot ghee on medium-high heat, basting with more ghee, until deep red-brown and slightly charred at the edges (8-10 mins).`,
      finish: `Pour any remaining spiced ghee from the pan over the top before serving — that's the signature glossy finish of a Ghee Roast.`,
      tip: `Don't crowd the pan — sear in batches so ${bIng} browns instead of steaming.`
    },
    'chettinad': {
      masala: `Dry roast whole spices — including kalpasi (black stone flower) and marathi moggu if available — then grind into a coarse masala. This roasted-and-ground base is what makes Chettinad food distinct from a standard curry.`,
      mainCook: `Sauté onions and curry leaves, add the ground Chettinad masala, then add ${bIng} and simmer uncovered on medium for 12-15 mins so the gravy reduces and intensifies.`,
      finish: `Garnish with extra fried curry leaves. Serve fiery-hot with plain rice or dosa.`,
      tip: `Dry-roast the whole spices just until fragrant — burnt spices will make the whole dish bitter.`
    },
    'malabari': {
      masala: `Sauté sliced onions, curry leaves, and green chilies in coconut oil (not regular oil — it matters for flavor). Add ginger-garlic paste and light spices; avoid heavy chili powder, Malabari curries are gentle.`,
      mainCook: `Add ${bIng} and thin coconut milk first, simmer 10 mins, then stir in thick coconut milk at the end and simmer 2-3 more minutes — never let thick coconut milk boil hard or it can split.`,
      finish: `Finish with a final tempering of mustard seeds and curry leaves in coconut oil poured over the top just before serving.`,
      tip: `Always add thick coconut milk last and keep the flame low — boiling it hard breaks the milk and dulls the flavor.`
    },
    'jhol': {
      masala: `Temper Panch Phoron (the five-spice Bengali blend) in mustard oil until it crackles, rather than the usual cumin tadka.`,
      mainCook: `Add ${bIng} and enough water for a thin, light broth-like consistency (not a thick gravy) with turmeric and a little green chili. Simmer gently for 10-12 mins.`,
      finish: `Finish with a few drops of raw mustard oil and fresh coriander. Serve with plain steamed rice — Jhol is meant to be light, not rich.`,
      tip: `Jhol should stay thin and brothy — resist the urge to reduce it down like a regular curry gravy.`
    },
    'posto': {
      masala: `Soak poppy seeds (posto) in warm water, then grind into a smooth, thick paste — this is the entire base of the dish, no onion-tomato masala needed.`,
      mainCook: `Sauté ${bIng} briefly in mustard oil with a slit green chili, then stir in the poppy seed paste and a little water. Simmer gently for 8-10 mins, stirring often since the paste thickens quickly.`,
      finish: `Finish with a final drizzle of raw mustard oil. Serve with steamed rice — this Bengali classic is meant to be simple and mildly nutty.`,
      tip: `Keep stirring once the poppy seed paste goes in — it thickens fast and can stick to the pan.`
    },
    'bharta': {
      masala: `Char ${bIng} directly over an open flame (or under a hot grill) until the skin blisters and blackens, then peel and mash roughly — this smoky char is the entire point of a Bharta.`,
      mainCook: `Sauté mustard oil, garlic, and green chilies until fragrant, then fold in the mashed, charred ${bIng} and cook for 6-8 mins so it absorbs the tempering.`,
      finish: `Garnish with raw chopped onion and coriander. Serve as a smoky mashed side, not a gravy dish.`,
      tip: `Don't skip direct-flame charring — roasting in an oven alone won't give the same smokiness.`
    },
    'usal': {
      masala: `Sauté onions, ginger-garlic, and goda masala (or garam masala) as the base, then add sprouted/soaked legumes for ${bIng}.`,
      mainCook: `Add water and simmer covered for 12-15 mins until the sprouts are tender but still hold their shape (not mushy).`,
      finish: `Top generously with crunchy farsan (sev), raw chopped onion, and a squeeze of lemon just before serving — the farsan topping is essential to an authentic Usal.`,
      tip: `Add the farsan only at serving time so it stays crunchy instead of going soggy.`
    },
    'nihari': {
      masala: `Sauté a generous amount of sliced onions until deep brown, then add whole spices (bay leaf, black cardamom, cloves) and ginger-garlic paste.`,
      mainCook: `Add ${bIng} and a wheat-flour slurry (the traditional thickener) with plenty of water. Cover and slow-simmer on the lowest possible flame for at least 45-60 mins until the meat is falling-apart tender and the gravy is thick and glossy.`,
      finish: `Top with julienned ginger, fried onions, and chopped coriander. Serve with naan — Nihari is meant to be a slow, patient dish, not a weeknight-quick one.`,
      tip: `The wheat-flour slurry is what gives Nihari its glossy thickness — whisk it into a little water first so it doesn't form lumps in the pot.`
    },
    'xacuti': {
      masala: `Dry roast a large batch of whole spices with grated coconut until deep brown and fragrant, then grind into a thick, dark masala paste — this roasted coconut-spice base is the heart of a Xacuti.`,
      mainCook: `Sauté onions until golden, add the ground Xacuti masala, then add ${bIng} and simmer covered for 15-18 mins until the gravy thickens and turns deep brown.`,
      finish: `Serve hot with rice — Xacuti's flavor deepens if it rests for 20-30 minutes before eating.`,
      tip: `Roast the coconut slowly until deep brown, not just golden — that dark roast is what gives Xacuti its signature color and depth.`
    },
    'takari': {
      masala: `Build a standard onion-tomato masala base with regional whole spices, adjusted milder or spicier depending on the specific regional variation.`,
      mainCook: `Add ${bIng} with enough water for a medium-thick gravy consistency and simmer covered for 12-15 mins until tender.`,
      finish: `Garnish with fresh coriander and serve with rice or flatbread.`,
    },
    'shorba': {
      masala: `Sauté whole spices (bay leaf, cinnamon, cloves) briefly in ghee, then add onions and cook until soft rather than deeply browned — a Shorba stays lighter than a curry.`,
      mainCook: `Add ${bIng} and enough stock/water for a thin, brothy consistency. Simmer gently for 15-20 mins, then blend or strain lightly for a smoother soup texture if desired.`,
      finish: `Finish with a squeeze of lemon and fresh herbs. Serve hot in bowls as a starter soup, not over rice.`,
      tip: `Simmer gently rather than boiling hard — a hard boil can make a Shorba cloudy instead of clear and aromatic.`
    },
    'dhaba': {
      masala: `Build the masala in a well-used, heavy kadhai over a strong open flame — dhaba-style cooking relies on real high heat and smoky char, not a gentle stovetop simmer.`,
      mainCook: `Add ${bIng} and let it pick up a slight char at the edges before adding water and covering to simmer for 10-12 mins.`,
      finish: `Finish with an extra spoon of ghee and a generous handful of coriander. Serve rustic and hot, straight from the kadhai.`,
      tip: `A bit of char and smoke is the goal here, not a spotless-clean gravy — that's what makes it taste like a real dhaba.`
    },
    'home style': {
      masala: `Keep the masala simple and mild — just onions, tomatoes, turmeric, and a little chili powder. Home-style cooking deliberately skips the heavier restaurant spice blends.`,
      mainCook: `Add ${bIng}, cover, and simmer gently on low for 10-12 mins until tender — no need to reduce the gravy hard.`,
      finish: `Finish with a light garnish of coriander. Comfort food is about balance, not intensity — taste and adjust salt gently before serving.`,
    },
  };

  const hintKey = Object.keys(styleHints).find((key) => sName.includes(key));

  if (hintKey) {
    const hint = styleHints[hintKey];
    return [
      {
        stepNumber: 1,
        title: 'Step 1: Basic Prep & Cleaning',
        description: `Wash, peel, and chop ${bIng} into uniform bite-sized pieces. Finely chop onions, tomatoes, green chilies, and ginger-garlic paste as needed. Have ${keySpices} measured out and ready.`,
        durationMinutes: 8
      },
      {
        stepNumber: 2,
        title: `Step 2: Build the ${styleName} Masala Base`,
        description: hint.masala,
        durationMinutes: 8
      },
      {
        stepNumber: 3,
        title: `Step 3: Cook & Simmer ${bIng}`,
        description: hint.mainCook,
        durationMinutes: 15
      },
      {
        stepNumber: 4,
        title: 'Step 4: Finish & Serve',
        description: hint.finish,
        durationMinutes: 3,
        proTip: hint.tip
      }
    ];
  }

  // Default brief 5-step guide for any remaining Curry / Sabzi / Dal / Regional Dish
  return [
    {
      stepNumber: 1,
      title: 'Step 1: Basic Prep & Cleaning',
      description: `Wash, peel, and chop ${bIng} into uniform bite-sized pieces. Finely chop onions, tomatoes, green chilies, and ginger-garlic paste.`,
      durationMinutes: 8
    },
    {
      stepNumber: 2,
      title: 'Step 2: Tempering & Aromatics (Tadka)',
      description: `Heat 2 tbsp oil or ghee in a deep pan. Add cumin/mustard seeds until crackling, then sauté chopped onions, ginger, and garlic paste until golden brown.`,
      durationMinutes: 7
    },
    {
      stepNumber: 3,
      title: `Step 3: ${styleDesc}`,
      description: `Add chopped tomatoes, turmeric powder, red chili powder, coriander powder, and salt. Cook for 4 mins until tomatoes turn soft and oil separates. ${styleDesc}`,
      durationMinutes: 5
    },
    {
      stepNumber: 4,
      title: `Step 4: Add ${bIng} & Slow Simmer`,
      description: `Stir in ${bIng} until well coated with masala. Add 1/2 to 1 cup warm water, cover with lid, and slow-simmer on medium-low flame for 10-12 mins until tender.`,
      durationMinutes: 12
    },
    {
      stepNumber: 5,
      title: 'Step 5: Garnish & Serve Hot',
      description: `Sprinkle 1/2 tsp garam masala, crushed kasuri methi, and fresh coriander leaves. Let rest covered for 2 mins, then serve warm with roti or rice.`,
      durationMinutes: 3,
      proTip: `Resting covered for 2 mins after cooking allows all flavors to settle nicely.`
    }
  ];
}

import { RAW_INDIAN_RECIPES_105, Raw105Recipe } from '../data/indianRecipes105';

function convertRaw105ToRecipe(raw: Raw105Recipe): Recipe {
  const isVeg = raw.type === 'Veg';

  const ingredientsList: RecipeIngredient[] = raw.ingredients.map((ingStr) => {
    // Try to extract numerical quantity or unit if present at start
    const match = ingStr.match(/^([\d\/\.]+)\s*([a-zA-Z]*)\s+(.*)$/);
    let qty = 1;
    let unit = 'unit';
    let name = ingStr;

    if (match) {
      const parsedNum = parseFloat(match[1]);
      if (!isNaN(parsedNum)) qty = parsedNum;
      if (match[2]) unit = match[2];
      if (match[3]) name = match[3];
    }

    return {
      name,
      regionalName: name,
      quantity: qty,
      unit,
      isMissing: false,
      targetBrand: 'Local Market',
      priceInr: Math.floor(Math.random() * 30) + 10,
    };
  });

  const instructionsList: RecipeInstruction[] = raw.instructions.map((stepText, idx) => {
    const words = stepText.split(' ');
    const stepTitle = words.slice(0, 4).join(' ').replace(/[\.\,\;\:]$/, '');
    return {
      stepNumber: idx + 1,
      title: stepTitle ? stepTitle.charAt(0).toUpperCase() + stepTitle.slice(1) : `Step ${idx + 1}`,
      description: stepText,
      durationMinutes: Math.min(10, Math.max(2, Math.round(stepText.length / 30))),
    };
  });

  return {
    id: raw.id,
    _id: `mongo-${raw.id}`,
    title: cleanRecipeTitle(raw.title),
    subtitle: `Authentic ${raw.cuisine} Delicacy - Serves ${raw.servings}`,
    cuisine: raw.cuisine,
    tags: [raw.cuisine, raw.type, 'Authentic Indian'],
    dietType: isVeg ? 'Vegetarian' : 'Non-Vegetarian',
    isVegetarian: isVeg,
    difficulty: raw.instructions.length > 6 ? 'Medium' : 'Easy',
    prepTimeMinutes: raw.prep_time_mins,
    cookTimeMinutes: raw.cook_time_mins,
    servings: raw.servings,
    rating: 4.8,
    reviewsCount: 140 + Math.floor(Math.random() * 200),
    image: getAccurateFoodImage(raw.title, raw.cuisine),
    ingredients: ingredientsList,
    instructions: instructionsList,
    missingCount: 0,
    matchPercentage: 100,
    nutrition: {
      calories: 280 + ingredientsList.length * 20,
      proteinGrams: isVeg ? 12 : 26,
      carbsGrams: 38,
      fatGrams: 12,
      fiberGrams: 5,
    },
    chefTips: [
      `For authentic ${raw.cuisine} flavor, cook over medium heat and let the spices bloom in ghee/oil.`,
      `Serve hot immediately after cooking for maximum fragrance and ideal texture.`
    ],
    equipment: [
      { name: 'Kadhai or Pan', required: true },
      { name: 'Mixing Spoon', required: true }
    ],
  };
}

/**
 * Utility to load the complete recipe dataset from the server API
 */
export async function fetchLargeRecipeDataset(): Promise<Recipe[]> {
  try {
    const response = await fetch('/api/recipes');
    if (!response.ok) throw new Error('Failed to fetch recipes from API');
    const data = await response.json();
    
    if (data.success && Array.isArray(data.documents)) {
      return data.documents;
    }
  } catch (err) {
    console.error('Error fetching recipes from API, falling back to local data:', err);
  }

  // Fallback to local 105 curated recipes if API fails
  const seenCanonicalKeys = new Set<string>();
  const combinedRecipes: Recipe[] = [];

  const addUniqueRecipe = (recipe: Recipe) => {
    const canonicalKey = getCanonicalDishKey(recipe.title);
    if (!seenCanonicalKeys.has(canonicalKey)) {
      seenCanonicalKeys.add(canonicalKey);
      
      const accurateImage = findRecipeImageForDish(recipe.title, recipe.URL) || getAccurateFoodImage(recipe.title, recipe.cuisine);

      const mongoDoc = enrichToMongoDocument({
        ...recipe,
        title: cleanRecipeTitle(recipe.title),
        image: accurateImage,
      }, combinedRecipes.length);

      combinedRecipes.push(mongoDoc);
    }
  };

  RAW_INDIAN_RECIPES_105.forEach((raw) => {
    const recipe = convertRaw105ToRecipe(raw);
    addUniqueRecipe(recipe);
  });

  return combinedRecipes;
}

