import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

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
