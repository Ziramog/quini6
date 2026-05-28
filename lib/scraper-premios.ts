import * as cheerio from 'cheerio';

export interface Premio {
  tipo: string;
  aciertos: number | null;
  ganadores: string;
  premio: string;
}

export interface PremioDraw {
  fecha: string;
  premios: Premio[];
}

const PREMIO_URL = 'https://www.quini-6-resultados.com.ar/';

const TIPO_MAP: Record<string, string> = {
  'TRADICIONAL': 'TRAD',
  'LA SEGUNDA': 'SEGUNDA',
  'REVANCHA': 'REVANCHA',
  'SIEMPRE SALE': 'SIEMPRE_SALE',
  'POZO EXTRA': 'POZO_EXTRA',
};

export async function scrapePremios(): Promise<PremioDraw> {
  const res = await fetch(PREMIO_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const $ = cheerio.load(html);
  const premios: Premio[] = [];

  // Find the detailed prize table (second table on the page)
  // Look for <span class="sorteo"> containing category names
  $('span.sorteo').each((_i, el) => {
    const tipoRaw = $(el).text().trim();
    if (!tipoRaw) return;

    const tipo = TIPO_MAP[tipoRaw] || tipoRaw;

    // The category row is inside <tr class="v"> — look at subsequent rows
    const categoryRow = $(el).closest('tr');
    let nextRow = categoryRow.next('tr');

    // Collect all prize tiers under this category
    while (nextRow.length && !nextRow.hasClass('v')) {
      const cells = nextRow.find('td');
      if (cells.length >= 3) {
        const aciertosStr = $(cells[0]).text().trim();
        const ganadoresStr = $(cells[1]).text().trim();
        const premioStr = $(cells[2]).text().trim();

        premios.push({
          tipo,
          aciertos: aciertosStr ? parseInt(aciertosStr.replace(/\./g, ''), 10) : null,
          ganadores: ganadoresStr || '',
          premio: premioStr.replace(/^\$\s*/, ''),
        });
      }
      nextRow = nextRow.next('tr');
    }
  });



  // Extract draw date from page
  const fechaText = $('strong:contains("Sorteo")').first().text() || $('p:contains("/")').first().text();
  const fechaMatch = fechaText.match(/(\d{2})\/(\d{2})\/(\d{4})/) || html.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  let fecha = '';
  if (fechaMatch) {
    fecha = `${fechaMatch[3]}-${fechaMatch[2].padStart(2, '0')}-${fechaMatch[1].padStart(2, '0')}`;
  }

  return { fecha, premios };
}
