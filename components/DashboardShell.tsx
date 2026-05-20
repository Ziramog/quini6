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
import { SplashScreen } from '@/components/SplashScreen';
import { calcularProximoSorteo, formatoRelativo } from '@/lib/nextDraw';

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
  const [showSplash, setShowSplash] = useState(true);

  // Which sorteos to use based on active tab
  const is2da = activeTab === 'historico2da' || activeTab === 'estadistico2da';
  const sorteosForDraw = is2da ? allSorteos : sorteos;
  const nextDraw = calcularProximoSorteo(sorteosForDraw);
  const relativo = nextDraw ? formatoRelativo(nextDraw.dias) : '';

  const drawBg = nextDraw?.esHoy
    ? 'bg-green-600'
    : nextDraw && nextDraw.dias <= 1
    ? 'bg-yellow-500'
    : 'bg-blue-700';

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
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

        {/* Next draw banner */}
        {nextDraw && (
          <div className={`${drawBg} text-white text-xs font-medium px-4 py-2 flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-2">
              <span className="text-base">🎱</span>
              <span>
                <span className="font-semibold">Próximo {is2da ? '2DA-TRAD' : 'SALE-REV'}: </span>
                <span className="font-bold">{nextDraw.label}</span>
                <span className="ml-1 opacity-90">({nextDraw.tipos.join('+')})</span>
              </span>
            </div>
            <span className={`shrink-0 font-bold ${nextDraw.esHoy ? 'animate-pulse' : ''}`}>
              {relativo}
            </span>
          </div>
        )}

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
    </>
  );
}