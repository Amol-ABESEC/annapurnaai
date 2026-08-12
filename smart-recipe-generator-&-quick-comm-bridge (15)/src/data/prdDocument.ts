export const PRD_MARKDOWN_CONTENT = `# Product Requirements Document (PRD)
## Smart Recipe Generator & Quick-Comm Bridge
**Document Version:** 1.0.0-PROD  
**Target Market:** India Metro & Tier-1 Cities (Blinkit, Zepto, Swiggy Instamart)  
**Authors:** Principal Product Manager & Firebase Solutions Architect  

---

## 1. EXECUTIVE SUMMARY & OBJECTIVES

### 1.1 Problem Statement
Urban Indian households frequently experience "decision fatigue" and "pantry friction" when determining daily meals. Users have partial kitchen inventories (e.g., 4 out of 6 ingredients needed for Paneer Butter Masala, lacking Amul Fresh Cream and Kasuri Methi). Existing recipe apps present recipes without accounting for immediate inventory availability or force users to manually search external quick-commerce apps (Blinkit, Zepto, Swiggy Instamart) to purchase missing items, leading to high drop-offs.

### 1.2 Product Vision
"Smart Recipe Generator & Quick-Comm Bridge" eliminates kitchen inventory friction by instantly converting available pantry items into executable recipes, while providing a 1-click Quick-Comm Cart Bridge that deep-links missing ingredients directly into 10-minute delivery apps.

### 1.3 North Star Metrics
1. **Cross-Platform Cart Export Success Rate:** % of users missing 1–3 items who click "Export Cart" and successfully open Blinkit/Zepto/Instamart deep-links ($\ge 42\%$).
2. **Recipe-to-Purchase Conversion Rate:** % of recipe detail views that trigger either immediate cooking or a missing item purchase ($\ge 35\%$).
3. **Time-to-Table Efficiency:** Average time saved per meal decision ($\le 90$ seconds from opening app to initiating recipe or order).
4. **Latency SLA:** Firestore multi-item ingredient matching queries returning results in $< 350\text{ ms}$.

---

## 2. USER PERSONAS & INTEGRATED USER JOURNEYS

### 2.1 Target Personas

#### Persona A: "Rohan (28, Software Engineer in Bengaluru)"
- **Behavior:** Works late hours, keeps basic pantry staples (Onions, Tomatoes, Paneer, Atta, Spices). Lacks specialty items like Cream, Kasuri Methi, or Coconut Milk.
- **Pain Point:** Wants home-cooked dinner but realizes mid-cooking that an essential ingredient is missing.
- **Goal:** Type what's in his fridge, get a recipe, and order missing cream on Blinkit in 1 click.

#### Persona B: "Priya (34, Working Parent in Gurgaon)"
- **Behavior:** Plans weekend family meals, manages household groceries across Instamart and Zepto.
- **Pain Point:** Wastes time looking up recipes, then building manual shopping lists across quick-commerce apps.
- **Goal:** Auto-generate recipe feeds with visual "4/5 ingredients present" badges and deep-link the missing 1 item.

### 2.2 Integrated User Journey Flowchart

\`\`\`
[1. Pantry Entry] ----> [2. Smart Matching Engine] ----> [3. Recipe Feed UI]
  - Tag input             - Indexed query / map check     - "100% Ready to Cook"
  - Hinglish synonyms     - Match % calculation           - "Missing 1-3 Items" badge
  - Category chips                                                 |
                                                                   v
[5. Order Delivery] <-- [4. Quick-Comm Bridge] <------------------+
  - 10-min delivery      - Platform Switch (Blinkit/Zepto/Instamart)
  - Cook meal            - Missing item brand selection
                         - 1-Click Deep-Link Payload Execution
\`\`\`

---

## 3. FUNCTIONAL REQUIREMENTS & USER STORIES

### EPIC 1: Inventory Management & Hinglish Synonym Engine
- **US-1.1 (Multi-Modal Inventory Input):** As a user, I can input ingredients via free-text tags, structured category chips, or conversational voice/text prompts so that my current kitchen state is accurately captured.
  - *Acceptance Criteria:*
    - Auto-completes Indian regional ingredient names (e.g. typing "Alu" tags "Potato / Alu", "Dhania" tags "Coriander / Dhania").
    - Supports category chips: Vegetables, Spices & Masalas, Dairy, Grains & Atta, Sauces & Oils.
    - Stores inventory in Firestore under user doc with offline local state fallback.

- **US-1.2 (Regional Culinary Synonym Mapping):** As a user in India, I can toggle Hinglish terms so that ingredient names match local kitchen terminology.
  - *Acceptance Criteria:*
    - Bi-directional lookup table mapping \`Alu\` $\leftrightarrow$ \`Potato\`, \`Tamatar\` $\leftrightarrow$ \`Tomato\`, \`Pyaz\` $\leftrightarrow$ \`Onion\`, \`Dahi\` $\leftrightarrow$ \`Curd\`, \`Atta\` $\leftrightarrow$ \`Wheat Flour\`.

---

### EPIC 2: Recipe Feed & Visual Matching UI
- **US-2.1 (Inventory Match Score Calculation):** As a user, I want recipes categorized by match percentage so that I know what I can cook immediately vs what requires ordering.
  - *Acceptance Criteria:*
    - **Green Badge:** "100% Match / Ready to Cook" when missing items $= 0$.
    - **Orange Badge:** "Missing $N$ Items ($1 \le N \le 3$)" highlighting exact missing items in orange.
    - Filters for Vegetarian, Cooking Time ($< 20\text{ min}$), and High Protein.

- **US-2.2 (Dynamic Serving Scaler):** As a user, I can scale recipe portions ($2, 4, 6, 8$ servings) so ingredient quantities and missing quick-comm item counts update automatically.

---

### EPIC 3: Smart Up-Sell & Quick-Comm Deep-Linking Engine
- **US-3.1 (1-Click Deep-Link Export):** As a user missing 1–3 items for a recipe, I can click "Buy Missing Items" to trigger a deep-link into Blinkit, Zepto, or Swiggy Instamart.
  - *Acceptance Criteria:*
    - Renders platform selector tabs (Blinkit, Zepto, Instamart) with live estimated delivery times ($8\text{–}12\text{ mins}$) and packaging/delivery fees.
    - Deep-link URI schemes generated:
      - **Blinkit:** \`blinkit://search?q=Amul+Fresh+Cream,Kasuri+Methi\`
      - **Zepto:** \`zepto://search?query=Amul+Fresh+Cream\`
      - **Swiggy Instamart:** \`swiggy://instamart/search?q=Amul+Fresh+Cream\`
    - Web URL fallback (\`https://blinkit.com/s/?q=...\`) if target mobile application is not installed.

- **US-3.2 (Item Substitute & Out-Of-Stock Fallback):** As a user, if a quick-comm item is out of stock, the app suggests a culinary substitute (e.g., Amul Fresh Cream $\rightarrow$ Home Malai + Milk ratio).

---

### EPIC 4: Context-Aware AI Cooking Assistant Chatbot
- **US-4.1 (Active Recipe & Pantry Aware Assistant):** As a user, I can open the embedded AI cooking copilot to ask real-time cooking questions, substitute advice, or step-by-step Hinglish instructions.
  - *Acceptance Criteria:*
    - System prompt automatically injects user's active inventory snapshot and selected recipe ID.
    - Provides instant quick-prompt chips: "Substitute missing items", "Scale for 6 guests", "Make less spicy", "Hinglish instructions".
    - Connected to server-side Gemini API (\`gemini-2.5-flash\`) with fallback domain response engine.

---

## 4. FIREBASE ARCHITECTURE & DATA SCHEMA (TECHNICAL)

### 4.1 Firestore Collection Topology

\`\`\`
/users/{userId}
  ├── profile: { name, phone, preferredPlatform: "blinkit", locationPincode: "560034" }
  └── inventory: {
        lastUpdated: Timestamp,
        items: [
          { ingredientId: "ing_101", name: "Onion", regionalName: "Pyaz", inStock: true },
          { ingredientId: "ing_102", name: "Paneer", regionalName: "Cottage Cheese", inStock: true }
        ]
      }

/recipes/{recipeId}
  ├── title: "Restaurant Style Paneer Butter Masala"
  ├── cuisine: "North Indian"
  ├── isVegetarian: true
  ├── prepTimeMinutes: 10
  ├── cookTimeMinutes: 20
  ├── ingredientMap: {
        "ing_101": { requiredQty: 2, unit: "medium", isCore: true },
        "ing_102": { requiredQty: 200, unit: "g", isCore: true },
        "ing_205": { requiredQty: 100, unit: "ml", isCore: false, quickCommBrand: "Amul Fresh Cream (250ml)", priceInr: 68 }
      }
  ├── ingredientIds: ["ing_101", "ing_102", "ing_205"]  // Array for array-contains-any
  └── instructions: [...]

/cart_exports/{exportId}
  ├── userId: "usr_8821"
  ├── recipeId: "rec_1"
  ├── platform: "blinkit"
  ├── missingItems: ["Amul Fresh Cream", "Kasuri Methi"]
  ├── totalEstimatedInr: 113
  ├── deepLinkTriggered: "blinkit://search?q=Amul+Fresh+Cream"
  └── timestamp: Timestamp
\`\`\`

### 4.2 Query Optimization Strategy
To prevent Firestore index explosion and high billing costs during multi-item matching:
1. **Client-Side Pre-Filtering via In-Memory Inverted Index:**
   - Recipes are cached locally using Firestore persistent cache.
   - Ingredient matching score calculated client-side over active inventory map ($\mathcal{O}(N \times M)$ where $N \le 50$ recipes and $M \le 20$ ingredients).
2. **Firestore Vector Embeddings (Optional Hybrid Search):**
   - For loose conversational queries (e.g. "something warm with lentils and ghee"), text embeddings generated via Gemini Pro are matched against recipe collection embeddings using Firestore Vector Search.

### 4.3 Chatbot Architecture (Firebase Cloud Functions + Gemini)

\`\`\`
[React Client Chatbot UI]
       │  (HTTPS POST /api/chat)
       ▼
[Express / Firebase Cloud Function] ──> Fetch user inventory from /users/{userId}/inventory
       │                            ──> Fetch recipe doc from /recipes/{recipeId}
       ▼
[Google GenAI SDK (gemini-2.5-flash)]
       │
       ▼
[Structured Assistant Output] ──> [Stream response back to Client UI]
\`\`\`

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Performance
- **Search & Match Latency:** $< 350\text{ ms}$ for initial recipe feed render.
- **Deep-Link Launch Latency:** Instantaneous ($< 100\text{ ms}$ CTA response).
- **App Bundle Size:** $< 180\text{ KB}$ gzipped frontend asset bundle.

### 5.2 Security & Isolation
- **Firebase Security Rules:** Strict user-level access isolation restricting write access to \`/users/{userId}\` only to authenticated owner (\`request.auth.uid == userId\`).
- **API Key Guard:** Gemini API keys kept exclusively on server-side Cloud Function / Express environment variables.

### 5.3 Localisation & Culinary Taxonomy
- Full support for Indian culinary vernacular, Hinglish ingredient synonyms, metric units (grams, kg, cups, tablespoons, whistle counts for pressure cookers).

---

## 6. EDGE CASES, RISKS & MITIGATIONS

| Risk / Edge Case | Consequence | Engineering Mitigation |
| :--- | :--- | :--- |
| **Quick-Comm Deep-Link Fails** | User app not installed, link breaks | Provide automatic web URL fallback (\`https://blinkit.com/s/?q=...\`) and copy-to-clipboard query payload. |
| **Ingredient Out-of-Stock on Blinkit** | User cannot purchase item | AI Chatbot automatically suggests in-kitchen substitute ratio (e.g. Malai + Milk for Fresh Cream). |
| **Runaway Firestore Read Costs** | High bills from frequent pantry updates | Implement local state batching & 15-minute Firestore query client caching layer. |
| **Regional Name Confusion** | "Brinjal" vs "Baingan" vs "Eggplant" | Centralized \`synonyms.json\` lookup dictionary mapping regional slang to standard ingredient IDs. |

---
*End of Engineering PRD Document.*
`;
