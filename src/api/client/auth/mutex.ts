export type Mutex = {
  runExclusive: <T>(callback: () => Promise<T>) => Promise<T>;
};

export const createMutex = (): Mutex => {
  let lastPromise = Promise.resolve();

  const runExclusive = <T>(callback: () => Promise<T>): Promise<T> => {
    const nextPromise = lastPromise.then(
      async () => {
        return callback();
      },
      async () => {
        return callback();
      },
    );
    // Ensure lastPromise updates and catches all failures so the chain doesn't break
    lastPromise = nextPromise.then(
      () => {},
      () => {},
    );
    return nextPromise;
  };

  return {
    runExclusive,
  };
};
