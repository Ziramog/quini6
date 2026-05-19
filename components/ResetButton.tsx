'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ResetButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function reset() {
    if (!confirm('Esto borrará TODOS los sorteos y volverá a scraping todo desde cero. ¿Continuar?')) return;
    setLoading(true); setMsg('');
    try {
      const res  = await fetch('/api/reset', { method: 'POST' });
      const json = await res.json();
      setMsg(json.ok
        ? `✓ ${json.total} sorteos recargados`
        : `✗ ${json.error}`);
      if (json.ok) setTimeout(() => window.location.reload(), 1000);
    } catch { setMsg('✗ Error de red'); }
    finally   { setLoading(false); }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={reset} disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700
                   disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
      >
        {loading ? '⏳ Recargando...' : '🔁 Reset + Rescrape'}
      </button>
      {msg && (
        <span className={`text-xs ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
          {msg}
        </span>
      )}
    </div>
  );
}