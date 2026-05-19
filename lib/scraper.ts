import * as cheerio from 'cheerio';
import { Sorteo, TipoSorteo } from './types';

const URLS: Record<TipoSorteo, string> = {
  SALE: 'https://loteria.guru/resultados-loteria-argentina/ar-quini-6-segunda-vuelta/resultados-anteriores-quini-6-segunda-vuelta-ar',
  REV:  'https://loteria.guru/resultados-loteria-argentina/ar-quini-6-revancha/resultados-anteriores-quini-6-revancha-ar',
  TRAD: 'https://loteria.guru/resultados-loteria-argentina/ar-quini-6-tradicional/resultados-anteriores-quini-6-tradicional-ar',
};

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
  'Accept-Language': 'es-AR,es;q=0.9',
  'Accept': 'text/html,application/xhtml+xml',
};

const MESES: Record<string, string> = {
  'enero':'01','febrero':'02','marzo':'03','abril':'04','mayo':'05','junio':'06',
  'julio':'07','agosto':'08','septiembre':'09','octubre':'10','noviembre':'11','diciembre':'12',
  'ene':'01','feb':'02','mar':'03','abr':'04','may':'05','jun':'06',
  'jul':'07','ago':'08','sep':'09','oct':'10','nov':'11','dic':'12',
  'sept':'09',
};

export function parseFechaES(texto: string): { iso: string; display: string; year: number } {
  texto = texto.toLowerCase().trim();
  if (!texto) return { iso: '', display: '', year: 0 };
  const slash = texto.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slash) {
    const [, d, m, y] = slash;
    return { iso: `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`, display: texto, year: parseInt(y) };
  }
  const text = texto.match(/(\d{1,2})\s+([a-záéíóú]+)(?:\s+(\d{4}))?/);
  if (text) {
    const [, d, mes, y] = text;
    const year = y ? parseInt(y) : 0;
    const m = MESES[mes] || '01';
    return {
      iso: `${y || 'XXXX'}-${m}-${d.padStart(2,'0')}`,
      display: `${d.padStart(2,'0')} ${mes.slice(0,3)} ${y || '????'}`,
      year,
    };
  }
  return { iso: '', display: texto, year: 0 };
}

export async function scrapeTipo(tipo: TipoSorteo): Promise<Partial<Sorteo>[]> {
  const allSorteos: Partial<Sorteo>[] = [];
  let page = 1;
  let currentYear = new Date().getFullYear(); // anchor: page 1 is this year
  let prevMonth = 0;
  let justSawExplicitYear = false;

  while (true) {
    const url = `${URLS[tipo]}?page=${page}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status} scraping ${tipo} page ${page}`);
    const html = await res.text();

    const $ = cheerio.load(html);
    const lines = $('.lg-lottery-older-results .lg-line');
    if (lines.length === 0) { console.log(`[scrape ${tipo}] página ${page} vacía, termino`); break; }

    lines.each((_, line) => {
      const dateEl = $(line).find('.lg-date.has-text-right');
      const fechaTxt = dateEl.text().replace(/\s+/g, ' ').trim();
      if (!fechaTxt) return;
      const numeros: number[] = [];
      $(line).find('.lg-number').each((_, el) => {
        const n = parseInt($(el).text().trim());
        if (!isNaN(n) && n >= 0 && n <= 46) numeros.push(n);
      });
      if (numeros.length < 6) return;

      const parsed = parseFechaES(fechaTxt);
      const month = parseInt(parsed.iso.split('-')[1]);
      const day   = parseInt(parsed.iso.split('-')[2]);

      if (parsed.year !== 0) {
        currentYear = parsed.year;
        justSawExplicitYear = true;
      } else {
        // When month > prevMonth going backward through time, we've crossed a year boundary.
        // e.g., prevMonth=9 (sep) → month=1 (jan) = crossed from sep back through aug→...→jan, into prev year
        // The justSawExplicitYear flag prevents a false decrement on the entry immediately after
        // an explicit-year entry (which has no month context to work with).
        if (month > prevMonth && prevMonth > 0 && !justSawExplicitYear) {
          currentYear--;
        }
        justSawExplicitYear = false;
      }
      prevMonth = month;

      const iso = `${currentYear}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
      allSorteos.push({
        id: `${iso}_${tipo}`,
        num: 0,
        fecha: iso,
        fecha_display: parsed.display.replace('????', currentYear.toString()),
        n1: numeros[0], n2: numeros[1], n3: numeros[2],
        n4: numeros[3], n5: numeros[4], n6: numeros[5],
        tipo,
      });
    });

    console.log(`[scrape ${tipo}] página ${page}: ${lines.length} sorteos`);
    page++;
    if (page > 50) break;
    await new Promise(r => setTimeout(r, 800));
  }

  console.log(`[scrape ${tipo}] total: ${allSorteos.length} sorteos`);
  return allSorteos;
}