
import { supabase } from './supabaseClient';
import { Expense, CategoryConfig, CategoryId } from '../types';
import { CATEGORIES } from '../constants';

export const ApiService = {
  // --- Icons ---
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

  ensureIconExists: async (name: string): Promise<void> => {
    try {
      const { data } = await supabase.from('master_icons').select('name').eq('name', name).single();
      if (data) return;

      await supabase.from('master_icons').insert({ name, label: name });
    } catch (err) {
      // Ignore duplicate errors
    }
  },

  addMasterIcon: async (name: string, label: string): Promise<void> => {
    try {
      await supabase.from('master_icons').insert({ name, label });
    } catch (err) {
      console.error("Failed to add icon", err);
    }
  },

  deleteMasterIcon: async (name: string): Promise<void> => {
    try {
      await supabase.from('master_icons').delete().eq('name', name);
    } catch (err) {
      console.error("Failed to delete icon", err);
    }
  },

  // --- Categories ---
  getCategories: async (): Promise<Record<string, CategoryConfig>> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id,
          label,
          icon_name,
          master_colors ( hex_code )
        `);

      if (error) throw error;

      if (!data || data.length === 0) {
        // Fallback to seeds if empty
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
      return {};
    }
  },

  createCategory: async (category: CategoryConfig): Promise<{ success: boolean; data?: CategoryConfig; error?: any }> => {
    try {
      // 1. Ensure Icon Exists
      await ApiService.ensureIconExists(category.iconName);

      // 2. Resolve Color Name (Reverse lookup from hex)
      // Note: This assumes the color exists in master_colors. 
      // If custom colors are allowed, we'd need to insert into master_colors too.
      const colorName = await getColorNameFromHex(category.color);

      const { error } = await supabase
        .from('categories')
        .insert({
          id: category.id,
          label: category.label,
          color_name: colorName,
          icon_name: category.iconName,
        });

      if (error) throw error;
      return { success: true, data: category };
    } catch (err: any) {
      console.error('Error creating category:', err.message || err);
      return { success: false, error: err };
    }
  },

  updateCategory: async (category: CategoryConfig): Promise<{ success: boolean; data?: CategoryConfig; error?: any }> => {
    try {
      await ApiService.ensureIconExists(category.iconName);
      const colorName = await getColorNameFromHex(category.color);

      const { error } = await supabase
        .from('categories')
        .update({
          label: category.label,
          color_name: colorName,
          icon_name: category.iconName,
        })
        .eq('id', category.id);

      if (error) throw error;
      return { success: true, data: category };
    } catch (err: any) {
      console.error('Error updating category:', err.message || err);
      return { success: false, error: err };
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

      return (data || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount),
        date: e.date,
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
      // Order matters for FK constraints
      await supabase.from('expenses').delete().neq('id', 0);
      await supabase.from('categories').delete().neq('id', 'placeholder');
      // Re-seed
      await seedCategories();
      return true;
    } catch (err) {
      console.error("Reset failed", err);
      return false;
    }
  }
};

// Helper: Get color name from hex (or default to Blue)
async function getColorNameFromHex(hex: string): Promise<string> {
  const { data } = await supabase
    .from('master_colors')
    .select('name')
    .ilike('hex_code', hex) // Case insensitive match
    .single();

  return data ? data.name : 'Blue';
}

async function seedCategories(): Promise<Record<string, CategoryConfig>> {
  const defaults = Object.values(CATEGORIES);
  for (const cat of defaults) {
    await ApiService.ensureIconExists(cat.iconName);
    // Try to find a matching color name for the hex
    const colorName = await getColorNameFromHex(cat.color);

    await supabase.from('categories').insert({
      id: cat.id,
      label: cat.label,
      color_name: colorName,
      icon_name: cat.iconName,
    });
  }
  return CATEGORIES;
}
