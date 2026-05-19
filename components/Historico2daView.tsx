'use client';
import { useState, useEffect } from 'react';
import { SyncButton2da } from '@/components/SyncButton2da';
import { Sorteo } from '@/lib/types';

function colorFondoNumero(n: number): string {
  if (n <= 9)  return '#A5D6A7';
  if (n <= 19) return '#FFCC80';
  if (n <= 29) return '#EF9A9A';
  if (n <= 39) return '#90CAF9';
  return '#E0E0E0';
}

function colorPorNumero(n: number): string {
  if (n <= 9)  return '#006100';
  if (n <= 19) return '#9C6500';
  if (n <= 29) return '#9C0006';
  if (n <= 39) return '#0070C0';
  return '#1a1a1a';
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function Historico2daView() {
  const [loading, setLoading] = useState(false);

  async function exportPDF() {
    setLoading(true);
    try {
      const res = await fetch('/api/pdf2da');
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quini6-2da-historico.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error generando PDF');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 no-print">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Histórico 2DA — Tradicional</h2>
          <p className="text-xs text-gray-500">Sorteos TRAD</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportPDF}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
          >
            {loading ? '⏳ Generando...' : '🖨️ Exportar PDF'}
          </button>
          <SyncButton2da />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <SorteosTable2da />
      </div>
    </div>
  );
}

function SorteosTable2da() {
  const [sorteos, setSorteos] = useState<Sorteo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sorteos2da')
      .then(r => r.json())
      .then(data => { setSorteos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-500 p-4">Cargando TRAD...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="sorteos-table w-full text-sm border-collapse bg-white text-gray-900 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-xs uppercase tracking-wide text-gray-500">
            <th className="px-1 py-1 text-right text-xs w-8">NUM</th>
            <th className="px-1 py-1 text-left text-xs">FECHA</th>
            <th className="px-0.5 py-1 text-center text-xs">N1</th>
            <th className="px-0.5 py-1 text-center text-xs">N2</th>
            <th className="px-0.5 py-1 text-center text-xs">N3</th>
            <th className="px-0.5 py-1 text-center text-xs">N4</th>
            <th className="px-0.5 py-1 text-center text-xs">N5</th>
            <th className="px-0.5 py-1 text-center text-xs">N6</th>
            <th className="px-1 py-1 text-center text-xs">SORTEO</th>
          </tr>
        </thead>
        <tbody>
          {sorteos.map((s, i) => (
            <tr key={s.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-1 py-1 text-right text-gray-400 text-xs tabular-nums">{s.num}</td>
              <td className="px-1 py-1 text-gray-700 whitespace-nowrap text-xs">{s.fecha_display}</td>
              {[s.n1, s.n2, s.n3, s.n4, s.n5, s.n6].map((n, j) => (
                <td key={j} className="px-0.5 py-1 text-center">
                  <span
                    className="font-mono font-bold text-xs block px-1 py-0.5 text-center rounded"
                    style={{
                      color: colorPorNumero(n),
                      backgroundColor: colorFondoNumero(n),
                      letterSpacing: '-0.05em',
                    }}
                  >
                    {pad(n)}
                  </span>
                </td>
              ))}
              <td className="px-1 py-1 text-center">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  {s.tipo}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}