export type Mutex = {
  acquire: () => Promise<() => void>;
  runExclusive: <T>(callback: () => Promise<T>) => Promise<T>;
  isLocked: () => boolean;
};

export const createMutex = (): Mutex => {
  let locked = false;
  const queue: ((release: () => void) => void)[] = [];

  const acquire = (): Promise<() => void> => {
    return new Promise((resolve) => {
      const release = () => {
        if (queue.length > 0) {
          const nextResolve = queue.shift();
          if (nextResolve) {
            nextResolve(release);
          }
        } else {
          locked = false;
        }
      };

      if (locked) {
        queue.push(resolve);
      } else {
        locked = true;
        resolve(release);
      }
    });
  };

  const runExclusive = async <T>(callback: () => Promise<T>): Promise<T> => {
    const release = await acquire();
    try {
      return await callback();
    } finally {
      release();
    }
  };

  const isLocked = () => locked;

  return {
    acquire,
    runExclusive,
    isLocked,
  };
};
