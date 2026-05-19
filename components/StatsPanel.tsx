'use client';
import { EstadisticaNumero } from '@/lib/analysis';

interface Props {
  stats: EstadisticaNumero[];
  totalSorteos: number;
}

export function StatsPanel({ stats, totalSorteos }: Props) {
  const top5 = [...stats].sort((a, b) => b.frecuencia - a.frecuencia).slice(0, 5);
  const masAusentes = [...stats].sort((a, b) => b.ausencia - a.ausencia).slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-3">Más frecuentes</h3>
        <div className="space-y-1">
          {top5.map(s => (
            <div key={s.numero} className="flex justify-between items-center text-sm">
              <span className="font-mono font-bold" style={{ color: s.numero <= 9 ? '#006100' : s.numero <= 19 ? '#9C6500' : s.numero <= 29 ? '#9C0006' : s.numero <= 39 ? '#0070C0' : '#1a1a1a' }}>
                {String(s.numero).padStart(2, '0')}
              </span>
              <span className="text-gray-500 text-xs">{s.frecuencia} veces</span>
              <span className="text-gray-400 text-xs">{s.frecSALE}S / {s.frecREV}R</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-3">Más ausentes</h3>
        <div className="space-y-1">
          {masAusentes.map(s => (
            <div key={s.numero} className="flex justify-between items-center text-sm">
              <span className="font-mono font-bold text-gray-700">
                {String(s.numero).padStart(2, '0')}
              </span>
              <span className="text-gray-500 text-xs">{s.ausencia} sorteos</span>
              <span className="text-gray-400 text-xs">desde {s.ultimaVez}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-3">Resumen</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Total sorteos</span>
            <span className="font-semibold">{totalSorteos}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">SALE</span>
            <span className="font-semibold">{stats[0] ? Math.round(totalSorteos / 2) : 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">REV</span>
            <span className="font-semibold">{stats[0] ? Math.round(totalSorteos / 2) : 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}