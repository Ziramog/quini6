'use client';
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Tab } from '@/lib/types';
import { HistoricoView } from '@/components/HistoricoView';
import { EstadisticoView } from '@/components/EstadisticoView';
import { Historico2daView } from '@/components/Historico2daView';
import { Estadistico2daView } from '@/components/Estadistico2daView';
import { Sorteo, UltimaSync } from '@/lib/types';
import { EstadisticaNumero } from '@/lib/analysis';

interface Props {
  sorteos: Sorteo[];
  allSorteos: Sorteo[];
  stats: EstadisticaNumero[];
  total: number;
  ultimaSync: UltimaSync | null;
}

const TAB_LABELS: Record<Tab, string> = {
  historico: 'Histórico SALE-REV',
  estadistico: 'Estadístico SALE-REV',
  historico2da: 'Histórico 2DA-TRAD',
  estadistico2da: 'Estadístico 2DA-TRAD',
};

export function DashboardShell({ sorteos, allSorteos, stats, total, ultimaSync }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('historico');

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="sidebar-print">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <main className="flex-1 overflow-hidden bg-gray-50">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 shadow-sm">
          <img src="/duende.png" alt="logo" className="w-7 h-7 object-contain" />
          <p className="text-sm font-semibold text-white">{TAB_LABELS[activeTab]}</p>
        </div>
        {activeTab === 'historico' && (
          <HistoricoView sorteos={sorteos} ultimaSync={ultimaSync} total={total} />
        )}
        {activeTab === 'estadistico' && (
          <EstadisticoView sorteos={allSorteos} />
        )}
        {activeTab === 'historico2da' && (
          <Historico2daView />
        )}
        {activeTab === 'estadistico2da' && (
          <Estadistico2daView />
        )}
      </main>
    </div>
  );
}