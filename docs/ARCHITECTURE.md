# Architecture Deep Dive & System Map

## Overview
Orbit Expenses is a front-end first application. The entire experience runs within Vite/React and communicates with a self-hosted Supabase backend. To handle CORS issues inherent to the self-hosted setup, the application uses a Vite proxy during development.

## Component Map
- `App.tsx` is the single entry point. It manages: data fetching, modals (expense/category), filters (title, amount, date, category), dashboard/table toggling, settings actions (CSV import/export, reset), and orchestrates child components.
- `components/expenses/ExpensesTable.tsx` renders sorting/filtering controls, quick-add, and action buttons that bubble up to `App.tsx` handlers (`onEdit`, `onDelete`, `onAdd`).
- `components/expenses/ExpenseForm.tsx` handles the create/edit form, including the category dropdown (portal + hover behavior) and amount/date/notes inputs.
- `components/categories/CategoryManager.tsx` shows all categories with delete/edit hooks; `components/categories/CategoryForm.tsx` manages icon/color selection and preview before saving.
- `components/charts/CategoryChart.tsx` renders the pie chart + legend derived from filtered expenses and lets users toggle categories via chart slice clicks.
- `components/icons/IconLibrary.tsx` displays the master icon list pulled from Supabase.
- `components/ui/*` provide atoms (Cards, Buttons, Inputs, Modals, DateRangeControl, Toast) used throughout.

## Services & Data Flow
- `services/supabaseClient.ts` wraps `createClient`. It detects if the `VITE_SUPABASE_URL` is a relative path (like `/supaproxy`) and resolves it to an absolute URL for the Supabase client. It also manages header manipulation to ensure compatibility with the self-hosted instance.
- `services/apiService.ts` exposes: icon list retrieval, category CRUD, expense CRUD, cascading deletes, and database resetting.
- `services/storageService.ts` handles CSV import/export and template download.
- `App.tsx` fetches categories and expenses via `ApiService.getCategories()/getExpenses()` on mount, then keeps client-local state in sync for visuals.

**Data flow path (input → processing → output)**
1. **Initial load**: `App.tsx` calls `ApiService.getCategories()` & `getExpenses()` → `services/apiService.ts` queries Supabase (via Proxy) → data sticks in React state for dashboards, tables, forms.
2. **Expense CRUD**: `App.tsx` dispatches handlers to `ApiService.createExpense/updateExpense/deleteExpense` → optimistic UI updates + rollback on failure → Supabase confirms change.
3. **Category CRUD**: `CategoryForm` posts to `App.tsx` → `ApiService.createCategory/updateCategory` ensures icons exist in `master_icons` before writing to `categories` → table updates for forms/charts.
4. **CSV import/export**: `StorageService.parseCSV` reads file, maps rows to categories, returns `Expense[]`; `App.tsx` iterates and calls `ApiService.createExpense` per row, then refetches state.
5. **Reset flow**: Settings button calls `ApiService.resetDatabase` → deletes tables, re-fetches data for UI.

## Supabase Table Dependencies
- `master_icons`/`master_colors`: lookups used by categories and icon manager.
- `categories`: stores id/label/color_name/icon_name.
- `expenses`: stores title/amount/date/category_id/note. Foreign key correlates to `categories.id`.
- **Migrations**: The database schema and initial data are managed via SQL scripts in `supabase/migrations/`.

## System Map Summary
- **Frontend (Vite/React)** → view/controller logic inside `App.tsx` + form/modal components.
- **Service layer** → `services/apiService.ts` (Supabase client) + `storageService.ts` (CSV tooling).
- **Data store** → Supabase (self-hosted), accessed via `/supaproxy` in dev.

## Dependencies & Tooling
- `React 19`, `Vite 6`, `TypeScript`, `Recharts`, `lucide-react` for icons, `@supabase/supabase-js` client.
- **No Backend Code**: The `backend/` directory has been removed. All logic resides in the frontend or Supabase.

## Access Patterns
- API requests are proxied through Vite (`/supaproxy`) to avoid CORS errors when connecting to the self-hosted Supabase instance.
- Authentication is handled via the `VITE_SUPABASE_ANON_KEY`.


