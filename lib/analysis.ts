import { Sorteo, numerosArray } from './types';

export interface EstadisticaNumero {
  numero: number;
  frecuencia: number;
  frecSALE: number;
  frecREV: number;
  ultimaVez: string;
  ausencia: number;
  puntaje: number;
  cicloMedio: number;
  maxGap: number;
  ratio: number;
  estado: 'CALIENTE' | 'NORMAL' | 'ATRASADO' | 'VENCIDO';
}

export interface AnalisisCompleto {
  stats: EstadisticaNumero[];
  paridadDist: number[];
  consecutivosDist: number[];
  sumaDist: { rango: string; desde: number; hasta: number; count: number; pct: number }[];
 decenasDist: { decena: string; color: string; count: number; pct: number; avgPorSorteo: number }[];
  paresFrecuentes: { par: [number, number]; veces: number }[];
  tripletasFrecuentes: { tripla: [number, number, number]; veces: number }[];
  sesgoSaleRev: { numero: number; salePct: number; revPct: number; delta: number }[];
  repeticionDiaria: { compartidos: number; count: number; pct: number }[];
  tendenciaVentana: { numero: number; ultimos30: number; media30: number; delta: number }[];
  allSorteos: Sorteo[];
}

export interface ConfigTarjeta {
  modo: 'SALE' | 'REV' | 'AMBOS';
  incluirVencidos: boolean;
  respetoDecenas: boolean;
  filtroParidad: [number, number];
  filtroSuma: [number, number];
  penalizarConsecutivos: boolean;
}

export interface TarjetaGenerada {
  numeros: number[];
  suma: number;
  pares: number;
  consecutivos: number;
  vencidosIncluidos: number[];
  decenasUsadas: number[];
  confianza: number;
}

// ── Basic stats ─────────────────────────────────────────────────────────────

export function calcularEstadisticas(sorteos: Sorteo[]): EstadisticaNumero[] {
  const stats: EstadisticaNumero[] = Array.from({ length: 47 }, (_, i) => ({
    numero: i, frecuencia: 0, frecSALE: 0, frecREV: 0,
    ultimaVez: '', ausencia: sorteos.length, puntaje: 0,
    cicloMedio: 0, maxGap: 0, ratio: 0, estado: 'NORMAL',
  }));

  // Track appearances per number for gap calculation
  const appearances: number[][] = Array.from({ length: 47 }, () => []);

  sorteos.forEach((s, idx) => {
    numerosArray(s).forEach(n => {
      if (n < 0 || n > 46) return;
      stats[n].frecuencia++;
      if (s.tipo === 'SALE') stats[n].frecSALE++; else stats[n].frecREV++;
      if (!stats[n].ultimaVez) {
        stats[n].ultimaVez = s.fecha;
        stats[n].ausencia = idx;
      }
      appearances[n].push(idx);
    });
  });

  // Calculate ciclo medio and max gap
  const totalSorteos = sorteos.length;
  stats.forEach((s, n) => {
    const apps = appearances[n].sort((a, b) => a - b);
    if (apps.length > 1) {
      const gaps = apps.slice(1).map((app, i) => app - apps[i]);
      s.cicloMedio = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      s.maxGap = Math.max(...gaps);
    } else if (apps.length === 1) {
      s.cicloMedio = totalSorteos;
      s.maxGap = totalSorteos;
    }
    // Ratio
    if (s.cicloMedio > 0) {
      s.ratio = s.ausencia / s.cicloMedio;
    } else {
      s.ratio = s.frecuencia === 0 ? 999 : 0;
    }
    // Estado
    if (s.ausencia === 0) s.estado = 'CALIENTE';
    else if (s.ratio >= 1.5) s.estado = 'VENCIDO';
    else if (s.ratio >= 1.0) s.estado = 'ATRASADO';
    else s.estado = 'NORMAL';
  });

  const maxFrec = Math.max(...stats.map(s => s.frecuencia), 1);
  const maxAus = Math.max(...stats.map(s => s.ausencia), 1);

  stats.forEach(s => {
    s.puntaje = (s.frecuencia / maxFrec) * 0.4 + (s.ausencia / maxAus) * 0.6;
  });

  return stats;
}

// ── Paridad ─────────────────────────────────────────────────────────────────

export function calcularParidad(sorteos: Sorteo[]): number[] {
  const dist = new Array(7).fill(0);
  sorteos.forEach(s => {
    const nums = numerosArray(s);
    const pares = nums.filter(n => n % 2 === 0).length;
    dist[pares]++;
  });
  return dist;
}

