import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CategoryConfig } from '../../types';

interface TrendsChartProps {
    data: any[];
    categories: Record<string, CategoryConfig>;
    mode: 'TOTAL' | 'CATEGORY';
    compact?: boolean;
}

export const TrendsChart: React.FC<TrendsChartProps> = ({ data, categories, mode, compact = false }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-slate-500">
                No data available for the selected period
            </div>
        );
    }

    // Custom Tooltip to show formatted currency and better labels
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border border-border p-3 rounded-lg shadow-xl">
                    <p className="text-primary font-medium mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-muted">{entry.name}:</span>
                            <span className="text-primary font-mono">${Number(entry.value).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const formatXAxis = (tickItem: string) => {
        if (compact) {
            // tickItem is "YYYY-MM"
            const [year, month] = tickItem.split('-').map(Number);
            const date = new Date(year, month - 1, 1); // Use local time constructor: new Date(year, monthIndex, day)
            return date.toLocaleDateString('en-US', { month: compact ? 'short' : 'short' });
        }
        return tickItem;
    };

    return (
        <div className="h-full w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 10,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
                    <XAxis
                        dataKey="name"
                        stroke="var(--text-muted)"
                        fontSize={compact ? 10 : 12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                        tickFormatter={formatXAxis}
                    />
                    <YAxis
                        stroke="var(--text-muted)"
                        fontSize={compact ? 10 : 12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                        dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-color)' }} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                    />

                    {mode === 'TOTAL' ? (
                        <Line
                            type="monotone"
                            dataKey="total"
                            name="Total Spending"
                            stroke="var(--accent-primary)"
                            strokeWidth={3}
                            dot={{ r: 4, fill: 'var(--accent-primary)', strokeWidth: 2, stroke: 'var(--bg-card)' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    ) : (
                        Object.values(categories).map((category: CategoryConfig) => (
                            <Line
                                key={category.id}
                                type="monotone"
                                dataKey={category.id}
                                name={category.label}
                                stroke={category.color}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                connectNulls
                            />
                        ))
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
