
import React, { useState, useEffect } from 'react';
import { CategoryConfig } from '../../types';
import { AVAILABLE_COLORS, AVAILABLE_ICONS, getIconComponent } from '../../constants';
import { Button, Input } from '../ui/Elements';
import { Check, Search } from 'lucide-react';

interface Props {
  initialData?: CategoryConfig | null;
  onSubmit: (category: CategoryConfig) => void;
  onCancel: () => void;
}

export const CategoryForm: React.FC<Props> = ({ initialData, onSubmit, onCancel }) => {
  const [label, setLabel] = useState('');
  const [selectedColorObj, setSelectedColorObj] = useState(AVAILABLE_COLORS[10]);
  const [selectedIcon, setSelectedIcon] = useState('CircleDashed');
  const [searchIcon, setSearchIcon] = useState('');

  useEffect(() => {
    if (initialData) {
      setLabel(initialData.label);
      const foundColor = AVAILABLE_COLORS.find(c => c.value === initialData.color) || AVAILABLE_COLORS[10];
      setSelectedColorObj(foundColor);
      setSelectedIcon(initialData.iconName);
    } else {
      setLabel('');
      setSelectedColorObj(AVAILABLE_COLORS[10]);
      setSelectedIcon('CircleDashed');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label) return;

    const generatedId = initialData?.id || label.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    
    const newCategory: CategoryConfig = {
      id: generatedId,
      label,
      color: selectedColorObj.value,
      twColor: '',
      iconName: selectedIcon,
    };
    
    onSubmit(newCategory);
  };

  const filteredIcons = AVAILABLE_ICONS.filter(name => 
    name.toLowerCase().includes(searchIcon.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input 
        label="Category Name"
        placeholder="e.g. Subscription, Gym..."
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        required
        autoFocus
      />

      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-400 ml-1">Color: <span className="text-slate-200 ml-1">{selectedColorObj.name}</span></label>
        <div className="grid grid-cols-9 gap-2">
          {AVAILABLE_COLORS.map(colorObj => (
            <button
              key={colorObj.value}
              type="button"
              title={colorObj.name}
              onClick={() => setSelectedColorObj(colorObj)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${selectedColorObj.value === colorObj.value ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''}`}
              style={{ backgroundColor: colorObj.value }}
            >
              {selectedColorObj.value === colorObj.value && <Check size={14} className="text-white/80" />}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center mb-1.5 ml-1">
          <label className="text-xs font-medium text-slate-400">Icon</label>
          <div className="relative w-32">
             <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-gray-800 border border-slate-700 rounded-md px-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-blue-500"
                value={searchIcon}
                onChange={(e) => setSearchIcon(e.target.value)}
             />
             <Search size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto no-scrollbar p-1 bg-gray-950/50 rounded-xl border border-slate-800 min-h-[100px]">
          {filteredIcons.map(name => (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => setSelectedIcon(name)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                selectedIcon === name 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-gray-800 text-slate-400 hover:bg-gray-700 hover:text-slate-200'
              }`}
            >
                {getIconComponent(name, { size: 20 })}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between bg-gray-950 p-4 rounded-xl border border-slate-800">
        <span className="text-sm text-slate-500">Preview</span>
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${selectedColorObj.value}20`, color: selectedColorObj.value }}
          >
            {getIconComponent(selectedIcon, { size: 20 })}
          </div>
          <span className="font-medium text-slate-200">{label || 'Category Name'}</span>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1">{initialData ? 'Save Changes' : 'Create Category'}</Button>
      </div>
    </form>
  );
};
