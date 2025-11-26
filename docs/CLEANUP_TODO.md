# Cleanup & Stabilization TODO

## Immediate Actions
1. **Regenerate `schema.sql`** from Supabase (dump `public` schema) and replace the corrupted file. Document the schema version and table definitions so new environments can spin up without seeding hacks.
2. **Fill or remove `backend/` placeholders**. Either link them to Supabase helpers (if you're adding a backend) or remove the unused directory to avoid confusion.
3. **Introduce `.env.example` and env usage** for Supabase credentials (`SUPABASE_URL`, `SUPABASE_KEY`, optional `GEMINI_API_KEY`). Update `services/*.ts` and `seed_*.js` to read from `process.env` and add instructions to README.
4. **Centralize icon/color metadata** by exporting shared objects used in `constants.tsx`, seeds, and cleanup scripts. This prevents divergent master data.

## Mid-term Improvements
5. **Refactor `App.tsx`**: extract `useExpensesFilters`, `useCategoryManager`, or move Settings logic into its own component to reduce cognitive load and make the component testable.
6. **Add automated tests** per `docs/TEST_PLAN.md`: start with unit tests for services followed by React Testing Library coverage of `App` and at least one Playwright E2E scenario.
7. **Batch/create endpoints for bulk imports**: replace the sequential CSV import loop with a backend function (maybe Supabase function or serverless) that handles multiple rows in one request.

## Clean-up Recap
- Remove unused scripts or mark them as deprecated if they only target one deployment.
- Ensure `supabase/config.toml` explicitly references schema and seed paths (migrations + seeds), and store actual SQL/seed files under `supabase/` so the Supabase CLI can operate without manual copying.
- Verify `README.md` is aligned with actual setup steps (this new version already documents environment and Supabase notes).

