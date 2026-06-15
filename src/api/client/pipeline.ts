import { Interceptor, Adapter, RequestCtx, ResponseCtx } from './types';

export const compose = (interceptors: Interceptor[], adapter: Adapter): Adapter => {
  return (initialCtx: RequestCtx): Promise<ResponseCtx> => {
    let index = -1;
    const dispatch = (i: number, ctx: RequestCtx): Promise<ResponseCtx> => {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }
      index = i;
      const fn = i === interceptors.length ? adapter : interceptors[i];
      try {
        return Promise.resolve(fn(ctx, (nextCtx) => dispatch(i + 1, nextCtx)));
      } catch (err) {
        return Promise.reject(err);
      }
    };
    return dispatch(0, initialCtx);
  };
};
