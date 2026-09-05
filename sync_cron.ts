import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.log('Faltan credenciales');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://www.quini-6-resultados.com.ar';
const SORTEOS_URL = `${BASE_URL}/quini6/sorteos-anteriores.aspx`;

const TIPO_MAP: Record<string, string> = {
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

async function run() {
  console.log('Consultando última fecha en Supabase...');
  const { data: lastSync } = await supabase.from('sync_log').select('last_sorteo_date').order('last_sorteo_date', { ascending: false }).limit(1);
  const minRequiredIso = (lastSync && lastSync.length > 0) ? lastSync[0].last_sorteo_date : '0000-00-00';
  console.log('Última fecha DB:', minRequiredIso);

  const res = await fetch(SORTEOS_URL);
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
        if (!links.some(l => l.url === url) && iso > minRequiredIso) {
          links.push({ url, iso, num: parseInt(numStr, 10) });
        }
      }
    }
  });

  links.sort((a, b) => a.iso.localeCompare(b.iso));
  
  if (links.length === 0) {
    console.log('Todo al día.');
    return;
  }

  let allSorteos: any[] = [];
  let maxDate = minRequiredIso;

  for (const { url, iso, num } of links) {
    console.log(`Descargando Sorteo ${num} (${iso})...`);
    try {
      const drawRes = await fetch(url);
      const drawHtml = await drawRes.text();
      const $d = cheerio.load(drawHtml);

      $d('h3').each((_, el) => {
        const h3Text = $d(el).text().trim().toUpperCase();
        const matchedKey = Object.keys(TIPO_MAP).find(k => h3Text.includes(k));
        if (matchedKey) {
          const currentTipo = TIPO_MAP[matchedKey];
          let nextP = $d(el).next('p.numeros');
          if (nextP.length > 0) {
            const numbers = nextP.text().split('-').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
            if (numbers.length >= 6) {
              allSorteos.push({
                id: `${iso}_${currentTipo}`,
                num: num,
                fecha: iso,
                fecha_display: formatDisplayDate(iso),
                n1: numbers[0], n2: numbers[1], n3: numbers[2],
                n4: numbers[3], n5: numbers[4], n6: numbers[5],
                tipo: currentTipo,
              });
            }
          }
        }
      });
      if (iso > maxDate) maxDate = iso;
    } catch (e: any) {
      console.log(`Error: ${e.message}`);
    }
  }

  if (allSorteos.length > 0) {
    console.log(`Guardando ${allSorteos.length} registros en Supabase...`);
    const { error: err1 } = await supabase.from('sorteos').upsert(allSorteos, { onConflict: 'id' });
    if (err1) throw err1;
    console.log('Calculando históricos...');
    await supabase.rpc('recalcular_nums');
    await supabase.from('sync_log').insert({ last_sorteo_date: maxDate, ejecutado_en: new Date().toISOString(), nuevos: allSorteos.length });
    console.log('¡Sincronización completa!');
  }
}

run().catch(console.error);
