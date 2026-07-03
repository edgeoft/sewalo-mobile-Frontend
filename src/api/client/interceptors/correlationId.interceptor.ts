import { Interceptor } from '../types';

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  let d = Date.now();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = ((d + r) % 16) | 0;
      d = Math.floor(d / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export const correlationIdInterceptor: Interceptor = async (ctx, next) => {
  const correlationId =
    ctx.correlationId || ctx.headers?.['X-Correlation-ID'] || ctx.headers?.['x-correlation-id'] || generateUUID();

  const updatedCtx = {
    ...ctx,
    correlationId,
    headers: {
      ...ctx.headers,
      'X-Correlation-ID': correlationId,
    },
  };

  return next(updatedCtx);
};
