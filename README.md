# Orbit Expenses Dashboard

Orbit Expenses is a Supabase-backed React/Vite UI for tracking spending, categorizing transactions, and managing your dataset. It features a polished dashboard, category editor, icon manager, and import/export tooling.

## Features
- **Dashboard**: Interactive charts and transaction tables with advanced filtering.
- **Expense Management**: Create, edit, and delete expenses with real-time updates.
- **Category Control**: Manage categories with custom icons and colors.
- **Data Tooling**: Import/export CSVs and database reset capabilities.
- **Self-Hosted Ready**: Configured to work with self-hosted Supabase instances via a local proxy.

## Architecture
- **Frontend**: React 19 + Vite + Tailwind CSS.
- **Backend**: Supabase (PostgreSQL + PostgREST).
- **State Management**: Custom Hooks (`useOrbitData`, `useOrbitFilters`) + Context API.
- **Notifications**: Custom Toast notification system.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- A running Supabase instance (Self-hosted or Cloud)

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=/supaproxy
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```
*Note: The `/supaproxy` URL is used to bypass CORS issues with self-hosted instances.*

### 4. Database Setup
Run the following SQL scripts in your Supabase SQL Editor in order:
1. `supabase/migrations/20251127000000_init_schema.sql` (Schema & Policies)
2. `supabase/migrations/20251127000001_add_missing_colors.sql` (Color Data)
3. `supabase/migrations/20251127000002_seed_data.sql` (Seed Data)

### 5. Running Locally
```bash
npm run dev
```
Access the app at `http://localhost:3000`.

## Development Notes
- **Proxy**: `vite.config.ts` is configured to proxy requests from `/supaproxy` to your self-hosted Supabase instance to avoid CORS errors.
- **Supabase Client**: `services/supabaseClient.ts` handles the URL resolution and header management.
- **Error Handling**: The app uses a global `ErrorBoundary` and Toast notifications for user feedback.

## Documentation
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Design Notes](docs/DESIGN_NOTES.md)
- [Test Plan](docs/TEST_PLAN.md)


