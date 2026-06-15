import axios from 'axios';
import { createMutex } from './mutex';
import { StorageAdapter } from './storage';
import { TokenManager, SingleTokenConfig, Tokens } from '../client/types';

const decodeJwt = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = payload.replace(/-/g, '+').replace(/_/g, '/');
    let output = '';
    str = str.replace(/=+$/, '');
    for (
      let bc = 0, bs = 0, buffer, i = 0;
      (buffer = str.charAt(i++));
      ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0
    ) {
      buffer = chars.indexOf(buffer);
    }

    const jsonPayload = decodeURIComponent(
      output
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const createSingleTokenManager = (
  config: SingleTokenConfig,
  storage: StorageAdapter,
  baseURL: string,
): TokenManager => {
  const mutex = createMutex();
  const ACCESS_KEY = 'single_access_token';
  const REFRESH_KEY = 'single_refresh_token';

  const isExpiring = (token: string): boolean => {
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return true;
    const buffer = config.proactiveRefreshSeconds ?? 60;
    const nowSecs = Math.floor(Date.now() / 1000);
    return decoded.exp - nowSecs < buffer;
  };

  const getAccessToken = async (): Promise<string | null> => {
    let token = await storage.getItem(ACCESS_KEY);
    if (token && isExpiring(token)) {
      try {
        token = await refreshToken();
      } catch {
        return null;
      }
    }
    return token;
  };

  const getRefreshToken = async (): Promise<string | null> => {
    return storage.getItem(REFRESH_KEY);
  };

  const setTokens = async (tokens: Tokens): Promise<void> => {
    await storage.setItem(ACCESS_KEY, tokens.accessToken);
    await storage.setItem(REFRESH_KEY, tokens.refreshToken);
  };

  const clearTokens = async (): Promise<void> => {
    await storage.removeItem(ACCESS_KEY);
    await storage.removeItem(REFRESH_KEY);
  };

  const canRefresh = (): boolean => {
    return !!config.refreshURL;
  };

  const handleAuthFailure = (): void => {
    clearTokens().then(() => {
      config.onAuthFailure();
    });
  };

  const refreshToken = async (): Promise<string | null> => {
    return mutex.runExclusive(async () => {
      const currentToken = await storage.getItem(ACCESS_KEY);
      if (currentToken && !isExpiring(currentToken)) {
        return currentToken;
      }

      const refresh = await storage.getItem(REFRESH_KEY);
      if (!refresh) {
        handleAuthFailure();
        throw new Error('No refresh token available');
      }

      try {
        const response = await axios.post(
          `${baseURL}${config.refreshURL}`,
          { refreshToken: refresh },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        const data = response.data;
        const newTokens: Tokens = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || refresh,
        };

        await setTokens(newTokens);
        config.onTokenRefreshed(newTokens);
        return newTokens.accessToken;
      } catch (err) {
        handleAuthFailure();
        throw err;
      }
    });
  };

  return {
    baseURL,
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    refreshToken,
    canRefresh,
    handleAuthFailure,
  };
};
