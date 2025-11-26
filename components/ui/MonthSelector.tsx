import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface Props {
  currentDate: Date;
  onChange: (date: Date) => void;
}

export const MonthSelector: React.FC<Props> = ({ currentDate, onChange }) => {
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onChange(newDate);
  };

  return (
    <div className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-full p-1 max-w-xs mx-auto shadow-lg backdrop-blur-sm">
      <button 
        onClick={handlePrev}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-all"
      >
        <ChevronLeft size={20} />
      </button>
      
      <div className="flex items-center gap-2 px-4">
        <Calendar size={14} className="text-indigo-400" />
        <span className="text-sm font-semibold text-gray-100 tabular-nums tracking-wide">
          {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </span>
      </div>

      <button 
        onClick={handleNext}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-all"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};