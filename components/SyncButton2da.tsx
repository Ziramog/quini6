'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SyncButton2da() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const router = useRouter();

  async function sync() {
    setLoading(true); setMsg('');
    try {
      const res  = await fetch('/api/sync2da', { method: 'POST' });
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