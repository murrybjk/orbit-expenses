import { useState, useEffect, useCallback } from 'react';
import { Expense, CategoryConfig } from '../types';
import { ApiService } from '../services/apiService';
import { useToast } from '../components/ui/Toast';

export const useOrbitData = () => {
    const { showToast } = useToast();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<Record<string, CategoryConfig>>({});
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
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
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Expense Actions ---

    const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
        const tempId = Date.now();
        const newExpense: Expense = { ...expenseData, id: tempId };

        // Optimistic Update
        setExpenses(prev => [newExpense, ...prev]);

        const saved = await ApiService.createExpense(newExpense);
        if (saved) {
            setExpenses(prev => prev.map(e => e.id === tempId ? saved : e));
            showToast('Expense added', 'success');
            return true;
        } else {
            setExpenses(prev => prev.filter(e => e.id !== tempId));
            showToast('Failed to save expense', 'error');
            return false;
        }
    };

    const updateExpense = async (expenseData: Omit<Expense, 'id'>, originalId: number) => {
        const updatedExpense = { ...expenseData, id: originalId };

        // Optimistic Update
        setExpenses(prev => prev.map(e => e.id === originalId ? updatedExpense : e));

        const saved = await ApiService.updateExpense(updatedExpense);
        if (saved) {
            showToast('Expense updated', 'success');
            return true;
        } else {
            // Revert would require passing original expense, or re-fetching. 
            // For simplicity in this refactor, we'll just re-fetch on error or accept the risk.
            // Ideally, we'd pass the original expense to revert to.
            showToast('Failed to update expense', 'error');
            fetchData(); // Re-sync to be safe
            return false;
        }
    };

    const deleteExpense = async (id: number) => {
        const previousExpenses = [...expenses];
        setExpenses(prev => prev.filter(e => e.id !== id));

        const success = await ApiService.deleteExpense(id);
        if (success) {
            showToast('Expense deleted', 'success');
            return true;
        } else {
            setExpenses(previousExpenses);
            showToast('Failed to delete expense', 'error');
            return false;
        }
    };

    // --- Category Actions ---

    const saveCategory = async (category: CategoryConfig, isNew: boolean) => {
        const previousCategories = { ...categories };
        setCategories(prev => ({ ...prev, [category.id]: category }));

        let result;
        if (!isNew) {
            result = await ApiService.updateCategory(category);
        } else {
            result = await ApiService.createCategory(category);
        }

        if (result.success) {
            showToast('Category saved', 'success');
            return true;
        } else {
            setCategories(previousCategories);
            showToast(`Failed to save category: ${result.error?.message || 'Unknown error'}`, 'error');
            return false;
        }
    };

    const deleteCategory = async (categoryId: string) => {
        const previousCategories = { ...categories };
        const newCategories = { ...categories };
        delete newCategories[categoryId];
        setCategories(newCategories);

        const result = await ApiService.deleteCategory(categoryId);

        if (!result.success) {
            setCategories(previousCategories);

            // Check for Foreign Key violation
            if (result.error && (result.error.code === '23503' || result.error.message?.includes('foreign key constraint'))) {
                if (window.confirm('This category contains expenses. Do you want to delete all associated expenses as well?')) {
                    const cascadeSuccess = await ApiService.deleteExpensesByCategory(categoryId);
                    if (cascadeSuccess) {
                        const retryResult = await ApiService.deleteCategory(categoryId);
                        if (retryResult.success) {
                            setExpenses(prev => prev.filter(e => e.categoryId !== categoryId));
                            showToast('Category and expenses deleted', 'success');
                            return true;
                        }
                    }
                    showToast('Failed to cascade delete. Please try again.', 'error');
                }
            } else {
                console.error("Delete error:", result.error);
                showToast(`Failed to delete category: ${result.error?.message || 'Unknown error'}`, 'error');
            }
            return false;
        } else {
            showToast('Category deleted', 'success');
            return true;
        }
    };

    const resetDatabase = async () => {
        if (window.confirm('WARNING: This will delete ALL data. Continue?')) {
            const success = await ApiService.resetDatabase();
            if (success) {
                await fetchData();
                showToast('Reset successful', 'success');
                return true;
            } else {
                showToast('Reset failed', 'error');
                return false;
            }
        }
        return false;
    };

    return {
        expenses,
        categories,
        isLoading,
        setExpenses, // Exposed for import logic
        setCategories, // Exposed for manual updates if needed
        fetchData,
        addExpense,
        updateExpense,
        deleteExpense,
        saveCategory,
        deleteCategory,
        resetDatabase
    };
};
