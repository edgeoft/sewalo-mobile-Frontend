import { RequestCtx } from '../types';

export const createCacheKey = (method: string, url: string, params?: any): string => {
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
  return `${method.toUpperCase()}:${url}:${sortedParams}`;
};

export const getRequestCacheKey = (req: RequestCtx): string => {
  return createCacheKey(req.method, req.url, req.params);
};