// ── Consecutivos ────────────────────────────────────────────────────────────

export function calcularConsecutivos(sorteos: Sorteo[]): number[] {
  const dist = new Array(4).fill(0); // 0,1,2,3+
  sorteos.forEach(s => {
    const nums = numerosArray(s).sort((a, b) => a - b);
    let consec = 0;
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] - nums[i - 1] === 1) consec++;
    }
    const idx = consec >= 3 ? 3 : consec;
    dist[idx]++;
  });
  return dist;
}

// ── Suma ────────────────────────────────────────────────────────────────────

export function calcularSuma(sorteos: Sorteo[]): { rango: string; desde: number; hasta: number; count: number; pct: number }[] {
  const buckets = [
    { rango: '0-90', desde: 0, hasta: 90, count: 0 },
    { rango: '91-110', desde: 91, hasta: 110, count: 0 },
    { rango: '111-130', desde: 111, hasta: 130, count: 0 },
    { rango: '131-150', desde: 131, hasta: 150, count: 0 },
    { rango: '151-180', desde: 151, hasta: 180, count: 0 },
    { rango: '181+', desde: 181, hasta: 999, count: 0 },
  ];
  sorteos.forEach(s => {
    const sum = numerosArray(s).reduce((a, b) => a + b, 0);
    const bucket = buckets.find(b => sum >= b.desde && sum <= b.hasta);
    if (bucket) bucket.count++;
  });
  const total = sorteos.length;
  return buckets.map(b => ({ ...b, pct: Math.round((b.count / total) * 100) }));
}

// ── Decenas ─────────────────────────────────────────────────────────────────

export function calcularDecenas(sorteos: Sorteo[]): { decena: string; color: string; count: number; pct: number; avgPorSorteo: number }[] {
  const groups = [
    { decena: '0-9', min: 0, max: 9, color: '#006100' },
    { decena: '10-19', min: 10, max: 19, color: '#9C6500' },
    { decena: '20-29', min: 20, max: 29, color: '#9C0006' },
    { decena: '30-39', min: 30, max: 39, color: '#0070C0' },
    { decena: '40-46', min: 40, max: 46, color: '#1a1a1a' },
  ];
  const counts = new Array(5).fill(0);
  sorteos.forEach(s => {
    numerosArray(s).forEach(n => {
      for (let i = 0; i < groups.length; i++) {
        if (n >= groups[i].min && n <= groups[i].max) {
          counts[i]++;
          break;
        }
      }
    });
  });
  const total = counts.reduce((a, b) => a + b, 0);
  return groups.map((g, i) => ({
    ...g,
    count: counts[i],
    pct: Math.round((counts[i] / total) * 100),
    avgPorSorteo: parseFloat((counts[i] / sorteos.length).toFixed(2)),
  }));
}

// ── Pares frecuentes ─────────────────────────────────────────────────────────

export function calcularParesFrecuentes(sorteos: Sorteo[]): { par: [number, number]; veces: number }[] {
  const map = new Map<string, number>();
  sorteos.forEach(s => {
    const nums = numerosArray(s).sort((a, b) => a - b);
    for (let i = 0; i < nums.length - 1; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const key = `${nums[i]}-${nums[j]}`;
        map.set(key, (map.get(key) || 0) + 1);
      }
    }
  });
  return Array.from(map.entries())
    .map(([k, v]) => { const [a, b] = k.split('-').map(Number); return { par: [a, b] as [number, number], veces: v }; })
    .sort((a, b) => b.veces - a.veces)
    .slice(0, 30);
}

// ── Tripletas frecuentes ───────────────────────────────────────────────────

export function calcularTripletasFrecuentes(sorteos: Sorteo[]): { tripla: [number, number, number]; veces: number }[] {
  const map = new Map<string, number>();
  sorteos.forEach(s => {
    const nums = numerosArray(s).sort((a, b) => a - b);
    for (let i = 0; i < nums.length - 2; i++) {
      for (let j = i + 1; j < nums.length - 1; j++) {
        for (let k = j + 1; k < nums.length; k++) {
          const key = `${nums[i]}-${nums[j]}-${nums[k]}`;
          map.set(key, (map.get(key) || 0) + 1);
        }
      }
    }
  });
  return Array.from(map.entries())
    .map(([k, v]) => { const [a, b, c] = k.split('-').map(Number); return { tripla: [a, b, c] as [number, number, number], veces: v }; })
    .sort((a, b) => b.veces - a.veces)
    .slice(0, 20);
}

