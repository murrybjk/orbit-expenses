# Architecture Deep Dive & System Map

## Overview
Orbit Expenses is a front-end first application. The entire experience runs within Vite/React and communicates with a self-hosted Supabase backend. To handle CORS issues inherent to the self-hosted setup, the application uses a Vite proxy during development.

## Component Map
## Component Map
- **`App.tsx`**: The main layout orchestrator. It uses custom hooks (`useOrbitData`, `useOrbitFilters`) to manage state and logic, keeping the view layer clean. It handles view switching (Dashboard, Transactions, Trends, etc.) and modal coordination.
- **`hooks/useOrbitData.ts`**: Manages all API interactions (CRUD) and state for expenses and categories. Handles optimistic updates and error handling.
- **`hooks/useOrbitFilters.ts`**: Manages filtering state (date, category, amount) and derived data (chart data, trends, totals).
- **`components/expenses/ExpensesTable.tsx`**: Renders sorting/filtering controls, quick-add, and action buttons.
- **`components/expenses/ExpenseForm.tsx`**: Handles the create/edit form, including the category dropdown and amount/date/notes inputs.
- **`components/categories/CategoryManager.tsx`**: Shows all categories with delete/edit hooks.
- **`components/charts/*`**: Visualization components (Pie, Trends, Matrix, Flash) derived from filtered data.
- **`components/ui/*`**: Reusable UI atoms (Cards, Buttons, Inputs, Modals, DateRangeControl, Toast).

## Services & Data Flow
- **`services/supabaseClient.ts`**: Wraps `createClient` and handles proxy URL resolution for self-hosted instances.
- **`services/apiService.ts`**: Exposes raw API methods for Supabase interactions (CRUD, cascading deletes, reset).
- **`services/storageService.ts`**: Handles CSV import/export.
- **`hooks/useOrbitData.ts`**: The primary data layer. Fetches initial data via `ApiService` and exposes methods like `addExpense`, `updateExpense`, etc.

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


