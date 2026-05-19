export type Tab = 'historico' | 'estadistico' | 'historico2da';

export type TipoSorteo = 'SALE' | 'REV' | 'TRAD';

export interface Sorteo {
  id: string;
  num: number;
  fecha: string;
  fecha_display: string;
  n1: number;
  n2: number;
  n3: number;
  n4: number;
  n5: number;
  n6: number;
  tipo: TipoSorteo;
}

export function numerosArray(s: Sorteo): number[] {
  return [s.n1, s.n2, s.n3, s.n4, s.n5, s.n6];
}

export interface UltimaSync {
  ejecutado_en: string;
  nuevos: number;
  total: number;
}