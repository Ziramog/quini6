const cheerio = require('cheerio');
fetch('https://loteria.guru/resultados-loteria-argentina/ar-quini-6-segunda-vuelta/resultados-anteriores-quini-6-segunda-vuelta-ar?page=1', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36' }
}).then(r => {
  console.log('Status:', r.status);
  return r.text();
}).then(html => {
  const $ = cheerio.load(html);
  const lines = $('.lg-lottery-older-results .lg-line');
  console.log('Lines found:', lines.length);
  if (lines.length > 0) {
    const first = lines.first();
    console.log('First date:', first.find('.lg-date').text().trim());
    console.log('First numbers:', first.find('.lg-number').text().trim());
  }
}).catch(e => console.error('Error:', e.message));