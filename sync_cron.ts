import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.log('Faltan credenciales');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

const meses: Record<string, string> = {
  'Enero': '01', 'Febrero': '02', 'Marzo': '03', 'Abril': '04', 'Mayo': '05', 'Junio': '06',
  'Julio': '07', 'Agosto': '08', 'Septiembre': '09', 'Octubre': '10', 'Noviembre': '11', 'Diciembre': '12'
};

async function run() {
  console.log('Consultando última fecha en Supabase...');
  const { data: lastSync } = await supabase.from('sync_log').select('last_sorteo_date').order('last_sorteo_date', { ascending: false }).limit(1);
  const minRequiredIso = (lastSync && lastSync.length > 0) ? lastSync[0].last_sorteo_date : '0000-00-00';
  console.log('Última fecha DB:', minRequiredIso);

  const url = 'https://apps.loteriasantafe.gov.ar:8443/Extractos/paginas/mostrarQuini6.xhtml?display=0';
  console.log('Fetching URL:', url);
  
  // Custom fetch with no-reject for self-signed certs just in case
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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

  if (fechaStr <= minRequiredIso) {
    console.log(`El último sorteo en Lotería es ${fechaStr}, y ya tenemos hasta ${minRequiredIso}.`);
    console.log('Todo al día.');
    return;
  }

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

  function formatDisplayDate(iso: string) {
    const [y, m, d] = iso.split('-');
    const mnames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${d} ${mnames[parseInt(m, 10) - 1]} ${y}`;
  }

  const fd = formatDisplayDate(fechaStr);
  const allSorteos = [
    { id: `${fechaStr}_TRAD`, num: sorteoNum, fecha: fechaStr, fecha_display: fd, tipo: 'TRAD', n1: nTrad[0], n2: nTrad[1], n3: nTrad[2], n4: nTrad[3], n5: nTrad[4], n6: nTrad[5] },
    { id: `${fechaStr}_2DA`, num: sorteoNum, fecha: fechaStr, fecha_display: fd, tipo: '2DA', n1: n2da[0], n2: n2da[1], n3: n2da[2], n4: n2da[3], n5: n2da[4], n6: n2da[5] },
    { id: `${fechaStr}_REV`, num: sorteoNum, fecha: fechaStr, fecha_display: fd, tipo: 'REV', n1: nRev[0], n2: nRev[1], n3: nRev[2], n4: nRev[3], n5: nRev[4], n6: nRev[5] },
    { id: `${fechaStr}_SALE`, num: sorteoNum, fecha: fechaStr, fecha_display: fd, tipo: 'SALE', n1: nSale[0], n2: nSale[1], n3: nSale[2], n4: nSale[3], n5: nSale[4], n6: nSale[5] },
  ];

  console.log(`Guardando sorteo ${sorteoNum} (${fechaStr}) en Supabase...`);
  const { error: err1 } = await supabase.from('sorteos').upsert(allSorteos, { onConflict: 'id' });
  if (err1) throw err1;
  
  console.log('Calculando históricos...');
  await supabase.rpc('recalcular_nums');
  await supabase.from('sync_log').insert({ last_sorteo_date: fechaStr, ejecutado_en: new Date().toISOString(), nuevos: 4 });
  console.log('¡Sincronización completa!');
}

run().catch(console.error);
