import { describe, expect, it } from 'vitest';
import {
  salePaymentSettlement,
  salePaymentSettlementLabel,
  salePaymentSettlementTagColor,
  salePaymentSettlementTitleKey,
} from './salePaymentSettlement.js';

describe('salePaymentSettlement', () => {
  it('returns null unless type sale (or omitted) and status registered', () => {
    expect(salePaymentSettlement({ type: 'debit', status: 'registered', openAmount: 0 })).toBeNull();
    expect(salePaymentSettlement({ type: 'sale', status: 'draft', openAmount: 0 })).toBeNull();
    expect(salePaymentSettlement({ type: 'sale', status: 'registered', openAmount: null })).toBeNull();
  });

  it('maps openAmount to paid/unpaid', () => {
    expect(salePaymentSettlement({ type: 'sale', status: 'registered', openAmount: 0 })).toBe('paid');
    expect(salePaymentSettlement({ type: 'sale', status: 'registered', openAmount: '0.00' })).toBe(
      'paid',
    );
    expect(salePaymentSettlement({ status: 'registered', openAmount: 10 })).toBe('unpaid');
  });
});

describe('salePaymentSettlement helpers', () => {
  it('title key and tag color', () => {
    expect(salePaymentSettlementTitleKey('paid')).toContain('paid');
    expect(salePaymentSettlementTitleKey('unpaid')).toContain('unpaid');
    expect(salePaymentSettlementTagColor('paid')).toBe('success');
    expect(salePaymentSettlementTagColor('unpaid')).toBe('warning');
  });

  it('label appends pending money for unpaid', () => {
    const translate = (key: string) => (key.includes('unpaid') ? 'Impaga' : 'Pagada');
    expect(salePaymentSettlementLabel('paid', 0, translate)).toBe('Pagada');
    expect(salePaymentSettlementLabel('unpaid', 12.5, translate)).toBe('Impaga · 12.50');
  });
});
