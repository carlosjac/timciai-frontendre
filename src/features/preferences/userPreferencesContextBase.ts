import { createContext } from 'react';
import type { UserPreferencesContextValue } from './userPreferencesTypes.js';

export const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null);
