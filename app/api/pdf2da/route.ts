import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { getSorteos2da } from '@/lib/db';

chromium.setGraphicsMode = false;

function colorFondoNumero(n: number): string {
  if (n <= 9)  return '#A5D6A7';
  if (n <= 19) return '#FFCC80';
  if (n <= 29) return '#EF9A9A';
  if (n <= 39) return '#90CAF9';
  return '#E0E0E0';
}

function colorPorNumero(n: number): string {
  if (n <= 9)  return '#006100';
  if (n <= 19) return '#9C6500';
  if (n <= 29) return '#9C0006';
  if (n <= 39) return '#0070C0';
  return '#1a1a1a';
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function buildHtml(sorteos: any[]) {
  const rows = sorteos.map((s, i) => `
    <tr style="${i % 2 === 0 ? '' : 'background:#fafafa'}">
      <td style="color:#999;text-align:right;padding:2pt 4pt;font-size:8pt">${s.num}</td>
      <td style="text-align:left;padding:2pt 4pt;font-size:8pt">${s.fecha_display}</td>
      ${[s.n1, s.n2, s.n3, s.n4, s.n5, s.n6].map((n: number) => `
        <td style="text-align:center;padding:2pt">
          <span style="display:inline-block;padding:1pt 3pt;border-radius:3pt;font-size:8pt;font-weight:bold;background-color:${colorFondoNumero(n)};color:${colorPorNumero(n)}">${pad(n)}</span>
        </td>`).join('')}
      <td style="text-align:center;padding:2pt 6pt">
        <span style="display:inline-block;padding:1pt 4pt;border-radius:8pt;font-size:7pt;font-weight:bold;background-color:${s.tipo === 'TRAD' ? '#e9d5ff' : '#dbeafe'};color:${s.tipo === 'TRAD' ? '#6b21a8' : '#1d4ed8'}">${s.tipo}</span>
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; padding: 5mm 15mm; background: white; }
  h1 { font-size: 14pt; font-weight: bold; margin: 0 0 4px 0; }
  p { font-size: 9pt; color: #666; margin: 0 0 16px 0; }
  table { width: 100%; border-collapse: collapse; }
  th { font-size: 7pt; text-transform: uppercase; color: #666; border-bottom: 1pt solid #ccc; padding: 2pt 4pt; text-align: left; }
  td { font-size: 8pt; color: #333; }
</style>
</head>
<body>
<div style="border-bottom:1pt solid #ccc;padding-bottom:8px;margin-bottom:8px">
  <h1>Quini 6 — Histórico 2DA-TRAD</h1>
  <p>${sorteos.length} sorteos</p>
</div>
<table>
  <thead><tr><th>NUM</th><th>FECHA</th><th>N1</th><th>N2</th><th>N3</th><th>N4</th><th>N5</th><th>N6</th><th>SORTEO</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
</body>
</html>`;
}

export async function GET() {
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: await chromium.executablePath(),
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-web-security', ...await chromium.args],
    });

    const page = await browser.newPage();
    const rows = await getSorteos2da();
    const sorteos = rows.map((s, i) => ({ ...s, num: rows.length - i }));
    const html = buildHtml(sorteos);

    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: false,
      margin: { top: '8mm', bottom: '8mm', left: '0mm', right: '0mm' },
      printBackground: true,
    });

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="quini6-2da-historico.pdf"',
      },
    });
  } catch (err) {
    console.error('PDF error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}