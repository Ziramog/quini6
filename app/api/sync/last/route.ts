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
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
