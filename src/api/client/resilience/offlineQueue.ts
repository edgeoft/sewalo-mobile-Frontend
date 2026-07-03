import { RequestCtx, ResponseCtx } from '../types';

type QueuedRequest = {
  ctx: RequestCtx;
  resolve: (value: ResponseCtx) => void;
  reject: (err: any) => void;
};

export const createOfflineQueue = (clientRequest: (ctx: RequestCtx) => Promise<ResponseCtx>) => {
  let queue: QueuedRequest[] = [];
  let isOnline = true;
  let isFlushing = false;

  const enqueue = (ctx: RequestCtx): Promise<ResponseCtx> => {
    return new Promise((resolve, reject) => {
      queue.push({ ctx, resolve, reject });
    });
  };

  const flush = async (): Promise<void> => {
    if (isFlushing || queue.length === 0) return;
    isFlushing = true;

    const currentQueue = [...queue];
    queue = [];

    try {
      for (let i = 0; i < currentQueue.length; i++) {
        const req = currentQueue[i];
        try {
          const response = await clientRequest(req.ctx);
          req.resolve(response);
        } catch (err: any) {
          const isNetworkError = err.message === 'Network Error' || err.code === 'ECONNABORTED';
          if (isNetworkError && !isOnline) {
            // Re-enqueue this request and the remaining unprocessed ones
            queue = [...currentQueue.slice(i), ...queue];
            break;
          } else {
            req.reject(err);
          }
        }
      }
    } finally {
      isFlushing = false;
    }
  };

  const setOnline = (online: boolean): void => {
    const wasOffline = !isOnline;
    isOnline = online;
    if (isOnline && wasOffline) {
      flush();
    }
  };

  return {
    enqueue,
    flush,
    setOnline,
    getQueue: () => queue.map((q) => q.ctx),
    isOnline: () => isOnline,
  };
};
