import { NextResponse } from 'next/server';
import { scrapeTipo } from '@/lib/scraper';
import { getIdsExistentes, upsertSorteos, registrarSync, recalcularNums, getTotalSorteos } from '@/lib/db';
import { Sorteo } from '@/lib/types';

export async function POST() {
  try {
    const rawTRAD = await scrapeTipo('TRAD');

    const existentes = await getIdsExistentes();
    const nuevos = rawTRAD
      .filter(s => s.id && !existentes.has(s.id)) as Sorteo[];

    if (nuevos.length > 0) {
      await upsertSorteos(nuevos);
      await recalcularNums();
    }

    const total = await getTotalSorteos();
    await registrarSync(nuevos.length, total);

    return NextResponse.json({ ok: true, nuevos: nuevos.length, total });
  } catch (err) {
    const msg = String(err);
    await registrarSync(0, 0, msg).catch(() => {});
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}