# Annapurna AI Smart Recipe Generator

Annapurna AI is a smart Indian recipe web app that helps users cook with the ingredients they already have, discover authentic dishes, track missing pantry items, and move missing ingredients into quick-commerce carts.

## Features

- **Large Indian recipe database**: Loads 4,466 recipes from `cuisine_updated.csv` through the Express API.
- **Dish-specific image matching**: Uses local JPG assets from the provided image zip files and matches them to recipes by normalized dish names.
- **Smart pantry matching**: Compares recipe ingredients against the user's pantry and calculates missing ingredients plus match percentage.
- **Recipe discovery feed**: Search and filter recipes by cuisine, course, diet type, readiness, quick-cook time, favorites, and custom recipes.
- **Detailed recipe modal**: Shows recipe image, cooking time, difficulty, servings, scalable ingredients, instructions, chef tips, equipment, pairings, and video recommendations.
- **Favorites**: Saves favorite recipes in browser local storage.
- **Weekly meal planner**: Adds recipes to meal slots and exports a combined grocery list.
- **Custom recipes**: Lets users create, save, view, and delete their own recipes.
- **Quick-commerce bridge**: Prepares missing ingredients for Blinkit, Zepto, Instamart, or FreshToHome flows.
- **AI cooking assistant**: Provides recipe-aware cooking help using configured AI keys, with fallback behavior when keys are not available.

## Project Structure

```text
.
├── api/
│   └── index.ts                     # Vercel/Express entrypoint
├── public/
│   ├── recipe-images/               # Local dish JPGs extracted from zip files
│   │   ├── images/
│   │   ├── images-1/
│   │   ├── images-2/
│   │   └── README.md
│   └── *.jpg                        # Brand/logo assets
├── src/
│   ├── components/                  # React UI components
│   ├── data/                        # Recipe data, image manifest, mock data
│   ├── server/                      # CSV recipe loading logic
│   ├── utils/                       # Matchers, parsers, AI helpers
│   ├── App.tsx
│   └── main.tsx
├── cuisine_updated.csv              # Main 4,466-recipe dataset
├── server.ts                        # Express + Vite development server
└── package.json
```

## Recipe Image System

The image zips were extracted into `public/recipe-images`:

- `images.zip` -> `public/recipe-images/images`
- `images (1).zip` -> `public/recipe-images/images-1`
- `images (2).zip` -> `public/recipe-images/images-2`

The app uses [src/data/recipeImageManifest.ts](src/data/recipeImageManifest.ts) to list all 4,466 public JPG paths. [src/utils/recipeImageMatcher.ts](src/utils/recipeImageMatcher.ts) normalizes recipe titles and image filenames, removes numeric prefixes such as `1221.`, and picks the best matching local image.

When the server loads CSV recipes, [src/server/recipeLoader.ts](src/server/recipeLoader.ts) prefers a matched local image path like:

```text
/recipe-images/images/2.Fish_Tandoori.jpg
```

If no local match is found, the app falls back to the original CSV `image_url` or the existing curated fallback image logic.

## Getting Started

### Prerequisites

- Node.js
- npm

### Install

```bash
npm install
```

### Configure Environment

Create `.env.local` for local secrets when needed:

```bash
GEMINI_API_KEY=your_gemini_key
OPENROUTER_API_KEY=your_openrouter_key
YOUTUBE_API_KEY=your_youtube_key
```

The app can still run without these keys. AI/video features use fallback behavior when keys are missing.

### Run Locally

```bash
npm run dev
```

By default the server listens on port `3000`. You can choose another port:

```bash
PORT=3001 npm run dev
```

Open the app at:

```text
http://localhost:3000
```

or the custom port you selected.

## Useful Scripts

```bash
npm run dev      # Start Express + Vite dev server
npm run build    # Build frontend and bundled server
npm run start    # Run built server from dist/server.cjs
npm run lint     # Type-check with TypeScript
```

## Deployment

The project includes `vercel.json` and `api/index.ts` for Vercel-style deployment. Add these environment variables in the deployment dashboard as needed:

- `GEMINI_API_KEY`: Powers Gemini-based assistant responses.
- `OPENROUTER_API_KEY`: Enables OpenRouter fallback chat responses.
- `YOUTUBE_API_KEY`: Enables live YouTube recipe video recommendations.

After adding or changing environment variables, redeploy so production receives the latest values.

## Notes For Future Image Updates

1. Add new JPGs under `public/recipe-images` in a clear subfolder.
2. Run `npm run images:manifest` so the app can discover the new paths.
3. Keep filenames dish-focused because matching depends on the dish name in the filename.
4. Run `npm run build` after updating images or matcher code.
