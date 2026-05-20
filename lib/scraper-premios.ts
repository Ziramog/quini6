import { Sorteo } from './types';

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

export async function scrapePremios(): Promise<PremioDraw> {
  const res = await fetch(PREMIO_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const premios: Premio[] = [];

  // Match prize rows: <tr><td>6|5|4</td><td>Vacante|number</td><td>$ amount</td></tr>
  // with a preceding <span class="sorteo">TIPO</span>
  const rowRegex = /<tr class="v"><td colspan="3"><span class="sorteo">([^<]+)<\/span><\/td><\/tr>\s*<tr><td>(\d+)<\/td><td>(Vacante|\d+)<\/td><td>\$ ([^<]+)<\/td><\/tr>/g;
  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const tipoRaw = match[1].trim();
    // Map display names to DB names
    const tipoMap: Record<string, string> = {
      'TRADICIONAL': 'TRAD',
      'LA SEGUNDA': 'SEGUNDA',
      'REVANCHA': 'REVANCHA',
      'SIEMPRE SALE': 'SIEMPRE_SALE',
    };
    const tipo = tipoMap[tipoRaw] || tipoRaw;
    premios.push({
      tipo,
      aciertos: parseInt(match[2], 10),
      ganadores: match[3],
      premio: match[4].trim(),
    });
  }

  // POZO EXTRA — has no aciertos number in same pattern
  // Find it separately
  const pozoMatch = html.match(/<tr class="v"><td colspan="3"><span class="sorteo">POZO EXTRA<\/span><\/td><\/tr>\s*<tr><td>\s*(\d+)\s*<\/td><td>(\d+)<\/td><td>\$ ([^<]+)<\/td><\/tr>/);
  if (pozoMatch) {
    premios.push({
      tipo: 'POZO_EXTRA',
      aciertos: parseInt(pozoMatch[1], 10),
      ganadores: pozoMatch[2],
      premio: pozoMatch[3].trim(),
    });
  }

  // Extract draw date from page
  const fechaMatch = html.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  let fecha = '';
  if (fechaMatch) {
    // dd/mm/yyyy → yyyy-mm-dd
    fecha = `${fechaMatch[3]}-${fechaMatch[2].padStart(2,'0')}-${fechaMatch[1].padStart(2,'0')}`;
  }

  return { fecha, premios };
}