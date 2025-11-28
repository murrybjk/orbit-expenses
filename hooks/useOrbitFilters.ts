import { useState, useMemo } from 'react';
import { Expense, CategoryConfig, DateScope } from '../types';
import { getTodayString } from '../constants';

export interface TableFilters {
    title: string;
    categories: string[];
    dateStart: string;
    dateEnd: string;
    amountMin: string;
    amountMax: string;
}

export const useOrbitFilters = (expenses: Expense[], categories: Record<string, CategoryConfig>) => {
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

    // 1. Base Data: Filtered by Date, Title, Amount (Everything EXCEPT Category)
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
    const filteredExpenses = useMemo(() => {
        return expensesInScope.filter(e => {
            if (filters.categories.length > 0 && !filters.categories.includes(e.categoryId)) return false;
            return true;
        });
    }, [expensesInScope, filters.categories]);

    // Chart Data derived from Base Data
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

    // Total Spent
    const totalSpent = useMemo(() => {
        return expensesInScope.reduce((sum, e) => sum + e.amount, 0);
    }, [expensesInScope]);

    // Trends Data
    const trendsData = useMemo(() => {
        const grouped: Record<string, any> = {};

        expensesInScope.forEach(e => {
            const monthKey = e.date.substring(0, 7);
            if (!grouped[monthKey]) {
                grouped[monthKey] = { name: monthKey, total: 0 };
            }
            grouped[monthKey][e.categoryId] = (grouped[monthKey][e.categoryId] || 0) + e.amount;
            grouped[monthKey].total += e.amount;
        });

        return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
    }, [expensesInScope]);

    // Filtered Trends Data
    const filteredTrendsData = useMemo(() => {
        const grouped: Record<string, any> = {};

        filteredExpenses.forEach(e => {
            const monthKey = e.date.substring(0, 7);
            if (!grouped[monthKey]) {
                grouped[monthKey] = { name: monthKey, total: 0 };
            }
            grouped[monthKey][e.categoryId] = (grouped[monthKey][e.categoryId] || 0) + e.amount;
            grouped[monthKey].total += e.amount;
        });

        return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
    }, [filteredExpenses]);

    // Dashboard Chart Categories
    const dashboardChartCategories = useMemo(() => {
        const activeCategories = new Set<string>();
        expensesInScope.forEach(e => {
            activeCategories.add(e.categoryId);
        });

        const filtered: Record<string, CategoryConfig> = {};

        if (filters.categories.length === 0) {
            Object.keys(categories).forEach(id => {
                if (activeCategories.has(id)) {
                    filtered[id] = categories[id];
                }
            });
            return filtered;
        }

        filters.categories.forEach(id => {
            if (categories[id] && activeCategories.has(id)) {
                filtered[id] = categories[id];
            }
        });
        return filtered;
    }, [categories, filters.categories, expensesInScope]);

    // Expense Counts
    const expenseCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        expenses.forEach(e => {
            counts[e.categoryId] = (counts[e.categoryId] || 0) + 1;
        });
        return counts;
    }, [expenses]);

    return {
        filters,
        setFilters,
        currentDate,
        setCurrentDate,
        dateScope,
        setDateScope,
        expensesInScope,
        filteredExpenses,
        chartData,
        totalSpent,
        trendsData,
        filteredTrendsData,
        dashboardChartCategories,
        expenseCounts
    };
};
