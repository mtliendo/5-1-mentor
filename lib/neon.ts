/**
 * Neon / serverless SQL hook.
 * Callers should treat an empty result as "not persisted yet".
 */
export function isNeonConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function queryStub<T = unknown>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (!isNeonConfigured()) {
    return [];
  }
  // TODO: const sqlClient = neon(process.env.DATABASE_URL!)
  // return sqlClient(sql, params)
  void sql;
  void params;
  return [];
}
