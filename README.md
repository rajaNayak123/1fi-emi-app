# 1Fi SDE1 Assignment — EMI Product Catalog

A full-stack app that shows smartphones with multiple EMI plans backed by mutual
funds. Product info, pricing, variants, and EMI plans are all served dynamically
from a database via a REST API — nothing is hardcoded in the frontend.

**Live demo:** _add your deployed link here after deploying (see [Deployment](https://frontend-five-murex-82.vercel.app/))_
**Demo video:** _add your Google Drive / YouTube link here_

---

## Tech stack

| Layer     | Choice                                                                 |
|-----------|-------------------------------------------------------------------------|
| Frontend  | React 18 (Vite), React Router, Tailwind CSS                            |
| Backend   | Node.js, Express                                                        |
| Database  | MongoDB via Mongoose ODM                                                |

---

## Project structure

```
1fi-emi-app/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── config/db.js           # MongoDB (Mongoose) connection configuration
│   ├── controllers/           # Request handlers (productController.js)
│   ├── middleware/            # Custom middleware (notFound.js, errorHandler.js)
│   ├── models/                # Mongoose schemas: Product, Variant, EmiPlanTemplate, Order
│   ├── routes/products.js     # Express routes mapped to controllers
│   ├── services/              # Business logic & DB queries (productService.js)
│   ├── seed.js                # Seeds 3 products, variants, EMI plan templates
│   └── utils/emi.js           # EMI math (reducing-balance formula)
└── frontend/
    ├── src/
    │   ├── pages/ProductList.jsx     # Catalog grid  ("/")
    │   ├── pages/ProductDetail.jsx   # Product page  ("/products/:slug")
    │   ├── components/VariantSelector.jsx
    │   ├── components/EmiPlanCard.jsx
    │   └── lib/api.js                # fetch wrapper for the backend API
    └── vite.config.js                # dev-time proxy of /api -> backend
```

---

## Setup and run instructions

Requires Node.js 18+ and a MongoDB instance (local or Atlas).

### 0. Get a MongoDB connection

Pick one:
- **Local MongoDB** — install and run `mongod` (default URI `mongodb://127.0.0.1:27017/emi_store`
  already matches `backend/.env.example`, no extra config needed).
- **MongoDB Atlas (free tier, no local install)** — create a free cluster at
  [mongodb.com/atlas](https://www.mongodb.com/atlas), grab its connection string, and set it as
  `MONGODB_URI` in `backend/.env`.

### 1. Backend

```bash
cd backend
cp .env.example .env    # edit MONGODB_URI if you're using Atlas instead of local MongoDB
npm install
npm run seed             # connects to MongoDB and inserts 3 products, variants, EMI plans
npm start                # runs on http://localhost:4000
```

Re-run `npm run seed` any time to reset the catalog back to its original state
(it's idempotent — it clears and re-inserts every collection).

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev       # runs on http://localhost:5173
```

The Vite dev server proxies any `/api/*` request to `http://localhost:4000`
(see `frontend/vite.config.js`), so the frontend "just works" against the
local backend with no extra configuration. Open **http://localhost:5173**.

### 3. Production build (frontend)

```bash
cd frontend
npm run build      # outputs static files to frontend/dist
npm run preview    # serve the build locally to sanity-check it
```

---

## Database schema (MongoDB / Mongoose)

Four collections, each defined as a Mongoose schema in `backend/models/`:

```js
// products — one document per catalog item
{
  slug:        String,   // unique, used in the URL: /products/:slug
  name:        String,
  brand:       String,
  category:    String,   // default "smartphone"
  description: String,
  badge:       String,   // e.g. "NEW", "BESTSELLER"
  createdAt, updatedAt   // via { timestamps: true }
}

// variants — purchasable SKUs of a product (storage or color), each with its own price
{
  product:     ObjectId,  // ref "Product"
  variantType: String,    // "storage" | "color"
  label:       String,    // "256GB" | "Cosmic Orange"
  swatchHex:   String,    // for color-swatch UI, nullable
  mrp:         Number,    // ₹, before discount
  price:       Number,    // ₹, selling price
  imageUrl:    String,
  stock:       Number,    // default 25
  isDefault:   Boolean
}

// emiPlanTemplates — EMI options offered per product. The monthly amount is
// NOT stored — it's computed from the selected variant's live price using the
// standard reducing-balance EMI formula, so it always reflects real pricing data.
{
  product:         ObjectId,  // ref "Product"
  tenureMonths:    Number,
  interestRate:    Number,    // annual %, 0 = interest-free
  cashbackAmount:  Number,
  fundPartner:     String,    // default "Nifty 50 Index Fund"
  isRecommended:   Boolean
}

// orders — created when a user taps "Proceed with this plan"
{
  product:        ObjectId,  // ref "Product"
  variant:        ObjectId,  // ref "Variant"
  plan:           ObjectId,  // ref "EmiPlanTemplate"
  monthlyAmount:  Number,
  tenureMonths:   Number,
  status:         String,    // default "PENDING_APPROVAL"
  createdAt, updatedAt
}
```

All API responses transform `_id` → `id` (string) and drop Mongoose's `__v`
via a shared `toJSON` option (`backend/models/schemaOptions.js`), so the
frontend never deals with raw ObjectId objects.

Seed data ships with **3 products**, each with **2–3 variants**, and **7 EMI
plan templates** per product (3/6/12/24 months at 0% interest, 36/48/60 months
at 10.5%) — mirroring the reference design in the assignment PDF.

---

## API endpoints and example responses

Base URL (local): `http://localhost:4000/api`

### `GET /api/health`
```json
{ "status": "ok", "service": "1fi-emi-backend" }
```

### `GET /api/products`
List every product with its default variant and starting price.

```json
{
  "count": 3,
  "products": [
    {
      "slug": "iphone-17-pro",
      "name": "iPhone 17 Pro",
      "brand": "Apple",
      "category": "smartphone",
      "badge": "NEW",
      "variantCount": 3,
      "startingPrice": 127400,
      "startingMrp": 134900,
      "image": "https://placehold.co/600x600/3b3a3e/ffffff?text=iPhone%2017%20Pro%20256GB"
    }
  ]
}
```

> IDs below are MongoDB ObjectIds (24-char hex strings) — the exact values in
> your instance will differ from this example on every fresh `npm run seed`.

### `GET /api/products/:slug`
Full product detail: all variants plus computed EMI plans for the selected
(or default) variant. Pass `?variantId=<id>` to price a specific variant.

```
GET /api/products/iphone-17-pro
```
```json
{
  "slug": "iphone-17-pro",
  "name": "iPhone 17 Pro",
  "brand": "Apple",
  "description": "Titanium design, A19 Pro chip, and the most advanced Pro camera system yet.",
  "badge": "NEW",
  "variants": [
    { "id": "6600a1...e1", "type": "storage", "label": "256GB", "mrp": 134900, "price": 127400, "imageUrl": "...", "inStock": true, "isDefault": true },
    { "id": "6600a1...e2", "type": "storage", "label": "512GB", "mrp": 154900, "price": 146900, "imageUrl": "...", "inStock": true, "isDefault": false },
    { "id": "6600a1...e3", "type": "storage", "label": "1TB",   "mrp": 174900, "price": 165900, "imageUrl": "...", "inStock": true, "isDefault": false }
  ],
  "selectedVariantId": "6600a1...e1",
  "emiPlans": [
    { "id": "6600a1...f1", "tenureMonths": 3,  "interestRate": 0,    "cashback": 7500, "monthlyAmount": 42467, "totalPayable": 127401, "isRecommended": false },
    { "id": "6600a1...f2", "tenureMonths": 6,  "interestRate": 0,    "cashback": 7500, "monthlyAmount": 21233, "totalPayable": 127398, "isRecommended": false },
    { "id": "6600a1...f3", "tenureMonths": 12, "interestRate": 0,    "cashback": 7500, "monthlyAmount": 10617, "totalPayable": 127404, "isRecommended": true  },
    { "id": "6600a1...f4", "tenureMonths": 24, "interestRate": 0,    "cashback": 7500, "monthlyAmount": 5308,  "totalPayable": 127392, "isRecommended": false },
    { "id": "6600a1...f5", "tenureMonths": 36, "interestRate": 10.5, "cashback": 7500, "monthlyAmount": 4141,  "totalPayable": 149076, "isRecommended": false },
    { "id": "6600a1...f6", "tenureMonths": 48, "interestRate": 10.5, "cashback": 7500, "monthlyAmount": 3262,  "totalPayable": 156576, "isRecommended": false },
    { "id": "6600a1...f7", "tenureMonths": 60, "interestRate": 10.5, "cashback": 7500, "monthlyAmount": 2738,  "totalPayable": 164280, "isRecommended": false }
  ]
}
```

### `GET /api/products/:slug/emi?variantId=2`
Just the EMI plans, re-priced for a given variant (used when switching
storage/color on the product page without refetching everything).

```json
{ "variantId": "6600a1...e2", "price": 146900, "emiPlans": [ /* same shape as above */ ] }
```

### `POST /api/products/:slug/checkout`
"Proceed with this plan." Body: `{ "variantId": "6600a1...e1", "planId": "6600a1...f3" }`.
Creates a document in the `orders` collection.

```json
{
  "orderId": "6600a2...9c",
  "status": "PENDING_APPROVAL",
  "message": "Your EMI plan request has been submitted for approval.",
  "monthlyAmount": 10617,
  "tenureMonths": 12
}
```

---

## Deployment

The repo is ready to deploy as-is:

**Database (MongoDB Atlas — free tier):**
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Add a database user and allow network access from anywhere (0.0.0.0/0) for
   simplicity, or from your host's specific IP for tighter security.
3. Copy the connection string — you'll use it as `MONGODB_URI` below.

**Backend (Render — "Web Service"):**
1. Root directory: `backend`
2. Build command: `npm install`
3. Start command: `npm run seed && npm start` (seeds on every boot so the
   demo always has data — drop `npm run seed &&` once you don't want resets)
4. Environment variable: `MONGODB_URI` = your Atlas connection string

**Frontend (Vercel):**
1. Root directory: `frontend`
2. Build command: `npm run build`, output directory: `dist`
3. Set the environment variable `VITE_API_URL` to your deployed backend's
   `/api` URL, e.g. `https://your-backend.onrender.com/api`.

After deploying, update the two placeholder links at the top of this README.

---

## A note on testing

The backend was fully run and exercised (all four endpoints, including a
real `POST /checkout` writing a document) during development. When the
database layer was switched from SQLite to MongoDB, this sandboxed
environment turned out to have no path to a running MongoDB instance —
there's no `mongodb-org` package in the Ubuntu repos, no Docker, and the
outbound network policy blocks MongoDB's own binary-download host (verified
by trying `mongodb-memory-server`, which failed to fetch its embedded
`mongod` binary). So this version of the backend is syntax-checked and
carefully reviewed line-by-line, but not run end-to-end against a live
Mongo instance the way the SQLite version was.

To confirm it works before you rely on it, run through [Setup](#setup-and-run-instructions)
locally with either a local `mongod` or a free Atlas cluster — it should take
a few minutes. If anything doesn't behave as documented, the most likely
culprits are worth checking first: `MONGODB_URI` reachability and the
Node/Mongoose version installed by `npm install`.

---


