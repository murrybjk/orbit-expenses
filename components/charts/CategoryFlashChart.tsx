import React, { useMemo } from 'react';
import { CategoryConfig } from '../../types';
import * as Icons from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface CategoryFlashChartProps {
    data: any[];
    categories: Record<string, CategoryConfig>;
}

export const CategoryFlashChart: React.FC<CategoryFlashChartProps> = ({ data, categories }) => {
    // 1. Get list of category IDs
    const categoryIds = useMemo(() => Object.keys(categories), [categories]);

    // 2. Get list of months from data
    const months = useMemo(() => data.map(d => d.name), [data]);

    // 3. Calculate max value for heatmap intensity
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

    // Helper to format month (YYYY-MM -> MMM)
    const formatMonth = (dateStr: string) => {
        const [year, month] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'short' });
    };

    // Helper to format currency
    const formatCurrency = (val: number) => {
        if (val === 0) return '-';
        return '$' + Math.round(val).toLocaleString();
    };

    // Helper to get icon component
    const getIcon = (iconName: string) => {
        const Icon = (Icons as any)[iconName] || Icons.Circle;
        return <Icon size={10} />;
    };

    return (
        <div className="h-full w-full overflow-auto no-scrollbar pr-2 relative">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-card border-b border-border mb-4 grid grid-cols-[80px_1fr_60px] gap-2 py-2">
                <div className="text-[10px] font-semibold text-muted pl-1">Category</div>
                <div className="grid grid-cols-12 gap-0.5">
                    {months.map(month => (
                        <div key={month} className="text-center text-[9px] font-medium text-muted">
                            {formatMonth(month)}
                        </div>
                    ))}
                </div>
                <div className="text-right text-[10px] font-semibold text-muted pr-1">Total</div>
            </div>

            <div className="flex flex-col gap-6 pb-4">
                {categoryIds.map(catId => {
                    const category = categories[catId];
                    if (!category) return null;

                    // Prepare data for this category's chart
                    const categoryChartData = data.map(d => ({
                        name: d.name,
                        value: d[catId] || 0
                    }));

                    const total = categoryChartData.reduce((sum, d) => sum + d.value, 0);

                    return (
                        <div key={catId} className="flex flex-col gap-1">
                            {/* Matrix Row */}
                            <div className="grid grid-cols-[80px_1fr_60px] items-center gap-2">
                                {/* Category Label */}
                                <div className="flex items-center gap-1.5 font-medium text-primary whitespace-nowrap text-[10px] pl-1">
                                    <span style={{ color: category.color }}>{getIcon(category.iconName)}</span>
                                    <span className="truncate" title={category.label}>{category.label}</span>
                                </div>

                                {/* Monthly Values (Heatmap) */}
                                <div className="grid grid-cols-12 gap-0.5">
                                    {data.map(monthData => {
                                        const value = monthData[catId] || 0;
                                        const intensity = maxValue > 0 ? value / maxValue : 0;

                                        return (
                                            <div
                                                key={monthData.name}
                                                className="h-[24px] rounded-[2px] flex items-center justify-center text-[9px] transition-all relative group/cell font-bold"
                                                style={{
                                                    backgroundColor: value > 0 ? category.color : 'transparent',
                                                    opacity: value > 0 ? 0.15 + (intensity * 0.85) : 1,
                                                    color: value > 0 && intensity > 0.4 ? '#fff' : 'inherit',
                                                    border: value === 0 ? '1px solid var(--border)' : 'none'
                                                }}
                                            >
                                                {value > 0 && (
                                                    <span className={`font-bold ${value > 0 && intensity > 0.4 ? 'text-white' : 'text-foreground'} drop-shadow-sm`}>
                                                        {formatCurrency(value)}
                                                    </span>
                                                )}
                                                {/* Tooltip */}
                                                {value > 0 && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover/cell:opacity-100 pointer-events-none z-30 whitespace-nowrap border border-border font-normal">
                                                        <div className="font-bold">{category.label} - {formatMonth(monthData.name)}</div>
                                                        <div className="font-bold">${value.toLocaleString()}</div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Total */}
                                <div className="text-right font-bold text-primary text-[10px] bg-accent/5 p-1 rounded">
                                    {formatCurrency(total)}
                                </div>
                            </div>

                            {/* Line Chart Row */}
                            <div className="h-[60px] w-full pl-[80px] pr-[60px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={categoryChartData}>
                                        <defs>
                                            <linearGradient id={`color-${catId}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={category.color} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={category.color} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={category.color}
                                            fillOpacity={1}
                                            fill={`url(#color-${catId})`}
                                            strokeWidth={1.5}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
