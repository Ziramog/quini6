import * as cheerio from 'cheerio';
import { Sorteo, TipoSorteo } from './types';

const BASE_URL = 'https://www.quini-6-resultados.com.ar';
const SORTEOS_URL = `${BASE_URL}/quini6/sorteos-anteriores.aspx`;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
  'Accept-Language': 'es-AR,es;q=0.9',
  'Accept': 'text/html,application/xhtml+xml',
};

const TIPO_MAP: Record<string, TipoSorteo> = {
  'SORTEO TRADICIONAL': 'TRAD',
  'LA SEGUNDA DEL QUINI': '2DA',
  'SORTEO REVANCHA': 'REV',
  'QUINI QUE SIEMPRE SALE': 'SALE',
};

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

export async function scrapeTipo(
  tipo: TipoSorteo,
  minIso?: string,
): Promise<Partial<Sorteo>[]> {
  const allSorteos: Partial<Sorteo>[] = [];
  
  // 1. Fetch the list of historical draws
  const html = await proxyFetch(SORTEOS_URL);
  const $ = cheerio.load(html);

  // 2. Extract links and their ISO dates
  const links: { url: string; iso: string }[] = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('/quini6/sorteo-')) {
      const url = href.startsWith('http') ? href : `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
      
      const match = url.match(/-del-dia-(\d{2})-(\d{2})-(\d{4})/);
      if (match) {
        const [, d, m, y] = match;
        const iso = `${y}-${m}-${d}`;
        // deduplicate and ensure it's strictly > minIso
        if (!links.some(l => l.url === url)) {
          if (!minIso || iso > minIso) {
            links.push({ url, iso });
          }
        }
      }
    }
  });

  links.sort((a, b) => b.iso.localeCompare(a.iso));
  console.log(`[scrape ${tipo}] Found ${links.length} URLs > ${minIso || 'all'}`);

  // 3. Fetch each valid link and parse the numbers
  for (const { url, iso } of links) {
    console.log(`[scrape ${tipo}] Fetching ${url}`);
    try {
      const drawHtml = await proxyFetch(url);
      const $draw = cheerio.load(drawHtml);

      $draw('h3').each((_, el) => {
      // the title might have extra spaces, e.g. ' SORTEO TRADICIONAL'
      const h3Text = $draw(el).text().trim().toUpperCase();
      
      // Try to find a matching prefix (e.g. if it has extra text)
      const matchedKey = Object.keys(TIPO_MAP).find(k => h3Text.includes(k));
      if (!matchedKey) return;
      
      const currentTipo = TIPO_MAP[matchedKey];
      
      if (currentTipo === tipo) {
        const numsP = $draw(el).next('p.numeros');
        const numsText = numsP.text().trim();
        if (numsText) {
          const numbers = numsText.split('-').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
          if (numbers.length >= 6) {
            allSorteos.push({
              id: `${iso}_${tipo}`,
              num: 0,
              fecha: iso,
              fecha_display: formatDisplayDate(iso),
              n1: numbers[0], n2: numbers[1], n3: numbers[2],
              n4: numbers[3], n5: numbers[4], n6: numbers[5],
              tipo,
            });
          }
        }
      }
    });
    } catch (e) {
      console.warn(`[scrape ${tipo}] Error fetching ${url}:`, e);
    }
    
    // Slight delay to avoid being rate-limited
    await new Promise(r => setTimeout(r, 400));
  }

  return allSorteos;
}

function formatDisplayDate(iso: string) {
  const [y, m, d] = iso.split('-');
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const mes = meses[parseInt(m, 10) - 1];
  return `${d} ${mes} ${y}`;
}