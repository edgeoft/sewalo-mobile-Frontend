import { Interceptor } from '../client/types';

export const createDeduplicator = () => {
  const inFlight = new Map<string, Promise<any>>();

  const getHash = (url: string, params?: any): string => {
    const sortedParams = params
      ? JSON.stringify(
          Object.keys(params)
            .sort()
            .reduce((acc: any, key) => {
              acc[key] = params[key];
              return acc;
            }, {}),
        )
      : '';
    return `${url}:${sortedParams}`;
  };

  const execute = async <T>(url: string, params: any, action: () => Promise<T>): Promise<T> => {
    const key = getHash(url, params);
    let promise = inFlight.get(key);

    if (!promise) {
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
    return deduplicator.execute(ctx.url, ctx.params, () => next(ctx));
  };
};
