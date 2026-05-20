export { supabase, supabaseAdmin } from './supabase';
import { supabase, supabaseAdmin } from './supabase';
import { Sorteo, UltimaSync } from './types';

export async function getSorteos(limit?: number, offset?: number): Promise<Sorteo[]> {
  const query = supabase
    .from('sorteos')
    .select('*')
    .in('tipo', ['SALE', 'REV'])
    .order('fecha', { ascending: false })
    .order('tipo', { ascending: false });
  if (limit != null) query.range(offset ?? 0, (offset ?? 0) + limit - 1);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as Sorteo[];
}

export async function getAllSorteos(): Promise<Sorteo[]> {
  const { data, error } = await supabase
    .from('sorteos')
    .select('*')
    .in('tipo', ['SALE', 'REV'])
    .order('fecha', { ascending: false })
    .order('tipo', { ascending: false });
  if (error) throw new Error(error.message);
  return data as Sorteo[];
}

export async function getTotalSorteos(): Promise<number> {
  const { count, error } = await supabase
    .from('sorteos')
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function getSorteos2da(): Promise<Sorteo[]> {
  const { data, error } = await supabase
    .from('sorteos')
    .select('*')
    .in('tipo', ['TRAD', '2DA'])
    .order('fecha', { ascending: false })
    .order('tipo', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Sorteo[];
}

export async function getUltimaSync(): Promise<UltimaSync | null> {
  const { data, error } = await supabase
    .from('sync_log')
    .select('ejecutado_en, nuevos, total')
    .order('ejecutado_en', { ascending: false })
    .limit(1)
    .single();
  if (error) return null;
  return data as UltimaSync;
}

export async function getIdsExistentes(): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin
    .from('sorteos')
    .select('id');
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((r: { id: string }) => r.id));
}

export async function upsertSorteos(sorteos: Sorteo[]): Promise<void> {
  if (sorteos.length === 0) return;
  const { error } = await supabaseAdmin
    .from('sorteos')
    .upsert(sorteos, { onConflict: 'id', ignoreDuplicates: true });
  if (error) throw new Error(error.message);
}

export async function recalcularNums(): Promise<void> {
  const { error } = await supabaseAdmin.rpc('recalcular_nums');
  if (error) throw new Error(`recalcular_nums: ${error.message}`);
}

export async function registrarSync(nuevos: number, total: number, errorMsg?: string) {
  await supabaseAdmin
    .from('sync_log')
    .insert({ nuevos, total, error: errorMsg ?? null });
}