import { Sorteo, TipoSorteo } from './types';



function formatDisplayDate(iso: string) {
  const [y, m, d] = iso.split('-');
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const mes = meses[parseInt(m, 10) - 1];
  return `${d} ${mes} ${y}`;
}

export async function runClientSync(onProgress?: (msg: string) => void) {
  onProgress?.('Obteniendo últimas fechas...');
  const resLast = await fetch('/api/sync/last');
  const lastDates = await resLast.json();

  onProgress?.('Descargando último sorteo desde Lotería de Santa Fe...');
  const resFetch = await fetch('/api/sync/fetch');
  const jsonFetch = await resFetch.json();

  if (!jsonFetch.ok || !jsonFetch.data || jsonFetch.data.length === 0) {
    throw new Error(jsonFetch.error || 'Error al descargar datos.');
  }

  const allSorteos: Partial<Sorteo>[] = [];
  const s = jsonFetch.data[0];

  const tipos: { key: string; name: TipoSorteo }[] = [
    { key: 'tradicional', name: 'TRAD' },
    { key: 'segunda', name: '2DA' },
    { key: 'revancha', name: 'REV' },
    { key: 'siempre_sale', name: 'SALE' },
  ];

  for (const t of tipos) {
    const lastDateForTipo = lastDates[t.name] || '0000-00-00';
    if (s.fecha > lastDateForTipo) {
      const numbers = s[t.key];
      if (numbers && numbers.length >= 6) {
        allSorteos.push({
          id: `${s.fecha}_${t.name}`,
          num: s.sorteo,
          fecha: s.fecha,
          fecha_display: formatDisplayDate(s.fecha),
          n1: numbers[0], n2: numbers[1], n3: numbers[2],
          n4: numbers[3], n5: numbers[4], n6: numbers[5],
          tipo: t.name,
        });
      }
    }
  }

  if (allSorteos.length === 0) {
    onProgress?.('✓ 0 nuevos. Todo al día.');
    return [];
  }

  onProgress?.('Guardando datos...');
  return allSorteos;
}
