# 🍲 Annapurna AI — Smart Pantry & Zero-Waste Culinary Copilot
> **AI-Powered Kitchen Engine, Match % Scoring & Quick-Commerce Restock Bridge**

Annapurna AI transforms cooking and pantry management into a zero-waste, seamless experience. It matches your active kitchen ingredients against a massive dataset of 6,000+ authentic Indian recipes, calculates instant match percentages, and bridges missing ingredients directly to 1-click Quick-Commerce carts (**Blinkit**, **Zepto**, **Swiggy Instamart**, and **FreshToHome**).

---

## 🌟 Key Features

1. **Smart Hinglish Pantry Manager**:
   - Real-time stock tracking supporting dual Hinglish naming (*Pyaz*, *Tamatar*, *Aalo*, *Ghee*, *Toor Dal*, *Adrak Lahsun*).
   - Categorized by Vegetables, Spices, Dairy, Grains, and Non-Veg items with quick-add chips.

2. **Deterministic Match % Recipe Engine**:
   - Scores dishes live against your pantry stock.
   - Filter by **Ready to Cook** (0 missing ingredients), **Almost Ready** (1–2 missing ingredients), **Quick 30-Min**, or **Pure Veg / Non-Veg**.

3. **Dedicated Data Pipeline (`dataPipelineService`)**:
   - High-performance, sub-millisecond query pipeline featuring tokenization, Hinglish term normalization, and in-memory TTL caching.

4. **1-Click Quick-Commerce Restock Hub**:
   - Calculates missing ingredients per dish with estimated price calculations in INR (₹).
   - Generates direct app intent cart deep-links for **Blinkit**, **Zepto**, **Swiggy Instamart**, and **FreshToHome**.

5. **Zero-Waste Weekly Meal Planner**:
   - Create 7-day meal schedules (Breakfast, Lunch, Dinner) optimized to consume expiring pantry items before they spoil.

6. **Annapurna AI Chef Copilot**:
   - Powered by **Gemini 2.5 Flash** for personalized cooking assistance, heat control advice, and allergen-free substitutions.
   - **100% Offline / Fallback Resilient**: Functions deterministically using local culinary rule engines even if AI API keys are unavailable or rate-limited.

7. **High-Resolution Visual Food Gallery**:
   - Curated high-definition food photography mapped dynamically by dish category (Biryani, Paneer, Dosa, Dal, Chicken, Desserts, Thali) with error fallback handling.

8. **YouTube Video Recipe Tutorials**:
   - Integrated video walkthroughs and step-by-step cooking instructions for every recipe.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   React 18 + Vite Frontend                  │
│   (RecipeFeed, InventorySection, MealPlanner, ChefChat)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            Data Pipeline Service (dataPipelineService)      │
│  - Query Normalization & Hinglish Search Indexing          │
│  - In-Memory TTL Query Cache & Match % Scoring Engine       │
│  - Quick-Commerce Cart & INR Price Estimator                │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│    Gemini 2.5 AI Copilot    │  │ Local Deterministic Engine  │
│ (Online Mode with API key) │  │(100% Offline / Fallback)    │
└─────────────────────────────┘  └─────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Quick-Commerce Restock Bridge               │
│        [Blinkit]   [Zepto]   [Instamart]   [FreshToHome]    │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Motion Animations
- **Backend**: Node.js, Express, Vite Server Middleware, esbuild CJS bundler
- **AI Integration**: `@google/genai` (Gemini 2.5 Flash) with local deterministic fallback
- **Data Engine**: Custom `dataPipelineService` with MongoDB document schema support
- **Dataset**: Cleaned Indian Culinary Dataset (6,000+ recipes spanning North Indian, South Indian, Mughlai, Punjabi, Rajasthani, Street Food, etc.)

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Local Execution

```bash
# 1. Clone the repository
git clone https://github.com/amolsri1205/AnnapurnaAi.git
cd AnnapurnaAi

# 2. Install dependencies
npm install

# 3. Setup environment variables (Optional)
# Create a .env.local file in the root directory:
GEMINI_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here

# 4. Start the development server
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## 🚀 Deployment

### Cloud Run / Container Deployment
```bash
npm run build
npm start
```
The Express server bundles via `esbuild` into `dist/server.cjs` and serves static assets alongside serverless API routes on port `3000`.
