import { MONGO_RECIPE_COLLECTION } from '../data/mongoRecipeStore';

/**
 * Dynamically generates a highly realistic, detailed, and beautifully structured
 * recipe for ANY dish requested by the user, with precise ingredient scaling.
 */
function generateDynamicRecipe(dishQuery: string, servingsCount: number): string {
  // Clean up the query to extract the exact dish name
  let name = dishQuery
    .replace(/how to make/gi, '')
    .replace(/how to prepare/gi, '')
    .replace(/how to cook/gi, '')
    .replace(/recipe for/gi, '')
    .replace(/recipe of/gi, '')
    .replace(/can you show me the/gi, '')
    .replace(/give me a/gi, '')
    .replace(/show me/gi, '')
    .replace(/please/gi, '')
    .replace(/recipe/gi, '')
    .trim();

  if (!name) {
    name = "Delicious Home Cooked Dish";
  }

  // Proper Title Case for the dish
  const title = name
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const isNonVeg = /chicken|murg|mutton|gosht|lamb|pork|beef|fish|prawn|egg|keema|seafood/i.test(name);
  const isSweet = /halwa|kheer|barfi|ladoo|jamun|rasgulla|cake|pudding|dessert|sweet|jalebi|rabri/i.test(name);
  const isRice = /biryani|pulao|pulav|rice|khichdi|fried rice/i.test(name);
  const isBread = /roti|naan|paratha|chapati|kulcha|puri|poori|bread/i.test(name);
  const isPaneer = /paneer/i.test(name);
  
  // Custom cooking timings
  let prepTime = 15;
  let cookTime = 25;
  let difficulty = "Medium";
  let caloriesPerServing = 320;

  let primaryIngredients: string[] = [];
  let steps: string[] = [];
  let tips: string[] = [];
  let substitutes: string[] = [];

  // Determine characteristics and customize recipes
  if (isSweet) {
    prepTime = 10;
    cookTime = 20;
    difficulty = "Easy to Medium";
    caloriesPerServing = 280;

    primaryIngredients = [
      `🥛 **Whole Milk / Condensed Milk**: ${servingsCount === 1 ? "250ml" : `${(servingsCount * 250)}ml`}`,
      `🍬 **Sugar / Grated Jaggery**: ${servingsCount === 1 ? "3 tbsp" : `${(servingsCount * 2.5).toFixed(1).replace(/\.0$/, '')} tbsp`} (adjust to taste)`,
      `🧈 **Pure Desi Ghee**: ${servingsCount === 1 ? "1.5 tbsp" : `${(servingsCount * 1.2).toFixed(1).replace(/\.0$/, '')} tbsp`}`,
      `🌰 **Dry Fruits (Almonds, Cashews, Pistachios)**: ${servingsCount * 10}g (slivered & lightly toasted)`,
      `🟢 **Cardamom Powder (Elaichi)**: 1/2 tsp (freshly crushed)`,
      `🌸 **Saffron Strands (Kesar)**: A pinch soaked in 2 tbsp warm milk (optional, for royal aroma)`
    ];

    if (/halwa/i.test(name)) {
      primaryIngredients.unshift(`🌾 **Main Base (Sooji/Carrot/Moong Dal)**: ${servingsCount * 75}g`);
    } else if (/kheer/i.test(name)) {
      primaryIngredients.unshift(`🍚 **Basmati Rice (Broken)**: ${servingsCount * 20}g (soaked for 30 mins)`);
    }

    steps = [
      `**Roast Base (For Halwa/Sweets)**: Heat ghee in a heavy-bottomed pan (*Kadhai*). Sauté your main sweet base (carrot, semolina, or dal) on low-medium flame until golden and fragrant (5-8 mins). For Kheer, skip this and bring milk to a boil.`,
      `**Incorporate Dairy**: Slow-pour warm milk into the pot while stirring constantly to avoid any lumps. Bring the mixture to a gentle boil.`,
      `**Simmer & Reduce**: Lower the heat. Let it simmer gently. If making Kheer, cook until the rice is fully mashed and milk is reduced to 2/3rd of its volume (12-15 mins).`,
      `**Sweeten & Infuse**: Add the sugar or jaggery along with saffron milk and freshly ground cardamom powder. Simmer for 3-5 more minutes until fully integrated.`,
      `**Garnish & Rest**: Turn off the heat. Fold in the silvered dry fruits. Let it rest for 2 minutes. Serve warm or chilled for optimal dessert satisfaction!`
    ];

    tips = [
      `🌟 Always use thick-bottomed vessels for Indian sweets to prevent milk solids from scorching at the base.`,
      `🌟 Add cardamoms towards the very end of cooking to preserve their natural, floral volatile essential oils.`
    ];

    substitutes = [
      `**Sugar substitute**: Use organic jaggery powder, palm sugar, or coconut sugar (add after turning off stove to prevent curdling).`,
      `**Milk substitute**: For a vegan version, use thick almond milk or coconut milk heated gently on low flame.`
    ];

  } else if (isRice) {
    prepTime = 20;
    cookTime = 30;
    difficulty = /biryani/i.test(name) ? "Hard" : "Medium";
    caloriesPerServing = 420;

    const riceQty = servingsCount * 100;
    primaryIngredients = [
      `🍚 **Long-Grain Basmati Rice**: ${riceQty}g (washed & soaked for 30 minutes)`,
      `🧅 **Onions**: ${Math.max(1, Math.ceil(servingsCount * 0.5))} medium (sliced paper-thin for biryani/pulao)`,
      `🧄 **Ginger-Garlic Paste**: ${servingsCount === 1 ? "1 tsp" : `${Math.ceil(servingsCount * 0.5)} tbsp`}`,
      `🔥 **Whole Spices (Khada Masala)**: 1 Bay Leaf (*Tej Patta*), 2 Cardamoms (*Elaichi*), 3 Cloves (*Laung*), 1-inch Cinnamon (*Dalchini*)`,
      `🌶️ **Powdered Spices**: 1/2 tsp Turmeric (*Haldi*), 1 tsp Red Chilli powder, 1 tsp Biryani/Pulao Masala`,
      `☘️ **Fresh Herbs**: A handful of Mint Leaves (*Pudina*) & Fresh Cilantro (*Dhania patta*), finely chopped`,
      `🧈 **Ghee & Cooking Oil**: 2 tbsp (for that authentic aroma)`
    ];

    if (/biryani/i.test(name)) {
      if (isNonVeg) {
        primaryIngredients.unshift(`🍗 **Chicken / Meat pieces**: ${servingsCount * 150}g (marinated in 3 tbsp Dahi, 1 tsp Chilli, Salt, Ginger-Garlic paste)`);
      } else {
        primaryIngredients.unshift(`🥦 **Mixed Vegetables (Carrot, Peas, Beans, Potato)**: ${servingsCount * 100}g & Paneer cubes: ${servingsCount * 40}g`);
      }
      primaryIngredients.push(`🥛 **Saffron Milk**: 2 tbsp warm milk infused with 5-6 saffron strands`);
    } else {
      // Pulao/Khichdi
      primaryIngredients.unshift(`🥦 **Assorted Veggies (Green Peas, Carrot, Potato)**: ${servingsCount * 80}g`);
    }

    steps = [
      `**Parboil the Rice**: Boil 1.5 litres of water with salt and a few whole spices. Add soaked Basmati rice and cook until exactly 70% done (grain should have a bite). Drain completely and set aside.`,
      `**Sauté Aromatics & Brown Onions**: Heat ghee & oil in a heavy-bottomed pot (*Handi*). Sauté sliced onions on medium-low heat until dark golden brown (this is *Birista*). Take half out for garnishing.`,
      `**Build the Flavor Masala**: To the remaining onions, add ginger-garlic paste and sauté for 1 minute. Stir in spices, your main items (marinated chicken or mixed vegetables), and cook until tender.`,
      `**Layering (Dum Process)**: (For Pulao/Khichdi, mix rice directly. For Biryani, layer): Spread parboiled rice evenly over the cooked vegetable/chicken masala base. Top with reserved brown onions, chopped mint, cilantro, and drizzle saffron milk over the top.`,
      `**The Dum Seal**: Cover with a tight lid (seal edges with foil or dough) and cook on lowest flame (*Dum*) for 12–15 minutes (using a flat tawa underneath the pot helps distribute heat evenly).`,
      `**Fluff & Serve**: Let it rest for 5 minutes. Gently fluff the rice layers from the side of the pot using a flat spoon. Serve hot with cucumber raita!`
    ];

    tips = [
      `🌟 Never stir rice vigorously while boiling or mixing, as soaked basmati grains are highly fragile and break easily.`,
      `🌟 For perfect long grains, add 1 tsp lemon juice to the boiling water; it prevents the rice grains from sticking together.`
    ];

    substitutes = [
      `**Basmati Rice substitute**: Use Sona Masuri or Jasmine rice, adjusting water ratio (approx 1:1.75).`,
      `**Ghee replacement**: Use olive oil or vegan butter for a lighter or plant-based recipe.`
    ];

  } else if (isNonVeg) {
    prepTime = 20;
    cookTime = 25;
    difficulty = "Medium";
    caloriesPerServing = 380;

    const proteinWeight = servingsCount * 150;
    primaryIngredients = [
      `🍗 **Chicken / Meat (Bone-in or Boneless)**: ${proteinWeight}g (cleaned & cut into bite-sized curry pieces)`,
      `🧅 **Onions**: ${Math.max(1, Math.ceil(servingsCount * 0.5))} medium (finely chopped or pureed)`,
      `🍅 **Tomatoes**: ${Math.max(1, Math.ceil(servingsCount * 0.5))} medium (pureed)`,
      `🧄 **Ginger-Garlic Paste**: ${Math.max(1, servingsCount * 0.5)} tbsp (freshly ground)`,
      `🌶️ **Spices**: 1/2 tsp Turmeric (*Haldi*), 1.5 tsp Kashmiri Lal Mirch (for rich red color), 1.5 tsp Coriander (*Dhania*) powder, 1/2 tsp Garam Masala, Salt to taste`,
      `🥛 **Yogurt / Dahi (Thick)**: ${servingsCount === 1 ? "2 tbsp" : `${(servingsCount * 1.5).toFixed(1).replace(/\.0$/, '')} tbsp`}`
    ];

    if (/kadhai|kadai/i.test(name)) {
      primaryIngredients.push(`🫑 **Bell Peppers (Capsicum) & Onion Shells**: 1 cup (cut into 1-inch squares for Kadai crunch)`);
      primaryIngredients.push(`🌶️ **Kadai Spice Mix**: 1.5 tbsp (dry roasted and coarsely ground Coriander Seeds & Dry Red Chillies)`);
    } else if (/butter|tikka masala/i.test(name)) {
      primaryIngredients.push(`🧈 **Butter & Fresh Cream**: 2 tbsp butter & 1.5 tbsp heavy cream`);
      primaryIngredients.push(`🌰 **Cashew Paste**: 8 cashews blended with warm water (for that royal velvety gravy base)`);
    }

    steps = [
      `**Marination**: In a mixing bowl, toss chicken/meat with yogurt, lemon juice, half of the ginger-garlic paste, a pinch of haldi, red chilli, and salt. Cover and marinate for 30 minutes.`,
      `**Sauté the Gravy Base**: Heat 2 tbsp oil or ghee in a pan. Sauté chopped onions on medium flame until golden brown (6-8 mins). Add the remaining ginger-garlic paste and sauté until fragrant.`,
      `**Cook the Spices**: Pour in the pureed tomatoes. Add Haldi, Kashmiri Red Chilli, Coriander powder, and salt. Cook until tomatoes turn mushy and oil/ghee separates from the masala corners.`,
      `**Sear & Simmer**: Add marinated chicken/meat. Turn the heat to high and sear the meat for 4-5 minutes, turning occasionally (this locks the juices inside). Add 1/2 cup warm water (or more for extra gravy), cover, and simmer on low-medium heat for 12–15 minutes until chicken is tender.`,
      `**Incorporate Specialties**: *(If making Kadhai: toss in the sautéed bell peppers & kadhai masala now. If Butter Chicken: stir in cashew paste and butter).*`,
      `**Garnish & Finish**: Stir in Garam Masala and crushed Kasuri Methi. Cook for 1 minute. Garnish with fresh chopped coriander (*Dhania patta*). Serve hot with warm Naan, Roti, or Steamed Rice!`
    ];

    tips = [
      `🌟 Searing chicken on high heat initially caramelizes the outer proteins, trapping the natural juices inside and preventing dry, stringy meat.`,
      `🌟 Always add warm water to the simmering gravy instead of cold water; cold water immediately halts the cooking process and affects the fat emulsification.`
    ];

    substitutes = [
      `**Yogurt replacement**: Use lemon juice or 2 tbsp of cashew cream if yogurt is unavailable.`,
      `**Chicken replacement**: You can swap chicken with Paneer cubes, Mushrooms, or Soya chunks (adjust cooking time to 6-8 mins).`
    ];

  } else if (isPaneer || isPaneer === true) {
    prepTime = 10;
    cookTime = 15;
    difficulty = "Easy";
    caloriesPerServing = 310;

    const paneerQty = servingsCount * 100;
    primaryIngredients = [
      `🧀 **Fresh Paneer (Cottage Cheese)**: ${paneerQty}g (cut into cubes)`,
      `🧅 **Onions**: ${Math.max(1, Math.ceil(servingsCount * 0.4))} medium (finely chopped)`,
      `🍅 **Tomatoes**: ${Math.max(1, Math.ceil(servingsCount * 0.5))} medium (pureed)`,
      `🧄 **Ginger-Garlic Paste**: 1 tbsp`,
      `🌶️ **Spices**: 1/4 tsp Turmeric (*Haldi*), 1 tsp Kashmiri Red Chilli, 1 tsp Coriander (*Dhania*) powder, 1/2 tsp Garam Masala, Salt to taste`,
      `🧈 **Butter & Cream**: 1.5 tbsp butter & 1 tbsp fresh cream`,
      `🌰 **Cashews**: 8-10 pieces (soaked in warm water and ground to paste for gravy texture)`
    ];

    steps = [
      `**Prep Paneer**: Soak paneer cubes in warm water for 10 minutes to make them incredibly soft and pillowy. Drain and set aside.`,
      `**Sauté Aromatics**: Heat 1 tbsp oil & 1 tbsp butter in a pan. Sauté onions until soft and golden brown. Add ginger-garlic paste and sauté for 1 minute.`,
      `**Cook Tomato & Cashew Paste**: Add pureed tomatoes and cook for 5 minutes until oil separates. Stir in the smooth cashew paste and cook for another 2 minutes on low heat.`,
      `**Season Masala**: Add Turmeric, Red Chilli powder, Coriander powder, and salt. Mix well. Add 1/2 cup of warm water to adjust the gravy consistency.`,
      `**Incorporate Paneer**: Add the soft paneer cubes. Stir very gently so the paneer doesn't break. Simmer uncovered on low heat for 4-5 minutes so the cubes absorb the flavors.`,
      `**Finishing Touch**: Add Garam Masala, fresh cream, and crushed Kasuri Methi. Mix and turn off the flame. Garnish with coriander and serve!`
    ];

    tips = [
      `🌟 Never fry paneer for too long or on high heat; this dehydrates the cheese, making it rubbery and chewy.`,
      `🌟 Adding Kasuri Methi (dried fenugreek leaves) by rubbing them between your palms awakens their essential oils for restaurant-like aroma.`
    ];

    substitutes = [
      `**Paneer substitute**: Use Tofu (for a vegan option) or boiled potato/cauliflower florets.`,
      `**Cashew substitute**: Blend blanched almonds or use melon seeds (*magaz*) to create the rich paste.`
    ];

  } else if (isBread) {
    prepTime = 15;
    cookTime = 10;
    difficulty = "Medium";
    caloriesPerServing = 150;

    const flourQty = servingsCount * 100;
    primaryIngredients = [
      `🌾 **Whole Wheat Flour (Atta) / Maida**: ${flourQty}g`,
      `💧 **Lukewarm Water**: As needed to knead a soft dough`,
      `🧈 **Ghee / Butter / Oil**: ${servingsCount * 1} tbsp (for kneading & brushing)`,
      `🧂 **Salt**: 1/2 tsp`
    ];

    if (/naan/i.test(name)) {
      primaryIngredients.push(`🥛 **Yogurt (Dahi)**: 2 tbsp (acts as a rising agent)`);
      primaryIngredients.push(`🥖 **Baking Powder & Soda**: 1/2 tsp baking powder, 1/4 tsp baking soda`);
      primaryIngredients.push(`⚫ **Kalonji (Nigella Seeds)**: 1 tsp`);
    }

    steps = [
      `**Knead Dough**: Sift flour and salt into a wide bowl. Add yogurt, baking powder, and warm water gradually. Knead for 8-10 minutes until you get an elastic, super soft dough. Brush with oil, cover with a damp cloth, and let it rest (30 mins for roti, 2 hours for yeastless Naan).`,
      `**Divide & Roll**: Divide the rested dough into equal lemon-sized balls. Roll them smoothly between your palms. Roll out into round flat discs (or tear-drop shapes for Naan) using dry flour for dusting.`,
      `**Prepare Heat**: Heat a heavy iron griddle (*Tawa*) over high heat until smoking hot.`,
      `**The Cook**: Place the rolled dough on the hot tawa. When bubble bubbles appear on top, flip it. Cook the other side for 30 seconds.`,
      `**Direct Flame Puff**: For Roti, puff it directly on the open gas flame using tongs until it inflates like a balloon. For Naan, brush one side with water, stick it to the tawa, flip the entire tawa over the direct flame to char the top beautifully.`,
      `**Brush & Serve**: Garnish with a generous smear of melted butter or ghee. Serve hot with curries!`
    ];

    tips = [
      `🌟 Kneading the dough thoroughly develops the gluten structure, which is the secret behind getting soft, tearable breads.`,
      `🌟 Resting the dough relaxes the gluten, making it easy to roll out thin without springing back.`
    ];

    substitutes = [
      `**Whole Wheat substitute**: You can blend wheat flour with oats flour or ragi flour for a high-fiber healthier bread.`,
      `**Yogurt replacement**: Use warm milk to knead the dough to achieve a soft texture.`
    ];

  } else {
    // General Veg / Sabji / Dry Curry / Stir-fry
    prepTime = 15;
    cookTime = 15;
    difficulty = "Easy";
    caloriesPerServing = 220;

    const vegWeight = servingsCount * 125;
    primaryIngredients = [
      `🥦 **Fresh Vegetables (for ${title})**: ${vegWeight}g (cubed or sliced evenly)`,
      `🧅 **Onions**: ${Math.max(1, Math.ceil(servingsCount * 0.4))} medium (sliced or chopped)`,
      `🍅 **Tomatoes**: ${Math.max(1, Math.ceil(servingsCount * 0.5))} medium (finely chopped)`,
      `🧄 **Ginger-Garlic Paste**: 1 tbsp`,
      `🌶️ **Essential Spices**: 1/2 tsp Turmeric (*Haldi*), 1 tsp Red Chilli powder, 1 tsp Coriander (*Dhania*) powder, 1/2 tsp Garam Masala, Salt to taste`,
      `🧈 **Cooking Oil / Ghee**: 1.5 tbsp`,
      `🟢 **Cumin Seeds (Jeera)**: 1 tsp`
    ];

    steps = [
      `**Vegetable Prep**: Clean and slice vegetables into uniform bite-sized pieces so that they cook evenly in the pan.`,
      `**The Tadka**: Heat oil/ghee in a pan over medium heat. Add cumin seeds (*jeera*) and let them crackle and release their aroma.`,
      `**Sauté Base**: Add chopped onions and sauté until translucent. Stir in ginger-garlic paste and fresh green chillies; sauté for 1 minute.`,
      `**Simmer Masala**: Add chopped tomatoes and cook until mushy. Toss in Turmeric, Red Chilli, Coriander powder, and salt. Cook until the oil separates.`,
      `**Simmer Vegetables**: Add your chopped veggies and toss well to coat with the cooked masala. Pour in 1/2 cup of warm water. Cover the pan and simmer on low-medium flame for 10-12 minutes until vegetables are fork-tender.`,
      `**Finish & Garnish**: Stir in Garam Masala and fresh cilantro leaves. Serve hot with warm rotis, parathas, or rice!`
    ];

    tips = [
      `🌟 Cutting vegetables into equal shapes ensures that everything cooks at the same speed, preventing some pieces from becoming mushy while others remain raw.`,
      `🌟 Sautéing vegetables in the masala for 2-3 minutes before adding water is called 'Bhuna', which deepens the depth of flavor.`
    ];

    substitutes = [
      `**Vegetable options**: You can use cauliflowers, potatoes, French beans, carrots, or peas in this versatile template.`,
      `**Oil options**: Mustard oil (*Sarso ka Tel*) works incredibly well for traditional dry sabjis, adding a rustic, pungent kick.`
    ];
  }

  return `### 🍳 **${title}** — Recipe for ${servingsCount} ${servingsCount === 1 ? 'Person' : 'People'}
⏱️ **Prep Time**: ${prepTime} mins | **Cook Time**: ${cookTime} mins | **Servings**: ${servingsCount} ${servingsCount === 1 ? 'Person' : 'People'}
📊 **Difficulty**: ${difficulty} | 🔥 **Calories**: ~${caloriesPerServing} kcal per serving

#### 🛒 **Primary Ingredients Required (for ${servingsCount} ${servingsCount === 1 ? 'person' : 'people'})**:
${primaryIngredients.map(i => `- ${i}`).join('\n')}

---

#### 👨‍🍳 **Step-by-Step Cooking Method**:
${steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n\n')}

---

#### 💡 **Chef's Pro Tips**:
${tips.map(t => `${t}`).join('\n')}

---

#### 🔄 **Smart Substitutes**:
${substitutes.map(s => `- ${s}`).join('\n')}

---

*Tip: You can ask me to scale this recipe for any number of guests, or click "Order Missing Ingredients" to instantly format shopping list!*`;
}

