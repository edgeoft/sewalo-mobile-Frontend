import axios, { isCancel } from 'axios';
import { Adapter, ResponseCtx, createApiError } from './types';

export const axiosAdapter: Adapter = async (reqCtx): Promise<ResponseCtx> => {
  const startTime = Date.now();

  try {
    const response = await axios({
      url: reqCtx.url,
      method: reqCtx.method,
      headers: reqCtx.headers,
      params: reqCtx.params,
      data: reqCtx.data,
      timeout: reqCtx.timeout,
      signal: reqCtx.signal,
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
      data: response.data,
      request: reqCtx,
      durationMs: Date.now() - startTime,
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;

    if (isCancel(error)) {
      throw createApiError('Request cancelled', {
        code: 'CANCELLED',
        request: reqCtx,
      });
    }

    if (error.response) {
      // Server responded with status outside 2xx
      throw createApiError(error.response.data?.message || error.message || 'API Error', {
        status: error.response.status,
        code: error.response.data?.code || 'SERVER_ERROR',
        details: error.response.data,
        request: reqCtx,
        response: {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers as Record<string, string>,
          data: error.response.data,
          request: reqCtx,
          durationMs,
        },
      });
    } else if (error.request) {
      // No response was received
      throw createApiError(error.message || 'Network Error', {
        code: error.code || 'NETWORK_ERROR',
        request: reqCtx,
      });
    } else {
      // Something happened in setting up the request
      throw createApiError(error.message || 'Unknown Error', {
        code: 'UNKNOWN_ERROR',
        request: reqCtx,
      });
    }
  }
};
