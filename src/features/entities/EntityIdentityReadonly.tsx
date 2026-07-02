import { Descriptions, Tag } from 'antd';
import { useTranslate } from '@refinedev/core';
import { timciPersonTypeLabel } from '../../shared/timci/personTypeLabel.js';
import type { EntityRecord } from './entity-types.js';

type EntityIdentityReadonlyProps = {
  record: EntityRecord | undefined;
  resolveCountry: (id: string | undefined) => string;
};

function boolTag(translate: (key: string) => string, value: boolean | undefined) {
  return value ? (
    <Tag color="green">{translate('table.entities.yes')}</Tag>
  ) : (
    <Tag color="red">{translate('table.entities.no')}</Tag>
  );
}

export function EntityIdentityReadonly({ record, resolveCountry }: EntityIdentityReadonlyProps) {
  const translate = useTranslate();

  return (
    <Descriptions
      bordered
      column={{ xs: 1, sm: 1, md: 2 }}
      size="middle"
      styles={{ label: { width: 220, maxWidth: 280, verticalAlign: 'top' } }}
      title={translate('pages.entitySettings.identitySection')}
    >
      <Descriptions.Item label={translate('table.entities.name')}>
        {record?.name ?? '—'}
      </Descriptions.Item>
      <Descriptions.Item label={translate('create.entity.country')}>
        {resolveCountry(record?.countryId)}
      </Descriptions.Item>
      <Descriptions.Item label={translate('table.entities.personType')}>
        {timciPersonTypeLabel(translate, record?.personType)}
      </Descriptions.Item>
      <Descriptions.Item label={translate('table.entities.documentType')}>
        {record?.documentTypeName ?? '—'}
      </Descriptions.Item>
      <Descriptions.Item label={translate('table.entities.documentNumber')}>
        {record?.documentNumber ?? '—'}
      </Descriptions.Item>
      <Descriptions.Item label={translate('create.entity.addAdvertisement')}>
        {boolTag(translate, record?.addAdvertisement)}
      </Descriptions.Item>
      {record?.addAdvertisement === true ? (
        <Descriptions.Item label={translate('table.entities.fantasyName')}>
          {record?.fantasyName != null && String(record.fantasyName) !== ''
            ? record.fantasyName
            : '—'}
        </Descriptions.Item>
      ) : null}
    </Descriptions>
  );
}