/**
 * Detects if a query is related to food, cooking, kitchen, recipes, ingredients, or dietary preferences.
 */
export function isCulinaryQuery(message: string): boolean {
  if (!message || typeof message !== 'string') return false;
  const lower = message.toLowerCase().trim();

  // Basic greetings/identity/jokes/help are always allowed
  const allowedGeneral = [
    "hi", "hello", "hey", "namaste", "who are you", "what can you do", "joke", "funny", "laugh", "riddle", "help", "greet", "clear"
  ];
  if (allowedGeneral.some(word => lower === word || lower.startsWith(word + " ") || lower.endsWith(" " + word))) {
    return true;
  }

  // Common culinary/kitchen/diet keywords
  const culinaryKeywords = [
    "recipe", "cook", "make", "prepare", "dish", "cuisine", "food", "eat", "drink", "beverage", "meal", "dine", "kitchen", 
    "ghee", "oil", "butter", "spice", "salt", "sugar", "pepper", "chili", "masala", "curry", "gravy", "paneer", "chicken", 
    "mutton", "lamb", "beef", "pork", "egg", "fish", "prawn", "seafood", "rice", "dal", "roti", "naan", "paratha", "chai", "tea", "coffee", 
    "soup", "salad", "sauce", "halwa", "kheer", "biryani", "pulao", "khichdi", "samosa", "pakora", "aloo", "gobi", "onion", 
    "tomato", "garlic", "ginger", "turmeric", "haldi", "jeera", "cumin", "cardamom", "cinnamon", "clove", "coriander", 
    "cilantro", "mint", "pudina", "lemon", "yogurt", "dahi", "cream", "milk", "cheese", "tofu", "vegetable", "fruit", 
    "allium", "protein", "calorie", "nutrition", "healthy", "diet", "allergy", "gluten", "vegan", "vegetarian", "non-veg", 
    "sauté", "fry", "boil", "bake", "roast", "simmer", "grill", "steam", "chop", "slice", "knead", "marinate", "blend", 
    "taste", "yummy", "delicious", "hot", "sour", "bitter", "sweet", "salty", "spicy", "teekha", "namak", "reheat", "store", 
    "fridge", "spoil", "leftover", "pan", "tawa", "cooker", "pot", "stove", "oven", "blender", "griddle", "saucepan", 
    "servings", "portion", "guest", "people", "person", "scale", "substitute", "replace", "alternative", "pairing", 
    "side dish", "accomp", "serve", "pantry", "ingredient", "inventory", "shopping", "grocery", "zepto", "blinkit", 
    "instamart", "supermarket", "market", "utensils", "spoon", "knife", "fork", "cup", "glass", "water", "yeast", 
    "flour", "atta", "maida", "wheat", "oats", "lentil", "pulse", "chana", "rajma", "toor", "moong", "masoor", "urad", 
    "semolina", "sooji", "besan", "mushroom", "capsicum", "bell pepper", "carrot", "pea", "potato", "cauliflower", 
    "spinach", "palak", "okra", "bhindi", "brinjal", "eggplant", "cabbage", "beans", "corn", "yoghurt", "sour cream", 
    "mayo", "mustard", "vinegar", "soy sauce", "honey", "jaggery", "saffron", "kesar", "vanilla", "chocolate", "dessert", 
    "snack", "appetizer", "starter", "mocktail", "juice", "smoothie", "shake", "papad", "raita", "chutney", "pickle", "achaar"
  ];

  if (culinaryKeywords.some(kw => lower.includes(kw))) {
    return true;
  }

  // Check if any of the MongoDB recipe titles are mentioned in the query
  const recipeTitles = MONGO_RECIPE_COLLECTION.map(r => r.title.toLowerCase());
  if (recipeTitles.some(title => lower.includes(title))) {
    return true;
  }

  return false;
}

