'use client';
import { Sorteo } from '@/lib/types';
import { EstadisticaNumero } from '@/lib/analysis';
import { Semaforo } from './Semaforo';
import { AnalisisGraficos } from './AnalisisGraficos';
import { GeneradorAvanzado } from './GeneradorAvanzado';

interface Props {
  sorteos: Sorteo[];
  stats: EstadisticaNumero[];
}

export function AnalisisContainer({ sorteos, stats }: Props) {
  return (
    <div className="space-y-4 overflow-auto h-full pb-8">
      <Semaforo stats={stats} />
      <GeneradorAvanzado stats={stats} />
      <AnalisisGraficos stats={stats} sorteos={sorteos} />
    </div>
  );
}