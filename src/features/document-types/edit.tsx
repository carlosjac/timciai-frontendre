import { Edit, SaveButton, useForm, useSelect } from '@refinedev/antd';
import { useInvalidate, usePermissions, useTranslate, type BaseRecord } from '@refinedev/core';
import { App, Alert, Button, Form, Input, Modal, Select } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import {
  getDocumentTypeActivateUrl,
  getDocumentTypeDeactivateUrl,
} from '../../shared/timci/documentTypesApi.js';
import { timciFetch } from '../../shared/timci/http.js';
import { stripSelectServerSearch } from '../../shared/timci/stripSelectServerSearch.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { documentTypeValidationRulesForCountryIso } from './validationRuleChoices.js';

const DOCUMENT_TYPE_EDIT_FIELDS = ['name', 'countryId', 'appliesTo', 'validationRuleKey'] as const;

type CountryRow = BaseRecord & { id: string; name?: string; isoCode?: string };

type DocumentTypeRecord = {
  id?: string;
  name?: string;
  countryId?: string | null;
  appliesTo?: string;
  validationRuleKey?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function DocumentTypeEdit() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { message } = App.useApp();
  const invalidate = useInvalidate();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canUpdate = permData?.actionCodes?.includes('document_types.update') ?? false;

  const { formProps, saveButtonProps, onFinish: submitRecord, form, query, formLoading } = useForm({
    resource: 'document_types',
    action: 'edit',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: DOCUMENT_TYPE_EDIT_FIELDS,
  });

  const { selectProps: countrySelectRaw, query: countriesQuery } = useSelect({
    resource: 'countries',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });
  const countrySelect = stripSelectServerSearch(countrySelectRaw);

  const record = query?.data?.data as DocumentTypeRecord | undefined;
  const countryId = Form.useWatch('countryId', form);
  const countries = useMemo(
    () => (countriesQuery.data?.data ?? []) as CountryRow[],
    [countriesQuery.data],
  );
  const selectedCountryIso = useMemo(() => {
    const row = countries.find((c) => c.id === countryId);
    return row?.isoCode;
  }, [countries, countryId]);

  const validationRuleOptions = useMemo(
    () => documentTypeValidationRulesForCountryIso(selectedCountryIso),
    [selectedCountryIso],
  );

  useEffect(() => {
    const key = form?.getFieldValue('validationRuleKey') as string | undefined;
    if (!key) return;
    const stillValid = validationRuleOptions.some((o) => o.value === key);
    if (!stillValid) form?.setFieldValue('validationRuleKey', undefined);
  }, [countryId, validationRuleOptions, form]);

  const [toggleOpen, setToggleOpen] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  const showToggle = !!record?.id && canUpdate;

  const performActivateDeactivate = useCallback(async () => {
    if (!tenantId || !record?.id) return;
    setToggleLoading(true);
    setToggleOpen(false);
    try {
      const url = record.isActive
        ? getDocumentTypeDeactivateUrl(tenantId, record.id)
        : getDocumentTypeActivateUrl(tenantId, record.id);
      await timciFetch(url, { method: 'PATCH' });
      message.success(
        record.isActive
          ? translate('pages.documentTypes.deactivated')
          : translate('pages.documentTypes.activated'),
      );
      await invalidate({
        resource: 'document_types',
        invalidates: ['list', 'detail'],
        id: record.id,
      });
      await query?.refetch?.();
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : translate('pages.documentTypes.toggleError'));
    } finally {
      setToggleLoading(false);
    }
  }, [tenantId, record?.id, record?.isActive, invalidate, message, query, translate]);

  if (!tenantId) {
    return (
      <Edit title={translate('pages.documentTypes.editTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Edit>
    );
  }

  const toggleLabel = record?.isActive
    ? translate('pages.documentTypes.deactivate')
    : translate('pages.documentTypes.activate');
  const toggleConfirmTitle = record?.isActive
    ? translate('pages.documentTypes.confirmDeactivateTitle')
    : translate('pages.documentTypes.confirmActivateTitle');
  const toggleConfirmBody = record?.isActive
    ? translate('pages.documentTypes.confirmDeactivateBody')
    : translate('pages.documentTypes.confirmActivateBody');

  return (
    <>
      <Edit
        title={translate('pages.documentTypes.editTitle')}
        isLoading={formLoading}
        saveButtonProps={saveButtonProps}
        footerButtons={({ saveButtonProps: refineSaveProps }) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              flexWrap: 'wrap',
              width: '100%',
              columnGap: 24,
              rowGap: 12,
            }}
          >
            {showToggle && (
              <Button
                type={record?.isActive ? 'default' : 'primary'}
                danger={record?.isActive}
                loading={toggleLoading}
                onClick={() => setToggleOpen(true)}
                style={{ marginRight: 'auto' }}
              >
                {toggleLabel}
              </Button>
            )}
            <SaveButton {...refineSaveProps} />
          </div>
        )}
      >
        <TimciFormServerAlert messages={generalMessages} />
        <TimciFormInactiveRecordBanner isActive={record?.isActive} />
        <Form
          {...formProps}
          layout="vertical"
          onFinish={async (values: Record<string, unknown>) => {
            clearServerErrors(form);
            const rawRule = values.validationRuleKey;
            const validationRuleKey =
              typeof rawRule === 'string' && rawRule.trim() !== '' ? rawRule.trim() : null;
            try {
              await submitRecord({
                ...values,
                validationRuleKey,
              });
            } catch (e) {
              applyServerError(form, e);
              throw e;
            }
          }}
        >
          <Form.Item
            label={translate('create.documentType.typeName')}
            name="name"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            label={translate('create.documentType.country')}
            name="countryId"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Select
              {...countrySelect}
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) => {
                const label = option?.label;
                const text = typeof label === 'string' ? label : String(label ?? '');
                return text.toLowerCase().includes(input.trim().toLowerCase());
              }}
            />
          </Form.Item>
          <Form.Item
            label={translate('create.documentType.appliesTo')}
            name="appliesTo"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Select
              options={[
                { value: 'physical_person', label: translate('create.documentType.physical') },
                { value: 'legal_person', label: translate('create.documentType.legal') },
                { value: 'both', label: translate('create.documentType.both') },
              ]}
            />
          </Form.Item>
          <Form.Item
            label={translate('create.documentType.validationRuleNumber')}
            name="validationRuleKey"
          >
            <Select
              allowClear
              disabled={!countryId}
              placeholder={
                !countryId
                  ? translate('create.documentType.validationRulePickCountry')
                  : validationRuleOptions.length === 0
                    ? translate('create.documentType.validationRuleNoneForCountry')
                    : translate('create.documentType.validationRulePlaceholder')
              }
              options={validationRuleOptions}
            />
          </Form.Item>
        </Form>
        {record && (
          <TimciFormAuditCollapse
            dateFormat={dateFormat}
            timeZone={timeZone}
            createdAt={record.createdAt}
            updatedAt={record.updatedAt}
            createdBy={record.createdBy}
            updatedBy={record.updatedBy}
          />
        )}
      </Edit>
      <Modal
        open={toggleOpen}
        title={toggleConfirmTitle}
        okText={toggleLabel}
        okButtonProps={{ danger: record?.isActive, loading: toggleLoading }}
        cancelText={translate('buttons.cancel')}
        onCancel={() => setToggleOpen(false)}
        onOk={() => void performActivateDeactivate()}
        destroyOnClose
      >
        <p>
          {record?.name != null && record.name !== '' ? (
            <>
              <strong>«{record.name}»</strong>
              <br />
            </>
          ) : null}
          {toggleConfirmBody}
        </p>
      </Modal>
    </>
  );
}
