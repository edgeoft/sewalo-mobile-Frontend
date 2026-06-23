import { Interceptor } from '../types';

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
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
