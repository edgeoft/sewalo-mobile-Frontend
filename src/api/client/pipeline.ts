import { Interceptor, Adapter, RequestCtx, ResponseCtx } from './types';

export const compose = (interceptors: Interceptor[], adapter: Adapter): Adapter => {
  return (initialCtx: RequestCtx): Promise<ResponseCtx> => {
    const activeDispatches = new Set<number>();

    const dispatch = (i: number, ctx: RequestCtx): Promise<ResponseCtx> => {
      if (activeDispatches.has(i)) {
        return Promise.reject(new Error('next() called concurrently multiple times'));
      }
      activeDispatches.add(i);

      const fn = i === interceptors.length ? adapter : interceptors[i];
      try {
        return Promise.resolve(fn(ctx, (nextCtx) => dispatch(i + 1, nextCtx))).finally(() => {
          activeDispatches.delete(i);
        });
      } catch (err) {
        activeDispatches.delete(i);
        return Promise.reject(err);
      }
    };
    return dispatch(0, initialCtx);
  };
};
