'use client';
import { useState, useEffect } from 'react';
import { SyncButton2da } from '@/components/SyncButton2da';

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
  const [sorteos, setSorteos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetch('/api/sorteos2da')
      .then(r => r.json())
      .then(data => { setSorteos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function exportPDF() {
    setPdfLoading(true);
    try {
      const res = await fetch('/api/pdf2da');
      if (!res.ok) throw new Error('PDF failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quini6-2da-historico.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Error generando PDF');
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 no-print gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-800">Histórico 2DA-TRAD</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {loading ? 'Cargando...' : `${sorteos.length} sorteos cargados`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportPDF}
            disabled={pdfLoading || loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition"
          >
            {pdfLoading ? '⏳' : '🖨️'} PDF
          </button>
          <SyncButton2da />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <SorteosTable2da sorteos={sorteos} loading={loading} />
      </div>
    </div>
  );
}

function SorteosTable2da({ sorteos, loading }: { sorteos: any[]; loading: boolean }) {
  if (loading) return <p className="text-sm text-gray-500 p-4">Cargando TRAD + 2DA...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="sorteos-table w-full text-sm border-collapse bg-white text-gray-900 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-xs uppercase tracking-wide text-gray-500">
            <th className="hidden md:table-cell px-1 py-1.5 text-right text-xs w-8">NUM</th>
            <th className="px-1 py-1.5 text-left text-xs">FECHA</th>
            <th className="px-0.5 py-1.5 text-center text-xs">N1</th>
            <th className="px-0.5 py-1.5 text-center text-xs">N2</th>
            <th className="px-0.5 py-1.5 text-center text-xs">N3</th>
            <th className="px-0.5 py-1.5 text-center text-xs">N4</th>
            <th className="px-0.5 py-1.5 text-center text-xs">N5</th>
            <th className="px-0.5 py-1.5 text-center text-xs">N6</th>
            <th className="px-1 py-1 text-center text-xs">SORTEO</th>
          </tr>
        </thead>
        <tbody>
          {sorteos.map((s, i) => (
            <tr key={s.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="hidden md:table-cell px-1 py-1.5 text-right text-gray-400 text-xs tabular-nums">{s.num}</td>
              <td className="px-1 py-1.5 text-gray-700 whitespace-nowrap text-xs">{s.fecha_display}</td>
              {[s.n1, s.n2, s.n3, s.n4, s.n5, s.n6].map((n: number, j: number) => (
                <td key={j} className="px-0.5 py-1.5 text-center">
                  <span
                    className="font-mono font-bold text-sm block px-1.5 py-1 text-center rounded"
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
              <td className="px-1 py-1.5 text-center">
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