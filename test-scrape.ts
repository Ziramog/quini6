import { scrapeTipo } from './lib/scraper';

async function main() {
  const [TRAD, SALE, REV, SEG] = await Promise.all([
    scrapeTipo('TRAD'),
    scrapeTipo('SALE'),
    scrapeTipo('REV'),
    scrapeTipo('2DA'),
  ]);

  console.log('TRAD:', TRAD.length, TRAD.slice(0,2).map(s=>s.id));
  console.log('SALE:', SALE.length, SALE.slice(0,2).map(s=>s.id));
  console.log('REV:', REV.length, REV.slice(0,2).map(s=>s.id));
  console.log('2DA:', SEG.length, SEG.slice(0,2).map(s=>s.id));

  const tradIds = new Set(TRAD.map(s=>s.id));
  const overlap = SEG.filter(s=>tradIds.has(s.id));
  console.log('2DA/-TRAD overlap:', overlap.length);

  const saleIds = new Set(SALE.map(s=>s.id));
  const saleOverlap = SEG.filter(s=>saleIds.has(s.id));
  console.log('2DA/SALE overlap:', saleOverlap.length);
}

main().catch(console.error);