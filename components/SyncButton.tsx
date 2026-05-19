'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UltimaSync } from '@/lib/types';

export function SyncButton({ ultimaSync }: { ultimaSync: UltimaSync | null }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const router = useRouter();

  async function sync() {
    setLoading(true); setMsg('');
    try {
      const res  = await fetch('/api/sync', { method: 'POST' });
      const json = await res.json();
      setMsg(json.ok
        ? `✓ ${json.nuevos} nuevos. Total: ${json.total}`
        : `✗ ${json.error}`);
      if (json.ok) router.refresh();
    } catch { setMsg('✗ Error de red'); }
    finally   { setLoading(false); }
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
      {ultimaSync && !msg && (
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