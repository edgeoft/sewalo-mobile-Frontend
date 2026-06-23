import { Interceptor, RetryConfig, TelemetryHooks } from '../types';

export const retryInterceptor = (retryConfig: RetryConfig, telemetry?: TelemetryHooks): Interceptor => {
  return async (ctx, next) => {
    let attempt = 0;
    const maxAttempts = retryConfig.maxAttempts ?? 3;
    const baseDelay = retryConfig.baseDelayMs ?? 500;
    const maxDelay = retryConfig.maxDelayMs ?? 30000;
    const jitter = retryConfig.jitter ?? true;
    const retryableStatuses = retryConfig.retryableStatuses ?? [408, 429, 500, 502, 503, 504];

    while (true) {
      try {
        return await next({ ...ctx, retryAttempt: attempt });
      } catch (err: any) {
        attempt++;
        if (attempt >= maxAttempts) {
          throw err;
        }

        const status = err.status || err.response?.status;
        const isRetryable =
          retryableStatuses.includes(status) ||
          (retryConfig.shouldRetry && retryConfig.shouldRetry(err)) ||
          err.code === 'ECONNABORTED' ||
          err.message === 'Network Error';

        if (!isRetryable) {
          throw err;
        }

        let delay = baseDelay * Math.pow(2, attempt - 1);
        if (jitter) {
          delay = Math.random() * delay;
        }
        delay = Math.min(delay, maxDelay);

        if (telemetry?.onRetry) {
          try {
            telemetry.onRetry(attempt, ctx);
          } catch (telemetryErr) {
            console.warn('Telemetry onRetry callback failed', telemetryErr);
          }
        }

        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(resolve, delay);
          if (ctx.signal) {
            ctx.signal.addEventListener('abort', () => {
              clearTimeout(timeoutId);
              reject(new Error('Request aborted during retry delay'));
            });
          }
        });
      }
    }
  };
};
