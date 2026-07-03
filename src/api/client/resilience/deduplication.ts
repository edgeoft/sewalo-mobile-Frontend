import { Interceptor } from '../types';
import { createCacheKey } from '../utils/cacheKey';

export const createDeduplicator = () => {
  const inFlight = new Map<string, Promise<any>>();
  const MAX_IN_FLIGHT = 100;

  const execute = async <T>(method: string, url: string, params: any, action: () => Promise<T>): Promise<T> => {
    const key = createCacheKey(method, url, params);
    let promise = inFlight.get(key);

    if (!promise) {
      if (inFlight.size >= MAX_IN_FLIGHT) {
        const oldestKey = inFlight.keys().next().value;
        if (oldestKey !== undefined) {
          inFlight.delete(oldestKey);
        }
      }

      promise = action().finally(() => {
        inFlight.delete(key);
      });
      inFlight.set(key, promise);
    }

    return promise;
  };

  return { execute, inFlight };
};

export const deduplicationInterceptor = (deduplicator: ReturnType<typeof createDeduplicator>): Interceptor => {
  return async (ctx, next) => {
    if (ctx.method !== 'GET') {
      return next(ctx);
    }
    return deduplicator.execute(ctx.method, ctx.url, ctx.params, () => next(ctx));
  };
};
