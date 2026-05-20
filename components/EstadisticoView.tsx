'use client';
import { Sorteo } from '@/lib/types';
import { EstadisticaNumero, calcularEstadisticas } from '@/lib/analysis';
import { AnalisisContainer } from './analisis/AnalisisContainer';
import { PremioCard } from './premios/PremioCard';

interface Props {
  sorteos: Sorteo[];
}

export function EstadisticoView({ sorteos }: Props) {
  const stats = calcularEstadisticas(sorteos);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">Análisis estadístico</h2>
        <p className="text-xs text-gray-500">{sorteos.length} sorteos analizados</p>
      </div>
      <div className="flex-1 overflow-auto">
        <PremioCard />
        <AnalisisContainer sorteos={sorteos} stats={stats} />
      </div>
    </div>
  );
}