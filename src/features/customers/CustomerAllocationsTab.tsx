import { useCallback, useEffect, useState } from 'react';
import { useTranslate } from '@refinedev/core';
import { Alert, Button, Select, Space, Table, Typography } from 'antd';
import { useNavigate } from 'react-router';
import { antdPaginationLocaleEs } from '../../shared/timci/antdPaginationLocaleEs.js';
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
import {
  preferredAccountCurrency,
  useCustomerAccountCurrencyParam,
} from './useCustomerAccountCurrencyParam.js';
import { useEntitySupportedCurrencySelect } from '../../shared/timci/useEntitySupportedCurrencySelect.js';

type CurrentAccountRow = {
  id: string;
  currencyId: string;
  balance: string;
};

type Props = {
  customerId: string;
  defaultCurrencyId?: string | null;
};

/** Tabla de enlaces de imputación origen → destino por moneda de CC (solo lectura). */
export function CustomerAllocationsTab({ customerId, defaultCurrencyId }: Props) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;

  const [accounts, setAccounts] = useState<CurrentAccountRow[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [currencyId, setCurrencyId] = useCustomerAccountCurrencyParam();
  const [rows, setRows] = useState<CurrentAccountAllocationLinkDto[]>([]);
  const [rowsTotal, setRowsTotal] = useState(0);
  const [rowsPage, setRowsPage] = useState(1);
  const [rowsPageSize, setRowsPageSize] = useState(25);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { labelById: currencyLabelById } = useEntitySupportedCurrencySelect(tenantId);

  const accountsEnabled = Boolean(tenantId && customerId);
  const rowsEnabled = Boolean(tenantId && customerId && currencyId);

  useEffect(() => {
    if (!accountsEnabled || !tenantId || !customerId) return;
    let cancelled = false;
    void (async () => {
      setAccountsLoading(true);
      setLoadError(null);
      try {
        const { json } = await timciFetch(getCustomerCurrentAccountsUrl(tenantId, customerId));
        if (cancelled) return;
        const list = Array.isArray(json) ? (json as CurrentAccountRow[]) : [];
        setAccounts(list);
        const nextCurrency = preferredAccountCurrency(list, defaultCurrencyId, currencyId);
        if (nextCurrency && nextCurrency !== currencyId) setCurrencyId(nextCurrency);
      } catch {
        if (!cancelled) {
          setLoadError(translate('pages.customers.currentAccountLoadError'));
          setAccounts([]);
        }
      } finally {
        if (!cancelled) setAccountsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accountsEnabled, currencyId, customerId, defaultCurrencyId, setCurrencyId, tenantId, translate]);

  useEffect(() => {
    if (!rowsEnabled || !tenantId || !customerId || !currencyId) return;
    let cancelled = false;
    void (async () => {
      setRowsLoading(true);
      try {
        const start = (rowsPage - 1) * rowsPageSize;
        const { json } = await timciFetch(
          getCustomerCurrentAccountAllocationsUrl(tenantId, customerId, currencyId, [
            start,
            start + rowsPageSize - 1,
          ]),
        );
        if (cancelled) return;
        const page = json as { data?: CurrentAccountAllocationLinkDto[]; total?: number };
        setRows(Array.isArray(page.data) ? page.data : []);
        setRowsTotal(typeof page.total === 'number' ? page.total : 0);
      } catch {
        if (!cancelled) {
          setLoadError(translate('pages.customers.allocationsLoadError'));
          setRows([]);
          setRowsTotal(0);
        }
      } finally {
        if (!cancelled) setRowsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rowsEnabled, currencyId, customerId, rowsPage, rowsPageSize, tenantId, translate]);

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
          onChange={(value) => {
            setCurrencyId(value);
            setRowsPage(1);
          }}
          placeholder={translate('pages.customers.currentAccountCurrencyPlaceholder')}
          aria-label={translate('pages.customers.currentAccountCurrency')}
          notFoundContent={
            accountsLoading ? null : translate('pages.customers.currentAccountEmpty')
          }
        />
      </div>

      <Table
        size="middle"
        loading={rowsEnabled && rowsLoading}
        rowKey={(r) => `${r.source.id}-${r.target.id}-${r.amount}`}
        dataSource={rowsEnabled ? rows : []}
        pagination={{
          current: rowsPage,
          pageSize: rowsPageSize,
          total: rowsTotal,
          showSizeChanger: true,
          pageSizeOptions: [10, 25, 50, 100],
          locale: antdPaginationLocaleEs,
          onChange: (page, pageSize) => {
            setRowsPage(page);
            setRowsPageSize(pageSize);
          },
        }}
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
