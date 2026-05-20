import { NextResponse } from 'next/server';
import { getSorteos2da } from '@/lib/db';

export async function GET() {
  try {
    const rows = await getSorteos2da();
    // rows are fecha desc (newest first); oldest gets num=rows.length, newest gets num=1
    const data = rows.map((s, i) => ({ ...s, num: rows.length - i }));
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}