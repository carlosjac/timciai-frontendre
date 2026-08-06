import type { ReactNode } from 'react';
import { TimciCanAccessRoute } from './TimciCanAccessRoute.js';

/** Convenience wrapper for Refine `<Route element={...} />`. */
export function timciGuarded(resource: string, action: string, element: ReactNode): ReactNode {
  return (
    <TimciCanAccessRoute resource={resource} action={action}>
      {element}
    </TimciCanAccessRoute>
  );
}
