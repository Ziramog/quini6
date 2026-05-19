import { getSorteos2da } from '@/lib/db';

function colorFondoNumero(n: number): string {
  if (n <= 9)  return '#A5D6A7';
  if (n <= 19) return '#FFCC80';
  if (n <= 29) return '#EF9A9A';
  if (n <= 39) return '#90CAF9';
  return '#E0E0E0';
}

function colorPorNumero(n: number): string {
  if (n <= 9)  return '#006100';
  if (n <= 19) return '#9C6500';
  if (n <= 29) return '#9C0006';
  if (n <= 39) return '#0070C0';
  return '#1a1a1a';
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default async function Print2daRoute() {
  const sorteos = await getSorteos2da();

  return (
    <div style={{ padding: '5mm 15mm', background: 'white' }}>
      <div style={{ marginBottom: '16px', borderBottom: '1pt solid #ccc', paddingBottom: '8px' }}>
        <h1 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '4px' }}>Quini 6 — Histórico 2DA Tradicional</h1>
        <p style={{ fontSize: '9pt', color: '#666' }}>{sorteos.length} sorteos</p>
      </div>
      <table className="sorteos-table">
        <thead>
          <tr>
            <th>NUM</th>
            <th>FECHA</th>
            <th>N1</th>
            <th>N2</th>
            <th>N3</th>
            <th>N4</th>
            <th>N5</th>
            <th>N6</th>
            <th>SORTEO</th>
          </tr>
        </thead>
        <tbody>
          {sorteos.map((s, i) => (
            <tr key={s.id} style={i % 2 === 0 ? {} : { background: '#fafafa' }}>
              <td style={{ color: '#999', textAlign: 'right', padding: '2pt 4pt', fontSize: '8pt' }}>{s.num}</td>
              <td style={{ textAlign: 'left', padding: '2pt 4pt', fontSize: '8pt' }}>{s.fecha_display}</td>
              {[s.n1, s.n2, s.n3, s.n4, s.n5, s.n6].map((n, j) => (
                <td key={j} style={{ textAlign: 'center', padding: '2pt' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '1pt 3pt',
                    borderRadius: '3pt',
                    fontSize: '8pt',
                    fontWeight: 'bold',
                    backgroundColor: colorFondoNumero(n),
                    color: colorPorNumero(n),
                  }}>
                    {pad(n)}
                  </span>
                </td>
              ))}
              <td style={{ textAlign: 'center', padding: '2pt 6pt' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '1pt 4pt',
                  borderRadius: '8pt',
                  fontSize: '7pt',
                  fontWeight: 'bold',
                  backgroundColor: '#f3e8ff',
                  color: '#7c3aed',
                }}>
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