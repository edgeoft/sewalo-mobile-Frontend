import { Interceptor, ApiClientConfig } from '../types';

const redact = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redact);
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const lowKey = key.toLowerCase();
    if (
      lowKey.includes('password') ||
      lowKey.includes('token') ||
      lowKey.includes('authorization') ||
      lowKey.includes('secret') ||
      lowKey.includes('card')
    ) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = redact(val);
    }
  }
  return result;
};

export const loggingInterceptor = (config: ApiClientConfig): Interceptor => {
  const isProd = config.env === 'prod';
  const name = config.name;

  return async (ctx, next) => {
    const start = Date.now();
    const correlationId = ctx.correlationId || 'N/A';

    if (isProd) {
      try {
        return await next(ctx);
      } catch (error: any) {
        console.error(
          `[API-CLIENT][${name}][ERR] [ID: ${correlationId}] ${ctx.method} ${ctx.url} - Code: ${error.code || 'N/A'}, Status: ${error.status || 'N/A'}`,
        );
        throw error;
      }
    }

    const loggedHeaders = ctx.headers;
    const loggedParams = ctx.params;
    const loggedData = ctx.data;

    console.log(`[API-CLIENT][${name}][REQ] [ID: ${correlationId}] ${ctx.method} ${ctx.url}`, {
      headers: loggedHeaders,
      params: loggedParams,
      data: loggedData,
    });

    try {
      const response = await next(ctx);
      const duration = Date.now() - start;
      const loggedResponseData = response.data;

      console.log(
        `[API-CLIENT][${name}][RES] [ID: ${correlationId}] ${ctx.method} ${ctx.url} - Status ${response.status} (${duration}ms)`,
        { data: loggedResponseData },
      );

      return response;
    } catch (error: any) {
      const duration = Date.now() - start;
      const loggedErrorDetails = error.details;

      console.error(
        `[API-CLIENT][${name}][ERR] [ID: ${correlationId}] ${ctx.method} ${ctx.url} - Code: ${error.code || 'N/A'}, Status: ${error.status || 'N/A'} (${duration}ms)`,
        { message: error.message, details: loggedErrorDetails },
      );

      throw error;
    }
  };
};
