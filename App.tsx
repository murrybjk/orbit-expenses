
import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Tag, Table2, PieChart, Settings as SettingsIcon, Upload, Download, FileText, RefreshCw, Shapes, Sun, Moon, TrendingUp, FileArchive } from 'lucide-react';
import { Expense, DateScope, CategoryConfig } from './types';
import { StorageService } from './services/storageService';
import { ApiService } from './services/apiService';
import { useToast } from './components/ui/Toast';
import { useTheme } from './components/ui/ThemeContext';

import { Card, Modal } from './components/ui/Elements';
import { DateRangeControl } from './components/ui/DateRangeControl';
import { ExpenseForm } from './components/expenses/ExpenseForm';
import { ExpensesTable, TableFilters } from './components/expenses/ExpensesTable';
import { CategoryChart } from './components/charts/CategoryChart';
import { TrendsChart } from './components/charts/TrendsChart';
import { CategoryMatrixChart } from './components/charts/CategoryMatrixChart';
import { CategoryFlashChart } from './components/charts/CategoryFlashChart';
import { CategoryManager } from './components/categories/CategoryManager';
import { CategoryForm } from './components/categories/CategoryForm';
import { IconLibrary } from './components/icons/IconLibrary';
import { getTodayString } from './constants';

type DashboardTab = 'OVERVIEW' | 'TRANSACTIONS';

