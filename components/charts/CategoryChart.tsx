
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint, CategoryConfig } from '../../types';
import { getIconComponent } from '../../constants';

interface Props {
  data: ChartDataPoint[];
  total: number;
  categories: Record<string, CategoryConfig>;
  onCategoryClick?: (categoryId: string) => void;
  selectedCategories?: string[];
}

export const CategoryChart: React.FC<Props> = ({ 
  data, 
  total, 
  categories, 
  onCategoryClick, 
  selectedCategories = [] 
}) => {
  if (data.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-slate-500 text-xs border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
        No data for this period
      </div>
    );
  }

  const getOpacity = (categoryId: string) => {
    if (selectedCategories.length === 0) return 1;
    return selectedCategories.includes(categoryId) ? 1 : 0.3;
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full gap-4">
      <div className="w-full aspect-square max-h-[220px] relative shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="85%"
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {data.map((entry, index) => {
                const isSelected = selectedCategories.includes(entry.categoryId);
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke={entry.color}
                    strokeWidth={isSelected ? 2 : 0}
                    onClick={() => onCategoryClick?.(entry.categoryId)}
                    style={{ 
                      cursor: 'pointer', 
                      opacity: getOpacity(entry.categoryId),
                      transition: 'opacity 0.3s ease',
                      filter: isSelected ? 'brightness(1.1)' : 'none'
                    }}
                  />
                );
              })}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderColor: '#1e293b', 
                borderRadius: '0.5rem', 
                color: '#f1f5f9', 
                padding: '6px 10px',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
              }}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
              cursor={false}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
           <span className="text-slate-500 text-[10px] font-medium uppercase tracking-widest mb-0.5">Total</span>
           <span className="text-2xl font-bold text-white tracking-tight">
             ${total.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
           </span>
        </div>
      </div>

      <div className="w-full space-y-2 overflow-y-auto flex-1 min-h-0 px-1 no-scrollbar">
        {data.map((item) => {
          const category = categories[item.categoryId];
          if (!category) return null;
          const percentage = ((item.value / total) * 100).toFixed(1);
          const isSelected = selectedCategories.includes(item.categoryId);
          const opacity = getOpacity(item.categoryId);

          return (
            <div 
              key={item.name} 
              onClick={() => onCategoryClick?.(item.categoryId)}
              style={{ opacity }}
              className={`group flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-800/50 transition-all cursor-pointer ${isSelected ? 'bg-slate-800/80 ring-1 ring-slate-700' : ''}`}
            >
              <div 
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${item.color}15`, color: item.color }}
              >
                {getIconComponent(category.iconName, { size: 14 })}
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-300 truncate">{item.name}</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div style={{ width: `${percentage}%`, backgroundColor: item.color }} className="h-full rounded-full" />
                </div>
              </div>
              
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-slate-200">
                    ${item.value.toFixed(0)} 
                    <span className="text-slate-500 font-normal ml-1">{percentage}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
