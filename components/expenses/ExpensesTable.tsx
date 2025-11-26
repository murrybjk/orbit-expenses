
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Expense, SortField, SortDirection, CategoryConfig } from '../../types';
import { getIconComponent, formatDateForDisplay, getTodayString } from '../../constants';
import { ArrowUp, ArrowDown, Trash2, Edit2, Plus, Filter, X, CheckSquare, Square, ChevronDown, Search } from 'lucide-react';

export interface TableFilters {
  title: string;
  categories: string[];
  dateStart: string;
  dateEnd: string;
  amountMin: string;
  amountMax: string;
}

interface Props {
  expenses: Expense[];
  categories: Record<string, CategoryConfig>;
  filters: TableFilters;
  onFilterChange: (newFilters: TableFilters) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onOpenAddModal: () => void;
  headerControls?: React.ReactNode;
}

export const ExpensesTable: React.FC<Props> = ({ 
  expenses, categories, filters, onFilterChange, onEdit, onDelete, onAdd, onOpenAddModal, headerControls
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<string>(Object.keys(categories)[0]);
  const [newDate, setNewDate] = useState(getTodayString());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const updateFilter = (key: keyof TableFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleCategorySelection = (catId: string) => {
    const current = filters.categories;
    const updated = current.includes(catId)
      ? current.filter(id => id !== catId)
      : [...current, catId];
    updateFilter('categories', updated);
  };

  const clearFilter = (key: keyof TableFilters | 'amount' | 'date') => {
    if (key === 'amount') {
      onFilterChange({ ...filters, amountMin: '', amountMax: '' });
    } else if (key === 'date') {
      onFilterChange({ ...filters, dateStart: '', dateEnd: '' });
    } else {
      updateFilter(key as keyof TableFilters, key === 'categories' ? [] : '');
    }
  };

  const sortedExpenses = useMemo(() => {
    const result = [...expenses];
    result.sort((a, b) => {
      let valA: any = a[fieldToKey(sortField)];
      let valB: any = b[fieldToKey(sortField)];

      if (sortField === 'amount') {
        valA = Number(valA);
        valB = Number(valB);
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [expenses, sortField, sortDirection]);

  function fieldToKey(field: SortField): keyof Expense {
    switch (field) {
      case 'date': return 'date';
      case 'amount': return 'amount';
      case 'title': return 'title';
      case 'category': return 'categoryId';
    }
  }

  const handleQuickAdd = () => {
    if (!newTitle || !newAmount || !newDate) return;
    onAdd({
      title: newTitle,
      amount: parseFloat(newAmount),
      date: newDate,
      categoryId: newCategory
    });
    setNewTitle('');
    setNewAmount('');
    setIsQuickAdding(false);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp size={14} className="text-blue-400" /> : <ArrowDown size={14} className="text-blue-400" />;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveFilterDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (e: React.MouseEvent, dropdown: string) => {
    e.stopPropagation();
    setActiveFilterDropdown(activeFilterDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="bg-gray-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
      
      <div className="px-4 py-3 border-b border-slate-800 bg-gray-900/80 flex items-center justify-between gap-4">
        <div className="flex-1">
           {headerControls}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Add Expense</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative min-h-[400px]">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-gray-900 z-10 shadow-sm">
            <tr className="border-b border-slate-800">
              <th className="px-4 py-3 font-medium text-slate-500 w-12 bg-gray-900"></th>
              
              <th className="px-4 py-3 font-medium text-slate-400 bg-gray-900 relative group">
                {activeFilterDropdown === 'title' ? (
                  <div 
                    ref={dropdownRef} 
                    className="absolute inset-0 bg-gray-900 flex items-center px-3 border-b-2 border-blue-500/50 z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Search size={14} className="text-slate-500 shrink-0 mr-2" />
                    <input 
                      autoFocus
                      className="bg-transparent border-none text-sm text-slate-200 placeholder-slate-600 focus:outline-none w-full h-full"
                      placeholder="Filter title..."
                      value={filters.title}
                      onChange={(e) => updateFilter('title', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Escape') setActiveFilterDropdown(null);
                      }}
                    />
                    <button 
                       onClick={(e) => {
                          e.stopPropagation();
                          if(filters.title) {
                            updateFilter('title', '');
                          } else {
                            setActiveFilterDropdown(null);
                          }
                       }}
                       className="p-1 text-slate-500 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 h-full">
                    <span className="cursor-pointer hover:text-slate-200 transition-colors" onClick={() => handleSort('title')}>Title</span>
                    <button onClick={(e) => toggleDropdown(e, 'title')} className={`p-1 rounded hover:bg-gray-800 ${filters.title ? 'text-blue-400' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`}>
                      <Filter size={12} fill={filters.title ? "currentColor" : "none"} />
                    </button>
                    <SortIcon field="title" />
                  </div>
                )}
              </th>

              <th className="px-4 py-3 font-medium text-slate-400 bg-gray-900 relative group">
                <div className="flex items-center gap-2">
                  <span className="cursor-pointer hover:text-slate-200 transition-colors" onClick={() => handleSort('category')}>Category</span>
                  <button onClick={(e) => toggleDropdown(e, 'category')} className={`p-1 rounded hover:bg-gray-800 ${filters.categories.length > 0 ? 'text-blue-400' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`}>
                    <Filter size={12} fill={filters.categories.length > 0 ? "currentColor" : "none"} />
                  </button>
                  <SortIcon field="category" />
                </div>
                {activeFilterDropdown === 'category' && (
                  <div ref={dropdownRef} className="absolute left-0 top-full mt-2 w-56 bg-gray-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-2 border-b border-slate-800 bg-gray-900 flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Select</span>
                      {filters.categories.length > 0 && <button onClick={() => clearFilter('categories')} className="text-xs text-blue-400">Clear</button>}
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                      {Object.values(categories).map((cat) => (
                        <label key={cat.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg cursor-pointer">
                          <div className={`text-slate-400 ${filters.categories.includes(cat.id) ? 'text-blue-500' : ''}`}>
                            {filters.categories.includes(cat.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                             <span className="text-slate-200 text-xs font-medium">{cat.label}</span>
                          </div>
                          <input type="checkbox" className="hidden" checked={filters.categories.includes(cat.id)} onChange={() => toggleCategorySelection(cat.id)} />
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </th>

              <th className="px-4 py-3 font-medium text-slate-400 bg-gray-900 relative group">
                <div className="flex items-center gap-2">
                  <span className="cursor-pointer hover:text-slate-200 transition-colors" onClick={() => handleSort('date')}>Date</span>
                  <button onClick={(e) => toggleDropdown(e, 'date')} className={`p-1 rounded hover:bg-gray-800 ${(filters.dateStart || filters.dateEnd) ? 'text-blue-400' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`}>
                    <Filter size={12} fill={(filters.dateStart || filters.dateEnd) ? "currentColor" : "none"} />
                  </button>
                  <SortIcon field="date" />
                </div>
                {activeFilterDropdown === 'date' && (
                   <div ref={dropdownRef} className="absolute left-0 top-full mt-2 w-64 bg-gray-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-3">
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-semibold text-slate-500 uppercase">Range</span>
                         {(filters.dateStart || filters.dateEnd) && <button onClick={() => clearFilter('date')} className="text-xs text-blue-400">Clear</button>}
                      </div>
                      <div className="space-y-2">
                         <div className="flex items-center gap-2">
                           <span className="text-xs text-slate-500 w-8">From</span>
                           <input type="date" className="bg-gray-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 w-full" value={filters.dateStart} onChange={e => updateFilter('dateStart', e.target.value)} />
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-xs text-slate-500 w-8">To</span>
                           <input type="date" className="bg-gray-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 w-full" value={filters.dateEnd} onChange={e => updateFilter('dateEnd', e.target.value)} />
                         </div>
                      </div>
                   </div>
                )}
              </th>

              <th className="px-4 py-3 font-medium text-slate-400 bg-gray-900 text-right relative group">
                 <div className="flex items-center justify-end gap-2">
                  <span className="cursor-pointer hover:text-slate-200 transition-colors" onClick={() => handleSort('amount')}>Amount</span>
                  <button onClick={(e) => toggleDropdown(e, 'amount')} className={`p-1 rounded hover:bg-gray-800 ${(filters.amountMin || filters.amountMax) ? 'text-blue-400' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`}>
                    <Filter size={12} fill={(filters.amountMin || filters.amountMax) ? "currentColor" : "none"} />
                  </button>
                  <SortIcon field="amount" />
                 </div>
                 {activeFilterDropdown === 'amount' && (
                   <div ref={dropdownRef} className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-3 text-left">
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-semibold text-slate-500 uppercase">Value Range</span>
                         {(filters.amountMin || filters.amountMax) && <button onClick={() => clearFilter('amount')} className="text-xs text-blue-400">Clear</button>}
                      </div>
                      <div className="space-y-2">
                         <input type="number" placeholder="Min $" className="bg-gray-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 w-full" value={filters.amountMin} onChange={e => updateFilter('amountMin', e.target.value)} />
                         <input type="number" placeholder="Max $" className="bg-gray-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 w-full" value={filters.amountMax} onChange={e => updateFilter('amountMax', e.target.value)} />
                      </div>
                   </div>
                 )}
              </th>

              <th className="px-4 py-3 font-medium text-slate-500 w-20 text-center bg-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {!isQuickAdding && (
              <tr className="h-1 hover:h-10 transition-all duration-200 cursor-pointer group hover:bg-blue-900/10" onClick={() => setIsQuickAdding(true)}>
                 <td colSpan={6} className="p-0 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 text-xs font-medium gap-2">
                       <Plus size={14} /> Quick Insert
                    </div>
                 </td>
              </tr>
            )}

            {isQuickAdding && (
              <tr className="bg-blue-900/10 shadow-inner relative z-20">
                <td className="px-4 py-3 text-center"><div className="w-2 h-2 rounded-full bg-blue-500 mx-auto"></div></td>
                <td className="px-4 py-3"><input autoFocus placeholder="Title..." className="bg-transparent border-b border-blue-500/30 text-white w-full py-1 text-sm focus:outline-none" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuickAdd()} /></td>
                <td className="px-4 py-3">
                  <select className="bg-gray-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs w-full" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                    {Object.values(categories).map((cat) => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3"><input type="date" className="bg-gray-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs w-full" value={newDate} onChange={e => setNewDate(e.target.value)} /></td>
                <td className="px-4 py-3"><input type="number" placeholder="0.00" className="bg-transparent border-b border-blue-500/30 text-white w-full text-right py-1 text-sm focus:outline-none" value={newAmount} onChange={e => setNewAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuickAdd()} /></td>
                <td className="px-4 py-3 text-center">
                   <div className="flex items-center justify-center gap-2">
                      <button onClick={handleQuickAdd} className="text-blue-400 hover:text-blue-300 text-xs font-bold">SAVE</button>
                      <button onClick={() => setIsQuickAdding(false)}><X size={14} className="text-slate-500" /></button>
                   </div>
                </td>
              </tr>
            )}

            {sortedExpenses.map(expense => {
              const category = categories[expense.categoryId] || { color: '#9ca3af', label: 'Unknown', iconName: 'CircleDashed' };
              return (
                <tr key={expense.id} className="group hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${category.color}15`, color: category.color }}>
                      {getIconComponent(category.iconName, { size: 14 })}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-200">{expense.title}</td>
                  <td className="px-4 py-3 text-slate-400">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border" style={{ backgroundColor: `${category.color}08`, borderColor: `${category.color}20`, color: category.color }}>
                      {category.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs tabular-nums">{formatDateForDisplay(expense.date)}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-200 tabular-nums">${expense.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(expense)} className="text-slate-500 hover:text-blue-400"><Edit2 size={14} /></button>
                      <button onClick={() => onDelete(expense.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
