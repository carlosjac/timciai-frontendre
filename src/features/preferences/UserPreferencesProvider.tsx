import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { loadUserPreferences, saveUserPreferences, type UserPreferencesState } from './storage.js';
import { UserPreferencesContext } from './userPreferencesContextBase.js';
import type { UserPreferencesContextValue } from './userPreferencesTypes.js';

function applyTimeZoneDefault(tz: string): void {
  try {
    dayjs.tz.setDefault(tz);
  } catch {
    try {
      dayjs.tz.setDefault('UTC');
    } catch {
      /* ignore */
    }
  }
  // `setDefault` puede dejar el locale de dayjs en inglés; el calendario Ant usa dayjs para fechas.
  dayjs.locale('es');
}

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserPreferencesState>(() => loadUserPreferences());

  const setPreferences = useCallback((patch: Partial<UserPreferencesState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      saveUserPreferences(next);
      return next;
    });
  }, []);

  useEffect(() => {
    applyTimeZoneDefault(state.timeZone);
  }, [state.timeZone]);

  const value = useMemo(
    (): UserPreferencesContextValue => ({ ...state, setPreferences }),
    [state, setPreferences],
  );

  return <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>;
}
