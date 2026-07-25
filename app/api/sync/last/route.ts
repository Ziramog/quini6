import { NextResponse } from 'next/server';
import { getLastDate } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [lastSALE, lastREV, lastTRAD, last2DA] = await Promise.all([
      getLastDate('SALE'),
      getLastDate('REV'),
      getLastDate('TRAD'),
      getLastDate('2DA'),
    ]);

    return NextResponse.json({
      SALE: lastSALE,
      REV: lastREV,
      TRAD: lastTRAD,
      '2DA': last2DA,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
