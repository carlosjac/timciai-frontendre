import { useTranslate } from '@refinedev/core';
import { Typography } from 'antd';
import { TaxProfileAttributeFields } from '../../shared/timci/tax/TaxProfileAttributeFields.js';
import { useEntityTaxContext } from '../../shared/timci/tax/useEntityTaxContext.js';

type Props = {
  tenantId: string;
  entityId: string;
  disabled?: boolean;
};

/**
 * Customer tax profile fields when the parent entity has tax management enabled.
 * Schema country = entity country (not the customer's country).
 */
export function CustomerTaxProfileFields({ tenantId, entityId, disabled = false }: Props) {
  const translate = useTranslate();
  const { taxManagementEnabled, countryCode, schema, schemaLoading, entityLoading } =
    useEntityTaxContext(tenantId, entityId);

  if (entityLoading) return null;
  if (!taxManagementEnabled) return null;

  return (
    <>
      <Typography.Text strong style={{ display: 'block', marginBottom: 8, marginTop: 8 }}>
        {translate('tax.sectionTitle')}
      </Typography.Text>
      {!countryCode ? (
        <Typography.Paragraph type="secondary">
          {translate('tax.entityCountryIsoMissing')}
        </Typography.Paragraph>
      ) : (
        <TaxProfileAttributeFields
          schema={schema}
          loading={schemaLoading}
          role="recipient"
          disabled={disabled}
        />
      )}
    </>
  );
}
