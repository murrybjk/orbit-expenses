
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Expense, CategoryConfig } from '../../types';
import { Button, Input } from '../ui/Elements';
import { getIconComponent, getTodayString } from '../../constants';
import { ChevronDown } from 'lucide-react';

interface Props {
  initialData?: Expense | null;
  categories: Record<string, CategoryConfig>;
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<Props> = ({ initialData, categories, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [categoryId, setCategoryId] = useState<string>(Object.keys(categories)[0] || 'FOOD');
  const [note, setNote] = useState('');

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number, left: number, width: number } | null>(null);
  const categoryContainerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAmount(initialData.amount.toString());
      setDate(initialData.date);
      setCategoryId(initialData.categoryId);
      setNote(initialData.note || '');
    } else {
      setTitle('');
      setAmount('');
      setDate(getTodayString());
      if (Object.keys(categories).length > 0) {
        setCategoryId(Object.keys(categories)[0]);
      }
      setNote('');
    }
  }, [initialData, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !date) return;
    onSubmit({
      title,
      amount: parseFloat(amount),
      date: date,
      categoryId,
      note
    });
  };

  const toggleDropdown = () => {
    if (isCategoryOpen) {
      setIsCategoryOpen(false);
    } else {
      if (categoryContainerRef.current) {
        const rect = categoryContainerRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom,
          left: rect.left,
          width: rect.width
        });
      }
      setIsCategoryOpen(true);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isCategoryOpen && categoryContainerRef.current && !categoryContainerRef.current.contains(event.target as Node)) {
        // Check if click is inside the portal
        const portalElement = document.getElementById('category-dropdown-portal');
        if (portalElement && portalElement.contains(event.target as Node)) {
          return;
        }
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCategoryOpen]);

  // Handle scroll to close dropdown prevents visual detachment
  useEffect(() => {
    const handleScroll = () => {
      if (isCategoryOpen) setIsCategoryOpen(false);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isCategoryOpen]);

  const selectedCategory = categories[categoryId] || { label: 'Select', color: '#64748b', iconName: 'CircleDashed' };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-6">
        <div className="text-muted text-xs uppercase tracking-widest font-semibold mb-2">Amount</div>
        <div className="relative inline-block">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 text-2xl font-bold text-muted">$</span>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            className="bg-transparent text-4xl font-bold text-primary placeholder-muted text-center w-48 focus:outline-none"
            required
          />
        </div>
      </div>

      <div className="bg-app/50 p-4 rounded-2xl space-y-4 border border-border">
        <Input
          label="Title"
          type="text"
          placeholder="What is this for?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className="w-full relative"
            ref={categoryContainerRef}
          >
            <label className="block text-xs font-medium text-muted mb-1.5 ml-1">Category</label>
            <button
              type="button"
              onClick={toggleDropdown}
              className={`w-full bg-app border ${isCategoryOpen ? 'border-accent/50 ring-2 ring-accent/20' : 'border-border'} rounded-xl px-3 py-2.5 text-primary flex items-center justify-between transition-all`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${selectedCategory.color}`, color: '#ffffff' }}
                >
                  {getIconComponent(selectedCategory.iconName, { size: 14 })}
                </div>
                <span className="text-sm truncate font-medium">{selectedCategory.label}</span>
              </div>
              <ChevronDown size={16} className={`text-muted transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCategoryOpen && dropdownPos && createPortal(
              <div
                id="category-dropdown-portal"
                className="fixed z-[9999] pt-2"
                style={{ top: dropdownPos.top, left: dropdownPos.left }}
              >
                <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 w-[400px] max-w-[90vw] max-h-[60vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 origin-top-left">
                  <div className="grid grid-cols-4 gap-3">
                    {Object.values(categories).map((cat: CategoryConfig) => {
                      const isSelected = categoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setCategoryId(cat.id);
                            setIsCategoryOpen(false);
                          }}
                          className={`group flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 ${isSelected
                            ? 'bg-accent/10 ring-1 ring-accent/20 scale-105'
                            : 'bg-transparent hover:bg-accent/5 hover:scale-105'
                            }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all ${isSelected ? 'shadow-xl' : 'shadow-none'}`}
                            style={{
                              backgroundColor: isSelected ? cat.color : `${cat.color}15`,
                              color: isSelected ? '#ffffff' : cat.color
                            }}
                          >
                            {getIconComponent(cat.iconName, { size: 24 })}
                          </div>
                          <span className={`text-[10px] font-semibold truncate w-full text-center leading-tight transition-colors ${isSelected ? 'text-primary' : 'text-muted group-hover:text-primary'}`}>
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>

          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <Input label="Note (Optional)" type="text" placeholder="Add details..." value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <div className="pt-2 flex gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1 font-semibold">
          {initialData ? 'Save Changes' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
};
