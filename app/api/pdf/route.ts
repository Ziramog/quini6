import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    await page.goto(`${baseUrl}/print`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: false,
      margin: { top: '8mm', bottom: '8mm', left: '0mm', right: '0mm' },
      printBackground: true,
    });

    const buffer = Buffer.from(pdfBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="quini6-historico.pdf"',
      },
    });
  } catch (err) {
    console.error('PDF error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}