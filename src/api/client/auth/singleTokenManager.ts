import axios from 'axios';
import { createMutex } from './mutex';
import { StorageAdapter } from './storage';
import { TokenManager, SingleTokenConfig, Tokens } from '../types';

export const createSingleTokenManager = (
  config: SingleTokenConfig,
  storage: StorageAdapter,
  baseURL: string,
): TokenManager => {
  const mutex = createMutex();
  const ACCESS_KEY = 'single_access_token';
  const REFRESH_KEY = 'single_refresh_token';

  const getAccessToken = async (): Promise<string | null> => {
    return storage.getItem(ACCESS_KEY);
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

  const handleAuthFailure = (slot?: string): void => {
    clearTokens()
      .catch((err) => {
        console.warn('Failed to clear tokens during auth failure', err);
      })
      .finally(() => {
        config.onAuthFailure?.();
      });
  };

  const refreshToken = async (): Promise<string | null> => {
    return mutex.runExclusive(async () => {
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
        config.onTokenRefreshed?.(newTokens);
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
