
import { Expense, CategoryId, CategoryConfig } from '../types';
import { CATEGORIES } from '../constants';

const STORAGE_KEY = 'orbit_expenses_v2';
const CATEGORIES_STORAGE_KEY = 'orbit_categories_v2';

// Initial seed data - using numeric IDs
const SEED_DATA: Expense[] = [
  {
    id: 1,
    title: 'Grocery Run',
    amount: 85.50,
    date: new Date().toISOString(),
    categoryId: CategoryId.FOOD,
    note: 'Weekly essentials'
  },
  {
    id: 2,
    title: 'Netflix',
    amount: 15.99,
    date: new Date().toISOString(),
    categoryId: CategoryId.ENTERTAINMENT,
  },
  {
    id: 3,
    title: 'Rent',
    amount: 1200.00,
    date: new Date().toISOString(),
    categoryId: CategoryId.HOUSING,
  },
  {
    id: 4,
    title: 'Uber to Airport',
    amount: 45.20,
    date: new Date(Date.now() - 86400000 * 1).toISOString(), 
    categoryId: CategoryId.TRANSPORT,
  }
];

export const StorageService = {
  getExpenses: (): Expense[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : SEED_DATA;
    } catch (error) {
      console.error("Failed to load expenses", error);
      return [];
    }
  },

  saveExpenses: (expenses: Expense[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error("Failed to save expenses", error);
    }
  },

  getCategories: (): Record<string, CategoryConfig> => {
    try {
      const data = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      return data ? JSON.parse(data) : CATEGORIES;
    } catch (error) {
      console.error("Failed to load categories", error);
      return CATEGORIES;
    }
  },

  saveCategories: (categories: Record<string, CategoryConfig>) => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error("Failed to save categories", error);
    }
  },

  exportToCSV: (expenses: Expense[]) => {
    const headers = ['ID', 'Date', 'Title', 'Amount', 'Category', 'Note'];
    const rows = expenses.map(e => [
      e.id,
      new Date(e.date).toLocaleDateString(),
      `"${e.title.replace(/"/g, '""')}"`,
      e.amount.toFixed(2),
      e.categoryId,
      `"${(e.note || '').replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `orbit_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  downloadTemplate: () => {
    const headers = ['Date (YYYY-MM-DD)', 'Title', 'Amount', 'Category Name', 'Note'];
    const exampleRow = ['2025-01-30', 'Lunch', '12.50', 'Food & Dining', 'Business meal'];
    
    const csvContent = [
      headers.join(','),
      exampleRow.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'orbit_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  parseCSV: async (file: File, categories: Record<string, CategoryConfig>): Promise<Expense[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) return resolve([]);

        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) return resolve([]);

        const headerLine = lines[0];
        const headers = headerLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => 
            h.trim().replace(/^"|"$/g, '').toLowerCase()
        );

        const findIdx = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)));

        let dateIdx = findIdx(['date', 'day', 'time']);
        let titleIdx = findIdx(['title', 'description', 'name', 'merchant']);
        let amountIdx = findIdx(['amount', 'price', 'cost', 'value']);
        let catIdx = findIdx(['category', 'type']);
        let noteIdx = findIdx(['note', 'details', 'comment']);

        if (titleIdx === -1 || amountIdx === -1) {
            if (headers[0] === 'id') {
                dateIdx = 1; titleIdx = 2; amountIdx = 3; catIdx = 4; noteIdx = 5;
            } else {
                dateIdx = 0; titleIdx = 1; amountIdx = 2; catIdx = 3; noteIdx = 4;
            }
        }

        const expenses: Expense[] = [];
        const categoryMap = new Map<string, string>();
        Object.values(categories).forEach(c => {
            categoryMap.set(c.label.toLowerCase(), c.id);
            categoryMap.set(c.id.toLowerCase(), c.id);
        });

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          
          const cleanCols = cols.map(c => {
              let val = c.trim();
              if (val.startsWith('"') && val.endsWith('"')) {
                  val = val.slice(1, -1);
              }
              return val.replace(/""/g, '"');
          });
          
          const dateStr = cleanCols[dateIdx] || '';
          const title = cleanCols[titleIdx] || '';
          const amountStr = cleanCols[amountIdx] || '';
          const catLabel = cleanCols[catIdx] || '';
          const note = cleanCols[noteIdx] || '';

          if (!title || !amountStr) continue;

          const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ""));
          if (isNaN(amount)) continue;

          let categoryId = CategoryId.OTHER;
          if (catLabel) {
             const search = catLabel.toLowerCase();
             if (categoryMap.has(search)) {
                 categoryId = categoryMap.get(search) as any;
             } else {
                 for (const [key, id] of categoryMap.entries()) {
                     if (search.includes(key) || key.includes(search)) {
                         categoryId = id as any;
                         break;
                     }
                 }
             }
          }

          let date = new Date(dateStr);
          if (isNaN(date.getTime())) {
             date = new Date();
          }

          expenses.push({
            id: Date.now() + i, // Temp Numeric ID for import preview/batch
            date: date.toISOString(),
            title,
            amount,
            categoryId: categoryId as any,
            note
          });
        }
        resolve(expenses);
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
};
