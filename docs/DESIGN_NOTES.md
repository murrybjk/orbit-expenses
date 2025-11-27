# Design Decisions & Technical Risk Notes

## Key Decisions
- **Single SPA with service encapsulation**: `App.tsx` is the orchestrator while `services/apiService.ts`, `services/storageService.ts`, and `services/supabaseClient.ts` shield Supabase details and CSV logic. This keeps Supabase queries centralized and simplifies component testing.
- **Optimistic UI workflows**: Expense/category mutations update local state before awaiting Supabase responses, then roll back on failure. It keeps the UI snappy.
- **SQL-based Migrations**: Database schema and initial data are managed via SQL scripts in `supabase/migrations/` rather than fragile JS seed scripts.
- **Proxy for Self-Hosted Supabase**: To bypass CORS restrictions inherent to the self-hosted setup, a Vite proxy (`/supaproxy`) is used during development.
- **Environment Variables**: All sensitive credentials and URLs are managed via `.env` files, preventing hardcoded secrets in the codebase.

## Risks & Smells
- **Tightly coupled `App.tsx`**: The component exceeds 400 lines, handling data fetching, filters, cards, modals, and Settings. Splitting logic into hooks/contexts would reduce regression risk and clarify responsibilities.
- **CSV import fragility**: Imports process each row sequentially. Failed imports leave partial data in Supabase without transactions.

## Technical Debt / Future Improvements
1. **Component refactor**: Move filtering/expense logic into smaller hooks (e.g., use `useExpenses` for fetch + filters) and extract the Settings card into its own component.
2. **CSV import batching**: Debounce sequential API calls or implement a bulk upload endpoint/function to avoid partial imports.
3. **Testing**: Implement unit tests for services + integration tests for `App` flows (see `docs/TEST_PLAN.md`). No automated tests exist yet.

## Completed Improvements
- **Secret management**: Replaced inlined Supabase keys with environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- **Schema/migrations**: Created proper SQL migration files for schema, data, and RLS policies.
- **Error Handling**: Replaced `alert()` calls with a robust Toast notification system and added a global `ErrorBoundary` to catch runtime crashes.
- **Cleanup**: Removed obsolete backend code and unused seed scripts.


