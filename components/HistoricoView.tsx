'use client';
import { useState } from 'react';
import { SorteosTable } from '@/components/SorteosTable';
import { SyncButton } from '@/components/SyncButton';
import { UltimaSync } from '@/lib/types';

interface Props {
  sorteos: import('@/lib/types').Sorteo[];
  ultimaSync: UltimaSync | null;
  total: number;
}

export function HistoricoView({ sorteos, ultimaSync, total }: Props) {
  const [pdfLoading, setPdfLoading] = useState(false);

  async function exportPDF() {
    setPdfLoading(true);
    try {
      const res = await fetch('/api/pdf');
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quini6-historico.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error generando PDF');
    } finally {
      setPdfLoading(false);
    }
  }

  const lastSyncLabel = ultimaSync
    ? `Último sync: ${new Date(ultimaSync.ejecutado_en).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} · ${ultimaSync.nuevos} nuevos`
    : 'Sin datos de sync';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 no-print gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-800">Histórico SALE-REV</h2>
          <p className="text-xs text-gray-500 mt-0.5">{total} sorteos cargados</p>
          <p className="text-xs text-gray-400">{lastSyncLabel}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportPDF}
            disabled={pdfLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition"
          >
            {pdfLoading ? '⏳' : '🖨️'} PDF
          </button>
          <button
            onClick={async () => {
              const res = await fetch('/api/sync', { method: 'POST' });
              const json = await res.json();
              if (json.ok) window.location.reload();
              else alert(json.error || 'Error');
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition"
          >
            🔄 Sincronizar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <SorteosTable sorteos={sorteos} />
      </div>
    </div>
  );
}