// ── Sesgo SALE/REV ──────────────────────────────────────────────────────────

export function calcularSesgoSaleRev(sorteos: Sorteo[]): { numero: number; salePct: number; revPct: number; delta: number }[] {
  const saleCount = new Array(47).fill(0);
  const revCount = new Array(47).fill(0);
  let saleTotal = 0, revTotal = 0;
  sorteos.forEach(s => {
    const nums = numerosArray(s);
    if (s.tipo === 'SALE') {
      saleTotal++;
      nums.forEach(n => saleCount[n]++);
    } else {
      revTotal++;
      nums.forEach(n => revCount[n]++);
    }
  });
  return Array.from({ length: 47 }, (_, i) => ({
    numero: i,
    salePct: saleTotal > 0 ? Math.round((saleCount[i] / saleTotal) * 100) : 0,
    revPct: revTotal > 0 ? Math.round((revCount[i] / revTotal) * 100) : 0,
    delta: 0,
  })).map(s => ({ ...s, delta: s.salePct - s.revPct }));
}

// ── Repetición diaria ───────────────────────────────────────────────────────

export function calcularRepeticionDiaria(sorteos: Sorteo[]): { compartidos: number; count: number; pct: number }[] {
  const map = new Map<number, number>();
  const porFecha: Record<string, Sorteo[]> = {};
  sorteos.forEach(s => {
    if (!porFecha[s.fecha]) porFecha[s.fecha] = [];
    porFecha[s.fecha].push(s);
  });
  Object.values(porFecha).forEach(grupo => {
    const sale = grupo.find(s => s.tipo === 'SALE');
    const rev = grupo.find(s => s.tipo === 'REV');
    if (sale && rev) {
      const saleNums = new Set(numerosArray(sale));
      const revNums = new Set(numerosArray(rev));
      const shared = Array.from(saleNums).filter(n => revNums.has(n)).length;
      map.set(shared, (map.get(shared) || 0) + 1);
    }
  });
  const dist = new Map([[0,0],[1,0],[2,0],[3,0]]);
  map.forEach((v, k) => dist.set(k, v));
  const total = Array.from(dist.values()).reduce((a, b) => a + b, 0);
  return Array.from(dist.entries()).map(([k, v]) => ({ compartidos: k, count: v, pct: Math.round((v / total) * 100) }));
}

// ── Tendencia ventana ───────────────────────────────────────────────────────

export function calcularTendencias(sorteos: Sorteo[], ventana = 30): { numero: number; ultimos30: number; media30: number; delta: number }[] {
  const recientes = sorteos.slice(0, ventana);
  const totalHist = sorteos.length;
  const freqRecientes = new Array(47).fill(0);
  recientes.forEach(s => numerosArray(s).forEach(n => freqRecientes[n]++));
  const freqHistorica = new Array(47).fill(0);
  sorteos.forEach(s => numerosArray(s).forEach(n => freqRecientes[n]++));
  return Array.from({ length: 47 }, (_, i) => ({
    numero: i,
    ultimos30: freqRecientes[i],
    media30: parseFloat(((freqRecientes[i] / totalHist) * ventana).toFixed(1)),
    delta: 0,
  })).map(s => ({ ...s, delta: s.ultimos30 - s.media30 }));
}

// ── Advanced card generator ─────────────────────────────────────────────────

