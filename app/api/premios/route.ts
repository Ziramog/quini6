import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { scrapePremios } from '@/lib/scraper-premios';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('premios')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST() {
  try {
    const draw = await scrapePremios();
    if (!draw.fecha || draw.premios.length === 0) {
      return NextResponse.json({ ok: false, error: 'No se pudieron extraer premios' });
    }

    // Delete existing rows for this date
    await supabase.from('premios').delete().eq('fecha', draw.fecha);

    // Insert new rows
    const rows = draw.premios.map(p => ({
      fecha: draw.fecha,
      tipo: p.tipo,
      aciertos: p.aciertos,
      ganadores: p.ganadores,
      premio: p.premio,
    }));

    const { error } = await supabase.from('premios').insert(rows);
    if (error) throw error;

    return NextResponse.json({ ok: true, fecha: draw.fecha, count: rows.length });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}