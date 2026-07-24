import { scrapeTipo } from './lib/scraper';
import { getIdsExistentes, upsertSorteos, registrarSync, recalcularNums, getTotalSorteos, getLastDate } from './lib/db';
import { Sorteo } from './lib/types';


async function syncGroup(types: string[]) {
  console.log(`Starting sync for ${types.join(', ')}`);
  const existentes = await getIdsExistentes();
  const nuevos: Sorteo[] = [];
  
  for (const type of types) {
    const lastDate = await getLastDate(type as any);
    console.log(`Last date for ${type}: ${lastDate}`);
    const raw = await scrapeTipo(type as any, lastDate ?? undefined);
    const filtered = raw.filter(s => s.id && !existentes.has(s.id));
    console.log(`Found ${filtered.length} new for ${type}`);
    nuevos.push(...(filtered as Sorteo[]));
    await new Promise(r => setTimeout(r, 1000));
  }
  
  if (nuevos.length > 0) {
    console.log(`Upserting ${nuevos.length} draws...`);
    await upsertSorteos(nuevos);
    console.log(`Recalculating nums...`);
    await recalcularNums();
  }
  
  const total = await getTotalSorteos();
  await registrarSync(nuevos.length, total);
  console.log(`Sync completed for ${types.join(', ')}. Added ${nuevos.length}, Total: ${total}`);
}

async function main() {
  await syncGroup(['SALE', 'REV']);
  await syncGroup(['TRAD', '2DA']);
}

main().catch(console.error);
