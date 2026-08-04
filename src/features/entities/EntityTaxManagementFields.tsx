import { useTranslate } from '@refinedev/core';
import { Form, Switch, Typography } from 'antd';
import type { FormInstance } from 'antd';
import { TaxProfileAttributeFields } from '../../shared/timci/tax/TaxProfileAttributeFields.js';
import { useCountryIsoCodeMap } from '../../shared/timci/tax/useCountryIsoCodeMap.js';
import { useTaxProfileSchema } from '../../shared/timci/tax/useTaxProfileSchema.js';

type Props = {
  form: FormInstance;
  tenantId: string;
  disabled?: boolean;
  /** When set (edit without watching country), use this country id instead of the form field. */
  countryIdOverride?: string | null;
};

/**
 * Entity tax toggle + dynamic issuer tax profile (country from `countryId` / ISO code).
 */
export function EntityTaxManagementFields({
  form,
  tenantId,
  disabled = false,
  countryIdOverride,
}: Props) {
  const translate = useTranslate();
  const taxManagementEnabled = Form.useWatch('taxManagementEnabled', form) as boolean | undefined;
  const countryIdWatched = Form.useWatch('countryId', form) as string | undefined;
  const countryId = countryIdOverride ?? countryIdWatched;

  const { resolveIsoCode } = useCountryIsoCodeMap(tenantId);
  const countryCode = resolveIsoCode(countryId);
  const { schema, loading } = useTaxProfileSchema(
    taxManagementEnabled === true ? tenantId : null,
    taxManagementEnabled === true ? countryCode : null,
  );

  return (
    <>
      <Typography.Text strong style={{ display: 'block', marginBottom: 8, marginTop: 8 }}>
        {translate('tax.sectionTitle')}
      </Typography.Text>
      <Form.Item
        label={translate('create.entity.taxManagementEnabled')}
        name="taxManagementEnabled"
        valuePropName="checked"
        extra={translate('create.entity.taxManagementEnabledHelp')}
        initialValue={false}
      >
        <Switch
          disabled={disabled}
          aria-label={translate('create.entity.taxManagementEnabled')}
        />
      </Form.Item>
      {taxManagementEnabled === true ? (
        <>
          {!countryId ? (
            <Typography.Paragraph type="secondary">
              {translate('tax.pickCountryFirst')}
            </Typography.Paragraph>
          ) : !countryCode ? (
            <Typography.Paragraph type="secondary">
              {translate('tax.countryIsoMissing')}
            </Typography.Paragraph>
          ) : (
            <TaxProfileAttributeFields
              schema={schema}
              loading={loading}
              role="issuer"
              disabled={disabled}
            />
          )}
        </>
      ) : null}
    </>
  );
}
