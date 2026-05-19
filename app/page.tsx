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

  const stats = calcularEstadisticas(allSorteos);

  return (
    <DashboardShell
      sorteos={sorteos}
      allSorteos={allSorteos}
      stats={stats}
      total={total}
      ultimaSync={ultimaSync}
    />
  );
}