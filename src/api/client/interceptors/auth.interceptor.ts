import { Interceptor, TokenManager } from '../types';

const isCrossOrigin = (url: string, baseURL: string): boolean => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }
  try {
    const requestHost = url.split('/')[2];
    const baseHost = baseURL.split('/')[2];
    return requestHost !== baseHost;
  } catch {
    return true;
  }
};

export const authInterceptor = (tokenManager: TokenManager): Interceptor => {
  return async (ctx, next) => {
    // 1. Strip auth headers on cross-origin redirects/requests
    if (isCrossOrigin(ctx.url, tokenManager.baseURL)) {
      const headers = { ...ctx.headers };
      delete headers['Authorization'];
      delete headers['authorization'];
      return next({ ...ctx, headers });
    }

    const slot = ctx.tokenSlot;
    // 2. Fetch current access token (handles proactive expiry check internally)
    let token = await tokenManager.getAccessToken(slot);

    let updatedCtx = ctx;
    if (token) {
      updatedCtx = {
        ...ctx,
        headers: {
          ...ctx.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    }

    try {
      return await next(updatedCtx);
    } catch (error: any) {
      // 3. On 401, attempt token refresh
      if (error.status === 401 && tokenManager.canRefresh(slot)) {
        try {
          const newToken = await tokenManager.refreshToken(slot);
          if (newToken) {
            return await next({
              ...ctx,
              headers: {
                ...ctx.headers,
                Authorization: `Bearer ${newToken}`,
              },
            });
          }
        } catch {
          tokenManager.handleAuthFailure(slot);
          throw error;
        }
      }
      throw error;
    }
  };
};
