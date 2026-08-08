import { NextResponse } from 'next/server';
import { getIdsExistentes, upsertSorteos, recalcularNums, registrarSync, getTotalSorteos } from '@/lib/db';
import { Sorteo } from '@/lib/types';

import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const { sorteos } = await req.json();
    if (!Array.isArray(sorteos)) {
      return NextResponse.json({ ok: false, error: 'Payload must be an array of sorteos' }, { status: 400 });
    }

    const existentes = await getIdsExistentes();
    const nuevos = (sorteos as Sorteo[]).filter(s => !existentes.has(s.id));

    if (nuevos.length > 0) {
      await upsertSorteos(nuevos);
      await recalcularNums();
    }

    const total = await getTotalSorteos();
    await registrarSync(nuevos.length, total);

    revalidatePath('/');

    return NextResponse.json({ ok: true, nuevos: nuevos.length, total });
  } catch (err) {
    const msg = String(err);
    await registrarSync(0, 0, msg).catch(() => {});
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
