'use client';
import { Tab } from '@/lib/types';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'historico', label: 'Histórico', icon: '📋' },
  { id: 'estadistico', label: 'Estadístico', icon: '📊' },
  { id: 'historico2da', label: 'Histórico 2DA', icon: '📋' },
];

export function Sidebar({ activeTab, onTabChange }: Props) {
  return (
    <aside className="w-48 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col no-print">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">Quini 6</h1>
        <p className="text-xs text-gray-500">Tablero de Mando</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === t.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}