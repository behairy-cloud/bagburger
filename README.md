# 🍔 BAG BURGER

A premium burger restaurant ordering platform built with React. Customers can browse the menu, customize their order, and submit orders with payment screenshots. Staff can manage orders and menu items through an admin dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Framer Motion, Recharts |
| **Styling** | Tailwind CSS 4, custom design system |
| **Backend** | Supabase (PostgreSQL, Storage, Auth) |
| **Charts** | Recharts (admin analytics) |
| **Deployment** | Cloudflare Pages (via Wrangler) |

## Features

- **Digital Menu** — Categorized product listing with images, prices, and labels (best-seller, spicy, new, combo)
- **Shopping Cart** — Add/remove items, quantity stepper, sticky cart bar
- **Checkout Flow** — Customer info form → payment details with transfer number → screenshot upload → order confirmation
- **Admin Dashboard** — Real-time order management with status updates, menu editor with visibility toggles, analytics dashboard with revenue/refund/top-products charts, staff management
- **Bilingual** — Arabic-first UI with RTL layout
- **Responsive** — Mobile-first responsive design
- **SEO** — Structured data (Schema.org Restaurant), Open Graph tags, sitemap.xml

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL (inlined into client bundle) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key (inlined into client bundle) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for seed scripts only (never inlined) |

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Database

Supabase PostgreSQL with the following tables:

- **menu_items** — Products with category, price, image, visibility, sort order
- **orders** — Customer orders with items, status, payment screenshot
- **Storage buckets** — `order-screenshots`, `menu-item-images`, `staff-images`

Migrations are in `supabase/migrations/`.

### Seed Data

Generate sample products and orders for development:

```bash
node --env-file=.env.local seed-orders.mjs
```

## Project Structure

```
bagburger/
├── public/                  # Static assets (images, robots.txt, sitemap.xml)
├── src/
│   ├── components/          # React components
│   │   └── ui/              # Reusable UI primitives
│   ├── hooks/               # Custom React hooks
│   ├── js/                  # Core logic
│   │   ├── products.js      # Product catalog data
│   │   ├── menu-store.js    # Supabase menu CRUD
│   │   ├── menu-images.js   # Menu image management
│   │   ├── supabase.js      # Supabase client setup
│   │   ├── supabase-auth.js # Auth utilities
│   │   ├── storage.js       # Unified storage (Supabase + localStorage)
│   │   ├── staff-store.js   # Staff management
│   │   ├── image-resize.js  # Client-side image processing
│   │   └── motion.js        # Animation variants
│   ├── lib/                 # Utilities
│   │   └── utils.js         # cn() helper (clsx + tailwind-merge)
│   ├── styles.css           # Global styles & design tokens
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── supabase/
│   └── migrations/          # Database migrations
├── .env.example             # Environment variable template
├── components.json          # shadcn/ui configuration
├── vite.config.js           # Vite configuration
└── wrangler.jsonc           # Cloudflare Pages configuration
```

## Deployment

The site is deployed to Cloudflare Pages:

```bash
npm run build
npx wrangler pages deploy dist --branch production
```

Or configure `wrangler.jsonc` and use:

```bash
npx wrangler deploy
```

## Admin Access

Append `#admin-7x9q2p` to the URL to access the admin dashboard.

## License

All rights reserved.
