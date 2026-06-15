import { RequestCtx, ResponseCtx, CacheConfig } from '../client/types';

export const createCacheStore = (config: CacheConfig) => {
  const store = new Map<string, { response: ResponseCtx; expiresAt: number }>();
  const maxEntries = config.maxEntries ?? 100;
  const ttl = config.ttl;

  const getCacheKey =
    config.keyStrategy ??
    ((req: RequestCtx) => {
      const sortedParams = req.params
        ? JSON.stringify(
            Object.keys(req.params)
              .sort()
              .reduce((acc: any, key) => {
                acc[key] = req.params[key];
                return acc;
              }, {}),
          )
        : '';
      return `${req.method}:${req.url}:${sortedParams}`;
    });

  const get = (req: RequestCtx): ResponseCtx | null => {
    const key = getCacheKey(req);
    const entry = store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }

    // Refresh LRU order: delete and re-insert
    store.delete(key);
    store.set(key, entry);

    return entry.response;
  };

  const set = (req: RequestCtx, response: ResponseCtx): void => {
    const key = getCacheKey(req);
    const itemTtl = req.cache?.ttl ?? ttl;

    if (store.size >= maxEntries && !store.has(key)) {
      // Evict oldest entry (the first one in insertion order)
      const oldestKey = store.keys().next().value;
      if (oldestKey !== undefined) {
        store.delete(oldestKey);
      }
    }

    store.set(key, {
      response,
      expiresAt: Date.now() + itemTtl,
    });
  };

  const invalidate = (key: string): void => {
    store.delete(key);
  };

  const invalidateAll = (): void => {
    store.clear();
  };

  return {
    get,
    set,
    invalidate,
    invalidateAll,
    getCacheKey,
    store,
  };
};
