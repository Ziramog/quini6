import { getSorteos, getAllSorteos, getTotalSorteos, getUltimaSync } from '@/lib/db';
import { calcularEstadisticas } from '@/lib/analysis';
import { DashboardShell } from '@/components/DashboardShell';

export default async function Home() {
  const [sorteos, allSorteos, total, ultimaSync] = await Promise.all([
    getSorteos(),
    getAllSorteos(),
    getTotalSorteos(),
    getUltimaSync(),
  ]);

  // rows are fecha desc (newest first); oldest gets num=rows.length, newest gets num=1
  const sortedSorteos = sorteos.map((s, i) => ({ ...s, num: sorteos.length - i }));
  const stats = calcularEstadisticas(allSorteos);

  return (
    <DashboardShell
      sorteos={sortedSorteos}
      allSorteos={allSorteos}
      stats={stats}
      total={total}
      ultimaSync={ultimaSync}
    />
  );
}