export function generarTarjetaAvanzada(
  stats: EstadisticaNumero[],
  config: ConfigTarjeta = {
    modo: 'AMBOS', incluirVencidos: true, respetoDecenas: true,
    filtroParidad: [2, 4], filtroSuma: [111, 180], penalizarConsecutivos: true,
  }
): TarjetaGenerada {
  const { filtroParidad, filtroSuma, penalizarConsecutivos, incluirVencidos, respetoDecenas, modo } = config;

  // Score compuesto
  const scores = stats.map(s => {
    let peso = s.puntaje;
    // Sesgo SALE/REV
    if (modo === 'SALE') peso += s.frecSALE * 0.01;
    if (modo === 'REV') peso += s.frecREV * 0.01;
    // Priorizar vencidos
    if (incluirVencidos && s.estado === 'VENCIDO') peso *= 1.5;
    if (s.estado === 'ATRASADO') peso *= 1.2;
    // Calentar (reciente)
    if (s.ausencia === 0) peso *= 0.5; // no repetir el último
    return { numero: s.numero, score: peso };
  });

  const elegir = (): number => {
    const total = scores.reduce((a, s) => a + s.score, 0);
    let r = Math.random() * total;
    for (const s of scores) {
      r -= s.score;
      if (r <= 0) return s.numero;
    }
    return scores[0].numero;
  };

  const elegida: number[] = [];
  const agregados = new Set<number>();

  if (respetoDecenas) {
    // Al menos 1 de cada decena 0-9, 10-19, 20-29, 30-39
    const decenasGroups = [
      stats.filter(s => s.numero <= 9),
      stats.filter(s => s.numero >= 10 && s.numero <= 19),
      stats.filter(s => s.numero >= 20 && s.numero <= 29),
      stats.filter(s => s.numero >= 30 && s.numero <= 39),
    ];
    for (const grupo of decenasGroups) {
      if (!grupo.length) continue;
      const total = grupo.reduce((a, s) => a + s.puntaje, 0);
      let r = Math.random() * total;
      for (const s of grupo) {
        r -= s.puntaje;
        if (r <= 0) { agregados.add(s.numero); break; }
      }
    }
  }

  // Llenar hasta 6
  while (elegida.length < 6) {
    const pool = scores.filter(s => !agregados.has(s.numero));
    if (!pool.length) break;
    const n = elegir();
    if (!agregados.has(n)) {
      agregados.add(n);
      elegida.push(n);
    }
  }

  const numeros = elegida.sort((a, b) => a - b);
  const suma = numeros.reduce((a, b) => a + b, 0);
  const pares = numeros.filter(n => n % 2 === 0).length;

  // Count consecutive
  let consecutivos = 0;
  for (let i = 1; i < numeros.length; i++) {
    if (numeros[i] - numeros[i - 1] === 1) consecutivos++;
  }

  // Vencidos incluidos
  const vencidosIncluidos = numeros.filter(n => {
    const s = stats[n];
    return s.estado === 'VENCIDO' || s.estado === 'ATRASADO';
  });

  // Decenas usadas
  const decenasUsadas = Array.from(new Set(numeros.map(n => Math.floor(n / 10))));

  // Confianza simple
  let confianza = 50;
  if (pares >= filtroParidad[0] && pares <= filtroParidad[1]) confianza += 15;
  if (suma >= filtroSuma[0] && suma <= filtroSuma[1]) confianza += 15;
  if (consecutivos === 0) confianza += 10;
  if (consecutivos === 1) confianza += 5;
  if (vencidosIncluidos.length >= 2) confianza += 10;
  confianza = Math.min(100, confianza);

  return { numeros, suma, pares, consecutivos, vencidosIncluidos, decenasUsadas, confianza };
}

// ── Original basic generator ────────────────────────────────────────────────

export function generarTarjeta(stats: EstadisticaNumero[]): number[] {
  const decenas = [
    stats.filter(s => s.numero <= 9),
    stats.filter(s => s.numero >= 10 && s.numero <= 19),
    stats.filter(s => s.numero >= 20 && s.numero <= 29),
    stats.filter(s => s.numero >= 30 && s.numero <= 39),
    stats.filter(s => s.numero >= 40),
  ];

  const elegidos = new Set<number>();

  for (const grupo of decenas) {
    if (!grupo.length) continue;
    const total = grupo.reduce((a, s) => a + s.puntaje + 0.01, 0);
    let r = Math.random() * total;
    for (const s of grupo) {
      r -= (s.puntaje + 0.01);
      if (r <= 0) { elegidos.add(s.numero); break; }
    }
  }

  for (const s of [...stats].sort((a, b) => b.puntaje - a.puntaje)) {
    if (elegidos.size >= 6) break;
    elegidos.add(s.numero);
  }

  return Array.from(elegidos).sort((a, b) => a - b);
}

// ── Colors ─────────────────────────────────────────────────────────────────

export function colorPorNumero(n: number): string {
  if (n <= 9)  return '#006100';
  if (n <= 19) return '#9C6500';
  if (n <= 29) return '#9C0006';
  if (n <= 39) return '#0070C0';
  return '#1a1a1a';
}

export function colorFondoNumero(n: number): string {
  if (n <= 9)  return '#A5D6A7';
  if (n <= 19) return '#FFCC80';
  if (n <= 29) return '#EF9A9A';
  if (n <= 39) return '#90CAF9';
  return '#E0E0E0';
}