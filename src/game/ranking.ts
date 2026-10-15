export interface Entry { name: string; score: number; rank: number; }
export interface Ranking { top: Entry[]; current: Entry; total: number; }
export interface Round { id: string; name: string; }
export async function api<T>(path: string, data: unknown): Promise<T> {
  const response = await fetch(`/api/${path}`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
  const body = await response.json().catch(() => ({ error: "No se pudo conectar con el guardado local." }));
  if (!response.ok) throw new Error(body.error || "No se pudo guardar el resultado.");
  return body;
}
