import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslate } from '@refinedev/core';
import { Alert, Button, Select, Space, Table, Tag, Typography, theme } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import {
  commercialResourceFromType,
  commercialTransactionShowPath,
  downloadCustomerCurrentAccountStatementPdf,
  getCustomerCurrentAccountMovementsUrl,
  getCustomerCurrentAccountsUrl,
} from '../../shared/timci/commercialTransactionsApi.js';
import { timciFetch } from '../../shared/timci/http.js';
import { formatTimciMoney } from '../../shared/timci/formatMoney.js';
import { formatTimciUserDateOnly } from '../../shared/timci/formatUserDateTime.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import {
  commercialStatusTagColor,
  commercialStatusTitleKey,
} from '../commercial-transactions/statusLabel.js';
import { SalePaymentSettlementTag } from '../commercial-transactions/SalePaymentSettlementTag.js';
import { UnallocatedRemainderTag } from '../commercial-transactions/UnallocatedRemainderTag.js';
import { useCustomerAccountCurrencyParam } from './useCustomerAccountCurrencyParam.js';
import { useEntitySupportedCurrencySelect } from '../../shared/timci/useEntitySupportedCurrencySelect.js';
import { useTimciNotify } from '../../shared/timci/notifyTimci.js';

type CurrentAccountRow = {
  id: string;
  currencyId: string;
  balance: string;
};

type MovementIssuedDocument = {
  id: string;
  documentKind: string;
  number: string;
  status: string;
};

type MovementRow = {
  id: string;
  entityTxnNumber?: number | null;
  type: string;
  status: string;
  transactionDate: string;
  amount: string;
  openAmount?: string | null;
  unallocatedAmount?: string | null;
  concept?: string | null;
  runningBalance: string;
  registeredAt: string | null;
  reversesTransactionId?: string | null;
  issuedDocument?: MovementIssuedDocument | null;
};

function documentShowPath(id: string): string {
  return `/documents/show/${encodeURIComponent(id)}`;
}

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

