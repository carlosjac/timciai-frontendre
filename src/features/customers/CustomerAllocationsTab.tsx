import { useCallback, useEffect, useMemo, useState } from 'react';
import { useList, useTranslate } from '@refinedev/core';
import { Alert, Button, Select, Space, Table, Typography } from 'antd';
import { useNavigate } from 'react-router';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import {
  commercialResourceFromType,
  commercialTransactionShowPath,
  getCustomerCurrentAccountAllocationsUrl,
  getCustomerCurrentAccountsUrl,
  type CurrentAccountAllocationLinkDto,
} from '../../shared/timci/commercialTransactionsApi.js';
import { timciFetch } from '../../shared/timci/http.js';
import { formatTimciMoney } from '../../shared/timci/formatMoney.js';
import { formatTimciUserDateOnly } from '../../shared/timci/formatUserDateTime.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { useCustomerAccountCurrencyParam } from './useCustomerAccountCurrencyParam.js';

type CurrentAccountRow = {
  id: string;
  currencyId: string;
  balance: string;
};

type Props = {
  customerId: string;
};

/** Tabla de enlaces de imputación origen → destino por moneda de CC (solo lectura). */
export function CustomerAllocationsTab({ customerId }: Props) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;

  const [accounts, setAccounts] = useState<CurrentAccountRow[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [currencyId, setCurrencyId] = useCustomerAccountCurrencyParam();
  const [rows, setRows] = useState<CurrentAccountAllocationLinkDto[]>([]);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { result: currenciesResult } = useList({
    resource: 'currencies',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });

  const currencyLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of currenciesResult.data ?? []) {
      const name = typeof c.name === 'string' ? c.name.trim() : '';
      const code = typeof c.code === 'string' ? c.code.trim() : '';
      map.set(String(c.id), name && code ? `${name} (${code})` : name || code || String(c.id));
    }
    return map;
  }, [currenciesResult.data]);

  useEffect(() => {
    if (!tenantId || !customerId) return;
    let cancelled = false;
    setAccountsLoading(true);
    setLoadError(null);
    void timciFetch(getCustomerCurrentAccountsUrl(tenantId, customerId))
      .then(({ json }) => {
        if (cancelled) return;
        const list = Array.isArray(json) ? (json as CurrentAccountRow[]) : [];
        setAccounts(list);
        if (list.length === 1 && !currencyId) setCurrencyId(list[0].currencyId);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(translate('pages.customers.currentAccountLoadError'));
          setAccounts([]);
        }
      })
      .finally(() => {
        if (!cancelled) setAccountsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currencyId, customerId, setCurrencyId, tenantId, translate]);

  useEffect(() => {
    if (!tenantId || !customerId || !currencyId) {
      setRows([]);
      return;
    }
    let cancelled = false;
    setRowsLoading(true);
    void timciFetch(getCustomerCurrentAccountAllocationsUrl(tenantId, customerId, currencyId))
      .then(({ json }) => {
        if (cancelled) return;
        setRows(Array.isArray(json) ? (json as CurrentAccountAllocationLinkDto[]) : []);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(translate('pages.customers.allocationsLoadError'));
          setRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) setRowsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currencyId, customerId, tenantId, translate]);

  const typeLabel = useCallback(
    (type: string) => {
      if (type === 'debit') return translate('pages.commercialTransactions.type.debit');
      if (type === 'credit') return translate('pages.commercialTransactions.type.credit');
      if (type === 'collection') return translate('pages.commercialTransactions.type.collection');
      return translate('pages.commercialTransactions.type.sale');
    },
    [translate],
  );

  const openTxShow = useCallback(
    (id: string, type: string) => {
      const resource = commercialResourceFromType(type);
      if (!resource) return;
      navigate(commercialTransactionShowPath(resource, id));
    },
    [navigate],
  );

  if (!tenantId) {
    return <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />;
  }

  if (loadError) {
    return <Alert type="error" showIcon message={loadError} />;
  }

  const accountOptions = accounts.map((a) => ({
    value: a.currencyId,
    label: currencyLabelById.get(a.currencyId) ?? a.currencyId,
  }));

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Typography.Text strong>
          {translate('pages.customers.currentAccountCurrency')}
        </Typography.Text>
        <Select
          style={{ width: '100%', maxWidth: 480, display: 'block', marginTop: 8 }}
          loading={accountsLoading}
          options={accountOptions}
          value={currencyId}
          onChange={setCurrencyId}
          placeholder={translate('pages.customers.currentAccountCurrencyPlaceholder')}
          aria-label={translate('pages.customers.currentAccountCurrency')}
          notFoundContent={
            accountsLoading ? null : translate('pages.customers.currentAccountEmpty')
          }
        />
      </div>

      <Table
        size="middle"
        loading={rowsLoading}
        rowKey={(r) => `${r.source.id}-${r.target.id}-${r.amount}`}
        dataSource={rows}
        pagination={{ pageSize: 25, showSizeChanger: true }}
        tableLayout="fixed"
        locale={{ emptyText: translate('pages.customers.allocationsEmpty') }}
        columns={[
          {
            title: translate('pages.customers.allocationsSource'),
            key: 'source',
            width: '42%',
            render: (_: unknown, row: CurrentAccountAllocationLinkDto) => {
              const date = formatTimciUserDateOnly(row.source.transactionDate, {
                dateFormat,
                timeZone,
              });
              const label = `${typeLabel(row.source.type)} #${row.source.entityTxnNumber} - ${date}`;
              const concept = row.source.concept?.trim();
              return (
                <span>
                  <Button
                    type="link"
                    style={{ padding: 0, height: 'auto', whiteSpace: 'normal', textAlign: 'left' }}
                    onClick={() => openTxShow(row.source.id, row.source.type)}
                    aria-label={translate('pages.customers.currentAccountOpen')}
                  >
                    {label}
                  </Button>
                  {concept ? (
                    <Typography.Text type="secondary" style={{ display: 'block' }}>
                      {concept}
                    </Typography.Text>
                  ) : null}
                </span>
              );
            },
          },
          {
            title: translate('pages.customers.allocationsAmount'),
            dataIndex: 'amount',
            align: 'right',
            width: '16%',
            render: (v: unknown) => formatTimciMoney(v),
          },
          {
            title: translate('pages.customers.allocationsTarget'),
            key: 'target',
            width: '42%',
            render: (_: unknown, row: CurrentAccountAllocationLinkDto) => {
              const date = formatTimciUserDateOnly(row.target.transactionDate, {
                dateFormat,
                timeZone,
              });
              const label = `${typeLabel(row.target.type)} #${row.target.entityTxnNumber} - ${date}`;
              const concept = row.target.concept?.trim();
              return (
                <span>
                  <Button
                    type="link"
                    style={{ padding: 0, height: 'auto', whiteSpace: 'normal', textAlign: 'left' }}
                    onClick={() => openTxShow(row.target.id, row.target.type)}
                    aria-label={translate('pages.customers.currentAccountOpen')}
                  >
                    {label}
                  </Button>
                  {concept ? (
                    <Typography.Text type="secondary" style={{ display: 'block' }}>
                      {concept}
                    </Typography.Text>
                  ) : null}
                </span>
              );
            },
          },
        ]}
      />
    </Space>
  );
}
