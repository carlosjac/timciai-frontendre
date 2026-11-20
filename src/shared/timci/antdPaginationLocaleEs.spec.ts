import { describe, expect, it } from 'vitest';
import { antdPaginationLocaleEs } from './antdPaginationLocaleEs.js';

describe('antdPaginationLocaleEs', () => {
  it('usa página en el selector de tamaño y en el salto de página', () => {
    expect(antdPaginationLocaleEs.items_per_page).toBe('/ página');
    expect(antdPaginationLocaleEs.page).toBe('Página');
  });
});