/** Ledger nominal: saldo y movimientos de cuenta corriente. */
export function CustomerCurrentAccountTab({ customerId }: Props) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const notify = useTimciNotify();
  const { token } = theme.useToken();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const [accounts, setAccounts] = useState<CurrentAccountRow[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [currencyId, setCurrencyId] = useCustomerAccountCurrencyParam();
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
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
  const movementsEnabled = Boolean(tenantId && customerId && currencyId);

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
    if (!movementsEnabled || !tenantId || !customerId || !currencyId) return;
    let cancelled = false;
    void (async () => {
      setMovementsLoading(true);
      try {
        const { json } = await timciFetch(
          getCustomerCurrentAccountMovementsUrl(tenantId, customerId, currencyId),
        );
        if (cancelled) return;
        setMovements(Array.isArray(json) ? (json as MovementRow[]) : []);
      } catch {
        if (!cancelled) {
          setLoadError(translate('pages.customers.currentAccountMovementsError'));
          setMovements([]);
        }
      } finally {
        if (!cancelled) setMovementsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [movementsEnabled, currencyId, customerId, tenantId, translate]);

  const openMovementShow = useCallback(
    (row: MovementRow) => {
      const resource = commercialResourceFromType(row.type);
      if (!resource) return;
      navigate(commercialTransactionShowPath(resource, row.id));
    },
    [navigate],
  );

  const downloadStatementPdf = useCallback(async () => {
    if (!tenantId || !customerId || !currencyId) return;
    setDownloadLoading(true);
    try {
      const ok = await downloadCustomerCurrentAccountStatementPdf(
        tenantId,
        customerId,
        currencyId,
      );
      if (!ok) {
        notify.error(translate('pages.customers.currentAccountDownloadPdfError'));
      }
    } catch {
      notify.error(translate('pages.customers.currentAccountDownloadPdfError'));
    } finally {
      setDownloadLoading(false);
    }
  }, [currencyId, customerId, notify, tenantId, translate]);

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
        <Space wrap style={{ width: '100%', marginTop: 8 }} align="start">
          <Select
            style={{ width: '100%', maxWidth: 480, minWidth: 240 }}
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
          <Button
            icon={<DownloadOutlined />}
            onClick={() => void downloadStatementPdf()}
            loading={downloadLoading}
            disabled={!currencyId || downloadLoading}
            aria-label={translate('pages.customers.currentAccountDownloadPdfAria')}
          >
            {translate('pages.customers.currentAccountDownloadPdf')}
          </Button>
        </Space>
      </div>

      <Table
        size="middle"
        loading={movementsLoading}
        rowKey="id"
        dataSource={movementsEnabled ? movements : []}
        pagination={{ pageSize: 25, showSizeChanger: true }}
        locale={{ emptyText: translate('list.emptyData') }}
        scroll={{ x: 'max-content' }}
        onRow={(row) => ({
          onClick: () => openMovementShow(row),
          style: { cursor: 'pointer' },
        })}
        columns={[
          {
            title: translate('pages.commercialTransactions.fields.entityTxnNumber'),
            dataIndex: 'entityTxnNumber',
            width: 72,
            render: (v: unknown, row: MovementRow) => {
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
            title: translate('pages.customers.currentAccountType'),
            dataIndex: 'type',
            render: (v: string, row: MovementRow) => {
              let typeLabel = v || '—';
              if (v === 'sale') typeLabel = translate('pages.commercialTransactions.type.sale');
              else if (v === 'debit') typeLabel = translate('pages.commercialTransactions.type.debit');
              else if (v === 'credit') typeLabel = translate('pages.commercialTransactions.type.credit');
              else if (v === 'collection') {
                typeLabel = translate('pages.commercialTransactions.type.collection');
              }

              if (v === 'sale') {
                return (
                  <span>
                    {typeLabel}{' '}
                    {row.status !== 'voided' ? (
                      <SalePaymentSettlementTag
                        type="sale"
                        status={row.status}
                        openAmount={row.openAmount}
                        translate={translate}
                      />
                    ) : null}
                  </span>
                );
              }

              if (
                (v === 'collection' || v === 'credit') &&
                row.status !== 'voided' &&
                !row.reversesTransactionId
              ) {
                return (
                  <span>
                    {typeLabel}{' '}
                    <UnallocatedRemainderTag
                      type={v}
                      unallocatedAmount={row.unallocatedAmount}
                      translate={translate}
                    />
                  </span>
                );
              }

              return typeLabel;
            },
          },
          {
            title: translate('table.commercialTransactions.concept'),
            dataIndex: 'concept',
            ellipsis: true,
            render: (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : '—'),
          },
          {
            title: translate('pages.customers.currentAccountDocument'),
            key: 'issuedDocument',
            ellipsis: true,
            render: (_: unknown, row: MovementRow) => {
              const doc = row.issuedDocument;
              if (!doc?.id || !doc.number) return '—';
              const kindLabel = translate(
                `documents.kinds.${doc.documentKind}`,
                doc.documentKind,
              );
              const label = `${kindLabel} # ${doc.number}`;
              return (
                <Link
                  to={documentShowPath(doc.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={label}
                >
                  {label}
                </Link>
              );
            },
          },
          {
            title: translate('table.commercialTransactions.status'),
            dataIndex: 'status',
            render: (v: string) => (
              <Tag color={commercialStatusTagColor(v)}>{translate(commercialStatusTitleKey(v))}</Tag>
            ),
          },
          {
            title: translate('table.commercialTransactions.amount'),
            dataIndex: 'amount',
            render: (v: unknown) => formatTimciMoney(v),
          },
          {
            title: translate('pages.customers.currentAccountRunningBalance'),
            dataIndex: 'runningBalance',
            render: (v: unknown) => <BalanceAmount value={v} colors={balanceColors} />,
          },
        ]}
      />
    </Space>
  );
}
