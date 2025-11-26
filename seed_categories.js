
import { createClient } from '@supabase/supabase-js';

// Credentials for the self-hosted Supabase deployment
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

const COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Slate', value: '#64748b' },
];

const CATEGORIES = [
  { id: 'FOOD', label: 'Food & Dining', color_name: 'Blue', icon_name: 'Utensils' },
  { id: 'TRANSPORT', label: 'Transport', color_name: 'Amber', icon_name: 'Car' },
  { id: 'SHOPPING', label: 'Shopping', color_name: 'Pink', icon_name: 'ShoppingBag' },
  { id: 'HOUSING', label: 'Housing', color_name: 'Indigo', icon_name: 'Home' },
  { id: 'ENTERTAINMENT', label: 'Entertainment', color_name: 'Violet', icon_name: 'Film' },
  { id: 'HEALTH', label: 'Health', color_name: 'Emerald', icon_name: 'HeartPulse' },
  { id: 'INVESTMENT', label: 'Investments', color_name: 'Cyan', icon_name: 'TrendingUp' },
  { id: 'OTHER', label: 'Other', color_name: 'Slate', icon_name: 'CircleDashed' },
  { id: 'SUBSCRIPTIONS', label: 'Subscriptions', color_name: 'Sky', icon_name: 'Globe' },
  { id: 'GROCERIES', label: 'Groceries', color_name: 'Green', icon_name: 'Utensils' },
  { id: 'UTILITIES', label: 'Utilities', color_name: 'Yellow', icon_name: 'Zap' },
  { id: 'TRAVEL', label: 'Travel', color_name: 'Orange', icon_name: 'Plane' },
  { id: 'WORK', label: 'Business', color_name: 'Slate', icon_name: 'Briefcase' },
  { id: 'EDUCATION', label: 'Education', color_name: 'Teal', icon_name: 'GraduationCap' }
];

async function seed() {
  console.log('Starting seed process...');

  // 1. Seed Master Colors
  console.log('Seeding Master Colors...');
  for (const color of COLORS) {
    const { error } = await supabase
      .from('master_colors')
      .upsert({ name: color.name, hex_code: color.value }, { onConflict: 'name' });
    
    if (error) console.error(`Error inserting color ${color.name}:`, error.message);
  }

  // 2. Ensure Master Icons Exist
  console.log('Seeding Master Icons...');
  // Collect all unique icons from our category list
  const usedIcons = [...new Set(CATEGORIES.map(c => c.icon_name))];
  
  for (const iconName of usedIcons) {
    const { error } = await supabase
      .from('master_icons')
      .upsert({ name: iconName, label: iconName }, { onConflict: 'name' });
      
    if (error) console.error(`Error inserting icon ${iconName}:`, error.message);
  }

  // 3. Seed Categories
  console.log('Seeding Categories...');
  for (const cat of CATEGORIES) {
    const { error } = await supabase
      .from('categories')
      .upsert({
        id: cat.id,
        label: cat.label,
        color_name: cat.color_name,
        icon_name: cat.icon_name
      }, { onConflict: 'id' });

    if (error) {
        console.error(`Error inserting category ${cat.label}:`, error.message);
    } else {
        console.log(`Inserted: ${cat.label}`);
    }
  }

  console.log('Seeding complete! Refresh your app.');
}

seed();
