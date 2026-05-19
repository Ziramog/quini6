'use client';
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Tab } from '@/lib/types';
import { HistoricoView } from '@/components/HistoricoView';
import { EstadisticoView } from '@/components/EstadisticoView';
import { Historico2daView } from '@/components/Historico2daView';
import { Sorteo, UltimaSync } from '@/lib/types';
import { EstadisticaNumero } from '@/lib/analysis';

interface Props {
  sorteos: Sorteo[];
  allSorteos: Sorteo[];
  stats: EstadisticaNumero[];
  total: number;
  ultimaSync: UltimaSync | null;
}

export function DashboardShell({ sorteos, allSorteos, stats, total, ultimaSync }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('historico');

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="sidebar-print">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <main className="flex-1 overflow-hidden bg-gray-50">
        {activeTab === 'historico' && (
          <HistoricoView sorteos={sorteos} ultimaSync={ultimaSync} total={total} />
        )}
        {activeTab === 'estadistico' && (
          <EstadisticoView sorteos={allSorteos} />
        )}
        {activeTab === 'historico2da' && (
          <Historico2daView />
        )}
      </main>
    </div>
  );
}