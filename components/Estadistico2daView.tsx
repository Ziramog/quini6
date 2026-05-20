'use client';
import { useState, useEffect } from 'react';
import { Sorteo } from '@/lib/types';
import { EstadisticaNumero } from '@/lib/analysis';
import { calcularEstadisticas } from '@/lib/analysis';
import { AnalisisContainer } from './analisis/AnalisisContainer';

export function Estadistico2daView() {
  const [sorteos, setSorteos] = useState<Sorteo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sorteos2da')
      .then(r => r.json())
      .then(data => { setSorteos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-500 p-4">Cargando estadísticas 2DA-TRAD...</p>;

  const stats = calcularEstadisticas(sorteos);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">Análisis estadístico 2DA-TRAD</h2>
        <p className="text-xs text-gray-500">{sorteos.length} sorteos analizados</p>
      </div>
      <div className="flex-1 overflow-auto">
        <AnalisisContainer sorteos={sorteos} stats={stats} />
      </div>
    </div>
  );
}