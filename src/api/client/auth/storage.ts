import * as SecureStore from 'expo-secure-store';

export type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export const createFallbackStorageAdapter = (): StorageAdapter => {
  const memoryStore = new Map<string, string>();
  let useMemory = false;

  return {
    getItem: async (key) => {
      if (useMemory) {
        return memoryStore.get(key) ?? null;
      }
      try {
        return await SecureStore.getItemAsync(key);
      } catch (err) {
        console.warn('SecureStore.getItemAsync failed, falling back to memory store', err);
        useMemory = true;
        return memoryStore.get(key) ?? null;
      }
    },
    setItem: async (key, value) => {
      if (useMemory) {
        memoryStore.set(key, value);
        return;
      }
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (err) {
        console.warn('SecureStore.setItemAsync failed, falling back to memory store', err);
        useMemory = true;
        memoryStore.set(key, value);
      }
    },
    removeItem: async (key) => {
      if (useMemory) {
        memoryStore.delete(key);
        return;
      }
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (err) {
        console.warn('SecureStore.deleteItemAsync failed, falling back to memory store', err);
        useMemory = true;
        memoryStore.delete(key);
      }
    },
  };
};

export const secureStorageAdapter = createFallbackStorageAdapter();
