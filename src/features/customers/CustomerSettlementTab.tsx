import { useEffect, useMemo, useState } from 'react';
import { useTranslate } from '@refinedev/core';
import { Alert, DatePicker, Select, Space, Table, Typography, theme } from 'antd';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { antdDatePickerLocaleEs } from '../../shared/timci/antdPickerLocaleEs.js';
import {
  commercialResourceFromType,
  commercialTransactionShowPath,
  getCustomerCurrentAccountSettlementUrl,
  getCustomerCurrentAccountsUrl,
  type CurrentAccountSettlementDto,
} from '../../shared/timci/commercialTransactionsApi.js';
import { timciFetch } from '../../shared/timci/http.js';
import { formatTimciMoney } from '../../shared/timci/formatMoney.js';
import { formatTimciUserDateOnly } from '../../shared/timci/formatUserDateTime.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { useCustomerAccountCurrencyParam } from './useCustomerAccountCurrencyParam.js';
import { useEntitySupportedCurrencySelect } from '../../shared/timci/useEntitySupportedCurrencySelect.js';

type CurrentAccountRow = {
  id: string;
  currencyId: string;
  balance: string;
};

type Props = {
  customerId: string;
};

/** Deudor (saldo > 0) rojo; acreedor (saldo ≤ 0) verde. */
function balanceColor(value: unknown, colors: { debtor: string; creditor: string }): string {
  const n =
    typeof value === 'number'
      ? value
      : Number(String(value ?? '').trim().replace(',', '.'));
  if (!Number.isFinite(n)) return colors.creditor;
  return n > 0 ? colors.debtor : colors.creditor;
}

function BalanceAmount({
  value,
  colors,
}: {
  value: unknown;
  colors: { debtor: string; creditor: string };
}) {
  return (
    <Typography.Text style={{ color: balanceColor(value, colors), fontWeight: 600 }}>
      {formatTimciMoney(value)}
    </Typography.Text>
  );
}

/**
 * Proyección «A pagar al [fecha]» (recargos/descuentos as-of). No muta el ledger.
 */
