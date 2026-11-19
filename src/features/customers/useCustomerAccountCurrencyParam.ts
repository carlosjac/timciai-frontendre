import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Currency to show when the URL has none. The customer's default wins when that
 * account exists. A single account is the fallback. An explicit choice is kept.
 */
export function preferredAccountCurrency(
  accounts: readonly { currencyId: string }[],
  defaultCurrencyId: string | null | undefined,
  current: string | undefined,
): string | undefined {
  if (current) return current;
  const preferred = defaultCurrencyId?.trim();
  if (preferred && accounts.some((account) => account.currencyId === preferred)) return preferred;
  if (accounts.length === 1) return accounts[0]?.currencyId;
  return undefined;
}

/**
 * Persists customer CC / settlement / allocations currency in the URL so browser back
 * restores the selected currency.
 */
export function useCustomerAccountCurrencyParam(): [
  string | undefined,
  (currencyId: string | undefined) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams();
  const currencyId = searchParams.get('currencyId') ?? undefined;

  const setCurrencyId = useCallback(
    (id: string | undefined) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id) next.set('currencyId', id);
          else next.delete('currencyId');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return useMemo(() => [currencyId, setCurrencyId], [currencyId, setCurrencyId]);
}
