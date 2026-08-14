import { describe, expect, it } from 'vitest';
import { esMessages } from '../../i18n/locale.es.js';

describe('customerSettlementAllocations i18n', () => {
  it('M-8.1: pages.customers.currentAccountSettlementEmpty', () => {
    expect(esMessages.pages.customers.currentAccountSettlementEmpty).toBe(
      'No hay saldos abiertos para liquidar en esta fecha.',
    );
  });

  it('M-8.5: pages.customers.allocationsEmpty', () => {
    expect(esMessages.pages.customers.allocationsEmpty).toBe(
      'No hay imputaciones registradas para esta moneda.',
    );
  });
});
