import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { scrapeTipo } from '@/lib/scraper';
import { upsertSorteos, registrarSync, recalcularNums } from '@/lib/db';
import { Sorteo } from '@/lib/types';

export async function POST() {
  try {
    // 1. Borrar todos los sorteos existentes
    const { error: deleteError } = await supabaseAdmin.from('sorteos').delete().neq('id', '');
    if (deleteError) throw new Error(`Borrar sorteos: ${deleteError.message}`);

    // 2. Re-scrapeo completo SALE, REV, TRAD y 2DA
    const rawSALE = await scrapeTipo('SALE');
    await new Promise(r => setTimeout(r, 1000));
    const rawREV  = await scrapeTipo('REV');
    await new Promise(r => setTimeout(r, 1000));
    const rawTRAD = await scrapeTipo('TRAD');
    await new Promise(r => setTimeout(r, 1000));
    const raw2DA  = await scrapeTipo('2DA');

    const nuevos = [...rawSALE, ...rawREV, ...rawTRAD, ...raw2DA] as Sorteo[];

    if (nuevos.length > 0) {
      await upsertSorteos(nuevos);
      await recalcularNums();
    }

    // 3. Registrar en sync_log
    await registrarSync(nuevos.length, nuevos.length);

    return NextResponse.json({ ok: true, total: nuevos.length });
  } catch (err) {
    const msg = String(err);
    console.error('[reset]', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}