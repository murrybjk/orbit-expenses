
import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/apiService';
import { Input, Button, Card } from '../ui/Elements';
import { Search, Check } from 'lucide-react';
import { getIconComponent, AVAILABLE_ICONS } from '../../constants';

interface IconRecord {
  name: string;
  label: string;
}

export const IconLibrary: React.FC = () => {
  const [dbIcons, setDbIcons] = useState<IconRecord[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'ACTIVE' | 'AVAILABLE'>('ACTIVE');

  const fetchIcons = async () => {
    setIsLoading(true);
    const data = await ApiService.getAvailableIcons();
    setDbIcons(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchIcons();
  }, []);

  const handleAddToDb = async (name: string) => {
    await ApiService.addMasterIcon(name, name);
    fetchIcons();
  };

  // Filter Active DB Icons
  const filteredDbIcons = dbIcons.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  // Filter Available Local Icons (Exclude ones already in DB)
  const existingNames = new Set(dbIcons.map(i => i.name));
  const filteredLocalIcons = AVAILABLE_ICONS.filter(name => 
    !existingNames.has(name) && name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto pt-8 px-4 pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
           <h2 className="text-2xl font-bold text-slate-100">Icon Library</h2>
           <p className="text-slate-400 text-sm">Manage icons available for your categories.</p>
        </div>
        
        <div className="flex bg-gray-900 p-1 rounded-xl border border-slate-800">
           <button 
             onClick={() => setView('ACTIVE')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'ACTIVE' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
           >
             Active ({dbIcons.length})
           </button>
           <button 
             onClick={() => setView('AVAILABLE')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'AVAILABLE' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
           >
             Add New ({filteredLocalIcons.length})
           </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
           <input 
             type="text" 
             placeholder="Search icons..." 
             className="w-full bg-gray-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading library...</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-4">
           {view === 'ACTIVE' && filteredDbIcons.map(icon => (
             <div key={icon.name} className="bg-gray-900 border border-slate-800 rounded-xl p-3 flex flex-col items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center text-blue-400">
                   {getIconComponent(icon.name, { size: 20 })}
                </div>
                <div className="text-[10px] text-slate-400 truncate w-full text-center">{icon.name}</div>
             </div>
           ))}

           {view === 'AVAILABLE' && filteredLocalIcons.map(name => (
             <button 
                key={name} 
                onClick={() => handleAddToDb(name)}
                className="bg-gray-900/50 border border-slate-800 hover:border-blue-500/50 hover:bg-gray-800 rounded-xl p-3 flex flex-col items-center gap-2 transition-all group"
             >
                <div className="w-8 h-8 flex items-center justify-center text-slate-500 group-hover:text-slate-200">
                   {getIconComponent(name, { size: 20 })}
                </div>
                <div className="text-[10px] text-slate-500 group-hover:text-slate-300 truncate w-full text-center">{name}</div>
             </button>
           ))}
        </div>
      )}
    </div>
  );
};
