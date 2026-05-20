'use client';
import { useEffect, useState } from 'react';

interface PremioApiRow {
  id: number;
  fecha: string;
  tipo: string;
  aciertos: number | null;
  ganadores: string;
  premio: string;
}

const TIPO_LABELS: Record<string, string> = {
  TRAD: 'TRAD',
  SEGUNDA: 'SEGUNDA',
  REVANCHA: 'REVANCHA',
  SIEMPRE_SALE: 'SIEMPRE SALE',
  POZO_EXTRA: 'POZO EXTRA',
};

const TIPO_COLORS: Record<string, string> = {
  TRAD: 'bg-emerald-100 text-emerald-800',
  SEGUNDA: 'bg-blue-100 text-blue-800',
  REVANCHA: 'bg-orange-100 text-orange-800',
  SIEMPRE_SALE: 'bg-purple-100 text-purple-800',
  POZO_EXTRA: 'bg-yellow-100 text-yellow-800',
};

const ACIERTO_LABELS: Record<number, string> = {
  6: '6 aciertos',
  5: '5 aciertos',
  4: '4 aciertos',
};

function formatPremio(p: string): string {
  return p.replace(/\.(\d{3})/g, ',$1');
}

export function PremioCard() {
  const [premios, setPremios] = useState<PremioApiRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  useEffect(() => {
    fetch('/api/premios')
      .then(r => r.json())
      .then(data => { setPremios(Array.isArray(data) ? data : []); })
      .catch(() => setPremios([]));
    // Auto-sync on mount
    sync();
  }, []);

  async function sync() {
    setLoading(true);
    setSyncMsg('');
    try {
      const res = await fetch('/api/premios', { method: 'POST' });
      const json = await res.json();
      if (json.ok) {
        setSyncMsg(`✓ ${json.count} premios · ${json.fecha}`);
        const fetchRes = await fetch('/api/premios');
        const fetchData = await fetchRes.json();
        setPremios(Array.isArray(fetchData) ? fetchData : []);
      } else {
        setSyncMsg(`✗ ${json.error}`);
      }
    } catch {
      setSyncMsg('✗ Error de red');
    } finally {
      setLoading(false);
    }
  }

  // Group by tipo
  const grouped = premios.reduce<Record<string, PremioApiRow[]>>((acc, p) => {
    if (!acc[p.tipo]) acc[p.tipo] = [];
    acc[p.tipo].push(p);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs uppercase tracking-wide text-gray-500">Premios del último sorteo</h3>
          {premios.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">{premios[0].fecha}</p>
          )}
        </div>
        <button
          onClick={sync}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs rounded-lg font-medium transition"
        >
          {loading ? '⏳' : '🔄'} Sync
        </button>
      </div>

      {syncMsg && (
        <p className={`text-xs mb-3 ${syncMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
          {syncMsg}
        </p>
      )}

      {premios.length === 0 && !loading && (
        <p className="text-xs text-gray-400 text-center py-4">
          Sin datos. Sincronizá para cargar los premios.
        </p>
      )}

      <div className="space-y-4">
        {Object.entries(grouped).map(([tipo, rows]) => (
          <div key={tipo}>
            <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1.5 ${TIPO_COLORS[tipo] || 'bg-gray-100 text-gray-700'}`}>
              {TIPO_LABELS[tipo] || tipo}
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 uppercase tracking-wide border-b">
                  <th className="text-left pb-1 pr-3">Aciertos</th>
                  <th className="text-center pb-1 pr-3">Ganadores</th>
                  <th className="text-right pb-1">Premio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((p, i) => (
                  <tr key={i}>
                    <td className="py-1.5 pr-3 text-gray-600">
                      {p.aciertos != null ? (ACIERTO_LABELS[p.aciertos] || `${p.aciertos} ac`) : '—'}
                    </td>
                    <td className={`py-1.5 text-center font-semibold ${p.ganadores === 'Vacante' ? 'text-red-600' : 'text-gray-800'}`}>
                      {p.ganadores === 'Vacante' ? '🍀 Vacante' : p.ganadores}
                    </td>
                    <td className={`py-1.5 text-right font-bold ${p.ganadores === 'Vacante' ? 'text-green-600' : 'text-gray-900'}`}>
                      ${formatPremio(p.premio)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3 pt-2 border-t">
        Fuente: quini-6-resultados.com.ar · Siempre verificá con el extracto oficial.
      </p>
    </div>
  );
}