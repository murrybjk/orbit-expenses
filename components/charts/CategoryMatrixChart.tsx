import React, { useMemo } from 'react';
import { CategoryConfig } from '../../types';
import * as Icons from 'lucide-react';

interface CategoryMatrixChartProps {
    data: any[];
    categories: Record<string, CategoryConfig>;
}

export const CategoryMatrixChart: React.FC<CategoryMatrixChartProps> = ({ data, categories }) => {
    // 1. Get list of category IDs present in the data or categories prop
    const categoryIds = useMemo(() => Object.keys(categories), [categories]);

    // 2. Get list of months from data
    const months = useMemo(() => data.map(d => d.name), [data]);

    // 3. Calculate max value for heatmap intensity (excluding totals)
    const maxValue = useMemo(() => {
        let max = 0;
        data.forEach(monthData => {
            categoryIds.forEach(catId => {
                const val = monthData[catId] || 0;
                if (val > max) max = val;
            });
        });
        return max;
    }, [data, categoryIds]);

    // 4. Calculate Row Totals (Category Sums)
    const rowTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        categoryIds.forEach(catId => {
            totals[catId] = data.reduce((sum, monthData) => sum + (monthData[catId] || 0), 0);
        });
        return totals;
    }, [data, categoryIds]);

    // 5. Calculate Column Totals (Month Sums)
    const colTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        data.forEach(monthData => {
            totals[monthData.name] = monthData.total || 0; // Assuming 'total' is already in data, otherwise recalc
            // Recalculate to be safe and consistent with displayed categories
            let sum = 0;
            categoryIds.forEach(catId => {
                sum += monthData[catId] || 0;
            });
            totals[monthData.name] = sum;
        });
        return totals;
    }, [data, categoryIds]);

    // 6. Grand Total
    const grandTotal = useMemo(() => {
        return Object.values(colTotals).reduce((sum: number, val: unknown) => sum + (val as number), 0);
    }, [colTotals]);

    // Helper to format month (YYYY-MM -> MMM)
    const formatMonth = (dateStr: string) => {
        const [year, month] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'short' });
    };

    // Helper to format currency compact
    const formatCurrency = (val: number) => {
        if (val === 0) return '-';
        // Show exact integer, no cents, no 'k' suffix, with $
        return '$' + Math.round(val).toLocaleString();
    };

    // Helper to get icon component
    const getIcon = (iconName: string) => {
        const Icon = (Icons as any)[iconName] || Icons.Circle;
        return <Icon size={10} />; // Smaller icon
    };

    return (
        <div className="h-full w-full overflow-auto no-scrollbar">
            <table className="w-full border-collapse text-[9px]">
                <thead>
                    <tr>
                        <th className="sticky top-0 left-0 z-20 bg-card p-1 text-left font-medium text-muted border-b border-border min-w-[80px]">
                            Category
                        </th>
                        {months.map(month => (
                            <th key={month} className="sticky top-0 z-10 bg-card p-1 text-center font-medium text-muted border-b border-border min-w-[35px]">
                                {formatMonth(month)}
                            </th>
                        ))}
                        <th className="sticky top-0 z-10 bg-card p-1 text-center font-bold text-primary border-b border-border min-w-[40px] bg-accent/5">
                            Total
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {categoryIds.map(catId => {
                        const category = categories[catId];
                        if (!category) return null;

                        return (
                            <tr key={catId} className="hover:bg-accent/5 transition-colors group/row">
                                <td className="sticky left-0 z-10 bg-card p-1 border-b border-border/50 flex items-center gap-1.5 font-medium text-primary whitespace-nowrap h-[26px]">
                                    <span style={{ color: category.color }}>{getIcon(category.iconName)}</span>
                                    <span className="truncate max-w-[80px]" title={category.label}>{category.label}</span>
                                </td>
                                {data.map(monthData => {
                                    const value = monthData[catId] || 0;
                                    const intensity = maxValue > 0 ? value / maxValue : 0;

                                    return (
                                        <td key={monthData.name} className="p-0.5 border-b border-border/50 text-center relative group/cell">
                                            <div
                                                className="w-full h-full min-h-[20px] rounded-[2px] flex items-center justify-center transition-all"
                                                style={{
                                                    backgroundColor: value > 0 ? category.color : 'transparent',
                                                    opacity: value > 0 ? 0.15 + (intensity * 0.85) : 1,
                                                    color: value > 0 && intensity > 0.4 ? '#fff' : 'inherit'
                                                }}
                                            >
                                                {value > 0 && (
                                                    <span className={`font-medium ${value > 0 && intensity > 0.4 ? 'text-white' : 'text-foreground'} drop-shadow-sm`}>
                                                        {formatCurrency(value)}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Tooltip */}
                                            {value > 0 && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover/cell:opacity-100 pointer-events-none z-30 whitespace-nowrap border border-border">
                                                    <div className="font-bold">{category.label} - {formatMonth(monthData.name)}</div>
                                                    <div>${value.toLocaleString()}</div>
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                                {/* Row Total */}
                                <td className="p-1 border-b border-border/50 text-center font-bold text-primary bg-accent/5">
                                    {formatCurrency(rowTotals[catId])}
                                </td>
                            </tr>
                        );
                    })}

                    {/* Column Totals Row */}
                    <tr className="font-bold text-primary bg-accent/5 border-t border-border">
                        <td className="sticky left-0 z-10 bg-card p-1 text-left pl-2 bg-accent/5">
                            Total
                        </td>
                        {months.map(month => (
                            <td key={month} className="p-1 text-center">
                                {formatCurrency(colTotals[month])}
                            </td>
                        ))}
                        <td className="p-1 text-center bg-accent/10">
                            {formatCurrency(grandTotal)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
