import { Sorteo, TipoSorteo } from './types';

const BASE_URL = 'https://www.quini-6-resultados.com.ar';
const SORTEOS_URL = `${BASE_URL}/quini6/sorteos-anteriores.aspx`;

const TIPO_MAP: Record<string, TipoSorteo> = {
  'SORTEO TRADICIONAL': 'TRAD',
  'LA SEGUNDA DEL QUINI': '2DA',
  'SORTEO REVANCHA': 'REV',
  'QUINI QUE SIEMPRE SALE': 'SALE',
};

function formatDisplayDate(iso: string) {
  const [y, m, d] = iso.split('-');
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const mes = meses[parseInt(m, 10) - 1];
  return `${d} ${mes} ${y}`;
}

async function proxyFetch(url: string): Promise<string> {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
  const json = await res.json();
  if (json.status && json.status.http_code !== 200) {
    throw new Error(`Target HTTP ${json.status.http_code} fetching ${url}`);
  }
  return json.contents as string;
}

export async function runClientSync(onProgress?: (msg: string) => void) {
  onProgress?.('Obteniendo últimas fechas...');
  const resLast = await fetch('/api/sync/last');
  const lastDates = await resLast.json(); // { SALE: '2026-07-22', REV: '...', TRAD: '...', 2DA: '...' }

  onProgress?.('Descargando historial...');
  const html = await proxyFetch(SORTEOS_URL);
  
  // Use DOMParser instead of cheerio
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const links: { url: string; iso: string }[] = [];
  doc.querySelectorAll('a').forEach((el) => {
    const href = el.getAttribute('href');
    if (href && href.includes('/quini6/sorteo-')) {
      const url = href.startsWith('http') ? href : `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
      const match = url.match(/-del-dia-(\d{2})-(\d{2})-(\d{4})/);
      if (match) {
        const [, d, m, y] = match;
        const iso = `${y}-${m}-${d}`;
        if (!links.some(l => l.url === url)) {
          // Check if it's newer than any of the last dates
          // If we need TRAD, 2DA, REV, or SALE, we should check if iso > lastDates for any of them.
          // To be safe, we just fetch if it's newer than the oldest lastDate, or just fetch all if missing.
          const minRequiredIso = Object.values(lastDates).reduce((min: string, cur: any) => {
            if (!cur) return '0000-00-00'; // if any is missing, fetch all
            return (min === '0000-00-00' || cur < min) ? cur : min;
          }, '9999-99-99' as string);
          
          if (iso > minRequiredIso || minRequiredIso === '0000-00-00') {
            links.push({ url, iso });
          }
        }
      }
    }
  });

  links.sort((a, b) => b.iso.localeCompare(a.iso));
  
  if (links.length === 0) {
    onProgress?.('No hay sorteos nuevos.');
    return [];
  }

  const allSorteos: Partial<Sorteo>[] = [];

  for (let i = 0; i < links.length; i++) {
    const { url, iso } = links[i];
    onProgress?.(`Procesando sorteo ${i + 1}/${links.length}...`);
    try {
      const drawHtml = await proxyFetch(url);
      const drawDoc = parser.parseFromString(drawHtml, 'text/html');

      drawDoc.querySelectorAll('h3').forEach((el) => {
        const h3Text = el.textContent?.trim().toUpperCase() || '';
        const matchedKey = Object.keys(TIPO_MAP).find(k => h3Text.includes(k));
        
        if (matchedKey) {
          const currentTipo = TIPO_MAP[matchedKey];
          const lastDateForTipo = lastDates[currentTipo];
          
          if (!lastDateForTipo || iso > lastDateForTipo) {
            // Numbers are in the next element p.numeros
            let nextEl = el.nextElementSibling;
            if (nextEl && nextEl.tagName.toLowerCase() === 'p' && nextEl.classList.contains('numeros')) {
              const numsText = nextEl.textContent?.trim() || '';
              const numbers = numsText.split('-').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
              if (numbers.length >= 6) {
                allSorteos.push({
                  id: `${iso}_${currentTipo}`,
                  num: 0,
                  fecha: iso,
                  fecha_display: formatDisplayDate(iso),
                  n1: numbers[0], n2: numbers[1], n3: numbers[2],
                  n4: numbers[3], n5: numbers[4], n6: numbers[5],
                  tipo: currentTipo,
                });
              }
            }
          }
        }
      });
    } catch (e) {
      console.warn(`Error fetching ${url}:`, e);
    }
    // minimal delay in client
    await new Promise(r => setTimeout(r, 200));
  }

  onProgress?.('Guardando datos...');
  return allSorteos;
}
