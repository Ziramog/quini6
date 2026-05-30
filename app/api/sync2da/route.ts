import { NextResponse } from 'next/server';
import { scrapeTipo } from '@/lib/scraper';
import { getIdsExistentes, upsertSorteos, registrarSync, recalcularNums, getTotalSorteos, getLastDate } from '@/lib/db';
import { Sorteo } from '@/lib/types';

export async function POST() {
  try {
    const [lastTRAD, last2DA] = await Promise.all([getLastDate('TRAD'), getLastDate('2DA')]);
    const rawTRAD = await scrapeTipo('TRAD', lastTRAD ?? undefined);
    await new Promise(r => setTimeout(r, 1000));
    const raw2DA  = await scrapeTipo('2DA', last2DA ?? undefined);

    const existentes = await getIdsExistentes();
    const nuevos = [...rawTRAD, ...raw2DA]
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