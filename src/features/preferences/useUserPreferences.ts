import { useContext } from 'react';
import { UserPreferencesContext } from './userPreferencesContextBase.js';
import type { UserPreferencesContextValue } from './userPreferencesTypes.js';

export function useUserPreferences(): UserPreferencesContextValue {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return ctx;
}

export type { UserPreferencesContextValue } from './userPreferencesTypes.js';
export type { ThemeMode, UserPreferencesState } from './storage.js';
