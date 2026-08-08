import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const meses: Record<string, string> = {
  'Enero': '01', 'Febrero': '02', 'Marzo': '03', 'Abril': '04', 'Mayo': '05', 'Junio': '06',
  'Julio': '07', 'Agosto': '08', 'Septiembre': '09', 'Octubre': '10', 'Noviembre': '11', 'Diciembre': '12'
};

export async function GET() {
  try {
    const url = 'https://apps.loteriasantafe.gov.ar:8443/Extractos/paginas/mostrarQuini6.xhtml?display=0';
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const mesStr = $('select[name="form:mesSeleccionado_input"] option').first().val()?.toString() || '';
    const sorteoStr = $('select[name="form:sorteoSeleccionado_input"] option').first().val()?.toString() || '';

    const [mesNombre, anio] = mesStr.split(' ');
    const mesNum = meses[mesNombre] || '01';

    const match = sorteoStr.match(/.*?(\d+)\s*-\s*(\d+)/);
    if (!match) throw new Error('No match date');
    const dia = match[1].padStart(2, '0');
    const sorteoNum = parseInt(match[2], 10);
    const fechaStr = `${anio}-${mesNum}-${dia}`;

    const extractNumbers = (title: string) => {
      let nums: number[] = [];
      $('h3').each((_, el) => {
        if ($(el).text().includes(title)) {
          const container = $(el).next('div');
          container.find('.cuadrado b').each((_, bol) => {
            const n = parseInt($(bol).text(), 10);
            if (!isNaN(n)) nums.push(n);
          });
        }
      });
      return nums;
    }

    const nTrad = extractNumbers('Tradicional Primer');
    const n2da = extractNumbers('La Segunda');
    const nRev = extractNumbers('Revancha');
    const nSale = extractNumbers('Siempre Sale');

    if (nTrad.length < 6 || n2da.length < 6 || nRev.length < 6 || nSale.length < 6) {
      throw new Error('Números incompletos');
    }

    const sorteo = {
      sorteo: sorteoNum,
      fecha: fechaStr,
      tradicional: nTrad.slice(0, 6),
      segunda: n2da.slice(0, 6),
      revancha: nRev.slice(0, 6),
      siempre_sale: nSale.slice(0, 6),
    };

    return NextResponse.json({ ok: true, data: [sorteo] }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
