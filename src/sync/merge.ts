export interface Timestamped {
  id: string;
  updatedAt: string;
}

/** updatedAt が新しい方を採用してマージする */
export function mergeByUpdatedAt<T extends Timestamped>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of local) map.set(item.id, item);
  for (const item of remote) {
    const existing = map.get(item.id);
    if (!existing || item.updatedAt >= existing.updatedAt) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}
