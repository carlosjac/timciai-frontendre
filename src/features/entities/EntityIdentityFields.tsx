import { Form, Input, Select, Switch } from 'antd';
import { useTranslate } from '@refinedev/core';
import type { FormInstance, SelectProps } from 'antd';
import type { DocTypeRow } from './entity-types.js';

export type EntityIdentitySection = 'nameCountry' | 'personDocument' | 'advertisement';

type EntityIdentityFieldsProps = {
  form: FormInstance;
  countrySelect: SelectProps;
  docTypes: DocTypeRow[];
  disabled?: boolean;
  sections?: EntityIdentitySection[];
};

export function EntityIdentityFields({
  form,
  countrySelect,
  docTypes,
  disabled = false,
  sections = ['nameCountry', 'personDocument', 'advertisement'],
}: EntityIdentityFieldsProps) {
  const translate = useTranslate();
  const show = (section: EntityIdentitySection) => sections.includes(section);

  return (
    <>
      {show('nameCountry') ? (
        <>
          <Form.Item
            label={translate('create.entity.entityName')}
            name="name"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Input maxLength={100} disabled={disabled} />
          </Form.Item>
          <Form.Item
            label={translate('create.entity.country')}
            name="countryId"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Select
              {...countrySelect}
              showSearch
              optionFilterProp="label"
              disabled={disabled}
            />
          </Form.Item>
        </>
      ) : null}
      {show('personDocument') ? (
        <>
          <Form.Item
            label={translate('create.entity.personType')}
            name="personType"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Select
              options={[
                { value: 'physical_person', label: translate('create.documentType.physical') },
                { value: 'legal_person', label: translate('create.documentType.legal') },
              ]}
              disabled={disabled}
            />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {() => {
              const countryId = form?.getFieldValue('countryId') as string | undefined;
              const personType = form?.getFieldValue('personType') as string | undefined;
              const filtered = docTypes.filter((dt) => {
                if (!countryId) return false;
                if (dt.countryId != null && dt.countryId !== countryId) return false;
                if (dt.countryId == null) {
                  const hasSpecific = docTypes.some((x) => x.countryId === countryId);
                  if (hasSpecific) return false;
                }
                if (personType === 'physical_person' && dt.appliesTo === 'legal_person') {
                  return false;
                }
                if (personType === 'legal_person' && dt.appliesTo === 'physical_person') {
                  return false;
                }
                return true;
              });
              return (
                <Form.Item
                  label={translate('create.entity.documentType')}
                  name="documentTypeId"
                  rules={[{ required: true, message: translate('form.validation.requiredField') }]}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={filtered.map((d) => ({ value: d.id, label: d.name }))}
                    disabled={!countryId || disabled}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
          <Form.Item
            label={translate('create.entity.documentNumber')}
            name="documentNumber"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Input disabled={disabled} />
          </Form.Item>
        </>
      ) : null}
      {show('advertisement') ? (
        <>
          <Form.Item
            label={translate('create.entity.addAdvertisement')}
            name="addAdvertisement"
            valuePropName="checked"
          >
            <Switch disabled={disabled} />
          </Form.Item>
          <Form.Item label={translate('create.entity.fantasyName')} name="fantasyName">
            <Input disabled={disabled} />
          </Form.Item>
        </>
      ) : null}
    </>
  );
}
