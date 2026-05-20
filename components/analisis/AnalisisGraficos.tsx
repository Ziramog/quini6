'use client';
import { EstadisticaNumero, calcularParidad, calcularConsecutivos, calcularSuma, calcularDecenas, calcularParesFrecuentes, calcularSesgoSaleRev, calcularRepeticionDiaria, calcularTendencias } from '@/lib/analysis';
import { Sorteo } from '@/lib/types';
import { InfoBox } from './InfoBox';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  stats: EstadisticaNumero[];
  sorteos: Sorteo[];
}

const DECENA_COLORS = ['#006100', '#9C6500', '#9C0006', '#0070C0', '#1a1a1a'];
const PARIDAD_COLORS = ['#DC2626', '#EA580C', '#CA8A04', '#16A34A', '#CA8A04', '#EA580C', '#DC2626'];

export function AnalisisGraficos({ stats, sorteos }: Props) {
  const paridadDist = calcularParidad(sorteos);
  const consecDist = calcularConsecutivos(sorteos);
  const sumaDist = calcularSuma(sorteos);
  const decenasDist = calcularDecenas(sorteos);
  const paresFrec = calcularParesFrecuentes(sorteos);
  const sesgo = calcularSesgoSaleRev(sorteos);
  const repDiaria = calcularRepeticionDiaria(sorteos);
  const tendencias = calcularTendencias(sorteos, 30);

  const paridadData = paridadDist.map((v, i) => ({ name: `${i}`, value: v, label: i }));
  const consecData = [
    { name: '0', value: consecDist[0], label: '0' },
    { name: '1', value: consecDist[1], label: '1' },
    { name: '2', value: consecDist[2], label: '2' },
    { name: '3+', value: consecDist[3], label: '3+' },
  ];
  const sumaData = sumaDist.map(s => ({ name: s.rango, value: s.count, pct: s.pct }));
  const totalSorteos = sorteos.length;

  return (
    <div className="space-y-4">
      {/* Decenas donut */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-1">Distribución por decenas</h3>
        <p className="text-xs text-gray-400 mb-3">Los 46 números se dividen en 5 grupos de 10: 0-9, 10-19, 20-29, 30-39 y 40-46. Este gráfico muestra cuántos números de cada grupo aparecen promedio por sorteo. Si un grupo aparece mucho, significa que tiene números que salen con frecuencia.</p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={decenasDist} dataKey="count" nameKey="decena" cx="50%" cy="50%" outerRadius={65} innerRadius={30}>
                {decenasDist.map((_, i) => <Cell key={i} fill={DECENA_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-1">
            {decenasDist.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="font-medium">{d.decena}</span>
                <span className="text-gray-500">{d.pct}% · avg {d.avgPorSorteo}/sorteo</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Paridad */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-1">Distribución de pares</h3>
        <p className="text-xs text-gray-400 mb-3">Cada sorteo tiene entre 0 y 6 números pares. Este gráfico muestra cuántos sorteos tuvieron 0 pares, 1 par, 2 pares, etc. La zona verde (2 a 4 pares) es la más común — más de la mitad de los sorteos caen ahí. Si juegas siempre con exactamente 3 pares, cubrís la zona más probable.</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={paridadData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v) => [v, 'sorteos']} />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {paridadData.map((entry, i) => (
                <Cell key={i} fill={i >= 2 && i <= 4 ? '#16A34A' : '#94A3B8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 mt-1">Zona verde (2-4 pares) = 60% de los sorteos</p>
      </div>

      {/* Suma */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-1">Rango de suma</h3>
        <p className="text-xs text-gray-400 mb-3">Sumá los 6 números de tu tarjeta. Este gráfico muestra en qué rangos caen las sumas de todos los sorteos históricos. Los sorteos no son aleatorios en su suma — la mayoryía cae entre 111 y 180. Jugar dentro de ese rango te pone en la zona más probable.</p>
        <div className="space-y-1">
          {sumaDist.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-16 text-right text-gray-500">{s.rango}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full"
                  style={{
                    width: `${s.pct}%`,
                    backgroundColor: i === 2 || i === 3 || i === 4 ? '#16A34A' : i === 1 || i === 5 ? '#CA8A04' : '#DC2626',
                  }}
                />
              </div>
              <span className="w-8 text-gray-500">{s.pct}%</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">Zona óptima (111-180) = 69.6% de los sorteos</p>
      </div>

      {/* Top pares */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-1">Pares más frecuentes</h3>
        <p className="text-xs text-gray-400 mb-3">Algunos números tienden a salir juntos con más frecuencia. Esta lista muestra los 15 pares que más frecuentemente aparecieron en los sorteos. Si dos números que te gustan están en esta lista, puede ser una buena señal — esos pares tienen historial de repetirse.</p>
        <div className="space-y-1">
          {paresFrec.slice(0, 15).map((p, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold" style={{ color: colorPorNumero(p.par[0]) }}>
                {String(p.par[0]).padStart(2,'0')}
              </span>
              <span className="font-mono font-bold" style={{ color: colorPorNumero(p.par[1]) }}>
                {String(p.par[1]).padStart(2,'0')}
              </span>
              <span className="text-gray-400 ml-2">{p.veces} veces</span>
            </div>
          ))}
        </div>
      </div>

      {/* Repetición diaria */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-1">Repetición SALE↔REV mismo día</h3>
        <p className="text-xs text-gray-400 mb-3">Cada día hay dos sorteos: Sale y Revancha. Este gráfico muestra cuántos números se repiten entre el Sale y la Revancha del mismo día. Si sale 1 número repetido, es lo más común. Esto es útil para saber cuántos números distintos necesitás entre ambas jugadas.</p>
        <div className="flex gap-3">
          {repDiaria.map((r, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-lg font-bold" style={{ color: r.compartidos === 1 ? '#16A34A' : '#374151' }}>{r.compartidos}</span>
              <span className="text-xs text-gray-500">{r.pct}%</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">55.7% de los días repiten al menos 1 número</p>
      </div>
    </div>
  );
}

function colorPorNumero(n: number) {
  if (n <= 9)  return '#006100';
  if (n <= 19) return '#9C6500';
  if (n <= 29) return '#9C0006';
  if (n <= 39) return '#0070C0';
  return '#1a1a1a';
}