import * as SecureStore from 'expo-secure-store';

export type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export const secureStorageAdapter: StorageAdapter = {
  getItem: async (key) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      // safe fallback/log in non-production environments
      console.warn(`SecureStore failed to set item for key: ${key}`, err);
    }
  },
  removeItem: async (key) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (err) {
      console.warn(`SecureStore failed to remove item for key: ${key}`, err);
    }
  },
};

export const createMemoryStorageAdapter = (): StorageAdapter => {
  const store = new Map<string, string>();
  return {
    getItem: async (key) => store.get(key) ?? null,
    setItem: async (key, value) => {
      store.set(key, value);
    },
    removeItem: async (key) => {
      store.delete(key);
    },
  };
};
