
import React from 'react';
import { Expense } from '../../types';
import { CATEGORIES, getIconComponent, formatDateForDisplay } from '../../constants';
import { Trash2, Edit2 } from 'lucide-react';

interface Props {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
}

const getRelativeDateLabel = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === yesterday.getTime()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
};

export const ExpenseList: React.FC<Props> = ({ expenses, onEdit, onDelete }) => {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 opacity-60">
        <p>No transactions found</p>
      </div>
    );
  }

  const grouped = expenses.reduce((acc, expense) => {
    const dateKey = expense.date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) => a < b ? 1 : -1);

  return (
    <div className="space-y-6 pb-24">
      {sortedDates.map(date => {
        const dailyTotal = grouped[date].reduce((sum, item) => sum + item.amount, 0);

        return (
          <div key={date} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-end mb-3 px-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                {getRelativeDateLabel(date)}
              </h3>
              <span className="text-xs font-medium text-gray-500">
                {dailyTotal.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}
              </span>
            </div>
            
            <div className="space-y-3">
              {grouped[date].map(expense => {
                const category = CATEGORIES[expense.categoryId] || { color: '#64748b', label: 'Unknown', iconName: 'CircleDashed' };
                
                return (
                  <div 
                    key={expense.id} 
                    className="group relative flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all hover:shadow-md"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {getIconComponent(category.iconName, { size: 20 })}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-200 truncate pr-2">{expense.title}</h4>
                        <span className="font-semibold whitespace-nowrap text-gray-200">
                          ${expense.amount.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        {category.label}
                        {expense.note && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-700" />
                            <span className="truncate max-w-[120px]">{expense.note}</span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 pl-2">
                      <button onClick={() => onEdit(expense)} className="p-2 text-gray-400 hover:text-indigo-400"><Edit2 size={16} /></button>
                      <button onClick={() => onDelete(expense.id)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
