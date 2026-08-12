# Teapp

A tea collection tracker — searchable database, flavor chart, brewing wiki, and teahouse community features.

## Tech Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres, Auth, RLS)
- Zustand for state management
- Recharts for scatter chart
- Framer Motion for animations

## Getting Started

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # production build
```

## Features

### Tea Database
- 100+ default teas with brewing params, flavor profiles, and characteristics
- Filter by type, status (have/tried/empty), source (default/teahouse/mine)
- Sort by name, type, or personal rating
- Expandable rows with inline brewing data
- Users can add custom teas (stored with `source_type='user'`)

### Dashboard
- Scatter chart plotting teas on a flavor grid (fresh→roasted × bitter→sweet)
- Dot size reflects collection status (have = large, tried = medium, empty = small)
- Bubble pop-out/pop-in animation when toggling "My Collection" view
- Search and type filter pills

### Tea Detail Modal
- Full brewing instructions, characteristics, health benefits, flavor coordinates
- Editable by tea owner or admin (uses `displayTea = savedTea || tea` pattern for instant UI update)
- Personal rating logging with notes
- Community ratings for teahouse teas (see below)

### Wiki
- Brewing styles (Gongfu, Western, Cold Brew, Grandpa Style)
- Pouring techniques
- Tea accessories (Gaiwan, Yixing teapot, Chahei, tea pet, and more)
- Tea types and processing (green, black, oolong, white, pu-erh, yellow)
- Staggered card animations

### Community Ratings

Teahouse owners can see aggregate ratings for their published teas. Individual ratings are never exposed — only the average and count.

- **RPC:** `get_tea_rating_stats(tea_slug)` — `SECURITY DEFINER` function that computes `AVG(rating)` and `COUNT(*)` from `tea_logs`
- **Threshold:** Minimum 3 ratings required to display
- **Visibility:** Only approved teahouses viewing their own teas
- **SQL:** See `scripts/add-rating-stats-rpc.sql`

### Settings
- 12 accent colors with animated color flow transition
- Theme support (cozy-dark default)

## Supabase Setup

### Tables
- `teas` — unified tea table (`source_type`: default | user | teahouse)
- `user_teas` — collection status per user
- `tea_logs` — tasting ratings and notes
- `profiles` — user profiles with teahouse enrollment

### Migrations
Apply SQL scripts in `scripts/` to your Supabase project:
```bash
# Via Supabase Dashboard SQL Editor or psql
psql -h <pooler> -U postgres.<project-ref> -d postgres -f scripts/add-rating-stats-rpc.sql
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Dashboard (scatter chart)
│   ├── database/page.tsx # Tea database (filters, list)
│   ├── wiki/page.tsx     # Tea wiki
│   ├── settings/page.tsx # Settings (accent colors)
│   ├── add/page.tsx      # Add custom tea
│   ├── admin/page.tsx    # Admin panel
│   └── layout.tsx        # Root layout
├── components/
│   ├── TeaDetailModal.tsx
│   ├── NavBar.tsx
│   ├── AuthGate.tsx
│   └── StatusCheckbox.tsx
├── lib/
│   ├── types.ts          # Tea interface, constants
│   ├── store.ts          # Zustand store
│   ├── supabaseClient.ts
│   └── profiles.ts
└── data/
    └── wikiData.ts       # Wiki content
```