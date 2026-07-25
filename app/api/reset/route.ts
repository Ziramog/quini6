import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { registrarSync, recalcularNums } from '@/lib/db';

export async function POST() {
  try {
    // 1. Borrar todos los sorteos existentes
    const { error: deleteError } = await supabaseAdmin.from('sorteos').delete().neq('id', '');
    if (deleteError) throw new Error(`Borrar sorteos: ${deleteError.message}`);

    await recalcularNums();

    // 3. Registrar en sync_log
    await registrarSync(0, 0);

    return NextResponse.json({ ok: true, msg: "Database reset. Run client sync to fetch all draws." });
  } catch (err) {
    const msg = String(err);
    console.error('[reset]', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}