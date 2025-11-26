
import { supabase } from './supabaseClient';
import { Expense, CategoryConfig, CategoryId } from '../types';
import { CATEGORIES, AVAILABLE_COLORS } from '../constants';

const getColorName = (hex: string) => {
  const found = AVAILABLE_COLORS.find(c => c.value.toLowerCase() === hex.toLowerCase());
  return found ? found.name : 'Blue'; 
};

const SEED_EXPENSES: Omit<Expense, 'id'>[] = [
  {
    title: 'Grocery Run',
    amount: 85.50,
    date: '2025-11-18',
    categoryId: CategoryId.FOOD,
    note: 'Weekly essentials'
  },
  {
    title: 'Netflix',
    amount: 15.99,
    date: '2025-11-19',
    categoryId: CategoryId.ENTERTAINMENT,
  },
  {
    title: 'Rent',
    amount: 1200.00,
    date: '2025-11-19',
    categoryId: CategoryId.HOUSING,
  },
  {
    title: 'Uber to Airport',
    amount: 45.20,
    date: '2025-11-18',
    categoryId: CategoryId.TRANSPORT,
  }
];

export const ApiService = {
  // --- Icons ---
  // Fetches the list of icons currently registered in the database
  // (Optional if using purely local list, but kept for hybrid support)
  getAvailableIcons: async (): Promise<{ name: string; label: string }[]> => {
    try {
      const { data, error } = await supabase
        .from('master_icons')
        .select('name, label')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Failed to fetch icons", err);
      return [];
    }
  },

  // Ensures an icon exists in master_icons before using it in a category
  // This prevents Foreign Key errors in Supabase
  ensureIconExists: async (name: string): Promise<void> => {
    try {
      // Check if exists
      const { data } = await supabase.from('master_icons').select('name').eq('name', name).single();
      if (data) return;

      // Insert if missing
      await supabase.from('master_icons').insert({ name, label: name });
    } catch (err) {
      // Ignore duplicate errors or race conditions
      console.log(`Icon ${name} checked/inserted`);
    }
  },

  addMasterIcon: async (name: string, label: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('master_icons')
        .insert({ name, label });
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Failed to add icon", err);
      return false;
    }
  },

  // --- Categories ---
  getCategories: async (): Promise<Record<string, CategoryConfig>> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          master_colors ( hex_code )
        `);

      if (error) throw error;

      if (!data || data.length === 0) {
        return await seedCategories();
      }

      const record: Record<string, CategoryConfig> = {};
      data.forEach((cat: any) => {
        const hex = cat.master_colors?.hex_code || '#64748b';
        record[cat.id] = {
          id: cat.id,
          label: cat.label,
          color: hex,
          iconName: cat.icon_name,
          twColor: '',
        };
      });
      return record;
    } catch (err: any) {
      console.error('Error fetching categories:', err.message || err);
      return CATEGORIES;
    }
  },

  createCategory: async (category: CategoryConfig): Promise<CategoryConfig | null> => {
    try {
      const colorName = getColorName(category.color);
      
      // Critical: Ensure the icon is in the master table first
      await ApiService.ensureIconExists(category.iconName);

      const { error } = await supabase
        .from('categories')
        .insert({
          id: category.id,
          label: category.label,
          color_name: colorName,
          icon_name: category.iconName,
        });

      if (error) throw error;
      return category;
    } catch (err: any) {
      console.error('Error creating category:', err.message || err);
      return null;
    }
  },

  updateCategory: async (category: CategoryConfig): Promise<CategoryConfig | null> => {
    try {
      const colorName = getColorName(category.color);

      // Critical: Ensure the icon is in the master table first
      await ApiService.ensureIconExists(category.iconName);

      const { error } = await supabase
        .from('categories')
        .update({
          label: category.label,
          color_name: colorName,
          icon_name: category.iconName,
        })
        .eq('id', category.id);

      if (error) throw error;
      return category;
    } catch (err: any) {
      console.error('Error updating category:', err.message || err);
      return null;
    }
  },

  deleteCategory: async (id: string): Promise<{ success: boolean; error?: any }> => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting category:', err.message || err);
      // Usually fails due to Foreign Key constraint (expenses using this category)
      // Return full error object so caller can check .code or .message
      return { success: false, error: err };
    }
  },

  deleteExpensesByCategory: async (categoryId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('category_id', categoryId);

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error deleting expenses by category:', err.message || err);
      return false;
    }
  },

  // --- Expenses ---
  getExpenses: async (): Promise<Expense[]> => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
          return await seedExpenses();
      }

      return data.map((e: any) => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount),
        date: e.date, // Expecting YYYY-MM-DD string
        categoryId: e.category_id,
        note: e.note
      }));
    } catch (err: any) {
      console.error('Error fetching expenses:', err.message || err);
      return [];
    }
  },

  createExpense: async (expense: Expense): Promise<Expense | null> => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          title: expense.title,
          amount: expense.amount,
          date: expense.date,
          category_id: expense.categoryId,
          note: expense.note
        })
        .select()
        .single();

      if (error) throw error;
      
      // Use the ID returned from the DB
      return { ...expense, id: data.id };
    } catch (err: any) {
      console.error('Error creating expense:', err.message || err);
      return null;
    }
  },

  updateExpense: async (expense: Expense): Promise<Expense | null> => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          title: expense.title,
          amount: expense.amount,
          date: expense.date,
          category_id: expense.categoryId,
          note: expense.note
        })
        .eq('id', expense.id);

      if (error) throw error;
      return expense;
    } catch (err: any) {
      console.error('Error updating expense:', err.message || err);
      return null;
    }
  },

  deleteExpense: async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error deleting expense:', err.message || err);
      return false;
    }
  },

  resetDatabase: async (): Promise<boolean> => {
    try {
        await supabase.from('expenses').delete().neq('id', 0); 
        await supabase.from('categories').delete().neq('id', 'placeholder');
        await seedCategories();
        await seedExpenses();
        return true;
    } catch (err) {
        console.error("Reset failed", err);
        return false;
    }
  }
};

async function seedCategories(): Promise<Record<string, CategoryConfig>> {
  const defaults = Object.values(CATEGORIES);
  for (const cat of defaults) {
    const colorName = getColorName(cat.color);
    await ApiService.ensureIconExists(cat.iconName);
    await supabase.from('categories').insert({
      id: cat.id,
      label: cat.label,
      color_name: colorName,
      icon_name: cat.iconName,
    });
  }
  return CATEGORIES;
}

async function seedExpenses(): Promise<Expense[]> {
  const createdExpenses: Expense[] = [];
  for (const seed of SEED_EXPENSES) {
    const { data, error } = await supabase.from('expenses').insert({
      title: seed.title,
      amount: seed.amount,
      date: seed.date,
      category_id: seed.categoryId,
      note: seed.note
    }).select().single();
    
    if (!error && data) {
        createdExpenses.push({ ...seed, id: data.id });
    }
  }
  return createdExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
