
import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/apiService';
import { Input, Button, Card } from '../ui/Elements';
import { Search, Check, Trash2, Plus, AlertCircle } from 'lucide-react';
import { getIconComponent, AVAILABLE_ICONS } from '../../constants';

interface IconRecord {
  name: string;
  label: string;
}

interface Props {
  headerAction?: React.ReactNode;
}

export const IconLibrary: React.FC<Props> = ({ headerAction }) => {
  const [dbIcons, setDbIcons] = useState<IconRecord[]>([]);
  const [usedIcons, setUsedIcons] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'ACTIVE' | 'AVAILABLE'>('ACTIVE');

  const fetchIcons = async () => {
    setIsLoading(true);
    try {
      const [icons, categories] = await Promise.all([
        ApiService.getAvailableIcons(),
        ApiService.getCategories()
      ]);

      setDbIcons(icons);

      // Calculate used icons
      const used = new Set<string>();
      Object.values(categories).forEach(cat => {
        if (cat.iconName) used.add(cat.iconName);
      });
      setUsedIcons(used);
    } catch (error) {
      console.error("Failed to fetch icons", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIcons();
  }, []);

  const handleAddToDb = async (name: string) => {
    await ApiService.addMasterIcon(name, name);
    fetchIcons();
  };

  const handleRemoveFromDb = async (name: string) => {
    if (usedIcons.has(name)) {
      alert("This icon is currently in use by a category and cannot be deactivated.");
      return;
    }
    await ApiService.deleteMasterIcon(name);
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
          <h2 className="text-2xl font-bold text-primary">Icon Library</h2>
          <p className="text-muted text-sm">Manage icons available for your categories.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-card p-1 rounded-xl border border-border">
            <button
              onClick={() => setView('ACTIVE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'ACTIVE' ? 'bg-accent text-white' : 'text-muted hover:text-primary'}`}
            >
              Active ({dbIcons.length})
            </button>
            <button
              onClick={() => setView('AVAILABLE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'AVAILABLE' ? 'bg-accent text-white' : 'text-muted hover:text-primary'}`}
            >
              Inactive ({filteredLocalIcons.length})
            </button>
          </div>
          {headerAction}
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search icons..."
            className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 text-primary focus:outline-none focus:border-accent transition-colors"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted">Loading library...</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-4">
          {view === 'ACTIVE' && filteredDbIcons.map(icon => {
            const isUsed = usedIcons.has(icon.name);
            return (
              <div key={icon.name} className="relative group bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-2 hover:border-accent/50 transition-colors">
                {isUsed && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" title="In use by a category" />
                )}

                {!isUsed && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveFromDb(icon.name); }}
                    className="absolute top-1 right-1 p-1.5 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Deactivate icon"
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                <div className={`w-8 h-8 flex items-center justify-center ${isUsed ? 'text-accent' : 'text-muted'}`}>
                  {getIconComponent(icon.name, { size: 20 })}
                </div>
                <div className="text-[10px] text-muted truncate w-full text-center">{icon.name}</div>
              </div>
            );
          })}

          {view === 'AVAILABLE' && filteredLocalIcons.map(name => (
            <button
              key={name}
              onClick={() => handleAddToDb(name)}
              className="relative bg-card/50 border border-border hover:border-accent/50 hover:bg-card rounded-xl p-3 flex flex-col items-center gap-2 transition-all group"
            >
              <div className="absolute top-1 right-1 p-1 text-muted group-hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus size={14} />
              </div>
              <div className="w-8 h-8 flex items-center justify-center text-muted group-hover:text-primary">
                {getIconComponent(name, { size: 20 })}
              </div>
              <div className="text-[10px] text-muted group-hover:text-primary truncate w-full text-center">{name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
