
import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Tag, Table2, PieChart, Settings as SettingsIcon, Upload, Download, FileText, RefreshCw, Shapes } from 'lucide-react';
import { Expense, DateScope, CategoryConfig } from './types';
import { StorageService } from './services/storageService';
import { ApiService } from './services/apiService';

import { Card, Modal } from './components/ui/Elements';
import { DateRangeControl } from './components/ui/DateRangeControl';
import { ExpenseForm } from './components/expenses/ExpenseForm';
import { ExpensesTable, TableFilters } from './components/expenses/ExpensesTable';
import { CategoryChart } from './components/charts/CategoryChart';
import { CategoryManager } from './components/categories/CategoryManager';
import { CategoryForm } from './components/categories/CategoryForm';
import { IconLibrary } from './components/icons/IconLibrary';
import { getTodayString } from './constants';

type DashboardTab = 'OVERVIEW' | 'TRANSACTIONS';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Record<string, CategoryConfig>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryConfig | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const [mainView, setMainView] = useState<'DASHBOARD' | 'CATEGORIES' | 'ICONS' | 'SETTINGS'>('DASHBOARD');
  const [mobileTab, setMobileTab] = useState<DashboardTab>('OVERVIEW');
  
  const [currentDate, setCurrentDate] = useState(() => {
    const todayStr = getTodayString();
    const [y, m, d] = todayStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  });
  const [dateScope, setDateScope] = useState<DateScope>('MONTH');
  
  const [filters, setFilters] = useState<TableFilters>({
    title: '',
    categories: [],
    dateStart: '',
    dateEnd: '',
    amountMin: '',
    amountMax: ''
  });
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedCategories, fetchedExpenses] = await Promise.all([
        ApiService.getCategories(),
        ApiService.getExpenses(),
      ]);
      setCategories(fetchedCategories);
      setExpenses(fetchedExpenses);
    } catch (error) {
      console.error("Failed to fetch initial data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Base Data: Filtered by Date, Title, Amount (Everything EXCEPT Category)
  // This dataset drives the CHART (so it always shows the full pie for the period)
  const expensesInScope = useMemo(() => {
    return expenses.filter(e => {
      // Date Scope Logic
      if (dateScope !== 'ALL') {
        const [yearStr, monthStr] = e.date.split('-');
        const eYear = parseInt(yearStr);
        const eMonth = parseInt(monthStr);
        
        const cYear = currentDate.getFullYear();
        const cMonth = currentDate.getMonth() + 1; 

        if (dateScope === 'YEAR') {
          if (eYear !== cYear) return false;
        } else {
          if (eYear !== cYear || eMonth !== cMonth) return false;
        }
      }

      // Title Filter
      if (filters.title && !e.title.toLowerCase().includes(filters.title.toLowerCase())) return false;
      
      // Amount Filter
      if (filters.amountMin && e.amount < parseFloat(filters.amountMin)) return false;
      if (filters.amountMax && e.amount > parseFloat(filters.amountMax)) return false;
      
      // Date Range Filter (Custom)
      if (filters.dateStart && e.date < filters.dateStart) return false;
      if (filters.dateEnd && e.date > filters.dateEnd) return false;

      return true;
    });
  }, [expenses, currentDate, dateScope, filters.title, filters.amountMin, filters.amountMax, filters.dateStart, filters.dateEnd]);

  // 2. Filtered Data: Base Data + Category Filter
  // This dataset drives the TABLE (so it shows only selected items)
  const filteredExpenses = useMemo(() => {
    return expensesInScope.filter(e => {
      if (filters.categories.length > 0 && !filters.categories.includes(e.categoryId)) return false;
      return true;
    });
  }, [expensesInScope, filters.categories]);

  // Chart Data derived from Base Data (ignoring category selection so slices stay visible)
  const chartData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    expensesInScope.forEach(e => {
      dataMap[e.categoryId] = (dataMap[e.categoryId] || 0) + e.amount;
    });
    
    return Object.keys(dataMap).map(catId => {
      const config = categories[catId];
      if (!config) return null;

      return {
        name: config.label,
        value: dataMap[catId],
        color: config.color,
        categoryId: catId
      };
    }).filter(Boolean).sort((a: any, b: any) => b.value - a.value) as any[];
  }, [expensesInScope, categories]);

  // Total Spent derived from Base Data (Grand Total for the period)
  const totalSpent = useMemo(() => {
    return expensesInScope.reduce((sum, e) => sum + e.amount, 0);
  }, [expensesInScope]);

  const handleChartClick = (categoryId: string) => {
    setFilters(prev => {
        const isSelected = prev.categories.includes(categoryId);
        let newCategories;
        
        if (isSelected) {
            // Remove it
            newCategories = prev.categories.filter(id => id !== categoryId);
        } else {
            // Add it
            newCategories = [...prev.categories, categoryId];
        }

        return {
            ...prev,
            categories: newCategories
        };
    });
  };

  const handleAddExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const tempId = Date.now(); 
    const newExpense: Expense = { ...expenseData, id: tempId };
    setExpenses(prev => [newExpense, ...prev]);
    setIsExpenseModalOpen(false);

    const saved = await ApiService.createExpense(newExpense);
    if (saved) {
        setExpenses(prev => prev.map(e => e.id === tempId ? saved : e));
    } else {
        setExpenses(prev => prev.filter(e => e.id !== tempId));
        alert('Failed to save expense.');
    }
  };

  const handleEditExpense = async (expenseData: Omit<Expense, 'id'>) => {
    if (!editingExpense) return;
    const updatedExpense = { ...expenseData, id: editingExpense.id };
    setExpenses(prev => prev.map(e => e.id === editingExpense.id ? updatedExpense : e));
    setIsExpenseModalOpen(false);
    setEditingExpense(null);

    const saved = await ApiService.updateExpense(updatedExpense);
    if (!saved) {
        setExpenses(prev => prev.map(e => e.id === editingExpense.id ? editingExpense : e));
        alert('Failed to update expense.');
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (window.confirm('Delete this expense?')) {
      const previousExpenses = [...expenses];
      setExpenses(prev => prev.filter(e => e.id !== id));
      const success = await ApiService.deleteExpense(id);
      if (!success) {
          setExpenses(previousExpenses);
          alert('Failed to delete expense.');
      }
    }
  };

  const openAddExpenseModal = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const openEditExpenseModal = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleSaveCategory = async (category: CategoryConfig) => {
    const previousCategories = { ...categories };
    setCategories(prev => ({...prev, [category.id]: category}));
    setIsCategoryModalOpen(false);
    setEditingCategory(null);

    let success = false;
    if (previousCategories[category.id]) {
       const res = await ApiService.updateCategory(category);
       success = !!res;
    } else {
       const res = await ApiService.createCategory(category);
       success = !!res;
    }

    if (!success) {
        setCategories(previousCategories);
        alert('Failed to save category.');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const previousCategories = { ...categories };
    
    // Optimistic update
    const newCategories = { ...categories };
    delete newCategories[categoryId];
    setCategories(newCategories);

    const result = await ApiService.deleteCategory(categoryId);
    
    if (!result.success) {
      // Revert
      setCategories(previousCategories);
      
      // Check for Foreign Key violation (Postgres Code 23503)
      // This means expenses exist for this category
      if (result.error && (result.error.code === '23503' || result.error.message?.includes('foreign key constraint'))) {
          if (window.confirm('This category contains expenses. Do you want to delete all associated expenses as well?')) {
              // User agreed to Cascade Delete
              const cascadeSuccess = await ApiService.deleteExpensesByCategory(categoryId);
              if (cascadeSuccess) {
                  // Try deleting category again
                  const retryResult = await ApiService.deleteCategory(categoryId);
                  if (retryResult.success) {
                      // Success! Update expenses list too
                      setExpenses(prev => prev.filter(e => e.categoryId !== categoryId));
                      return; // Done
                  }
              }
              alert('Failed to cascade delete. Please try again.');
          }
      } else {
          // Other error (e.g. RLS)
          console.error("Delete error:", result.error);
          alert(`Failed to delete category. ${result.error?.message || 'Unknown error'}`);
      }
    }
  };

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category: CategoryConfig) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.confirm('Importing will merge new expenses. Continue?')) {
        setIsImporting(true);
        try {
            const newExpenses = await StorageService.parseCSV(file, categories);
            if (newExpenses.length === 0) {
               alert('No valid expenses found in CSV.');
            } else {
               let count = 0;
               for (const expense of newExpenses) {
                   await ApiService.createExpense(expense);
                   count++;
               }
               const fetchedExpenses = await ApiService.getExpenses();
               setExpenses(fetchedExpenses);
               setDateScope('ALL');
               alert(`Imported ${count} expenses.`);
            }
        } catch (error) {
            alert('Failed to parse CSV.');
        } finally {
            setIsImporting(false);
            e.target.value = ''; 
        }
    }
  };

  const handleResetDatabase = async () => {
    if (window.confirm('WARNING: This will delete ALL data. Continue?')) {
        setIsResetting(true);
        const success = await ApiService.resetDatabase();
        if (success) {
            await fetchData();
            alert('Reset successful.');
        } else {
            alert('Reset failed.');
        }
        setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-slate-400">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-blue-500/30 pb-24 md:pb-0 md:pl-20 font-sans">
      
      <div className="hidden md:flex fixed left-0 top-0 h-full w-20 flex-col items-center py-8 bg-[#1e293b] border-r border-slate-800 z-50">
         <div className="mb-8 p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/20">
            <div className="w-5 h-5 rounded-full border-2 border-white" />
         </div>
         <div className="space-y-6 flex flex-col items-center w-full">
            <NavButton icon={<LayoutDashboard size={24} />} active={mainView === 'DASHBOARD'} onClick={() => setMainView('DASHBOARD')} label="Dashboard" />
            <NavButton icon={<Tag size={24} />} active={mainView === 'CATEGORIES'} onClick={() => setMainView('CATEGORIES')} label="Categories" />
            <NavButton icon={<Shapes size={24} />} active={mainView === 'ICONS'} onClick={() => setMainView('ICONS')} label="Icons" />
            <div className="flex-1" />
            <NavButton icon={<SettingsIcon size={24} />} active={mainView === 'SETTINGS'} onClick={() => setMainView('SETTINGS')} label="Settings" />
         </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#1e293b]/95 backdrop-blur-lg border-t border-slate-800 flex justify-around items-center p-4 z-50 pb-safe">
          <NavButtonMobile icon={<PieChart size={24} />} active={mainView === 'DASHBOARD' && mobileTab === 'OVERVIEW'} onClick={() => { setMainView('DASHBOARD'); setMobileTab('OVERVIEW'); }} />
          <NavButtonMobile icon={<Table2 size={24} />} active={mainView === 'DASHBOARD' && mobileTab === 'TRANSACTIONS'} onClick={() => { setMainView('DASHBOARD'); setMobileTab('TRANSACTIONS'); }} />
          <NavButtonMobile icon={<Tag size={24} />} active={mainView === 'CATEGORIES'} onClick={() => setMainView('CATEGORIES')} />
          <NavButtonMobile icon={<SettingsIcon size={24} />} active={mainView === 'SETTINGS'} onClick={() => setMainView('SETTINGS')} />
      </div>

      <main className="max-w-[1600px] mx-auto px-4 py-4 md:py-6 space-y-4 h-full md:h-screen flex flex-col">
        <div className="flex-1 min-h-0">
          {mainView === 'DASHBOARD' && (
            <div className="flex flex-col lg:flex-row h-full gap-4">
              <div className={`lg:w-[340px] xl:w-[380px] shrink-0 flex flex-col ${mobileTab === 'OVERVIEW' ? 'flex' : 'hidden lg:flex'}`}>
                <Card className="bg-[#1e293b] border-slate-800 flex-1 flex flex-col p-5">
                   <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 shrink-0">Distribution</h3>
                   <div className="flex-1 min-h-0">
                      <CategoryChart 
                        data={chartData} 
                        total={totalSpent} 
                        categories={categories} 
                        onCategoryClick={handleChartClick}
                        selectedCategories={filters.categories}
                      />
                   </div>
                </Card>
              </div>
              <div className={`flex-1 min-w-0 flex flex-col ${mobileTab === 'TRANSACTIONS' ? 'flex' : 'hidden lg:flex'}`}>
                 <ExpensesTable 
                    expenses={filteredExpenses}
                    categories={categories}
                    filters={filters}
                    onFilterChange={setFilters}
                    onEdit={openEditExpenseModal}
                    onDelete={handleDeleteExpense}
                    onAdd={handleAddExpense}
                    onOpenAddModal={openAddExpenseModal}
                    headerControls={
                       <DateRangeControl 
                          currentDate={currentDate} 
                          scope={dateScope}
                          onDateChange={setCurrentDate} 
                          onScopeChange={setDateScope}
                       />
                    }
                 />
              </div>
            </div>
          )}

          {mainView === 'CATEGORIES' && (
            <div className="h-full overflow-y-auto pb-20 md:pb-0 no-scrollbar">
              <CategoryManager 
                categories={categories} 
                onCreate={openAddCategoryModal} 
                onEdit={openEditCategoryModal}
                onDelete={handleDeleteCategory}
              />
            </div>
          )}

          {mainView === 'ICONS' && (
            <div className="h-full overflow-y-auto pb-20 md:pb-0 no-scrollbar">
              <IconLibrary />
            </div>
          )}

          {mainView === 'SETTINGS' && (
            <div className="h-full overflow-y-auto pb-20 md:pb-0 no-scrollbar max-w-3xl mx-auto pt-8">
               <h2 className="text-2xl font-bold mb-6">Settings</h2>
               <Card className="mb-6">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><FileText size={24} /></div>
                      <div><h3 className="text-lg font-semibold text-slate-200">Data Management</h3></div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                      <button onClick={() => StorageService.exportToCSV(expenses)} className="flex flex-col items-center p-6 bg-gray-950/50 border border-slate-800 rounded-xl hover:bg-gray-800 transition-all gap-3">
                          <Download size={24} className="text-slate-500" /><span className="font-medium text-slate-300">Export CSV</span>
                      </button>
                      <button onClick={StorageService.downloadTemplate} className="flex flex-col items-center p-6 bg-gray-950/50 border border-slate-800 rounded-xl hover:bg-gray-800 transition-all gap-3">
                          <FileText size={24} className="text-slate-500" /><span className="font-medium text-slate-300">Template</span>
                      </button>
                      <label className="flex flex-col items-center p-6 bg-gray-950/50 border border-slate-800 rounded-xl hover:bg-gray-800 transition-all gap-3 cursor-pointer">
                          <Upload size={24} className="text-slate-500" /><span className="font-medium text-slate-300">{isImporting ? '...' : 'Import CSV'}</span>
                          <input type="file" accept=".csv" className="hidden" onChange={handleImport} disabled={isImporting} />
                      </label>
                  </div>
               </Card>
               <Card>
                  <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-red-500/10 text-red-400 rounded-xl"><RefreshCw size={24} /></div>
                      <div><h3 className="text-lg font-semibold text-slate-200">Danger Zone</h3></div>
                  </div>
                  <button onClick={handleResetDatabase} disabled={isResetting} className="w-full p-4 border border-red-500/20 bg-red-500/5 text-red-400 rounded-xl hover:bg-red-500/10 transition-all font-medium">
                      {isResetting ? 'Resetting...' : 'Reset Database'}
                  </button>
               </Card>
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title={editingExpense ? 'Edit Expense' : 'New Expense'}>
        <ExpenseForm 
          initialData={editingExpense}
          categories={categories}
          onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
          onCancel={() => setIsExpenseModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title={editingCategory ? 'Edit Category' : 'New Category'}>
        <CategoryForm 
          initialData={editingCategory}
          onSubmit={handleSaveCategory}
          onCancel={() => setIsCategoryModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

const NavButton = ({ icon, active, onClick, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all w-16 ${active ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}>
    {icon}<span className="text-[10px] font-medium">{label}</span>
  </button>
);
const NavButtonMobile = ({ icon, active, onClick }: any) => (
  <button onClick={onClick} className={`p-4 rounded-2xl transition-all ${active ? 'text-blue-400' : 'text-slate-500'}`}>{icon}</button>
);

export default App;
