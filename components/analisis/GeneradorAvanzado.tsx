'use client';
import { useState } from 'react';
import { EstadisticaNumero, generarTarjetaAvanzada, ConfigTarjeta, TarjetaGenerada, colorPorNumero, colorFondoNumero } from '@/lib/analysis';

interface Props {
  stats: EstadisticaNumero[];
}

function TarjetaCard({ t, stats }: { t: TarjetaGenerada; stats: EstadisticaNumero[] }) {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
      <div className="flex gap-2 justify-center mb-2">
        {t.numeros.map((n, i) => (
          <span
            key={i}
            className="font-mono font-bold text-sm px-2 py-1 rounded text-center"
            style={{ color: colorPorNumero(n), backgroundColor: colorFondoNumero(n) }}
          >
            {String(n).padStart(2, '0')}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
        <div>Suma: <span className="font-semibold">{t.suma}</span> <span className={t.suma >= 111 && t.suma <= 180 ? 'text-green-600' : 'text-red-500'}>✓</span></div>
        <div>Pares: <span className="font-semibold">{t.pares}</span> <span className={t.pares >= 2 && t.pares <= 4 ? 'text-green-600' : 'text-red-500'}>✓</span></div>
        <div>Consecutivos: <span className="font-semibold">{t.consecutivos}</span></div>
        <div>Vencidos: <span className="font-semibold">{t.vencidosIncluidos.length}</span></div>
        <div className="col-span-2">Confianza: <span className="font-bold text-blue-600">{t.confianza}/100</span></div>
      </div>
    </div>
  );
}

export function GeneradorAvanzado({ stats }: Props) {
  const [config, setConfig] = useState<ConfigTarjeta>({
    modo: 'AMBOS',
    incluirVencidos: true,
    respetoDecenas: true,
    filtroParidad: [2, 4],
    filtroSuma: [111, 180],
    penalizarConsecutivos: true,
  });
  const [cards, setCards] = useState<TarjetaGenerada[]>([]);

  function generar(cantidad = 1) {
    const nuevas = Array.from({ length: cantidad }, () => generarTarjetaAvanzada(stats, config));
    setCards(prev => [...nuevas, ...prev].slice(0, 10));
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-wide text-gray-500">Generador inteligente</h3>
      <p className="text-xs text-gray-400 mb-3">Este generador no elige números al azar — usa las estadísticas de todos los sorteos para armar tarjetas que caigan dentro de los rangos más probables (suma 111-180, 2-4 pares, sin consecutivos). Podés filtrar por modo SALE o REV y priorizar números que están "vencidos" según el semáforo.</p>
        <div className="flex gap-2">
          <button onClick={() => generar(1)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium">🎲 1 Tarjeta</button>
          <button onClick={() => generar(5)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium">🎲 5 Tarjetas</button>
          <button onClick={() => generar(10)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium">🎲 10 Tarjetas</button>
        </div>
      </div>

      {/* Config */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg text-xs">
        <div>
          <label className="block text-gray-500 mb-1">Modo</label>
          <select
            value={config.modo}
            onChange={e => setConfig(c => ({ ...c, modo: e.target.value as 'SALE' | 'REV' | 'AMBOS' }))}
            className="w-full border rounded px-2 py-1"
          >
            <option value="AMBOS">Ambos</option>
            <option value="SALE">SALE</option>
            <option value="REV">REV</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-500 mb-1">Suma mín</label>
          <input type="number" value={config.filtroSuma[0]} onChange={e => setConfig(c => ({ ...c, filtroSuma: [Number(e.target.value), c.filtroSuma[1]] }))} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-gray-500 mb-1">Suma máx</label>
          <input type="number" value={config.filtroSuma[1]} onChange={e => setConfig(c => ({ ...c, filtroSuma: [c.filtroSuma[0], Number(e.target.value)] }))} className="w-full border rounded px-2 py-1" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={config.incluirVencidos} onChange={e => setConfig(c => ({ ...c, incluirVencidos: e.target.checked }))} />
          <label>Priorizar vencidos</label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((t, i) => <TarjetaCard key={i} t={t} stats={stats} />)}
      </div>

      <p className="text-xs text-gray-400 mt-3 border-t pt-3">
        El Quini 6 es un juego de azar. Estos análisis son descriptivos, no predictivos.
      </p>
    </div>
  );
}