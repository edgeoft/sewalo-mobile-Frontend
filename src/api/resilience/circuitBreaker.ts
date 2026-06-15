import { Interceptor, CircuitBreakerConfig, CircuitState, TelemetryHooks } from '../client/types';

const getHost = (url: string): string => {
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'localhost';
    }
    return url.split('/')[2] || 'unknown';
  } catch {
    return 'unknown';
  }
};

export const createCircuitBreaker = (config: CircuitBreakerConfig, telemetry?: TelemetryHooks) => {
  const states = new Map<
    string,
    {
      state: CircuitState;
      failures: number;
      successes: number;
      lastStateChange: number;
    }
  >();

  const getOrInitState = (host: string) => {
    let state = states.get(host);
    if (!state) {
      state = {
        state: 'CLOSED',
        failures: 0,
        successes: 0,
        lastStateChange: Date.now(),
      };
      states.set(host, state);
    }
    return state;
  };

  const execute = async <T>(host: string, action: () => Promise<T>): Promise<T> => {
    const breaker = getOrInitState(host);
    const now = Date.now();

    if (breaker.state === 'OPEN') {
      if (now - breaker.lastStateChange >= (config.recoveryWindowMs ?? 30000)) {
        breaker.state = 'HALF_OPEN';
        breaker.successes = 0;
        breaker.failures = 0;
        breaker.lastStateChange = now;

        config.onStateChange?.(host, 'HALF_OPEN');
        telemetry?.onCircuitStateChange?.(host, 'HALF_OPEN');
      } else {
        throw new Error(`Circuit breaker is OPEN for host: ${host}`);
      }
    }

    try {
      const result = await action();

      if (breaker.state === 'HALF_OPEN') {
        breaker.successes++;
        if (breaker.successes >= (config.successThreshold ?? 2)) {
          breaker.state = 'CLOSED';
          breaker.failures = 0;
          breaker.successes = 0;
          breaker.lastStateChange = Date.now();

          config.onStateChange?.(host, 'CLOSED');
          telemetry?.onCircuitStateChange?.(host, 'CLOSED');
        }
      } else if (breaker.state === 'CLOSED') {
        breaker.failures = 0;
      }

      return result;
    } catch (error) {
      if (breaker.state === 'CLOSED') {
        breaker.failures++;
        if (breaker.failures >= (config.failureThreshold ?? 5)) {
          breaker.state = 'OPEN';
          breaker.lastStateChange = Date.now();

          config.onStateChange?.(host, 'OPEN');
          telemetry?.onCircuitStateChange?.(host, 'OPEN');
        }
      } else if (breaker.state === 'HALF_OPEN') {
        breaker.state = 'OPEN';
        breaker.lastStateChange = Date.now();

        config.onStateChange?.(host, 'OPEN');
        telemetry?.onCircuitStateChange?.(host, 'OPEN');
      }
      throw error;
    }
  };

  return { execute, getOrInitState };
};

export const circuitBreakerInterceptor = (breaker: ReturnType<typeof createCircuitBreaker>): Interceptor => {
  return async (ctx, next) => {
    const host = getHost(ctx.url);
    return breaker.execute(host, () => next(ctx));
  };
};
