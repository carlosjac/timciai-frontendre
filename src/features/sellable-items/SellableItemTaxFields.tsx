import { useTranslate } from '@refinedev/core';
import { Typography } from 'antd';
import { LineTaxFields } from '../../shared/timci/tax/LineTaxFields.js';
import { useEntityTaxContext } from '../../shared/timci/tax/useEntityTaxContext.js';

type Props = {
  tenantId: string;
  entityId: string;
  disabled?: boolean;
};

/** Sellable item line tax fields when entity tax management is on. */
export function SellableItemTaxFields({ tenantId, entityId, disabled = false }: Props) {
  const translate = useTranslate();
  const { taxManagementEnabled, schema, schemaLoading, entityLoading } = useEntityTaxContext(
    tenantId,
    entityId,
  );

  if (entityLoading || !taxManagementEnabled) return null;

  return (
    <>
      <Typography.Text strong style={{ display: 'block', marginBottom: 8, marginTop: 8 }}>
        {translate('tax.sectionTitle')}
      </Typography.Text>
      <LineTaxFields
        schema={schema}
        namePrefix="taxAttributes"
        disabled={disabled || schemaLoading}
        fallbackLabelKey="table.sellableItems.taxCategory"
      />
    </>
  );
}
