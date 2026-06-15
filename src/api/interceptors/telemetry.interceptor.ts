import { Interceptor, TelemetryHooks } from '../client/types';

export const telemetryInterceptor = (telemetry?: TelemetryHooks): Interceptor => {
  return async (ctx, next) => {
    if (telemetry?.onRequest) {
      try {
        telemetry.onRequest(ctx);
      } catch (err) {
        console.warn('Telemetry onRequest callback failed', err);
      }
    }

    const start = Date.now();
    try {
      const response = await next(ctx);
      const durationMs = Date.now() - start;

      const responseWithTiming = {
        ...response,
        durationMs,
      };

      if (telemetry?.onResponse) {
        try {
          telemetry.onResponse(responseWithTiming);
        } catch (err) {
          console.warn('Telemetry onResponse callback failed', err);
        }
      }

      return responseWithTiming;
    } catch (error: any) {
      const durationMs = Date.now() - start;
      const updatedError = {
        ...error,
        durationMs,
      };

      if (telemetry?.onError) {
        try {
          telemetry.onError(updatedError, ctx);
        } catch (err) {
          console.warn('Telemetry onError callback failed', err);
        }
      }

      throw updatedError;
    }
  };
};
