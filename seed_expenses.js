import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://bjk.ai:8000';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTcxMTI0MDAwMCwiZXhwIjoxOTQ2MjQ4MDAwfQ.EVZPEgGdk20KlUoQjQ2T9JUSW5gF5VjvcM8jng2u9H6w';

// This key is not directly used by this script but is kept for consistency with other seed files.
// The actual seeding will be done via Playwright interacting with the Supabase Studio UI.
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzExMjQwMDAwLCJleHAiOjE5NDYyNDgwMDB9.9g8kXWbFyB0uZq37C3U-qc8Z6v3eWw1g6EkR1x4-qms';


console.log('Using SUPABASE_URL:', SUPABASE_URL);
console.log('Using SUPABASE_ANON_KEY (first 10 chars):', SUPABASE_ANON_KEY.substring(0, 10));

// The supabase client will not be initialized in this script, as direct Node.js seeding is failing.
// The data defined below will be used by a Playwright script to seed via the UI.

export const EXPENSES = [
  { title: 'Coffee with a friend', amount: 5.50, date: '2025-11-20', categoryId: 'FOOD', note: 'Met up with Sarah' },
  { title: 'Monthly train pass', amount: 85.00, date: '2025-11-01', categoryId: 'TRANSPORT' },
  { title: 'New jacket', amount: 120.00, date: '2025-11-15', categoryId: 'SHOPPING', note: 'Winter is coming' },
  { title: 'Rent for November', amount: 1500.00, date: '2025-11-01', categoryId: 'HOUSING' },
  { title: 'Movie tickets', amount: 25.00, date: '2025-11-22', categoryId: 'ENTERTAINMENT' },
  { title: 'Gym membership', amount: 50.00, date: '2025-11-05', categoryId: 'HEALTH' },
  { title: 'Stock investment', amount: 500.00, date: '2025-11-10', categoryId: 'INVESTMENT' },
  { title: 'Groceries for the week', amount: 75.20, date: '2025-11-18', categoryId: 'GROCERIES' },
  { title: 'Electricity bill', amount: 60.00, date: '2025-11-12', categoryId: 'UTILITIES' },
  { title: 'Weekend trip to the mountains', amount: 350.00, date: '2025-11-08', categoryId: 'TRAVEL' },
];