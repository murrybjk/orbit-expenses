# Test Plan

## Strategy
1. **Unit tests** for service helpers (`ApiService`, `StorageService`, constants). Mock the Supabase client to simulate success/failure and assert that `ApiService` methods return expected shapes and log errors gracefully.
2. **Integration tests** using React Testing Library for `App.tsx` flows: verify data fetching, filter logic, modals, optimistic updates, and Settings actions by mocking `ApiService`.
3. **End-to-end (E2E)** tests with Playwright or Cypress for critical workflows (expense entry, CSV import/export, category deletion, reset) against the running Vite app and Supabase.

## Unit Test Cases
- `ApiService.createExpense`/`updateExpense`/`deleteExpense`: mock Supabase responses to verify optimistic data handling, error logging, and returned payloads.
- `ApiService.ensureIconExists`/`addMasterIcon`: confirm duplicate suppression and insertion logic.
- `StorageService.parseCSV`: provide CSV strings for multiple formats (with/without quotes, varying column orders) and assert the returned `Expense[]` and category mapping logic.
- `constants.tsx`: ensure `getColorName` returns the expected color label for known hex codes and falls back to `Blue` when missing.

## Integration Test Cases
- **Initial load**: mock `ApiService.getCategories`/`getExpenses` and confirm `App` renders the dashboard, chart total, and table rows. Validate filters automatically reduce items.
- **Expense lifecycle**: simulate clicking “Add Expense,” fill the form, submit, and assert `ApiService.createExpense` was called then check the row appears in the table. Repeat for edit/delete flows, verifying rollback when API rejects.
- **Filtering**: interact with `ExpensesTable` filter dropdowns (title text, category toggles, date/amount range) and confirm chart/table state updates (`filteredExpenses`, `chartData`).
- **Settings actions**: test CSV export triggers `StorageService.exportToCSV` (mocked) and that Reset Database button calls `ApiService.resetDatabase` and re-fetches data.

## E2E Test Cases
- **Happy-path expense creation**: launch `npm run dev`, use Playwright to fill the Add Expense modal, submit, and verify the transaction appears in the table and chart.
- **CSV import**: upload a sample CSV through the Settings import control, confirm the browser prompt, wait for `alert` (mock or intercept), then ensure Supabase contains the new rows (via API or UI confirmation).
- **Category cascade delete**: create a category with associated expenses, delete it via Category Manager, confirm the foreign-key prompt appears, confirm cascade delete removes related expenses.
- **Icon library sync**: add an icon from the Available view; verify it moves to Active and appears when selecting categories (ensure Supabase `master_icons` has the record if possible).
- **Database reset**: run the Reset Database button, ensure both `categories` and `expenses` tables return to seeded state and the UI reloads accordingly.

## Quality Gates
- Run unit/integration suite locally (`npm test` once configured) before merging UI changes.
- Keep Playwright/Cypress scripts idempotent by cleaning Supabase state before each test (use seeded data or REST requests).

