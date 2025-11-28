import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { DateScope } from '../../types';

interface Props {
  currentDate: Date;
  scope: DateScope;
  onDateChange: (date: Date) => void;
  onScopeChange: (scope: DateScope) => void;
}

export const DateRangeControl: React.FC<Props> = ({ currentDate, scope, onDateChange, onScopeChange }) => {

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (scope === 'MONTH') newDate.setMonth(newDate.getMonth() - 1);
    if (scope === 'YEAR') newDate.setFullYear(newDate.getFullYear() - 1);
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (scope === 'MONTH') newDate.setMonth(newDate.getMonth() + 1);
    if (scope === 'YEAR') newDate.setFullYear(newDate.getFullYear() + 1);
    onDateChange(newDate);
  };

  const getLabel = () => {
    if (scope === 'ALL') return 'All Time';
    if (scope === 'YEAR') return currentDate.getFullYear().toString();
    return currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex items-center bg-card/80 border border-border rounded-xl shadow-lg backdrop-blur-sm p-1 gap-1">
      {/* Scope Selector */}
      <div className="flex bg-app rounded-lg p-1 mr-1">
        {(['MONTH', 'YEAR', 'ALL'] as DateScope[]).map((s) => (
          <button
            key={s}
            onClick={() => onScopeChange(s)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${scope === s
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted hover:text-primary'
              }`}
          >
            {s === 'ALL' ? 'All' : s === 'YEAR' ? 'Year' : 'Month'}
          </button>
        ))}
      </div>

      {/* Navigation (Hidden for ALL view) */}
      {scope !== 'ALL' && (
        <>
          <button
            onClick={handlePrev}
            className="p-1.5 text-muted hover:text-primary hover:bg-accent/10 rounded-lg transition-all"
            title="Previous Period"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center justify-center w-32 px-2">
            <span className="text-sm font-semibold text-primary tabular-nums tracking-wide whitespace-nowrap">
              {getLabel()}
            </span>
          </div>

          <button
            onClick={handleNext}
            className="p-1.5 text-muted hover:text-primary hover:bg-accent/10 rounded-lg transition-all"
            title="Next Period"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {scope === 'ALL' && (
        <div className="flex items-center justify-center w-32 px-2">
          <span className="text-sm font-semibold text-primary tracking-wide">History</span>
        </div>
      )}
    </div>
  );
};