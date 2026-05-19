import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { upsertSorteos, recalcularNums, getTotalSorteos } from '@/lib/db';
import { Sorteo } from '@/lib/types';

const SEED_SECRET = process.env.SEED_SECRET ?? 'quini-seed-2026';

export async function POST(req: NextRequest) {
  if (req.headers.get('x-seed-secret') !== SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const csv = fs.readFileSync(path.join(process.cwd(), 'data', 'seed.csv'), 'utf-8');
  const lines = csv.trim().split('\n').slice(1);

  const sorteos: Sorteo[] = lines.map(line => {
    const [num, fecha, n1, n2, n3, n4, n5, n6, tipo, fecha_display] = line.split(',');
    return {
      id: `${fecha}_${tipo.trim()}`,
      num: parseInt(num),
      fecha,
      fecha_display: fecha_display?.trim() ?? fecha,
      n1: parseInt(n1), n2: parseInt(n2), n3: parseInt(n3),
      n4: parseInt(n4), n5: parseInt(n5), n6: parseInt(n6),
      tipo: tipo.trim() as 'SALE' | 'REV',
    };
  });

  await upsertSorteos(sorteos);
  await recalcularNums();
  const total = await getTotalSorteos();

  return NextResponse.json({ ok: true, insertados: sorteos.length, total });
}