const App: React.FC = () => {
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Record<string, CategoryConfig>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryConfig | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [mainView, setMainView] = useState<'DASHBOARD' | 'DASHBOARD_2' | 'TRANSACTIONS' | 'TRENDS' | 'CATEGORIES' | 'ICONS' | 'SETTINGS'>('DASHBOARD');
  const [mobileTab, setMobileTab] = useState<'OVERVIEW' | 'TRANSACTIONS'>('OVERVIEW');
  const [dashboardTrendsMode, setDashboardTrendsMode] = useState<'TOTAL' | 'CATEGORY' | 'MATRIX' | 'TABLE'>('MATRIX');

  const [filters, setFilters] = useState<TableFilters>({
    title: '',
    categories: [],
    dateStart: '',
    dateEnd: '',
    amountMin: '',
    amountMax: ''
  });



  const [currentDate, setCurrentDate] = useState(() => {
    const todayStr = getTodayString();
    const [y, m, d] = todayStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  });
  const [dateScope, setDateScope] = useState<DateScope>('MONTH');
  const [trendMode, setTrendMode] = useState<'TOTAL' | 'CATEGORY'>('CATEGORY');

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
      showToast("Failed to load data", "error");
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

  // Trends Data derived from Base Data (Grouped by Month)
  const trendsData = useMemo(() => {
    const grouped: Record<string, any> = {};

    expensesInScope.forEach(e => {
      // Format YYYY-MM
      const monthKey = e.date.substring(0, 7);

      if (!grouped[monthKey]) {
        grouped[monthKey] = { name: monthKey, total: 0 };
      }

      grouped[monthKey][e.categoryId] = (grouped[monthKey][e.categoryId] || 0) + e.amount;
      grouped[monthKey].total += e.amount;
    });

    // Convert to array and sort by date
    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  }, [expensesInScope]);

  // Filtered Trends Data (Respects Category Filters)
  const filteredTrendsData = useMemo(() => {
    const grouped: Record<string, any> = {};

    filteredExpenses.forEach(e => {
      // Format YYYY-MM
      const monthKey = e.date.substring(0, 7);

      if (!grouped[monthKey]) {
        grouped[monthKey] = { name: monthKey, total: 0 };
      }

      grouped[monthKey][e.categoryId] = (grouped[monthKey][e.categoryId] || 0) + e.amount;
      grouped[monthKey].total += e.amount;
    });

    // Convert to array and sort by date
    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredExpenses]);

  // Filter categories for Trends Chart based on selection AND non-zero value
  const dashboardChartCategories = useMemo(() => {
    // 1. Identify categories with > 0 value in the current scope
    const activeCategories = new Set<string>();
    expensesInScope.forEach(e => {
      activeCategories.add(e.categoryId);
    });

    const filtered: Record<string, CategoryConfig> = {};

    // 2. If no manual filter, return all active categories
    if (filters.categories.length === 0) {
      Object.keys(categories).forEach(id => {
        if (activeCategories.has(id)) {
          filtered[id] = categories[id];
        }
      });
      return filtered;
    }

    // 3. If manual filter, return selected active categories
    filters.categories.forEach(id => {
      if (categories[id] && activeCategories.has(id)) {
        filtered[id] = categories[id];
      }
    });
    return filtered;
  }, [categories, filters.categories, expensesInScope]);

  // Expense Counts per Category (for Deletion Protection)
  const expenseCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    expenses.forEach(e => {
      counts[e.categoryId] = (counts[e.categoryId] || 0) + 1;
    });
    return counts;
  }, [expenses]);

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
      showToast('Expense added', 'success');
    } else {
      setExpenses(prev => prev.filter(e => e.id !== tempId));
      showToast('Failed to save expense', 'error');
    }
  };

  const handleEditExpense = async (expenseData: Omit<Expense, 'id'>) => {
    if (!editingExpense) return;
    const updatedExpense = { ...expenseData, id: editingExpense.id };
    setExpenses(prev => prev.map(e => e.id === editingExpense.id ? updatedExpense : e));
    setIsExpenseModalOpen(false);
    setEditingExpense(null);

    const saved = await ApiService.updateExpense(updatedExpense);
    if (saved) {
      showToast('Expense updated', 'success');
    } else {
      setExpenses(prev => prev.map(e => e.id === editingExpense.id ? editingExpense : e));
      showToast('Failed to update expense', 'error');
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (window.confirm('Delete this expense?')) {
      const previousExpenses = [...expenses];
      setExpenses(prev => prev.filter(e => e.id !== id));
      const success = await ApiService.deleteExpense(id);
      if (success) {
        showToast('Expense deleted', 'success');
      } else {
        setExpenses(previousExpenses);
        showToast('Failed to delete expense', 'error');
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
    setCategories(prev => ({ ...prev, [category.id]: category }));
    setIsCategoryModalOpen(false);
    setEditingCategory(null);

    let result;
    if (previousCategories[category.id]) {
      result = await ApiService.updateCategory(category);
    } else {
      result = await ApiService.createCategory(category);
    }

    if (result.success) {
      showToast('Category saved', 'success');
    } else {
      setCategories(previousCategories);
      showToast(`Failed to save category: ${result.error?.message || 'Unknown error'}`, 'error');
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
              showToast('Category and expenses deleted', 'success');
              return; // Done
            }
          }
          showToast('Failed to cascade delete. Please try again.', 'error');
        }
      } else {
        // Other error (e.g. RLS)
        console.error("Delete error:", result.error);
        showToast(`Failed to delete category: ${result.error?.message || 'Unknown error'}`, 'error');
      }
    } else {
      showToast('Category deleted', 'success');
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
          showToast('No valid expenses found in CSV', 'info');
        } else {
          let count = 0;
          for (const expense of newExpenses) {
            await ApiService.createExpense(expense);
            count++;
          }
          const fetchedExpenses = await ApiService.getExpenses();
          setExpenses(fetchedExpenses);
          setDateScope('ALL');
          showToast(`Imported ${count} expenses`, 'success');
        }
      } catch (error) {
        showToast('Failed to parse CSV', 'error');
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
        showToast('Reset successful', 'success');
      } else {
        showToast('Reset failed', 'error');
      }
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center text-muted">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app text-primary selection:bg-accent/30 pb-24 md:pb-0 md:pl-20 font-sans transition-colors duration-300">

      <div className="hidden md:flex fixed left-0 top-0 h-full w-20 flex-col items-center py-8 bg-card border-r border-border z-50 transition-colors duration-300">
        <div className="mb-8 p-3 bg-accent rounded-xl shadow-lg shadow-accent/20">
          <div className="w-5 h-5 rounded-full border-2 border-white" />
        </div>
        <div className="space-y-6 flex flex-col items-center w-full">
          <NavButton
            active={mainView === 'DASHBOARD'}
            onClick={() => setMainView('DASHBOARD')}
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
          />
          <NavButton
            active={mainView === 'DASHBOARD_2'}
            onClick={() => setMainView('DASHBOARD_2')}
            icon={<FileArchive size={20} />}
            label="Dashboard 2.0"
          />
          <NavButton
            active={mainView === 'TRANSACTIONS'}
            onClick={() => setMainView('TRANSACTIONS')}
            icon={<Table2 size={20} />}
            label="Table"
          />
          <NavButton icon={<TrendingUp size={24} />} active={mainView === 'TRENDS'} onClick={() => setMainView('TRENDS')} label="Trends" />
          <NavButton icon={<Tag size={24} />} active={mainView === 'CATEGORIES'} onClick={() => setMainView('CATEGORIES')} label="Categories" />
          <NavButton icon={<Shapes size={24} />} active={mainView === 'ICONS'} onClick={() => setMainView('ICONS')} label="Icons" />
          <div className="flex-1" />
          <NavButton icon={<SettingsIcon size={24} />} active={mainView === 'SETTINGS'} onClick={() => setMainView('SETTINGS')} label="Settings" />
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 w-full bg-card/95 backdrop-blur-lg border-t border-border flex justify-around items-center p-4 z-50 pb-safe transition-colors duration-300">
        <NavButtonMobile icon={<PieChart size={24} />} active={mainView === 'DASHBOARD' && mobileTab === 'OVERVIEW'} onClick={() => { setMainView('DASHBOARD'); setMobileTab('OVERVIEW'); }} />
        <NavButtonMobile icon={<FileArchive size={24} />} active={mainView === 'DASHBOARD_2' && mobileTab === 'OVERVIEW'} onClick={() => { setMainView('DASHBOARD_2'); setMobileTab('OVERVIEW'); }} />
        <NavButtonMobile icon={<Table2 size={24} />} active={mainView === 'TRANSACTIONS'} onClick={() => setMainView('TRANSACTIONS')} />
        <NavButtonMobile icon={<TrendingUp size={24} />} active={mainView === 'TRENDS'} onClick={() => setMainView('TRENDS')} />
        <NavButtonMobile icon={<Tag size={24} />} active={mainView === 'CATEGORIES'} onClick={() => setMainView('CATEGORIES')} />
        <NavButtonMobile icon={<SettingsIcon size={24} />} active={mainView === 'SETTINGS'} onClick={() => setMainView('SETTINGS')} />
      </div>

      <main className="max-w-[1600px] mx-auto px-4 py-4 md:py-6 space-y-4 h-full md:h-screen flex flex-col">
        <div className="flex-1 min-h-0">
          {mainView === 'DASHBOARD' && (
            <div className="flex flex-col lg:flex-row h-full gap-4">
              <div className={`lg:w-[340px] xl:w-[380px] shrink-0 flex flex-col ${mobileTab === 'OVERVIEW' ? 'flex' : 'hidden lg:flex'}`}>
                <Card className="bg-card border-border flex-1 flex flex-col p-5 transition-colors duration-300">
                  <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Distribution</h3>
                    <button
                      onClick={toggleTheme}
                      className="p-2 rounded-lg text-muted hover:text-primary hover:bg-accent/10 transition-colors lg:hidden"
                      title="Toggle Theme"
                    >
                      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                  </div>
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
                  rightControls={
                    <button onClick={toggleTheme} className="p-2 rounded-lg text-muted hover:text-primary hover:bg-accent/10 transition-colors" title="Toggle Theme">
                      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                  }
                />
              </div>
            </div>
          )}

          {mainView === 'DASHBOARD_2' && (
            <div className="flex flex-col lg:flex-row h-full gap-4">
              <div className={`lg:w-[340px] xl:w-[380px] shrink-0 flex flex-col ${mobileTab === 'OVERVIEW' ? 'flex' : 'hidden lg:flex'}`}>
                <Card className="bg-card border-border flex-1 flex flex-col p-5 transition-colors duration-300">
                  <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Distribution</h3>
                    <button
                      onClick={toggleTheme}
                      className="p-2 rounded-lg text-muted hover:text-primary hover:bg-accent/10 transition-colors lg:hidden"
                      title="Toggle Theme"
                    >
                      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                  </div>
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
              <div className={`flex-1 min-w-0 flex flex-col gap-4 ${mobileTab === 'TRANSACTIONS' ? 'flex' : 'hidden lg:flex'}`}>
                <div className="flex-1 min-h-0 flex flex-col">
                  <ExpensesTable
                    expenses={filteredExpenses}
                    categories={categories}
                    filters={filters}
                    onFilterChange={setFilters}
                    onEdit={openEditExpenseModal}
                    onDelete={handleDeleteExpense}
                    onAdd={handleAddExpense}
                    onOpenAddModal={openAddExpenseModal}
                    density="compact"
                    headerControls={
                      <DateRangeControl
                        currentDate={currentDate}
                        scope={dateScope}
                        onDateChange={setCurrentDate}
                        onScopeChange={setDateScope}
                      />
                    }
                    rightControls={
                      <button onClick={toggleTheme} className="p-2 rounded-lg text-muted hover:text-primary hover:bg-accent/10 transition-colors" title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                      </button>
                    }
                  />
                </div>
                <Card className="h-[300px] shrink-0 bg-card border-border p-5 transition-colors duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Trends</h3>
                    <div className="flex bg-accent/10 rounded-lg p-0.5">
                      <button
                        onClick={() => setDashboardTrendsMode('TOTAL')}
                        className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${dashboardTrendsMode === 'TOTAL' ? 'bg-card text-primary shadow-sm' : 'text-muted hover:text-primary'}`}
                      >
                        Total
                      </button>
                      <button
                        onClick={() => setDashboardTrendsMode('CATEGORY')}
                        className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${dashboardTrendsMode === 'CATEGORY' ? 'bg-card text-primary shadow-sm' : 'text-muted hover:text-primary'}`}
                      >
                        Category
                      </button>
                      <button
                        onClick={() => setDashboardTrendsMode('MATRIX')}
                        className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${dashboardTrendsMode === 'MATRIX' ? 'bg-card text-primary shadow-sm' : 'text-muted hover:text-primary'}`}
                      >
                        Matrix
                      </button>
                      <button
                        onClick={() => setDashboardTrendsMode('FLASH')}
                        className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${dashboardTrendsMode === 'FLASH' ? 'bg-card text-primary shadow-sm' : 'text-muted hover:text-primary'}`}
                      >
                        Flash
                      </button>
                    </div>
                  </div>
                  <div className="h-[calc(100%-2rem)]">
                    {dashboardTrendsMode === 'MATRIX' ? (
                      <CategoryMatrixChart
                        data={filteredTrendsData}
                        categories={dashboardChartCategories}
                      />
                    ) : dashboardTrendsMode === 'FLASH' ? (
                      <CategoryFlashChart
                        data={filteredTrendsData}
                        categories={dashboardChartCategories}
                      />
                    ) : (
                      <TrendsChart
                        data={filteredTrendsData}
                        categories={dashboardChartCategories}
                        mode={dashboardTrendsMode as 'TOTAL' | 'CATEGORY'}
                        compact={true}
                      />
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {mainView === 'TRANSACTIONS' && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-primary">Transactions</h2>
                <DateRangeControl
                  currentDate={currentDate}
                  scope={dateScope}
                  onDateChange={setCurrentDate}
                  onScopeChange={setDateScope}
                />
              </div>
              <div className="flex-1 min-h-0 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <ExpensesTable
                  expenses={filteredExpenses}
                  categories={categories}
                  filters={filters}
                  onFilterChange={setFilters}
                  onEdit={openEditExpenseModal}
                  onDelete={handleDeleteExpense}
                  onAdd={handleAddExpense}
                  onOpenAddModal={openAddExpenseModal}
                  density="compact"
                  rightControls={
                    <button onClick={toggleTheme} className="p-2 rounded-lg text-muted hover:text-primary hover:bg-accent/10 transition-colors" title="Toggle Theme">
                      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                  }
                />
              </div>
            </div>
          )}

          {mainView === 'TRENDS' && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-primary">Expense Trends</h2>
                <div className="flex items-center gap-4">
                  <div className="flex bg-card border border-border rounded-lg p-1">
                    <button
                      onClick={() => setTrendMode('TOTAL')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${trendMode === 'TOTAL' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-primary'
                        }`}
                    >
                      Total
                    </button>
                    <button
                      onClick={() => setTrendMode('CATEGORY')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${trendMode === 'CATEGORY' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-primary'
                        }`}
                    >
                      By Category
                    </button>
                  </div>
                  <DateRangeControl
                    currentDate={currentDate}
                    scope={dateScope}
                    onDateChange={setCurrentDate}
                    onScopeChange={setDateScope}
                  />
                  <button onClick={toggleTheme} className="p-2 rounded-lg text-muted hover:text-primary hover:bg-accent/10 transition-colors" title="Toggle Theme">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                </div>
              </div>
              <Card className="bg-card border-border flex-1 p-5 transition-colors duration-300 min-h-0">
                <TrendsChart data={trendsData} categories={categories} mode={trendMode} />
              </Card>
            </div>
          )}

          {mainView === 'CATEGORIES' && (
            <div className="h-full overflow-y-auto pb-20 md:pb-0 no-scrollbar">
              <CategoryManager
                categories={categories}
                expenseCounts={expenseCounts}
                onCreate={openAddCategoryModal}
                onEdit={openEditCategoryModal}
                onDelete={handleDeleteCategory}
                headerAction={
                  <button onClick={toggleTheme} className="p-2 rounded-lg text-muted hover:text-primary hover:bg-accent/10 transition-colors" title="Toggle Theme">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                }
              />
            </div>
          )}

          {mainView === 'ICONS' && (
            <div className="h-full overflow-y-auto pb-20 md:pb-0 no-scrollbar">
              <IconLibrary
                headerAction={
                  <button onClick={toggleTheme} className="p-2 rounded-lg text-muted hover:text-primary hover:bg-accent/10 transition-colors" title="Toggle Theme">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                }
              />
            </div>
          )}

          {mainView === 'SETTINGS' && (
            <div className="h-full overflow-y-auto pb-20 md:pb-0 no-scrollbar max-w-3xl mx-auto pt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Settings</h2>
                <button onClick={toggleTheme} className="p-2 rounded-lg text-muted hover:text-primary hover:bg-accent/10 transition-colors" title="Toggle Theme">
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
              <Card className="mb-6 bg-card border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-accent/10 text-accent rounded-xl"><FileText size={24} /></div>
                  <div><h3 className="text-lg font-semibold text-primary">Data Management</h3></div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <button onClick={() => StorageService.exportToCSV(expenses)} className="flex flex-col items-center p-6 bg-app border border-border rounded-xl hover:bg-accent/5 transition-all gap-3">
                    <Download size={24} className="text-muted" /><span className="font-medium text-primary">Export CSV</span>
                  </button>
                  <button onClick={StorageService.downloadTemplate} className="flex flex-col items-center p-6 bg-app border border-border rounded-xl hover:bg-accent/5 transition-all gap-3">
                    <FileText size={24} className="text-muted" /><span className="font-medium text-primary">Template</span>
                  </button>
                  <label className="flex flex-col items-center p-6 bg-app border border-border rounded-xl hover:bg-accent/5 transition-all gap-3 cursor-pointer">
                    <Upload size={24} className="text-muted" /><span className="font-medium text-primary">{isImporting ? '...' : 'Import CSV'}</span>
                    <input type="file" accept=".csv" className="hidden" onChange={handleImport} disabled={isImporting} />
                  </label>
                </div>
              </Card>
              <Card className="bg-card border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-red-500/10 text-red-500 rounded-xl"><RefreshCw size={24} /></div>
                  <div><h3 className="text-lg font-semibold text-primary">Danger Zone</h3></div>
                </div>
                <button onClick={handleResetDatabase} disabled={isResetting} className="w-full p-4 border border-red-500/20 bg-red-500/5 text-red-500 rounded-xl hover:bg-red-500/10 transition-all font-medium">
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
  <button onClick={onClick} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all w-16 ${active ? 'text-accent bg-accent/10' : 'text-muted hover:text-primary hover:bg-accent/5'}`}>
    {icon}<span className="text-[10px] font-medium">{label}</span>
  </button>
);
const NavButtonMobile = ({ icon, active, onClick }: any) => (
  <button onClick={onClick} className={`p-4 rounded-2xl transition-all ${active ? 'text-accent' : 'text-muted'}`}>{icon}</button>
);

export default App;
