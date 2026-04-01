import type { UserPreferencesState } from './storage.js';

export type UserPreferencesContextValue = UserPreferencesState & {
  setPreferences: (patch: Partial<UserPreferencesState>) => void;
};
