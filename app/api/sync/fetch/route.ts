import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const runtime = 'edge';

const BASE_URL = 'https://www.quini-6-resultados.com.ar';
const SORTEOS_URL = `${BASE_URL}/quini6/sorteos-anteriores.aspx`;

const TIPO_MAP: Record<string, string> = {
  'SORTEO TRADICIONAL': 'TRAD',
  'LA SEGUNDA DEL QUINI': '2DA',
  'SORTEO REVANCHA': 'REV',
  'QUINI QUE SIEMPRE SALE': 'SALE',
};

export async function GET() {
  try {
    const res = await fetch(SORTEOS_URL, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const links: { url: string; iso: string; num: number }[] = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('/quini6/sorteo-')) {
        const url = href.startsWith('http') ? href : `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
        const match = url.match(/-(\d+)-del-dia-(\d{2})-(\d{2})-(\d{4})/);
        if (match) {
          const [, numStr, d, m, y] = match;
          const iso = `${y}-${m}-${d}`;
          if (!links.some(l => l.url === url)) {
            links.push({ url, iso, num: parseInt(numStr, 10) });
          }
        }
      }
    });

    if (links.length === 0) throw new Error('No se encontraron links de sorteos');

    const sorteosExtraidos = [];
    
    for (const link of links.slice(0, 3)) {
      const drawRes = await fetch(link.url, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
      if (!drawRes.ok) continue;
      const drawHtml = await drawRes.text();
      const $d = cheerio.load(drawHtml);

      const s: any = { sorteo: link.num, fecha: link.iso };
      
      $d('h3').each((_, el) => {
        const h3Text = $d(el).text().trim().toUpperCase();
        const matchedKey = Object.keys(TIPO_MAP).find(k => h3Text.includes(k));
        if (matchedKey) {
          const currentTipo = TIPO_MAP[matchedKey];
          let nextP = $d(el).next('p.numeros');
          if (nextP.length > 0) {
            const numbers = nextP.text().split('-').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
            if (numbers.length >= 6) {
              if (currentTipo === 'TRAD') s.tradicional = numbers.slice(0, 6);
              if (currentTipo === '2DA') s.segunda = numbers.slice(0, 6);
              if (currentTipo === 'REV') s.revancha = numbers.slice(0, 6);
              if (currentTipo === 'SALE') s.siempre_sale = numbers.slice(0, 6);
            }
          }
        }
      });
      if (s.tradicional && s.segunda && s.revancha && s.siempre_sale) {
        sorteosExtraidos.push(s);
      }
    }

    return NextResponse.json({ ok: true, data: sorteosExtraidos }, {
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
