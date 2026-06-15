import { Interceptor } from '../client/types';
import { createCacheStore } from './cacheStore';

export const cacheInterceptor = (cacheStore: ReturnType<typeof createCacheStore>): Interceptor => {
  return async (ctx, next) => {
    // Only cache GET requests unless bypassed
    if (ctx.method !== 'GET' || ctx.cache?.bypass) {
      return next(ctx);
    }

    const cachedResponse = cacheStore.get(ctx);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await next(ctx);
    cacheStore.set(ctx, response);
    return response;
  };
};

export const createCacheInvalidator = (cacheStore: ReturnType<typeof createCacheStore>) => {
  return {
    invalidate: (key: string) => cacheStore.invalidate(key),
    invalidateAll: () => cacheStore.invalidateAll(),
    invalidatePattern: (pattern: RegExp) => {
      for (const key of cacheStore.store.keys()) {
        if (pattern.test(key)) {
          cacheStore.invalidate(key);
        }
      }
    },
  };
};
