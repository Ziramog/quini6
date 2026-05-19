'use client';
import { useState } from 'react';
import { SorteosTable } from '@/components/SorteosTable';
import { SyncButton } from '@/components/SyncButton';
import { ResetButton } from '@/components/ResetButton';
import { UltimaSync } from '@/lib/types';

interface Props {
  sorteos: import('@/lib/types').Sorteo[];
  ultimaSync: UltimaSync | null;
  total: number;
}

export function HistoricoView({ sorteos, ultimaSync, total }: Props) {
  const [loading, setLoading] = useState(false);

  async function exportPDF() {
    setLoading(true);
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
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 no-print">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Histórico de sorteos</h2>
          <p className="text-xs text-gray-500">{total} sorteos cargados</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportPDF}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
          >
            {loading ? '⏳ Generando...' : '🖨️ Exportar PDF'}
          </button>
          <SyncButton ultimaSync={ultimaSync} />
          <ResetButton />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <SorteosTable sorteos={sorteos} />
      </div>
    </div>
  );
}