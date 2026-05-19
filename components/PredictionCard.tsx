'use client';
import { useState } from 'react';
import { EstadisticaNumero, generarTarjeta, colorPorNumero } from '@/lib/analysis';

interface Props {
  stats: EstadisticaNumero[];
}

export function PredictionCard({ stats }: Props) {
  const [tarjeta, setTarjeta] = useState<number[]>([]);

  function generar() {
    setTarjeta(generarTarjeta(stats));
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-wide text-gray-500">Tarjeta predicha</h3>
        <button
          onClick={generar}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-medium transition"
        >
          🎲 Nueva prediction
        </button>
      </div>

      {tarjeta.length > 0 && (
        <div className="flex gap-2 justify-center mb-4">
          {tarjeta.map((n, i) => (
            <span
              key={i}
              className="font-mono font-bold text-lg w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"
              style={{ color: colorPorNumero(n) }}
            >
              {String(n).padStart(2, '0')}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 border-t pt-3">
        Este tablero es una herramienta de análisis estadístico. El Quini 6 usa una máquina de bolas aleatoria. Ningún sistema predice con certeza el resultado.
      </p>
    </div>
  );
}