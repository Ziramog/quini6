'use client';
import { EstadisticaNumero } from '@/lib/analysis';

interface Props {
  stats: EstadisticaNumero[];
}

function estadoColor(estado: string): { bg: string; border: string; text: string } {
  if (estado === 'VENCIDO') return { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B' };
  if (estado === 'ATRASADO') return { bg: '#FEF9C3', border: '#CA8A04', text: '#854D0E' };
  if (estado === 'CALIENTE') return { bg: '#DCFCE7', border: '#16A34A', text: '#166534' };
  return { bg: '#F9FAFB', border: '#D1D5DB', text: '#374151' };
}

export function Semaforo({ stats }: Props) {
  const sorted = [...stats].sort((a, b) => a.numero - b.numero);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-1">Semáforo de números</h3>
      <p className="text-xs text-gray-400 mb-3">Cada número puede estar "caliente" (sale mucho), "normal", "atrasado" (debería salir y no salió) o "vencido" (hace mucho que no sale y ya pasó su ciclo esperado). Pasá el mouse por arriba de cada número para ver sus estadísticas detalladas.</p>
      <div className="grid grid-cols-10 gap-1">
        {sorted.map(s => {
          const c = estadoColor(s.estado);
          return (
            <div
              key={s.numero}
              className="relative group flex flex-col items-center justify-center rounded-md text-xs font-bold cursor-default"
              style={{
                backgroundColor: c.bg,
                border: `1.5pt solid ${c.border}`,
                color: c.text,
                aspectRatio: '1',
                padding: '2pt',
              }}
            >
              <span style={{ fontSize: '11pt', lineHeight: 1 }}>{String(s.numero).padStart(2, '0')}</span>
              <span style={{ fontSize: '7pt', opacity: 0.8 }}>{s.ratio >= 999 ? '∞' : s.ratio.toFixed(1)}</span>
              {/* Tooltip */}
              <div className="hidden group-hover:block absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                <div>Ausencia: {s.ausencia} sorteos</div>
                <div>Ciclo medio: {s.cicloMedio.toFixed(1)}</div>
                <div>Ratio: {s.ratio >= 999 ? '∞' : s.ratio.toFixed(2)}</div>
                <div>Frecuencia: {s.frecuencia} veces</div>
                <div>Última vez: {s.ultimaVez}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-3 justify-center text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#FEE2E2', border: '1pt solid #DC2626' }}></span> Vencido</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#FEF9C3', border: '1pt solid #CA8A04' }}></span> Atrasado</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#DCFCE7', border: '1pt solid #16A34A' }}></span> Caliente</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#F9FAFB', border: '1pt solid #D1D5DB' }}></span> Normal</span>
      </div>
    </div>
  );
}