export function CustomerSettlementTab({ customerId }: Props) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const [accounts, setAccounts] = useState<CurrentAccountRow[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [currencyId, setCurrencyId] = useCustomerAccountCurrencyParam();
  const [settlementAsOf, setSettlementAsOf] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [settlement, setSettlement] = useState<CurrentAccountSettlementDto | null>(null);
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const balanceColors = useMemo(
    () => ({
      debtor: token.colorError,
      creditor: token.colorSuccess,
    }),
    [token.colorError, token.colorSuccess],
  );

  const { labelById: currencyLabelById } = useEntitySupportedCurrencySelect(tenantId);

  const accountsEnabled = Boolean(tenantId && customerId);
  const settlementEnabled = Boolean(tenantId && customerId && currencyId && settlementAsOf);

  useEffect(() => {
    if (!accountsEnabled || !tenantId || !customerId) return;
    let cancelled = false;
    void (async () => {
      setAccountsLoading(true);
      setLoadError(null);
      try {
        const { json } = await timciFetch(getCustomerCurrentAccountsUrl(tenantId, customerId));
        if (cancelled) return;
        const rows = Array.isArray(json) ? (json as CurrentAccountRow[]) : [];
        setAccounts(rows);
        if (rows.length === 1 && !currencyId) setCurrencyId(rows[0].currencyId);
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
  }, [accountsEnabled, currencyId, customerId, setCurrencyId, tenantId, translate]);

  useEffect(() => {
    if (!settlementEnabled || !tenantId || !customerId || !currencyId || !settlementAsOf) return;
    let cancelled = false;
    void (async () => {
      setSettlementLoading(true);
      setLoadError(null);
      try {
        const { json } = await timciFetch(
          getCustomerCurrentAccountSettlementUrl(tenantId, customerId, currencyId, settlementAsOf),
        );
        if (cancelled) return;
        setSettlement(json as CurrentAccountSettlementDto);
      } catch {
        if (!cancelled) {
          setSettlement(null);
          setLoadError(translate('pages.customers.currentAccountSettlementLoadError'));
        }
      } finally {
        if (!cancelled) setSettlementLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [settlementEnabled, currencyId, customerId, settlementAsOf, tenantId, translate]);

  if (!tenantId) {
    return <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />;
  }

  if (loadError) {
    return <Alert type="error" showIcon message={loadError} />;
  }

  const accountOptions = accounts.map((a) => ({
    value: a.currencyId,
    label: (
      <span>
        {currencyLabelById.get(a.currencyId) ?? a.currencyId}
        {' · '}
        {translate('pages.customers.currentAccountBalance')}:{' '}
        <BalanceAmount value={a.balance} colors={balanceColors} />
      </span>
    ),
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
          optionLabelProp="label"
        />
      </div>

      <div>
        <Space wrap align="center" style={{ marginBottom: 8 }}>
          <Typography.Text strong>
            {translate('pages.customers.currentAccountSettlementTitle')}
          </Typography.Text>
          <DatePicker
            value={settlementAsOf ? dayjs(settlementAsOf) : null}
            onChange={(v) =>
              setSettlementAsOf(v ? v.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'))
            }
            format={dateFormat}
            locale={antdDatePickerLocaleEs}
            allowClear={false}
            aria-label={translate('pages.customers.currentAccountSettlementTitle')}
          />
        </Space>
        {settlement ? (
          <Space wrap size="large" style={{ marginBottom: 12 }}>
            <Typography.Text>
              {translate('pages.customers.currentAccountSettlementOpen')}:{' '}
              <BalanceAmount value={settlement.totalOpen} colors={balanceColors} />
            </Typography.Text>
            <Typography.Text>
              {translate('pages.customers.currentAccountSettlementAdjustment')}:{' '}
              {formatTimciMoney(settlement.totalAdjustment)}
            </Typography.Text>
            <Typography.Text>
              {translate('pages.customers.currentAccountSettlementTotal')}:{' '}
              <BalanceAmount value={settlement.totalToSettle} colors={balanceColors} />
            </Typography.Text>
          </Space>
        ) : null}
        <Table
          size="middle"
          loading={settlementLoading}
          rowKey="id"
          dataSource={settlement?.lines ?? []}
          pagination={false}
          locale={{
            emptyText: !currencyId
              ? translate('pages.customers.currentAccountCurrencyPlaceholder')
              : translate('pages.customers.currentAccountSettlementEmpty'),
          }}
          scroll={{ x: 'max-content' }}
          onRow={(row) => ({
            onClick: () => {
              const resource = commercialResourceFromType(row.type);
              if (resource) navigate(commercialTransactionShowPath(resource, row.id));
            },
            style: { cursor: 'pointer' },
          })}
          columns={[
            {
              title: translate('pages.commercialTransactions.fields.entityTxnNumber'),
              dataIndex: 'entityTxnNumber',
              width: 72,
              render: (v: unknown, row) => {
                const label = v != null && v !== '' ? String(v) : '—';
                const resource = commercialResourceFromType(row.type);
                if (!resource || label === '—') return label;
                return (
                  <Link
                    to={commercialTransactionShowPath(resource, row.id)}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {label}
                  </Link>
                );
              },
            },
            {
              title: translate('table.commercialTransactions.transactionDate'),
              dataIndex: 'transactionDate',
              render: (v: unknown) => formatTimciUserDateOnly(v, { dateFormat, timeZone }),
            },
            {
              title: translate('pages.commercialTransactions.fields.dueDate'),
              dataIndex: 'dueDate',
              render: (v: unknown) =>
                v ? formatTimciUserDateOnly(v, { dateFormat, timeZone }) : '—',
            },
            {
              title: translate('pages.customers.currentAccountType'),
              dataIndex: 'type',
              render: (v: string) => {
                if (v === 'sale') return translate('pages.commercialTransactions.type.sale');
                if (v === 'debit') return translate('pages.commercialTransactions.type.debit');
                return v;
              },
            },
            {
              title: translate('table.commercialTransactions.concept'),
              dataIndex: 'concept',
              ellipsis: true,
              render: (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : '—'),
            },
            {
              title: translate('pages.customers.currentAccountSettlementOpen'),
              dataIndex: 'openAmount',
              align: 'right' as const,
              render: (v: unknown) => formatTimciMoney(v),
            },
            {
              title: translate('pages.customers.currentAccountSettlementAdjustment'),
              dataIndex: 'adjustmentAmount',
              align: 'right' as const,
              render: (v: unknown) => formatTimciMoney(v),
            },
            {
              title: translate('pages.customers.currentAccountSettlementDue'),
              dataIndex: 'settlementAmount',
              align: 'right' as const,
              render: (v: unknown) => formatTimciMoney(v),
            },
          ]}
        />
      </div>
    </Space>
  );
}
