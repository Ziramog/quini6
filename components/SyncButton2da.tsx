'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { runClientSync } from '@/lib/client-scraper';

export function SyncButton2da() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const router = useRouter();

  async function sync() {
    console.log('[SyncButton2da] Clickeado!');
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
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700
                   disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
      >
        {loading ? '⏳ Sincronizando...' : '🔄 Sync 2DA'}
      </button>
      {msg && (
        <span className={`text-xs ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
          {msg}
        </span>
      )}
    </div>
  );
}