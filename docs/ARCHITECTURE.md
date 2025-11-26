# Architecture Deep Dive & System Map

## Overview
Orbit Expenses is a front-end first application. The entire experience runs within Vite/React and communicates directly with a Supabase backend via a shared client wrapper. There is no dedicated Node/Python backend beyond placeholder files, so the application relies on Supabase tables (`categories`, `expenses`, `master_icons`, `master_colors`) plus seeding scripts to define its data model.

## Component Map
- `App.tsx` is the single entry point. It manages: data fetching, modals (expense/category), filters (title, amount, date, category), dashboard/table toggling, settings actions (CSV import/export, reset), and orchestrates child components.
- `components/expenses/ExpensesTable.tsx` renders sorting/filtering controls, quick-add, and action buttons that bubble up to `App.tsx` handlers (`onEdit`, `onDelete`, `onAdd`).
- `components/expenses/ExpenseForm.tsx` handles the create/edit form, including the category dropdown (portal + hover behavior) and amount/date/notes inputs.
- `components/categories/CategoryManager.tsx` shows all categories with delete/edit hooks; `components/categories/CategoryForm.tsx` manages icon/color selection and preview before saving.
- `components/charts/CategoryChart.tsx` renders the pie chart + legend derived from filtered expenses and lets users toggle categories via chart slice clicks.
- `components/icons/IconLibrary.tsx` displays the master icon list pulled from Supabase, lets devs add missing icons (writes back using `ApiService.addMasterIcon`).
- `components/ui/*` provide atoms (Cards, Buttons, Inputs, Modals, DateRangeControl) used throughout.

## Services & Data Flow
- `services/supabaseClient.ts` wraps `createClient`, pointing at the self-hosted URL (`http://bjk.ai:8000`) and deleting the outgoing `Authorization` header because the bundled anon key is not a JWT.
- `services/apiService.ts` exposes: icon list retrieval, icon upsert (ensures master table entries before categories reference them), category CRUD, expense CRUD, cascading deletes, and database resetting/seeding.
- `services/storageService.ts` handles CSV import/export, template download, and local storage fallbacks (used only inside Settings and for CSV parsing).
- `App.tsx` fetches categories and expenses via `ApiService.getCategories()/getExpenses()` on mount, then keeps client-local state in sync for visuals.

**Data flow path (input → processing → output)**
1. **Initial load**: `App.tsx` calls `ApiService.getCategories()` & `getExpenses()` → `services/apiService.ts` queries Supabase → data sticks in React state for dashboards, tables, forms.
2. **Expense CRUD**: `App.tsx` dispatches handlers to `ApiService.createExpense/updateExpense/deleteExpense` → optimistic UI updates + rollback on failure → Supabase confirms change.
3. **Category CRUD**: `CategoryForm` posts to `App.tsx` → `ApiService.createCategory/updateCategory` ensures icons exist in `master_icons` before writing to `categories` → table updates for forms/charts.
4. **Icon sync**: `IconLibrary` invokes `ApiService.getAvailableIcons` → displays active icons; `ApiService.addMasterIcon` inserts missing entries back into Supabase.
5. **CSV import/export**: `StorageService.parseCSV` reads file, maps rows to categories, returns `Expense[]`; `App.tsx` iterates and calls `ApiService.createExpense` per row, then refetches state.
6. **Reset flow**: Settings button calls `ApiService.resetDatabase` → deletes tables, runs seeding functions, re-fetches data for UI.

## Supabase Table Dependencies
- `master_icons`/`master_colors`: lookups used by categories and icon manager. `ApiService.ensureIconExists` writes to `master_icons` before a category entry is saved, avoiding FK issues.
- `categories`: stores id/label/color_name/icon_name. Colors resolved using `AVAILABLE_COLORS` map to translate hex to names for foreign tables.
- `expenses`: stores title/amount/date/category_id/note. Foreign key correlates to `categories.id`.
- The seed scripts (`seed_categories.js`, `seed_expenses.js`, `cleanup.js`) rely on column names above.

## System Map Summary
- **Frontend (Vite/React)** → view/controller logic inside `App.tsx` + form/modal components.
- **Service layer** → `services/apiService.ts` (Supabase client, seeding, migrations) + `storageService.ts` (local CSV tooling).
- **Data store** → Supabase (self-hosted `http://bjk.ai:8000`), plus `docs` for manual migrations/notes.

## Dependencies & Tooling
- `React 19`, `Vite 6`, `TypeScript 5.8`, `Recharts`, `lucide-react` for icons, `@supabase/supabase-js` client, `playwright` for optional seeding scripts.
- No backend server code beyond placeholder `backend/*.py`; Supabase handles persistence and API surface.

## Access Patterns
- API requests originate directly from the browser and are not proxied by a Node backend, so CORS and auth policies are enforced inside Supabase.
- CSV import (Settings) uses `FileReader` and sequential `ApiService.createExpense` calls, so large imports may take time but can be interrupted without rollback.

