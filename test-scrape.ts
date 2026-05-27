import { scrapeTipo } from './lib/scraper';
import { getIdsExistentes } from './lib/db';

const existentes = await getIdsExistentes();
console.log('Existentes:', existentes.size, 'sorteos');

const SALE = await scrapeTipo('SALE');
console.log('SALE scrapeados:', SALE.length);

const REV = await scrapeTipo('REV');
console.log('REV scrapeados:', REV.length);

const todos = [...SALE, ...REV];
const nuevos = todos.filter(s => s.id && !existentes.has(s.id));
console.log('Nuevos para insertar:', nuevos.length);
if (nuevos.length > 0) {
  console.log('Primeros 3:', nuevos.slice(0, 3).map(s => s.id));
} else {
  console.log('Ya tenés todos los sorteos.');
}