'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UltimaSync } from '@/lib/types';
import { runClientSync } from '@/lib/client-scraper';

export function SyncButton({ ultimaSync }: { ultimaSync: UltimaSync | null }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  async function sync() {
    console.log('[SyncButton] Clickeado!');
    alert('Iniciando sincronización... Por favor no cierres esta pestaña.');
    setLoading(true); setMsg('');
    try {
      const allSorteos = await runClientSync((m) => setMsg(m));
      if (allSorteos && allSorteos.length > 0) {
        setMsg('Guardando en base de datos...');
        const res = await fetch('/api/sync/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sorteos: allSorteos }),
        });
        const json = await res.json();
        setMsg(json.ok ? `✓ ${json.nuevos} nuevos guardados. Total: ${json.total}` : `✗ ${json.error}`);
        if (json.ok) router.refresh();
      } else {
        setMsg('✓ 0 nuevos. Todo al día.');
        router.refresh();
      }
    } catch (e: any) {
      setMsg(`✗ Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 no-print">
      <button
        onClick={sync} disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700
                   disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
      >
        {loading ? '⏳ Sincronizando...' : '🔄 Sincronizar'}
      </button>
      {ultimaSync && !msg && mounted && (
        <span className="text-xs text-gray-500">
          Sync: {new Date(ultimaSync.ejecutado_en).toLocaleString('es-AR')} · {ultimaSync.nuevos} nuevos
        </span>
      )}
      {msg && (
        <span className={`text-xs ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
          {msg}
        </span>
      )}
    </div>
  );
}