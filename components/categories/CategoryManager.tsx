
import React from 'react';
import { CategoryConfig } from '../../types';
import { getIconComponent } from '../../constants';
import { Plus, Trash2 } from 'lucide-react';
import { Card } from '../ui/Elements';

interface Props {
  categories: Record<string, CategoryConfig>;
  onCreate: () => void;
  onEdit: (category: CategoryConfig) => void;
  onDelete: (categoryId: string) => void;
}

export const CategoryManager: React.FC<Props> = ({ categories, onCreate, onEdit, onDelete }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 pt-4 max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-end">
        <button 
          className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors px-4 py-2 rounded-lg hover:bg-blue-500/10"
          onClick={onCreate}
        >
          <Plus size={16} />
          <span>New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {Object.values(categories).map((category) => (
          <div 
            key={category.id} 
            onClick={() => onEdit(category)}
            className="group relative bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-all"
          >
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(category.id);
              }}
              className="absolute top-2 right-2 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              title="Delete Category"
            >
              <Trash2 size={14} />
            </button>

            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              {getIconComponent(category.iconName, { size: 24 })}
            </div>
            <div className="text-center w-full">
              <h3 className="text-xs font-semibold text-gray-300 truncate px-1">{category.label}</h3>
            </div>
          </div>
        ))}
        
        <button 
          onClick={onCreate}
          className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-dashed border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 text-gray-600 hover:text-gray-400 transition-all"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-800/50">
            <Plus size={24} />
          </div>
          <span className="text-xs font-medium">Add New</span>
        </button>
      </div>
    </div>
  );
};
