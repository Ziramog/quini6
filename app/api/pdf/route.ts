import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { getSorteos } from '@/lib/db';

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

export async function GET() {
  try {
    const rows = await getSorteos();
    const sorteos = rows.map((s, i) => ({ ...s, num: rows.length - i }));

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {});

    // Header
    doc.fontSize(16).font('Helvetica-Bold').text('Quini 6 — Historico de Sorteos', { align: 'center' });
    doc.fontSize(9).font('Helvetica').fillColor('#666')
       .text(`${sorteos.length} sorteos`, { align: 'center' });
    doc.moveDown(1);

    // Table header
    const colWidths = [30, 80, 35, 35, 35, 35, 35, 35, 40];
    const headers = ['NUM', 'FECHA', 'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'SORTEO'];
    let x = 40;
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#666');
    headers.forEach((h, i) => {
      doc.text(h, x, doc.y, { width: colWidths[i], align: i === 0 ? 'right' : 'left' });
      x += colWidths[i];
    });
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(795 - 40, doc.y).strokeColor('#ccc').stroke();
    doc.moveDown(0.3);

    // Rows
    doc.fontSize(8).font('Helvetica');
    sorteos.forEach((s) => {
      if (doc.y > 780) { doc.addPage(); }

      const nums = [s.n1, s.n2, s.n3, s.n4, s.n5, s.n6];

      let y = doc.y;
      x = 40;

      // NUM
      doc.fillColor('#999').text(String(s.num), x, y, { width: colWidths[0], align: 'right' });
      x += colWidths[0];

      // FECHA
      doc.fillColor('#333').text(s.fecha_display || s.fecha, x, y, { width: colWidths[1] });
      x += colWidths[1];

      // Numbers
      nums.forEach((n, ni) => {
        const bg = colorFondoNumero(n);
        const fg = colorPorNumero(n);
        doc.fillColor(bg).rect(x - 2, y - 1, 28, 14).fill();
        doc.fillColor(fg).text(pad(n), x, y, { width: colWidths[ni + 2] });
        x += colWidths[ni + 2];
      });

      // TIPO
      doc.fillColor(s.tipo === 'SALE' ? '#1d4ed8' : '#c2410c')
         .text(s.tipo, x, y, { width: colWidths[8] });

      doc.y = y + 18;
      doc.fillColor('#333');
    });

    doc.end();

    const pdfBuffer = await new Promise<Buffer>(resolve => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    return new Response(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="quini6-historico.pdf"',
      },
    });
  } catch (err) {
    console.error('PDF error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
