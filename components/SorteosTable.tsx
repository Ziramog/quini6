import { Sorteo, numerosArray } from '@/lib/types';
import { colorPorNumero } from '@/lib/analysis';

function NumBall({ n }: { n: number }) {
  return (
    <span
      className="font-mono font-bold text-xs block px-1 py-0.5 text-center rounded"
      style={{
        color: colorPorNumero(n),
        backgroundColor: colorFondoNumero(n),
        letterSpacing: '-0.05em',
      }}
    >
      {String(n).padStart(2, '0')}
    </span>
  );
}

function colorFondoNumero(n: number): string {
  if (n <= 9)  return '#A5D6A7';
  if (n <= 19) return '#FFCC80';
  if (n <= 29) return '#EF9A9A';
  if (n <= 39) return '#90CAF9';
  return '#E0E0E0';
}

export function SorteosTable({ sorteos }: { sorteos: Sorteo[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="sorteos-table w-full text-sm border-collapse bg-white text-gray-900 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-xs uppercase tracking-wide text-gray-500">
            <th className="px-1 py-1 text-right text-xs w-8">NUM</th>
            <th className="px-1 py-1 text-left text-xs">FECHA</th>
            <th className="px-0.5 py-1 text-center text-xs">N1</th>
            <th className="px-0.5 py-1 text-center text-xs">N2</th>
            <th className="px-0.5 py-1 text-center text-xs">N3</th>
            <th className="px-0.5 py-1 text-center text-xs">N4</th>
            <th className="px-0.5 py-1 text-center text-xs">N5</th>
            <th className="px-0.5 py-1 text-center text-xs">N6</th>
            <th className="px-1 py-1 text-center text-xs">SORTEO</th>
          </tr>
        </thead>
        <tbody>
          {sorteos.map((s, i) => (
            <tr key={s.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-1 py-1 text-right text-gray-400 text-xs tabular-nums">{s.num}</td>
              <td className="px-1 py-1 text-gray-700 whitespace-nowrap text-xs">{s.fecha_display}</td>
              {numerosArray(s).map((n, j) => (
                <td key={j} className="px-0.5 py-1 text-center">
                  <NumBall n={n} />
                </td>
              ))}
              <td className="px-1 py-1 text-center">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  s.tipo === 'SALE' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {s.tipo}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}