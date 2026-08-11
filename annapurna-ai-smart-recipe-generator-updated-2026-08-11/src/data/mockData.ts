import { PantryIngredient, Recipe, QuickCommPlatform } from '../types';
import { MONGO_RECIPE_COLLECTION } from './mongoRecipeStore';

export const INITIAL_PANTRY_ITEMS: PantryIngredient[] = [
  // Vegetables
  { id: '1', name: 'Onion', regionalName: 'Pyaz', category: 'vegetables', inStock: true, quantity: '3 medium' },
  { id: '2', name: 'Tomato', regionalName: 'Tamatar', category: 'vegetables', inStock: true, quantity: '4 ripe' },
  { id: '3', name: 'Potato', regionalName: 'Aalo', category: 'vegetables', inStock: true, quantity: '5 medium' },
  { id: '4', name: 'Paneer', regionalName: 'Cottage Cheese', category: 'dairy', inStock: true, quantity: '200g block' },
  { id: '5', name: 'Green Peas', regionalName: 'Matar', category: 'vegetables', inStock: true, quantity: '1 cup' },
  { id: '6', name: 'Ginger Garlic Paste', regionalName: 'Adrak Lahsun', category: 'spices', inStock: true, quantity: '1 pouch' },
  
  // Spices & Masalas
  { id: '7', name: 'Turmeric Powder', regionalName: 'Haldi', category: 'spices', inStock: true },
  { id: '8', name: 'Red Chilli Powder', regionalName: 'Lal Mirch', category: 'spices', inStock: true },
  { id: '9', name: 'Cumin Seeds', regionalName: 'Jeera', category: 'spices', inStock: true },
  { id: '10', name: 'Garam Masala', regionalName: 'Garam Masala', category: 'spices', inStock: true },
  
  // Dairy & Grains
  { id: '11', name: 'Ghee / Butter', regionalName: 'Ghee', category: 'dairy', inStock: true },
  { id: '12', name: 'Wheat Flour', regionalName: 'Atta', category: 'grains', inStock: true },
  { id: '13', name: 'Arhar Dal', regionalName: 'Toor Dal', category: 'grains', inStock: true },
];

export const CATEGORY_QUICK_ADD: Record<string, { name: string; regionalName: string }[]> = {
  non_veg: [
    { name: 'Chicken', regionalName: 'Murgh' },
    { name: 'Eggs', regionalName: 'Anda' },
    { name: 'Mutton / Lamb', regionalName: 'Gosht' },
    { name: 'Fish Fillet', regionalName: 'Machli' },
    { name: 'Prawns', regionalName: 'Jhinga' },
  ],
  vegetables: [
    { name: 'Cauliflower', regionalName: 'Gobi' },
    { name: 'Coriander', regionalName: 'Dhania' },
    { name: 'Green Chilli', regionalName: 'Hari Mirch' },
    { name: 'Capsicum', regionalName: 'Shimla Mirch' },
    { name: 'Spinach', regionalName: 'Palak' },
  ],
  dairy: [
    { name: 'Amul Fresh Cream', regionalName: 'Fresh Cream' },
    { name: 'Curd / Yogurt', regionalName: 'Dahi' },
    { name: 'Cheese Slices', regionalName: 'Cheese' },
    { name: 'Milk', regionalName: 'Doodh' },
  ],
  spices: [
    { name: 'Kasuri Methi', regionalName: 'Dried Fenugreek' },
    { name: 'Cashews', regionalName: 'Kaju' },
    { name: 'Kashmiri Mirch', regionalName: 'Color Chilli' },
    { name: 'Chana Masala', regionalName: 'Chole Masala' },
  ],
  grains: [
    { name: 'Basmati Rice', regionalName: 'Chawal' },
    { name: 'Chickpeas', regionalName: 'Kabuli Chana' },
    { name: 'Poha', regionalName: 'Flattened Rice' },
  ],
  sauces_oils: [
    { name: 'Mustard Oil', regionalName: 'Sarson Tel' },
    { name: 'Tomato Ketchup', regionalName: 'Sauce' },
    { name: 'Soya Sauce', regionalName: 'Soya' },
  ],
};

export const PLATFORM_INFO: Record<
  QuickCommPlatform,
  { name: string; logoColor: string; estimatedDeliveryTime: string; deliveryFee: number; specialty?: string }
> = {
  blinkit: { name: 'Blinkit', logoColor: 'bg-yellow-400 text-yellow-950', estimatedDeliveryTime: '10 mins', deliveryFee: 15, specialty: 'General Grocery & Staples' },
  zepto: { name: 'Zepto', logoColor: 'bg-purple-600 text-white', estimatedDeliveryTime: '8 mins', deliveryFee: 0, specialty: 'Express Instant Delivery' },
  instamart: { name: 'Instamart', logoColor: 'bg-orange-500 text-white', estimatedDeliveryTime: '12 mins', deliveryFee: 12, specialty: 'Swiggy Quick Supermarket' },
  freshtohome: { name: 'FreshToHome', logoColor: 'bg-emerald-600 text-white', estimatedDeliveryTime: '20 mins', deliveryFee: 15, specialty: '100% Fresh Meat & Seafood' },
};

export const MOCK_CART_DEEPLINKS: Record<QuickCommPlatform, (items: string[]) => string> = {
  blinkit: (items) => `blinkit://search?q=${encodeURIComponent(items.join(', '))}`,
  zepto: (items) => `zepto://search?query=${encodeURIComponent(items.join(', '))}`,
  instamart: (items) => `swiggy://instamart/search?q=${encodeURIComponent(items.join(', '))}`,
  freshtohome: (items) => `freshtohome://search?q=${encodeURIComponent(items.join(', '))}`,
};

export const MOCK_WEB_FALLBACKS: Record<QuickCommPlatform, (items: string[]) => string> = {
  blinkit: () => 'https://blinkit.com/',
  zepto: () => 'https://www.zepto.com/',
  instamart: () => 'https://www.swiggy.com/instamart',
  freshtohome: () => 'https://www.freshtohome.com/',
};

// Sole master recipe dataset from MongoDB store
export const MOCK_RECIPES: Recipe[] = MONGO_RECIPE_COLLECTION;
