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
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    `https://thingproxy.freeboard.io/fetch/${url}`
  ];

  for (const proxy of proxies) {
    try {
      const res = await fetch(proxy, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        // Check if the response actually contains quini 6 content (not an error page)
        if (text.includes('quini') || text.includes('Quini') || text.includes('Sorteo')) {
          return text;
        }
      }
    } catch (e) {
      console.warn(`Proxy failed: ${proxy}`, e);
    }
  }
  throw new Error(`Todos los proxies fallaron para ${url}. Posible bloqueo de Cloudflare o sin conexión.`);
}

export async function runClientSync(onProgress?: (msg: string) => void) {
  onProgress?.('Obteniendo últimas fechas...');
  const resLast = await fetch('/api/sync/last');
  const lastDates = await resLast.json();

  onProgress?.('Descargando historial...');
  const html = await proxyFetch(SORTEOS_URL);
  
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
          const minRequiredIso = Object.values(lastDates).reduce((min: string, cur: any) => {
            if (!cur) return '0000-00-00';
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
    onProgress?.('✓ 0 nuevos. Todo al día.');
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
    await new Promise(r => setTimeout(r, 200));
  }

  onProgress?.('Guardando datos...');
  return allSorteos;
}
