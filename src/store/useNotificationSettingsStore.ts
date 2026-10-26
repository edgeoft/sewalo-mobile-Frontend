import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { File, Paths } from 'expo-file-system';

const SETTINGS_FILE = 'notification-settings.json';

/** zustand-persist storage backed by expo-file-system (no AsyncStorage dependency needed). */
const fileStorage: StateStorage = {
  getItem: async (name) => {
    try {
      const file = new File(Paths.document, name || SETTINGS_FILE);
      return file.exists ? file.textSync() : null;
    } catch {
      return null;
    }
  },
  setItem: async (name, value) => {
    try {
      const file = new File(Paths.document, name || SETTINGS_FILE);
      // File.create replaces atomically when parent exists; delete stale copy first.
      if (file.exists) file.delete();
      file.create({ overwrite: true });
      file.write(value);
    } catch {
      // persistence is best-effort; settings still work in-memory
    }
  },
  removeItem: async (name) => {
    try {
      const file = new File(Paths.document, name || SETTINGS_FILE);
      if (file.exists) file.delete();
    } catch {
      // ignore
    }
  },
};

export type NotificationSettingKey =
  | 'pushBookings'
  | 'pushOffers'
  | 'pushChat'
  | 'emailWeekly'
  | 'emailReceipts'
  | 'smsStatus'
  | 'soundEnabled'
  | 'vibrateEnabled';

export interface NotificationSettingsState {
  pushBookings: boolean;
  pushOffers: boolean;
  pushChat: boolean;
  emailWeekly: boolean;
  emailReceipts: boolean;
  smsStatus: boolean;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  setToggle: (key: NotificationSettingKey, value: boolean) => void;
}

export const useNotificationSettingsStore = create<NotificationSettingsState>()(
  persist(
    (set) => ({
      pushBookings: true,
      pushOffers: false,
      pushChat: true,
      emailWeekly: true,
      emailReceipts: true,
      smsStatus: false,
      soundEnabled: true,
      vibrateEnabled: true,
      setToggle: (key, value) => set({ [key]: value }),
    }),
    {
      name: SETTINGS_FILE,
      storage: createJSONStorage(() => fileStorage),
    },
  ),
);

export function useNotificationSettings() {
  return useNotificationSettingsStore(
    useShallow((s) => ({
      pushBookings: s.pushBookings,
      pushOffers: s.pushOffers,
      pushChat: s.pushChat,
      emailWeekly: s.emailWeekly,
      emailReceipts: s.emailReceipts,
      smsStatus: s.smsStatus,
      soundEnabled: s.soundEnabled,
      vibrateEnabled: s.vibrateEnabled,
      setToggle: s.setToggle,
    })),
  );
}
