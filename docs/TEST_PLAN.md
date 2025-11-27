# Test Plan

## Overview
Currently, testing is performed manually. The application relies on SQL migration scripts to set up a consistent state for testing.

## Manual Verification Steps

### 1. Database Setup
Before testing, ensure the database is in a clean state:
1. Go to the Supabase SQL Editor.
2. Run `supabase/migrations/20251127000000_init_schema.sql` to reset schema.
3. Run `supabase/migrations/20251127000002_seed_data.sql` to populate sample data.

### 2. Critical Workflows

#### Expense Management
- **Create**: Click "New Expense", fill form, save. Verify Toast success message and appearance in table.
- **Edit**: Click edit icon on a row, change amount/category, save. Verify update.
- **Delete**: Click delete icon, confirm prompt. Verify removal.

#### Category Management
- **Create**: Go to Categories tab, click "New Category", select icon/color. Verify it appears in list.
- **Cascade Delete**: Delete a category that has expenses. Confirm the "Cascade Delete" prompt. Verify category and its expenses are removed.

#### Data Tooling
- **Reset Database**: Go to Settings -> Danger Zone -> Reset Database. Confirm prompt. Verify app reloads with initial seed data.
- **CSV Import**: Use "Import CSV" in Settings. Upload a valid CSV. Verify expenses are added.

### 3. Error Handling
- **Network Error**: Stop the Supabase instance (or disconnect network). Try to add an expense. Verify error Toast appears and optimistic update rolls back.
- **Validation**: Try to submit empty forms. Verify HTML5 validation or UI feedback.

## Future Automated Testing
- **Unit Tests**: Add Jest/Vitest for `ApiService` and `utils`.
- **E2E Tests**: Implement Playwright tests to automate the manual workflows above.


