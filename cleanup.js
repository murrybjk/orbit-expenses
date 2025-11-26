
import { createClient } from '@supabase/supabase-js';

// Self-hosted Supabase credentials (service key used for admin tasks only)
const SUPABASE_URL = 'http://bjk.ai:8000';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzExMjQwMDAwLCJleHAiOjE5NDYyNDgwMDB9.9g8kXWbFyB0uZq37C3U-qc8Z6v3eWw1g6EkR1x4-qms';

const stripAuthorizationFetch = (input, init = {}) => {
  const headers = new Headers(init.headers || {});
  headers.delete('Authorization');
  return fetch(input, { ...init, headers });
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  global: { fetch: stripAuthorizationFetch },
});

async function cleanup() {
  console.log("Starting cleanup...");

  // 1. Clean up 'master_icons' (Sync with Local List)
  console.log("Resetting master_icons...");
  
  // Fetch all existing
  const { data: allIcons } = await supabase.from('master_icons').select('name');
  if (allIcons && allIcons.length > 0) {
      const names = allIcons.map(i => i.name);
      await supabase.from('master_icons').delete().in('name', names);
  }

  // Insert Local Icons (Sync with constants.tsx)
  const localIcons = [
    'Home', 'Car', 'Utensils', 'ShoppingBag', 'Film', 'HeartPulse', 'TrendingUp', 
    'CircleDashed', 'Coffee', 'Beer', 'Pizza', 'Zap', 'Wrench', 'Droplet', 'Bus', 
    'Fuel', 'Shirt', 'Scissors', 'Gamepad2', 'Globe', 'Pill', 'Dumbbell', 'Banknote', 
    'Laptop', 'Smartphone', 'Plane', 'Ticket', 'Map', 'Gift', 'Angry', 'Smile', 
    'Frown', 'Meh', 'Trophy', 'Medal', 'Bike', 'Tent', 'Camera', 'Palette', 'Tv', 
    'Printer', 'Cloud', 'Battery', 'Thermometer', 'Tag', 'Watch', 'Glasses', 'Baby', 
    'Dog', 'Cat', 'Wallet', 'PiggyBank', 'Building', 'Hammer', 'Train', 'Anchor', 
    'Sun', 'Umbrella', 'Briefcase', 'GraduationCap', 'CreditCard', 'Sofa', 'Bed',
    'Bath', 'ShowerHead', 'Key', 'Lock', 'Shield', 'FileText', 'DollarSign', 
    'Percent', 'PieChart', 'BarChart', 'Activity', 'ZapOff', 'WifiOff', 'Server', 
    'Database', 'HardDrive', 'Cpu', 'Headphones', 'Speaker', 'Mic', 'Video', 
    'Image', 'Book', 'Library', 'Music', 'Music2', 'Leaf', 'Flower', 'Trees', 
    'Mountain', 'Waves', 'Wind', 'Snowflake', 'Flame'
  ];

  // Chunk the inserts to avoid payload limits
  const chunkSize = 50;
  for (let i = 0; i < localIcons.length; i += chunkSize) {
      const chunk = localIcons.slice(i, i + chunkSize);
      const rows = chunk.map(name => ({ name, label: name }));
      const { error: insertError } = await supabase.from('master_icons').insert(rows);
      if (insertError) console.error("Error chunk:", insertError.message);
  }
  
  console.log("Success! master_icons synced with local code.");
  console.log("Cleanup complete. You can now restart your app.");
}

cleanup();
