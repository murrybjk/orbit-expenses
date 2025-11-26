# Design Decisions & Technical Risk Notes

## Key Decisions
- **Single SPA with service encapsulation**: `App.tsx` is the orchestrator while `services/apiService.ts`, `services/storageService.ts`, and `services/supabaseClient.ts` shield Supabase details and CSV logic. This keeps Supabase queries centralized and simplifies component testing.
- **Optimistic UI workflows**: Expense/category mutations update local state before awaiting Supabase responses, then roll back on failure. It keeps the UI snappy but depends on explicit error handling (`alert`, `console.error`).
- **Icon master table synchronization**: Before any category save, `ApiService.ensureIconExists` upserts into `master_icons`. This prevents FK violations after users select icons that may not yet exist in Supabase.
- **Seed/cleanup scripts**: Seeds defined in `seed_categories.js`, `seed_expenses.js`, and `cleanup.js` drive table state, while `seed_expenses_playwright.js` shows that non-API seeding (Playwright automation) is used when direct inserts fail.

## Risks & Smells
- **Hard-coded secrets & URLs**: The Supabase URL/anon key live inside several files (`services/supabaseClient.ts`, `seed_*.js`, `cleanup.js`). Rotating credentials or pointing to another project causes repeated edits, and keys bundled in git are a security risk.
- **Corrupted schema/backend placeholders**: `schema.sql` is binary garbage, and `backend/*.py` files are empty. Without usable migrations or API servers, replicating the schema on a fresh environment depends purely on the seed scripts.
- **Tightly coupled `App.tsx`**: The component now exceeds 300 lines, handling data fetching, filters, cards, modals, and Settings. Splitting logic into hooks/contexts would reduce regression risk and clarify responsibilities.
- **CSV import fragility**: Imports process each row sequentially and rely on alerts/`confirm`. Failed imports leave partial data in Supabase without transactions.
- **Minimal error handling**: Most supabase failures log to console and show `alert` dialogues; there is no toast/system for recoveries, raising UX risk on network drops or permission errors.

## Technical Debt
1. **Secret management**: Replace inlined Supabase keys with environment variables (`SUPABASE_URL`, `SUPABASE_KEY`) for every script and service file; add `.env.example`.
2. **Document schema/migrations**: Rebuild `schema.sql` (dump from Supabase) and populate `backend/` or a `supabase/migrations` folder so schema changes are versioned.
3. **Component refactor**: Move filtering/expense logic into smaller hooks (e.g., use `useExpenses` for fetch + filters) and extract the Settings card into its own component.
4. **CSV import batching**: Debounce sequential API calls or implement a bulk upload endpoint/function to avoid partial imports.
5. **Testing**: Implement unit tests for services + integration tests for `App` flows (see `docs/TEST_PLAN.md`). No automated tests exist yet.

## Cleanup Plan (preliminary)
- Remove unused backend artifacts or fill them with actual API code, depending on future roadmap.
- Regenerate `schema.sql` from Supabase or SQL migrations, and check in cleaned SQL.
- Add `docs/ARCHITECTURE.md` (done), `docs/DESIGN_NOTES.md` (you are here), `docs/TEST_PLAN.md`, and `docs/CLEANUP_TODO.md` (pending) to capture knowledge and to-do items.
- Centralize common constants (icons/colors) to keep seeds/migrations synchronized with `constants.tsx`.