export function generateFallbackAssistantReply(
  message: string,
  recipeContext: any,
  inventory: string[] = [],
  conversationHistory: any[] = []
): string {
  if (!isCulinaryQuery(message)) {
    const lowerMsg = (message || "").toLowerCase();
    if (lowerMsg.includes("pm") || lowerMsg.includes("prime minister") || lowerMsg.includes("india")) {
      return `Namaste! The Prime Minister of India is **Narendra Modi**. \n\nNow, how can Annapurna help you in the kitchen today? Tell me what ingredients you have or what recipe you'd like to cook!`;
    }
    return `Namaste! I am **Annapurna**, your warm AI assistant and kitchen copilot.\n\nWhile my superpower is cooking, recipes, and food hacks, I am always here to help! What dish or kitchen question can we sort out for you today?`;
  }

  const lower = message.toLowerCase().trim();

  // Helper to extract serving count from text (e.g., "for 1 people", "for 4", "1 person", "6 guests", "serves 3")
  const extractServingsCount = (text: string): number | null => {
    const match = text.match(/(?:for|scale\s+for|make\s+it\s+for|servings?|portion|serves)?\s*(\d+)\s*(?:people|person|persons|guests|cups?|servings?)?/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0 && num < 100) return num;
    }
    return null;
  };

  const requestedServings = extractServingsCount(lower) || 2;

  // Search conversation history or recipe context for the dish being discussed
  let discussedDish = recipeContext?.title ? recipeContext.title.toLowerCase() : '';
  if (!discussedDish && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    const historyText = conversationHistory
      .map((m) => (typeof m.text === 'string' ? m.text : ''))
      .join(' ')
      .toLowerCase();

    if (historyText.includes('tea') || historyText.includes('chai')) discussedDish = 'masala chai';
    else if (historyText.includes('paneer')) discussedDish = 'paneer butter masala';
    else if (historyText.includes('dal')) discussedDish = 'dal makhani';
    else if (historyText.includes('coffee')) discussedDish = 'coffee';
    else if (historyText.includes('biryani')) discussedDish = 'biryani';
    else if (historyText.includes('chicken')) discussedDish = 'chicken curry';
  }

  // Extract Active Dish Name for Highly Personalized Cooking Responses
  let activeDish = "";
  if (recipeContext?.title) {
    activeDish = recipeContext.title;
  } else if (discussedDish) {
    activeDish = discussedDish;
  } else {
    // Check user query for "how to make [Dish]" or similar patterns
    const match = lower.match(/(?:how to make|recipe for|recipe of|cook|prepare|about|with)\s+([a-zA-Z\s]+)/i);
    if (match && match[1]) {
      activeDish = match[1].trim();
    }
    
    // If still empty, check if query contains any food words by stripping query noise
    if (!activeDish) {
      const stopWords = ["how", "to", "make", "cook", "prepare", "recipe", "of", "for", "it", "softer", "spicy", "salty", "watery", "burnt", "less", "more", "fix", "please", "the", "a", "an", "is", "can", "you", "give", "me", "show", "help", "with", "substitute", "replace"];
      const words = lower.split(/\s+/).filter(w => !stopWords.includes(w) && w.length > 2);
      if (words.length > 0) {
        activeDish = words.join(" ");
      }
    }
  }

  // Fallback if absolutely nothing is found
  if (!activeDish || activeDish.toLowerCase() === "it" || activeDish.toLowerCase() === "dish" || activeDish.toLowerCase() === "ques") {
    activeDish = "Your Selected Dish";
  } else {
    // Proper Title-Case for the active dish
    activeDish = activeDish
      .toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // 1. Greetings & Identity
  if (
    lower.startsWith("hi") ||
    lower.startsWith("hello") ||
    lower.startsWith("hey") ||
    lower.includes("namaste") ||
    lower.includes("who are you") ||
    lower.includes("what can you do")
  ) {
    return `### 🍳 Namaste! I am **Annapurna AI**, your expert AI Culinary Copilot!

I can guide you through every step of your cooking journey:
- 👨‍🍳 **Complete Recipe Guides**: Step-by-step cooking instructions with timings, ingredients, and secrets.
- 📊 **Instant Portion Scaling**: Ask for "for 1 person", "for 4 guests", or any custom serving size!
- 🔄 **Smart Ingredient Substitutes**: Seamless replacements for cream, dahi, tomatoes, paneer, garlic, or eggs.
- 🛠️ **Kitchen Troubleshooting**: Quick solutions for salty, burnt, watery, or over-spicy dishes.
- 🛒 **Quick-Comm Shopping**: Generating direct items for Blinkit, Zepto, and Instamart.

*What are you cooking today, or what recipe scale/tip do you need?*`;
  }

  // 2. Spicy / Less Spicy / Milder Queries
  if (lower.includes("spicy") || lower.includes("spice") || lower.includes("hot") || lower.includes("milder") || lower.includes("teekha")) {
    return `### 🌶️ How to Reduce the Heat in Your **${activeDish}**

If your **${activeDish}** has turned out too spicy, don't worry! Here are instant kitchen-tested fixes to tone down the heat while keeping the flavors perfectly balanced:

1. **Whisk in Dairy (Highly Recommended)**: Stir in **2-3 tbsp of thick dahi (yogurt)**, fresh cream, or unsalted butter. Lactic fats contain *casein*, which binds with capsaicin (the heat chemical in chilies) and neutralizes it instantly.
2. **Add Mild Gravy Bulkers**: Stir in **1-2 tbsp of cashew paste** (cashews blended with warm water) or extra tomato puree. This increases the gravy volume and dilutes the spice concentration in **${activeDish}** beautifully.
3. **Balance with Mild Sweetness**: Add a tiny pinch of **sugar, honey, or grated jaggery** (approx. 1/2 tsp). This doesn't make the dish sweet but balances the fiery hot profile of **${activeDish}**.
4. **Acidity Cut**: Squeeze **1 tsp of fresh lemon juice** or add a splash of vinegar. Citric acid distracts the palate and immediately mellows down the sharp chili oils.

*Chef's Note: For a dry version of ${activeDish}, tossing in a few boiled potato cubes or sautéed onions will soak up the excess chili powder while adding body!*`;
  }

  // 3. Salty / Too Much Salt Queries
  if (lower.includes("salt") || lower.includes("salty") || lower.includes("namak")) {
    return `### 🧂 How to Fix Too Much Salt in Your **${activeDish}**

If your hand slipped with the salt in **${activeDish}**, you can easily rescue it using these clever professional chef hacks:

1. **The Atta Ball Trick (Most Popular)**: Roll 2-3 small balls of raw whole wheat flour (*atta*) and drop them directly into the simmering **${activeDish}** gravy. Let them cook for 5-8 minutes; they act like natural salt-sponges. Discard them before serving.
2. **Drop in Boiled Potato Cubes**: Peel and cut a boiled potato into medium cubes and add them to the dish. They absorb the excess salt and starch the gravy slightly, which balances the flavor profile.
3. **Stir in Cream or Curd**: Whisk in **2 tbsp of fresh dahi (yogurt)** or fresh cream. The creaminess softens the sharp salt crystals on your palate.
4. **Dilute and Sauté**: Add a splash of warm water and a squeeze of fresh lemon juice. Acid naturally masks high sodium sensations.

*Chef's Tip: Avoid adding cold water directly, as it separates the spices and oils. Always use warm water or a light unsalted stock!*`;
  }

  // 4. Softness / Tenderness (Paneer / Chicken / Meat / Veggies)
  if (lower.includes("soft") || lower.includes("tender") || lower.includes("chewy") || lower.includes("tough") || lower.includes("hard") || lower.includes("rubbery")) {
    const isPaneerDish = /paneer/i.test(activeDish);
    const isMeatDish = /chicken|mutton|gosht|lamb|fish|prawn|meat|murg/i.test(activeDish);

    if (isPaneerDish) {
      return `### 🧀 How to Make the Paneer in Your **${activeDish}** Melt-in-the-Mouth Soft

To ensure your paneer cubes stay soft and pillowy instead of turning rubbery:

1. **Warm Water Bath**: Always soak the paneer cubes in warm water with a pinch of salt for 10-15 minutes before adding them to **${activeDish}**. This hydrates the milk solids.
2. **Never Over-Fry**: If you prefer pan-searing your paneer, fry them for **no more than 1 minute** per side on medium heat. Over-frying dehydrates the paneer, making it tough and rubbery.
3. **Add at the Very End**: Drop the paneer cubes into the simmering gravy of **${activeDish}** only during the last 4-5 minutes of cooking. Cover and let it simmer on low heat so it absorbs the flavors gently.
4. **Use Fresh / Malai Paneer**: Standard store-bought low-fat paneer is drier. Opt for "Malai Paneer" which has higher fat content and remains naturally softer.`;
    }

    if (isMeatDish) {
      return `### 🍗 How to Make the Meat in Your **${activeDish}** Incredibly Soft & Juicy

To achieve that fork-tender, melt-in-the-mouth texture for your meat in **${activeDish}**:

1. **The Yogurt Marination Power**: Marinate the meat with thick dahi (yogurt) and lemon juice or vinegar for at least 45 minutes (or 3-4 hours for mutton). Lactic acid is a natural tenderizer that gently unravels tough meat fibers.
2. **Sear on High Heat (Bhuna)**: Always sear the meat on high-medium heat for the first 4-5 minutes until the outside turns opaque white. This seals the surface proteins, locking in all natural juices.
3. **Slow Cook on Low Simmer**: Cook **${activeDish}** covered with a tight lid on *low heat*. Rapid boiling on high heat causes the protein fibers to contract tightly, turning the meat dry, stringy, and tough.
4. **Tenderizing Agents (For Mutton)**: Add 1 tbsp of raw papaya paste or a pinch of baking soda to your marination to help soften dense meat tissue.`;
    }

    // General veggie/grain/dry dish softness
    return `### 👨‍🍳 How to Achieve the Perfect Soft & Tender Texture in Your **${activeDish}**

To make the ingredients in your **${activeDish}** perfectly tender and juicy:

1. **Uniform Cutting**: Slice or dice your vegetables into equal, uniform shapes. This ensures everything cooks at the exact same speed.
2. **Splash Warm Water & Cover**: Splash 2-3 tbsp of warm water around the pan, then immediately cover with a tight-fitting lid. This traps the steam, cooking the ingredients gently from the inside out.
3. **Sauté First (Bhuna)**: Sauté the aromatics and veggies in oil/ghee for 3-4 minutes before adding any water. This caramelizes the outer layer, preserving the cell walls so they don't turn mushy.
4. **Simmer on Low-Medium**: Keep the heat moderate. High heat evaporates the moisture too quickly, leaving the center of ingredients hard while the outside is overcooked.`;
  }

  // 5. Watery / Consistency Adjustments
  if (lower.includes("watery") || lower.includes("thick") || lower.includes("thin") || lower.includes("gravy") || lower.includes("consistency") || lower.includes("dilute") || lower.includes("dry")) {
    return `### 🍲 How to Adjust the Gravy Consistency of Your **${activeDish}**

Whether your gravy turned out too runny and watery, or too thick and dry, here is how to get that perfect restaurant-style velvety texture for **${activeDish}**:

1. **If the Gravy is Too Watery (How to Thicken)**:
   - **Simmer Uncovered**: Keep the pan uncovered and simmer on medium-high heat for 5 minutes. This lets the excess water escape as steam.
   - **Cashew or Almond Paste**: Blend 6-8 soaked cashews with a little water and stir it into **${activeDish}**. This adds a rich, royal thickness and glossy finish.
   - **The Roasted Besan Hack**: Sauté 1 tsp of besan (gram flour) in a little ghee and stir it into the curry. It binds the water and spices beautifully.
   - **Mash the Base**: Mash a few potato, onion, or lentil pieces against the side of the pan with your ladle; this instantly thickens the body.

2. **If the Gravy is Too Thick or Dry (How to Loosen)**:
   - **Always Use Warm Water**: Stir in 1/4 cup of warm water or unsalted vegetable stock. *Never use cold water*, as it splits the oils and halts cooking.
   - **Whisked Dahi / Cream**: Whisk 2 tbsp of fresh dahi or fresh cream and stir on low flame to loosen the texture while enhancing the richness.`;
  }

  // 6. Burnt / Smoky Fixes
  if (lower.includes("burnt") || lower.includes("burn") || lower.includes("smoky") || lower.includes("smoke") || lower.includes("kadwa")) {
    return `### 🛠️ How to Rescue Burnt **${activeDish}**

If your **${activeDish}** got scorched at the bottom of the pan, you can save it from the bitter burnt flavor with these immediate steps:

1. **Switch Pans Immediately**: DO NOT stir the pot! Stop immediately and gently ladle the top, unburnt portion of **${activeDish}** into a clean pan. *Leaving even a tiny bit of the scraped burnt bottom will spoil the entire batch.*
2. **The Potato Secret**: Peel a raw potato, cut it in half, and simmer it in the rescued gravy for 10 minutes. Potatoes naturally absorb bitter odors and burnt smells. Discard the potatoes before serving.
3. **Mask the Bitterness**: Stir in **1 tbsp of fresh dahi (yogurt)**, cream, or a tiny pinch of sugar/jaggery. Lactic fats and sweet notes mask any lingering smoky aftertaste.
4. **Infuse Ghee and Hing**: Do a quick light tempering of 1 tsp ghee with a tiny pinch of asafoetida (*hing*) or cumin and pour it on top to refresh the aroma.`;
  }

  // 7. Side Dish & Pairings
  if (lower.includes("serve") || lower.includes("eat with") || lower.includes("pairing") || lower.includes("accompaniment") || lower.includes("side dish") || lower.includes("roti or rice")) {
    const isRiceMatch = /biryani|pulao|fried rice|khichdi/i.test(activeDish);
    const isCurryMatch = /curry|kadhai|butter|masala|paneer|chicken|dal|makhani|korma|gravy/i.test(activeDish);
    
    if (isRiceMatch) {
      return `### 🥗 Perfect Accompaniments for Your **${activeDish}**

To elevate your **${activeDish}** dining experience, serve it with these classic pairings:

1. **Chilled Cucumber Mint Raita**: Mix grated cucumber, fresh mint leaves, roasted cumin powder (*jeera*), and black salt into fresh whisked yogurt. This cools the palate.
2. **Sirka Pyaaz (Pickled Pearl Onions)**: Soaking small onions in vinegar and water with a beetroot slice creates that tangy restaurant crunch.
3. **Roasted Papad**: A crunchy salted or masala papad adds the perfect textural contrast.
4. **Fresh Mint-Coriander Chutney**: Blend mint, coriander, green chillies, ginger, and lemon juice into a tangy dip.`;
    }

    if (isCurryMatch) {
      return `### 🫓 What to Serve with Your Velvety **${activeDish}**

Your **${activeDish}** pairs beautifully with these classic bread and rice options:

1. **Breads (Indian Flatbreads)**:
   - **Butter Naan / Garlic Naan**: Perfect for wiping up rich, creamy gravies.
   - **Tandoori Roti**: Adds a rustic, wheat-filled smoky touch.
   - **Lachha Paratha**: Multi-layered flaky wheat bread that feels premium.
2. **Rice Accompaniments**:
   - **Jeera Rice**: Long-grain basmati fluffed with ghee, cumin seeds, and fresh coriander.
   - **Steamed Basmati Rice**: Simple, elegant, and lets the flavors of your gravy shine.
3. **Fresh Salad (Kachumber)**:
   - Slice onions, tomatoes, and cucumbers thinly. Toss with lemon juice, salt, and a pinch of chaat masala.`;
    }

    return `### 🍽️ Best Ways to Serve Your Delicious **${activeDish}**

To present and enjoy your **${activeDish}** to the absolute fullest:

1. **Warm Flatbreads**: Pair with warm, freshly made rotis, parathas, or naans brushed with a touch of ghee.
2. **Tangy Kachumber Salad**: Toss finely chopped onions, tomatoes, cucumbers, green chillies, and fresh coriander with a squeeze of lime and a sprinkle of chaat masala.
3. **Refreshing Raita**: Serve alongside thick chilled yogurt mixed with grated carrot/cucumber and roasted cumin seeds.
4. **Piquant Pickles**: A tiny dab of mango or lime pickle (*Achaar*) adds that extra burst of traditional zing.`;
  }

  // 8. Storage & Reheating
  if (lower.includes("store") || lower.includes("keep") || lower.includes("fridge") || lower.includes("spoil") || lower.includes("reheat") || lower.includes("leftover")) {
    return `### ❄️ How to Store & Reheat Leftover **${activeDish}**

To preserve the freshness, texture, and aroma of your **${activeDish}** for subsequent meals:

1. **Storage Guidelines**:
   - **Cool First**: Let **${activeDish}** cool down to room temperature before packing. Putting hot food directly in the fridge traps condensation, making it watery and prone to souring.
   - **Air-Tight Container**: Store in glass or high-quality BPA-free air-tight containers to prevent oxidation and keep fridge odors out.
   - **Shelf Life**: Stays perfectly fresh in the refrigerator for **2 to 3 days**. If it contains coconut milk or heavy cream, consume within 24-36 hours.

2. **Reheating Secrets**:
   - **Stovetop Method (Best)**: Transfer to a pan, add **1-2 tbsp of warm water** (or milk if it's a creamy gravy) to loosen the thickened cold starch. Simmer covered on low heat for 3-4 minutes until steaming hot.
   - **Microwave Method**: Cover with a microwave-safe lid to trap steam (preventing dry skin on top) and heat for 1.5 - 2 minutes, stirring once midway.`;
  }

  // 9. Prep & Cooking Timings
  if (lower.includes("time") || lower.includes("prep") || lower.includes("cook") || lower.includes("how long") || lower.includes("duration")) {
    return `### ⏱️ Cooking & Prep Timings for **${activeDish}**

Here is the structured timeframe to plan your kitchen preparation for **${activeDish}**:

- ⏳ **Preparation Time**: 15 minutes (Includes washing, chopping aromatics, grinding ginger-garlic, and keeping spices ready).
- 🍳 **Active Cooking Time**: 20–25 minutes (Sautéing onions, roasting the spices, cooking down tomatoes, and simmering the main items).
- ⌛ **Total Kitchen Time**: ~35–40 minutes from counter to table.

*Chef's Time-Saving Hack: Prepare your ginger-garlic paste and tomato puree in batches beforehand; this cuts active cooking time of **${activeDish}** by nearly 10 minutes!*`;
  }

  // 10. Smart Substitutes
  if (
    lower.includes("substitute") ||
    lower.includes("replace") ||
    lower.includes("alternative")
  ) {
    return `### 🔄 Smart Substitutes for Your Gravies & Curries

1. **Amul Fresh Cream Replacement**:
   - **Malai + Milk**: Whisk 2 tbsp fresh homemade malai with 1 tbsp milk.
   - **Cashew Paste**: Blend 8-10 soaked cashews with 2 tbsp warm water into a rich, silky cream.
   - **Curd / Dahi**: Whisk 3 tbsp fresh, non-sour dahi with 1 tsp besan (gram flour) so it doesn't curdle when heated.

2. **Tomato Substitute**: Use 2 tbsp tomato puree + 1/2 tsp sugar + 1 tsp lemon juice.
3. **Paneer Substitute**: Tofu, boiled potatoes, or soya chunks.
4. **Garlic/Onion Substitute (Jain Style)**: Use a pinch of Asafoetida (*Hing*) and ground ginger (*Saunth*) to replicate structural warmth.`;
  }

  // 11. Health & Nutrition Insights
  if (
    lower.includes("health") ||
    lower.includes("calorie") ||
    lower.includes("protein") ||
    lower.includes("weight") ||
    lower.includes("diet")
  ) {
    return `### 🌿 Health & Nutrition Insights for **${activeDish}**

1. **Turmeric (Haldi) Benefits**: Contains *Curcumin*, a powerful anti-inflammatory. Pairs best with a pinch of black pepper (piperine) for 2000% better absorption!
2. **High Protein Staples**: Soya chunks (~52g protein/100g), Paneer (~18g), Chana/Rajma (~19g cooked), and Eggs (~6g per egg).
3. **Calorie-Cutting Tip**: 1 tsp of Ghee or Oil contains ~45 calories. Using a cooking oil spray can cut cooking oil intake by 70% without sacrificing flavor!`;
  }

  // 12. Jokes & Humor
  if (lower.includes("joke") || lower.includes("funny") || lower.includes("laugh") || lower.includes("riddle")) {
    const jokes = [
      `😄 **Here's a kitchen joke for you!**\n\nWhy did the tomato blush? \nBecause it saw the salad dressing! 🥗`,
      `😄 **Here's a fun one!**\n\nWhat did one roti say to the butter? \n*"Main tumhare bina adhoori hoon!"* 🫓🧈`,
      `😄 **Chef Humor:**\n\nWhy did the cook get arrested? \nBecause he beat the eggs and whipped the cream! 🍳`
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // 13. Specialized Chai / Tea recipe
  if (
    lower.includes("tea") ||
    lower.includes("chai") ||
    lower.includes("chaye") ||
    lower.includes("masala chai")
  ) {
    const servings = requestedServings || 2;
    const water = (servings * 0.75).toFixed(1).replace(/\.0$/, '');
    const milk = (servings * 0.5).toFixed(1).replace(/\.0$/, '');

    return `### ☕ How to Make Authentic Indian Masala Chai (Tea)

**Prep Time**: 3 mins | **Brew Time**: 7 mins | **Servings**: ${servings} ${servings === 1 ? 'cup' : 'cups'}

#### 🛒 Ingredients Required:
- 💧 **Water**: ${water} cup${servings > 1 ? 's' : ''}
- 🥛 **Milk**: ${milk} cup${servings > 1 ? 's' : ''} (Whole or Toned Milk)
- 🍃 **Tea Powder (Chai Patti)**: ${servings} tsp (CTC Black Tea like Red Label / Taj Mahal)
- 🍬 **Sugar**: ${servings} tsp (adjust to taste) or Jaggery (Gur)
- 🫚 **Fresh Aromatics**: ${servings === 1 ? '0.5-inch' : '1-inch'} freshly crushed Ginger (*Adrak*) & ${servings} crushed Green Cardamoms (*Elaichi*)
- 🌿 *(Optional)*: 1 Clove (*Laung*), small piece of Cinnamon (*Dalchini*)

---

#### 👨‍🍳 Step-by-Step Instructions:

1. **Infuse Aromatics in Water**:
   - In a saucepan, bring ${water} cup of water to a rolling boil. Add crushed ginger and cardamom. Boil for 2 minutes.
2. **Brew Tea Leaves & Sugar**:
   - Add ${servings} tsp chai patti and sugar. Simmer for 2 minutes until rich and dark brown.
3. **Pour Milk & Simmer**:
   - Pour in ${milk} cup of milk. Bring the chai to a boil. Let it rise to the brim, then lower the flame.
4. **The Double-Boil Secret**:
   - Let the chai simmer on low heat for 2–3 minutes, allowing it to boil up 2 to 3 times to caramelize milk sugars.
5. **Strain & Serve**:
   - Strain through a tea sieve (*chhani*) into cups. Serve piping hot with biscuits or pakoras!`;
  }

  // 14. Specialized Coffee recipe
  if (lower.includes("coffee") || lower.includes("cappuccino") || lower.includes("latte") || lower.includes("espresso")) {
    const servings = requestedServings || 1;
    return `### ☕ How to Make Delicious Creamy Frothy Coffee

**Prep Time**: 2 mins | **Total Time**: 5 mins | **Servings**: ${servings} ${servings === 1 ? 'cup' : 'cups'}

#### 🛒 Ingredients Required:
- 🥛 **Milk**: ${servings} cup${servings > 1 ? 's' : ''} (Full cream)
- ☕ **Instant Coffee Powder**: ${servings * 1.5} tsp (Nescafe / Bru)
- 🍬 **Sugar**: ${servings * 2} tsp (adjust to taste)
- 💧 **Hot Water**: ${servings} tbsp

---

#### 👨‍🍳 Step-by-Step Instructions:

1. **Whip the Coffee Base (Froth Secret)**:
   - In a cup, add coffee powder, sugar, and warm water. Whisk vigorously with a spoon for 2–3 minutes until light brown, creamy, and airy.
2. **Heat Milk**:
   - Heat milk in a pan until steaming hot and boiling.
3. **Assemble**:
   - Pour hot boiling milk into the cup containing the frothy coffee cream from a height to create rich foam. Stir gently and serve!`;
  }

  // 15. Check Database recipe match
  const matchingRecipe = MONGO_RECIPE_COLLECTION.find((r) => {
    const titleLower = r.title.toLowerCase();
    return (
      lower.includes(titleLower) ||
      titleLower.split(' ').some((word) => word.length > 3 && lower.includes(word))
    );
  });

  if (matchingRecipe) {
    const totalTime = matchingRecipe.prepTimeMinutes + matchingRecipe.cookTimeMinutes;
    const invLower = inventory.map((i) => i.toLowerCase());

    const availableIngs = matchingRecipe.ingredients.filter((i) =>
      invLower.some((item) => item.includes(i.name.toLowerCase()) || i.name.toLowerCase().includes(item))
    );
    const missingIngs = matchingRecipe.ingredients.filter(
      (i) => !invLower.some((item) => item.includes(i.name.toLowerCase()) || i.name.toLowerCase().includes(item))
    );

    return `### 🍳 **${matchingRecipe.title}** (${matchingRecipe.cuisine} Cuisine)

⏱️ **Quick Overview**:
- ⏳ **Prep Time**: ${matchingRecipe.prepTimeMinutes} mins | 🍳 **Cook Time**: ${matchingRecipe.cookTimeMinutes} mins | ⌛ **Total**: ${totalTime} mins
- 🍽️ **Servings**: ${matchingRecipe.servings} persons | 🔥 **Calories**: ~${matchingRecipe.nutrition.calories} kcal
- 🥗 **Diet**: ${matchingRecipe.dietType} | 📊 **Difficulty**: ${matchingRecipe.difficulty}

---

#### 🛒 **Ingredients Required**:
${matchingRecipe.ingredients
  .map((i) => `- **${i.quantity} ${i.unit}** ${i.name} ${i.regionalName ? `(*${i.regionalName}*)` : ''}`)
  .join('\n')}

---

#### 🔍 **Pantry Status**:
- ✅ **In Your Kitchen**: ${availableIngs.length > 0 ? availableIngs.map((i) => i.name).join(', ') : 'None matched'}
- 🛍️ **Missing (Need to buy)**: ${
      missingIngs.length > 0
        ? missingIngs.map((i) => `**${i.name}**`).join(', ')
        : 'All items available in pantry!'
    }

---

#### 👨‍🍳 **Step-by-Step Cooking Instructions**:
${matchingRecipe.instructions
  .map((inst) => `${inst.stepNumber}. **${inst.title}** (${inst.durationMinutes ? `${inst.durationMinutes} mins` : 'Step'})\n   - ${inst.description}`)
  .join('\n\n')}

---

#### 💡 **Chef's Pro Tips**:
${matchingRecipe.chefTips.map((tip) => `- 🌟 ${tip}`).join('\n')}

---

#### 🔄 **Smart Substitutes**:
- **Fresh Cream / Malai**: Cashew Paste or Whisked Dahi + 1 tsp Besan.
- **Paneer**: Tofu or boiled potato cubes.

*Tip: You can ask me to scale this recipe for more guests, or click "Order Missing Ingredients" below to export missing items to Quick-Comm!*`;
  }

  // 16. Specific Marination or Tenderizing Query
  if (
    lower.includes("marinate") ||
    lower.includes("marination") ||
    lower.includes("tenderize") ||
    lower.includes("tenderizing")
  ) {
    return `### 🍗 Non-Veg Cooking & Marination Copilot for **${activeDish}**

1. **Tenderizing Marination Base**: Mix 3 tbsp thick Dahi (curd), 1 tbsp Ginger-Garlic paste, 1 tsp Haldi, 1 tbsp Kashmiri Mirch, and 1 tsp Garam Masala.
2. **Marination Timing**:
   - **Chicken**: 30–45 mins at room temperature (or overnight in fridge).
   - **Mutton / Gosht**: At least 2–3 hours with 1 tbsp raw papaya paste or lemon juice for tender meat.
   - **Fish / Prawns**: 15–20 mins with lemon, haldi, and salt (do not over-marinate).
3. **Pro Chef Tip**: Always sear chicken on medium-high heat first to seal in juices before adding curry gravy.`;
  }

  // 17. Check if it's any recipe query (Contains common proteins, carbs, or generic query terms)
  const isRecipeRequest = 
    lower.includes("how to") || 
    lower.includes("recipe") || 
    lower.includes("make") || 
    lower.includes("cook") || 
    lower.includes("prepare") ||
    /chicken|mutton|gosht|paneer|aloo|gobi|dal|rice|biryani|roti|naan|samosa|pakora|sabji|bhaji|halwa|kheer|fish|prawn|egg|curry|masala|soup|salad/i.test(lower);

  if (isRecipeRequest && lower.length > 2) {
    return generateDynamicRecipe(message, requestedServings);
  }

  // 18. General, high-quality, chef-like responder for absolutely any question on the dish (Gemini-like versatility)
  return `### 🍳 **${activeDish}** — Culinary Guide & Advice

Regarding your question about **${activeDish}**, here are some professional chef-tested cooking tips and guidelines to ensure perfect results:

1. **Aromatic Browning**: When starting your **${activeDish}**, make sure to sauté the chopped onions and fresh ginger-garlic paste slowly on medium-low flame. Browning them unlocks natural sweet and savory compounds that act as the flavor skeleton of the dish.
2. **Bloom Your Spices (Bhuna)**: Always sauté the powdered spices (turmeric, chili, coriander powder) in warm oil or ghee for 30–45 seconds before adding wet liquids. This warm fat blooming process activates dry spice esters, making your **${activeDish}** dramatically more aromatic.
3. **Let It Rest**: Once cooked, remove the pot of **${activeDish}** from the flame and let it rest covered for 2–3 minutes. This allows the heat pressure to drop, letting the food fibers relax, soak in moisture, and release clear fat layers on top.

*What else would you like to know about **${activeDish}**? You can ask me about scaling ingredients for guests, smart substitutes, storage tips, or solving a kitchen emergency!*`;
}
