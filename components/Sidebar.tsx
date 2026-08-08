'use client';
import { useState } from 'react';
import { Tab } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'historico', label: 'Histórico SALE-REV', icon: '📋' },
  { id: 'estadistico', label: 'Estadístico SALE-REV', icon: '📊' },
  { id: 'historico2da', label: 'Histórico 2DA-TRAD', icon: '📋' },
  { id: 'estadistico2da', label: 'Estadístico 2DA-TRAD', icon: '📊' },
  { id: 'premios', label: 'Premios', icon: '🏆' },
];

export function Sidebar({ activeTab, onTabChange }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* Mobile hamburger button — floating top-left */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg flex items-center justify-center transition-colors animate-pulse"
      >
        <span className="text-white font-bold text-lg">Σ</span>
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <aside className={`
        md:relative fixed inset-y-0 left-0 z-50 w-56 flex-shrink-0 bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col no-print
        transform transition-transform duration-300 ease-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 flex items-center gap-3">
          <img src="/duende.png" alt="logo" className="w-9 h-9 object-contain" />
          <div>
            <p className="text-xs text-slate-400 leading-tight">El secreto del</p>
            <h1 className="text-xl font-black text-blue-400 tracking-tight leading-tight">QUINI 6</h1>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors ml-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { onTabChange(t.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
              }`}
            >
              <span className="text-base">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 space-y-2">
          <p className="text-xs text-slate-500 text-center">Análisis estadístico</p>
          <p className="text-xs text-slate-600 text-center">No es predicción</p>
        </div>
      </aside>
    </>
  );
}