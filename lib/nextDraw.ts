import { Sorteo } from '@/lib/types';

export interface NextDraw {
  fecha: string;
  dias: number;
  tipos: string[];
  label: string; // e.g. "Miércoles 20 may"
  esHoy: boolean;
}

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function formatoMes(d: Date) {
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

export function calcularProximoSorteo(sorteos: Sorteo[]): NextDraw | null {
  if (!sorteos || sorteos.length === 0) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Get unique draw dates sorted descending (most recent first)
  const fechasUnicas = Array.from(new Set(sorteos.map(s => s.fecha))).sort().reverse();
  const ultimoFecha = fechasUnicas[0];
  if (!ultimoFecha) return null;

  const ultimoDiaSemana = new Date(ultimoFecha + 'T00:00:00').getDay();

  // Draw days: 0=Sun, 3=Wed
  function siguienteDia(after: Date, diaAlvo: number): Date {
    const d = new Date(after);
    d.setDate(d.getDate() + ((diaAlvo - d.getDay() + 7) % 7 || 7));
    return d;
  }

  // From last draw, find next Wednesday and next Sunday
  const ultimo = new Date(ultimoFecha + 'T00:00:00');
  const proxWed = siguienteDia(ultimo, 3);
  const proxDom = siguienteDia(ultimo, 0);

  // Pick whichever is closer (but not the same day as last draw unless it's today)
  let prox: Date;
  if (proxWed < proxDom) {
    prox = proxWed;
  } else {
    prox = proxDom;
  }

  // If today equals the date we picked, check if we're before or after the draw time
  const esHoy = prox.getTime() === hoy.getTime();

  // Get all tipos for that date from data
  const tiposEnFecha = Array.from(new Set(
    sorteos
      .filter(s => s.fecha === (prox.toISOString().split('T')[0]))
      .map(s => s.tipo)
  ));

  const diasDiff = Math.round((prox.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  const labelDia = DIAS_SEMANA[prox.getDay()];

  return {
    fecha: prox.toISOString().split('T')[0],
    dias: diasDiff,
    tipos: tiposEnFecha,
    label: `${labelDia} ${formatoMes(prox)}`,
    esHoy,
  };
}

export function formatoRelativo(dias: number): string {
  if (dias === 0) return '¡Hoy! 🎱';
  if (dias < 0) return `hace ${Math.abs(dias)} días`;
  if (dias === 1) return '1 día';
  return `${dias} días`;
}