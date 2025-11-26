# Orbit Expenses Dashboard

Orbit Expenses is a supabase-backed React/Vite UI that lets you track spending, categorize transactions, and manage your dataset through a polished dashboard, category editor, icon manager, and import/export tooling.

## Features
- **Dashboard**: Pie chart + transaction table with filters for date range, amount, title, and category selection.
- **Expense management**: CRUD modals, quick-add row, and optimized Supabase sync with optimistic updates and rollback safeguards.
- **Category & icon control**: Create/edit/delete categories (with icon/color picker) plus an icon library that syncs to Supabase master tables.
- **Data tooling**: Import/export CSVs, download templates, reset the database, and seed initial data scripts.

## Architecture Summary
- **Frontend**: Vite + React 19, single-page `App.tsx` orchestrating layout, state, filters, and modals; composable UI atoms under `components/` (`ui`, `expenses`, `categories`, `charts`, `icons`).
- **Services**: `services/apiService.ts` wraps Supabase CRUD for `categories`, `expenses`, `master_icons`, and seeding logic; `supabaseClient.ts` configures the client to strip faulty `Authorization` headers; `storageService.ts` handles CSV import/export and local-storage fallbacks used only for tooling today.
- **Data layer**: Supabase (self-hosted at `http://bjk.ai:8000`) stores tables + master lookup tables; seed/cleanup scripts (`seed_categories.js`, `seed_expenses.js`, `cleanup.js`, `seed_expenses_playwright.js`) keep the DB populated during development.
- **Supporting assets**: Constants/types define category icons/colors/tw-helpers; `docs/` (to-be-created) hosts architecture/test/design guidance.

## Setup Instructions
1. Install dependencies: `npm install`.
2. Copy `.env.example` or create `.env.local` (see Environment Variables below).
3. Run `npm run dev` to launch http://localhost:5173.
4. Point the UI to the Supabase project defined by `SUPABASE_URL`/`SUPABASE_KEY` or override those values locally.

## Environment Variables
| Name | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Mentioned in original README for AI Studio; required if referencing Google Gemini in future (not used in source). |
| `SUPABASE_URL` | Override the default `http://bjk.ai:8000` if you run your own Supabase. |
| `SUPABASE_KEY` | Replace the hard-coded anon key when pointing at a new project (store outside git). |

If you run your own Supabase, mirror the configuration from `supabase/config.toml` so the API ports, auth, and extensions match.

## Supabase Setup Notes
- Tables referenced: `categories`, `expenses`, `master_icons`, `master_colors`. The column names follow the tRPC/SQL patterns shown in `services/apiService.ts` (foreign keys such as `category_id` and `icon_name`).
- Seed using `seed_categories.js` to populate master colors/icons/categories, then add expenses via the UI or `seed_expenses.js` (optionally via `seed_expenses_playwright.js` for Playwright-driven seeding).
- `cleanup.js` syncs the `master_icons` table to the icon list defined in `constants.tsx`.
- The Supabase client removes the `Authorization` header because the bundled anon token does not decode as JWT, so your custom project may not need that hack.

## Development Workflow
1. Pull/checkout `main`. `npm install` to bring dependencies.
2. Run Supabase locally (per `supabase/config.toml`) or point to the provided self-hosted URL.
3. Run `npm run dev` and use the console (browser) to exercise expense/category flows + Settings actions (import/export/reset).
4. When modifying categories/icons, keep `constants.tsx` and `seed` scripts in sync with any new master records referenced in Supabase.
5. Update docs under `docs/` to keep architecture/design/test notes current.

## Known Issues & Warnings
- The repo contains empty backend placeholders (`backend/*.py`) and a corrupted `schema.sql`, so schema definitions rely on seed scripts—copy/paste the SQL yourself before running migrations.
- Supabase anon key and URL are hard-coded; rotate them if you migrate to your own project and keep secrets outside git.
- The CSV import is sequential and alert-based; large files may be slow and cancel without cleanup.
- Error handling is mostly `alert`/`console.error`, so UX is not resilient to network outages or Supabase rate limits.

## Docs
- [Architecture Deep Dive](docs/ARCHITECTURE.md)
- [Design Notes & Cleanup Plan](docs/DESIGN_NOTES.md)
- [Test Plan](docs/TEST_PLAN.md)
- [Repository Cleanup TODO](docs/CLEANUP_TODO.md)

