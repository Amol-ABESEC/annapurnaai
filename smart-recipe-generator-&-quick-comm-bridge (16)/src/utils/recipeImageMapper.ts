// High-resolution curated food imagery mapping by dish type, cuisine, and ingredients

const DISH_IMAGE_DATABASE: Record<string, string[]> = {
  biryani: [
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800', // Hyderabadi Biryani
    'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1631515223380-a1274d7ab424?auto=format&fit=crop&q=80&w=800'
  ],
  paneer: [
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=800', // Paneer Butter Masala
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800', // Palak Paneer
    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=800'  // Kadai Paneer
  ],
  dal: [
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', // Dal Makhani / Dal Tadka
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800'
  ],
  dosa: [
    'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=800', // Masala Dosa
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800'
  ],
  idli: [
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=800'
  ],
  chicken: [
    'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=800', // Butter Chicken / Curry
    'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&q=80&w=800', // Tandoori Chicken
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800'
  ],
  samosa: [
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800'
  ],
  paratha: [
    'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=800', // Aloo Paratha
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800'
  ],
  naan: [
    'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=800', // Garlic Naan
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800'
  ],
  dessert: [
    'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&q=80&w=800', // Gulab Jamun / Sweet
    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800'
  ],
  beverage: [
    'https://images.unsplash.com/photo-1571006682880-60b61e27a696?auto=format&fit=crop&q=80&w=800', // Mango Lassi / Chai
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800'
  ],
  chole: [
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800', // Chole Bhature
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800'
  ],
  thali: [
    'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=800', // Indian Thali
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800'
  ]
};

const DEFAULT_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=800',
];

/**
 * Returns a high-resolution Unsplash photo tailored specifically to the dish title or cuisine
 */
export function getRecipeImage(title: string, cuisine: string = '', index: number = 0): string {
  const t = title.toLowerCase();
  const c = cuisine.toLowerCase();

  for (const [key, images] of Object.entries(DISH_IMAGE_DATABASE)) {
    if (t.includes(key) || c.includes(key)) {
      return images[index % images.length];
    }
  }

  // Fallback based on index modulo
  return DEFAULT_FALLBACK_IMAGES[index % DEFAULT_FALLBACK_IMAGES.length];
}

/**
 * Returns a safety fallback image when an <img> tag encounters a network or broken link error
 */
export function getRecipeFallbackImage(title: string = ''): string {
  return getRecipeImage(title, '', 0);
}
