import { Show } from '@refinedev/antd';
import { useShow, useTranslate } from '@refinedev/core';
import { Descriptions, Table } from 'antd';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type RateRow = {
  currencyCode: string;
  rate: string;
};

type RateSnapshotRecord = {
  id?: string;
  provider?: string;
  providerBaseCode?: string;
  asOf?: string;
  fetchedAt?: string;
  rates?: RateRow[];
};

export function RateSnapshotShow() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { query } = useShow<RateSnapshotRecord>({ resource: 'rateSnapshots' });
  const record = query?.data?.data;
  const isLoading = query?.isLoading ?? false;

  return (
    <Show
      title={translate('pages.rateSnapshots.showTitle')}
      isLoading={isLoading}
      canEdit={false}
      canDelete={false}
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label={translate('table.rateSnapshots.provider')}>
          {record?.provider ?? '—'}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.rateSnapshots.providerBaseCode')}>
          {record?.providerBaseCode ?? '—'}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.rateSnapshots.asOf')}>
          {formatTimciUserDateTime(record?.asOf, { dateFormat, timeZone })}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.rateSnapshots.fetchedAt')}>
          {formatTimciUserDateTime(record?.fetchedAt, { dateFormat, timeZone })}
        </Descriptions.Item>
      </Descriptions>

      <Table
        style={{ marginTop: 24 }}
        size="small"
        rowKey="currencyCode"
        pagination={{ pageSize: 50, showSizeChanger: true }}
        dataSource={record?.rates ?? []}
        columns={[
          {
            title: translate('table.rateSnapshots.currencyCode'),
            dataIndex: 'currencyCode',
            sorter: (a, b) => a.currencyCode.localeCompare(b.currencyCode),
          },
          {
            title: translate('table.rateSnapshots.rate'),
            dataIndex: 'rate',
          },
        ]}
      />
    </Show>
  );
}
