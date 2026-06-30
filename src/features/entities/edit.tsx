import { Edit, SaveButton, useForm, useSelect } from '@refinedev/antd';
import { useInvalidate, useList, usePermissions, useTranslate, type BaseRecord } from '@refinedev/core';
import {
  Alert,
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Typography,
} from 'antd';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { canFullyEditEntity } from '../../shared/timci/actionCodes.js';
import {
  getEntityPaymentOptionActivateUrl,
  getEntityPaymentOptionDeactivateUrl,
} from '../../shared/timci/entitiesApi.js';
import { fetchOverduePolicyCatalog, type OverduePolicyItem } from '../../shared/timci/auxiliaryApi.js';
import { timciFetch } from '../../shared/timci/http.js';
import { stripSelectServerSearch } from '../../shared/timci/stripSelectServerSearch.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import {
  normalizeRichTextField,
  TimciRichTextEditor,
  TimciRichTextReadonlyField,
} from '../../shared/timci/form/index.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

const ENTITY_EDIT_FIELDS = [
  'name',
  'countryId',
  'address',
  'email',
  'phone',
  'defaultCountryId',
  'defaultCurrencyId',
  'personType',
  'documentTypeId',
  'documentNumber',
  'defaultOverdueNotificationPolicyKey',
  'defaultPaymentTermDays',
  'availableOverduePolicyKeys',
  'addAdvertisement',
  'fantasyName',
] as const;

type DocTypeRow = BaseRecord & {
  id: string;
  name: string;
  countryId?: string | null;
  appliesTo?: string;
};

type EntityRecord = {
  id?: string;
  name?: string;
  countryId?: string;
  address?: string;
  email?: string;
  phone?: string;
  defaultCountryId?: string;
  defaultCurrencyId?: string;
  personType?: string;
  documentTypeId?: string;
  documentNumber?: string;
  defaultOverdueNotificationPolicyKey?: string;
  defaultPaymentTermDays?: number;
  availableOverduePolicyKeys?: string[];
  addAdvertisement?: boolean;
  fantasyName?: string | null;
  isActive?: boolean;
  paymentOptions?: PaymentOptionRow[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

type PaymentOptionRow = {
  id?: string;
  ordinal?: number;
  name?: string;
  details?: string;
  currencyIds?: string[];
  isActive?: boolean;
};

function mapPaymentOptionsForSubmit(
  rawList: PaymentOptionRow[] | undefined,
): Array<{
  id?: string;
  ordinal: number;
  name: string;
  details: string;
  currencyIds: string[];
  isActive: boolean;
}> {
  return (rawList ?? []).map((row, index) => ({
    ...(typeof row.id === 'string' && row.id.trim() !== '' ? { id: row.id.trim() } : {}),
    ordinal: index,
    name:
      typeof row.name === 'string' && row.name.trim() !== '' ? row.name.trim() : 'Principal',
    details: normalizeRichTextField(row.details),
    currencyIds: Array.isArray(row.currencyIds)
      ? row.currencyIds.filter((id) => id != null && String(id).trim() !== '')
      : [],
    isActive: row.isActive !== false,
  }));
}

export function EntityEdit() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { message } = App.useApp();
  const invalidate = useInvalidate();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const [policies, setPolicies] = useState<OverduePolicyItem[]>([]);
  const [paymentToggleOpen, setPaymentToggleOpen] = useState(false);
  const [paymentToggleLoading, setPaymentToggleLoading] = useState(false);
  const [paymentToggleTarget, setPaymentToggleTarget] = useState<PaymentOptionRow | null>(null);

  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];
  const canFullEditEntity = canFullyEditEntity(codes);
  const canActivatePaymentOption =
    codes.includes('entities.activate') || codes.includes('entities.update');
  const canDeactivatePaymentOption =
    codes.includes('entities.deactivate') || codes.includes('entities.update');

  const { formProps, saveButtonProps, onFinish: submitRecord, form, query, formLoading } = useForm({
    resource: 'entities',
    action: 'edit',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: ENTITY_EDIT_FIELDS,
  });

  const record = query?.data?.data as EntityRecord | undefined;
  const defaultCurrencyIdWatched = Form.useWatch('defaultCurrencyId', form);

  useEffect(() => {
    if (formLoading || record === undefined) return;
    if (record.isActive === false) {
      const entityId = record.id ?? routeId;
      if (entityId) {
        message.warning(translate('pages.entities.inactiveCannotEdit'));
        navigate(`/entities/show/${encodeURIComponent(String(entityId))}`, { replace: true });
      }
    }
  }, [formLoading, message, navigate, record, routeId, translate]);

  const { selectProps: countrySelect } = useSelect({
    resource: 'countries',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });

  const { selectProps: currencySelectRaw } = useSelect({
    resource: 'currencies',
    optionLabel: (item) => {
      const code = (item as { code?: string }).code;
      const name = (item as { name?: string }).name;
      return code != null && code !== '' ? `${code} — ${name ?? ''}` : (name ?? '');
    },
    optionValue: 'id',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });
  const currencySelect = stripSelectServerSearch(currencySelectRaw);

  const { result: docTypeResult } = useList<DocTypeRow>({
    resource: 'document_types',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });

  const docTypes = (docTypeResult.data ?? []).filter((dt) => dt.isActive !== false);

  useEffect(() => {
    if (!tenantId) return;
    void fetchOverduePolicyCatalog(tenantId).then(setPolicies);
  }, [tenantId]);

  const policyOptions = useMemo(
    () =>
      policies.map((p) => {
        const name = p.description?.trim() ?? '';
        return { value: p.key, label: name !== '' ? name : p.key };
      }),
    [policies],
  );

  const performPaymentOptionToggle = useCallback(async () => {
    if (!tenantId || !record?.id || !paymentToggleTarget?.id) return;
    setPaymentToggleLoading(true);
    setPaymentToggleOpen(false);
    try {
      const url = paymentToggleTarget.isActive
        ? getEntityPaymentOptionDeactivateUrl(tenantId, record.id, paymentToggleTarget.id)
        : getEntityPaymentOptionActivateUrl(tenantId, record.id, paymentToggleTarget.id);
      await timciFetch(url, { method: 'PATCH' });
      message.success(
        paymentToggleTarget.isActive
          ? translate('pages.entities.paymentOptionDeactivated')
          : translate('pages.entities.paymentOptionActivated'),
      );
      await invalidate({
        resource: 'entities',
        invalidates: ['detail'],
        id: record.id,
      });
      await query?.refetch?.();
    } catch (e: unknown) {
      message.error(
        e instanceof Error ? e.message : translate('pages.entities.paymentOptionToggleError'),
      );
    } finally {
      setPaymentToggleLoading(false);
      setPaymentToggleTarget(null);
    }
  }, [invalidate, message, paymentToggleTarget, query, record?.id, tenantId, translate]);

  const paymentToggleLabel = paymentToggleTarget?.isActive
    ? translate('pages.entities.paymentOptionDeactivate')
    : translate('pages.entities.paymentOptionActivate');
  const paymentToggleConfirmTitle = paymentToggleTarget?.isActive
    ? translate('pages.entities.confirmPaymentOptionDeactivateTitle')
    : translate('pages.entities.confirmPaymentOptionActivateTitle');
  const paymentToggleConfirmBody = paymentToggleTarget?.isActive
    ? translate('pages.entities.confirmPaymentOptionDeactivateBody')
    : translate('pages.entities.confirmPaymentOptionActivateBody');

  if (!tenantId) {
    return (
      <Edit title={translate('pages.entities.editTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Edit>
    );
  }

  if (!formLoading && record?.isActive === false) {
    return <Edit title={translate('pages.entities.editTitle')} isLoading />;
  }

  return (
    <>
      <Edit
        title={translate('pages.entities.editTitle')}
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
            <SaveButton {...refineSaveProps} />
          </div>
        )}
      >
        <TimciFormServerAlert messages={generalMessages} />
        <TimciFormInactiveRecordBanner isActive={record?.isActive} />
        {record?.id && (
          <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Id: {record.id}
          </Typography.Paragraph>
        )}
        <Form
          {...formProps}
          layout="vertical"
          onFinish={async (values: Record<string, unknown>) => {
            clearServerErrors(form);

            const paymentOptions = mapPaymentOptionsForSubmit(
              values.paymentOptions as PaymentOptionRow[] | undefined,
            );

            if (canFullEditEntity) {
              const fantasyRaw = values.fantasyName;
              const fantasyName =
                typeof fantasyRaw === 'string' && fantasyRaw.trim() !== ''
                  ? fantasyRaw.trim()
                  : null;

              try {
                await submitRecord({
                  name: values.name,
                  countryId: values.countryId,
                  address: values.address,
                  email: values.email,
                  phone: values.phone,
                  defaultCountryId: values.defaultCountryId,
                  defaultCurrencyId: values.defaultCurrencyId,
                  personType: values.personType,
                  documentTypeId: values.documentTypeId,
                  documentNumber: values.documentNumber,
                  defaultOverdueNotificationPolicyKey: values.defaultOverdueNotificationPolicyKey,
                  defaultPaymentTermDays: values.defaultPaymentTermDays,
                  availableOverduePolicyKeys: values.availableOverduePolicyKeys,
                  addAdvertisement: values.addAdvertisement,
                  fantasyName,
                  paymentOptions,
                });
              } catch (e) {
                applyServerError(form, e);
                throw e;
              }

              return;
            }

            try {
              await submitRecord({
                address: values.address,
                email: values.email,
                phone: values.phone,
                defaultCountryId: values.defaultCountryId,
                defaultCurrencyId: values.defaultCurrencyId,
                defaultOverdueNotificationPolicyKey: values.defaultOverdueNotificationPolicyKey,
                defaultPaymentTermDays: values.defaultPaymentTermDays,
                availableOverduePolicyKeys: values.availableOverduePolicyKeys,
                paymentOptions,
              });
            } catch (e) {
              applyServerError(form, e);
              throw e;
            }
          }}
        >
          <Form.Item
            label={translate('create.entity.entityName')}
            name="name"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Input maxLength={100} disabled={!canFullEditEntity} />
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
              disabled={!canFullEditEntity}
            />
          </Form.Item>
          <Form.Item
            label={translate('create.entity.address')}
            name="address"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={translate('create.entity.email')}
            name="email"
            rules={[
              { required: true, message: translate('form.validation.requiredField') },
              { type: 'email', message: translate('pages.login.errors.validEmail') },
            ]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            label={translate('create.entity.phone')}
            name="phone"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={translate('create.entity.defaultCountry')}
            name="defaultCountryId"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Select {...countrySelect} showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item
            label={translate('create.entity.defaultCurrency')}
            name="defaultCurrencyId"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Select
              {...currencySelect}
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
            label={translate('create.entity.personType')}
            name="personType"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Select
              options={[
                { value: 'physical_person', label: translate('create.documentType.physical') },
                { value: 'legal_person', label: translate('create.documentType.legal') },
              ]}
              disabled={!canFullEditEntity}
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
                if (personType === 'physical_person' && dt.appliesTo === 'legal_person') return false;
                if (personType === 'legal_person' && dt.appliesTo === 'physical_person') return false;
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
                    disabled={!countryId || !canFullEditEntity}
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
            <Input disabled={!canFullEditEntity} />
          </Form.Item>
          <Form.Item
            label={translate('create.entity.defaultOverduePolicy')}
            name="defaultOverdueNotificationPolicyKey"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Select showSearch optionFilterProp="label" options={policyOptions} />
          </Form.Item>
          <Form.Item
            label={translate('create.entity.availableOverduePolicies')}
            name="availableOverduePolicyKeys"
            rules={[
              { required: true, message: translate('form.validation.requiredField') },
              {
                validator: async (_, value: string[]) => {
                  const def = form?.getFieldValue('defaultOverdueNotificationPolicyKey') as
                    | string
                    | undefined;
                  if (def && Array.isArray(value) && !value.includes(def)) {
                    throw new Error(translate('create.entity.defaultPolicyMustBeInAvailable'));
                  }
                },
              },
            ]}
          >
            <Select mode="multiple" showSearch optionFilterProp="label" options={policyOptions} />
          </Form.Item>
          <Form.Item
            label={translate('create.entity.defaultPaymentTermDays')}
            name="defaultPaymentTermDays"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          {canFullEditEntity && (
            <>
              <Form.Item
                label={translate('create.entity.addAdvertisement')}
                name="addAdvertisement"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item label={translate('create.entity.fantasyName')} name="fantasyName">
                <Input />
              </Form.Item>
            </>
          )}

          <>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            {translate('create.entity.paymentOptionsSection')}
          </Typography.Text>
          <Form.List
            name="paymentOptions"
            rules={[
              {
                validator: async (_, value) => {
                  if (!Array.isArray(value) || value.length < 1) {
                    return Promise.reject(new Error(translate('create.entity.paymentOptionsMinOne')));
                  }
                  if (!value.some((row: { isActive?: boolean }) => row?.isActive !== false)) {
                    return Promise.reject(
                      new Error(translate('create.entity.paymentOptionsAtLeastOneActive')),
                    );
                  }
                  const normalized = value.map((row: { name?: string }) =>
                    String(row?.name ?? '')
                      .trim()
                      .toLowerCase(),
                  );
                  const nonEmpty = normalized.filter((n) => n !== '');
                  if (new Set(nonEmpty).size !== nonEmpty.length) {
                    return Promise.reject(
                      new Error(translate('create.entity.paymentOptionsDuplicateNames')),
                    );
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove, move }) => (
              <>
                {fields.map((field, index) => {
                  const { key, name: rowName, ...restField } = field;
                  const rowValues = form?.getFieldValue(['paymentOptions', rowName]) as
                    | PaymentOptionRow
                    | undefined;
                  const showPaymentToggle =
                    !!rowValues?.id &&
                    ((rowValues.isActive && canDeactivatePaymentOption) ||
                      (!rowValues.isActive && canActivatePaymentOption));
                  const paymentToggleLabelRow = rowValues?.isActive
                    ? translate('pages.entities.paymentOptionDeactivate')
                    : translate('pages.entities.paymentOptionActivate');
                  const isPersistedRow =
                    typeof rowValues?.id === 'string' && rowValues.id.trim() !== '';
                  const isRowInactive = rowValues?.isActive === false;
                  const rowFieldsDisabled = isRowInactive;

                  return (
                    <div
                      key={key}
                      style={{
                        marginBottom: 16,
                        padding: 16,
                        border: '1px solid var(--ant-color-border-secondary, #f0f0f0)',
                        borderRadius: 8,
                        opacity: isRowInactive ? 0.85 : 1,
                      }}
                    >
                      <Form.Item name={[rowName, 'id']} hidden>
                        <Input />
                      </Form.Item>
                      <Space wrap style={{ marginBottom: 12 }}>
                        <Button
                          type="default"
                          htmlType="button"
                          disabled={index === 0 || rowFieldsDisabled}
                          onClick={() => move(index, index - 1)}
                        >
                          {translate('create.entity.movePaymentOptionUp')}
                        </Button>
                        <Button
                          type="default"
                          htmlType="button"
                          disabled={index === fields.length - 1 || rowFieldsDisabled}
                          onClick={() => move(index, index + 1)}
                        >
                          {translate('create.entity.movePaymentOptionDown')}
                        </Button>
                        {!isPersistedRow && (
                          <Button
                            type="default"
                            htmlType="button"
                            danger
                            disabled={fields.length <= 1}
                            onClick={() => remove(rowName)}
                          >
                            {translate('create.entity.removePaymentOption')}
                          </Button>
                        )}
                        {showPaymentToggle && (
                          <Button
                            type={rowValues?.isActive ? 'default' : 'primary'}
                            danger={rowValues?.isActive}
                            htmlType="button"
                            loading={paymentToggleLoading}
                            onClick={() => {
                              setPaymentToggleTarget(rowValues ?? null);
                              setPaymentToggleOpen(true);
                            }}
                          >
                            {paymentToggleLabelRow}
                          </Button>
                        )}
                      </Space>
                      <Form.Item
                        {...restField}
                        name={[rowName, 'name']}
                        label={translate('create.entity.paymentOptionName')}
                        rules={[
                          { required: true, message: translate('form.validation.requiredField') },
                        ]}
                        style={{ marginBottom: 12 }}
                      >
                        <Input maxLength={120} disabled={rowFieldsDisabled} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[rowName, 'details']}
                        label={translate('create.entity.paymentOptionDetails')}
                        extra={translate('create.entity.paymentOptionDetailsHint')}
                        rules={[
                          { required: true, message: translate('form.validation.requiredField') },
                        ]}
                        style={{ marginBottom: 12 }}
                      >
                        {rowFieldsDisabled ? (
                          <TimciRichTextReadonlyField minHeight={120} />
                        ) : (
                          <TimciRichTextEditor minHeight={120} />
                        )}
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[rowName, 'currencyIds']}
                        label={translate('create.entity.paymentOptionCurrencies')}
                        rules={[
                          { required: true, message: translate('form.validation.requiredField') },
                          {
                            type: 'array',
                            min: 1,
                            message: translate('create.entity.paymentOptionCurrenciesMinOne'),
                          },
                        ]}
                        style={{ marginBottom: 12 }}
                      >
                        <Select
                          {...currencySelect}
                          mode="multiple"
                          showSearch
                          disabled={rowFieldsDisabled}
                          optionFilterProp="label"
                          filterOption={(input, option) => {
                            const label = option?.label;
                            const text = typeof label === 'string' ? label : String(label ?? '');
                            return text.toLowerCase().includes(input.trim().toLowerCase());
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[rowName, 'isActive']}
                        label={translate('create.entity.paymentOptionActive')}
                      >
                        <span>
                          {rowValues?.isActive !== false ? (
                            translate('table.entities.yes')
                          ) : (
                            translate('table.entities.no')
                          )}
                        </span>
                      </Form.Item>
                    </div>
                  );
                })}
                <Button
                  type="dashed"
                  htmlType="button"
                  onClick={() =>
                    add({
                      name: '',
                      details: '',
                      currencyIds: defaultCurrencyIdWatched ? [defaultCurrencyIdWatched] : [],
                      isActive: true,
                    })
                  }
                  block
                  style={{ marginBottom: 8 }}
                >
                  {translate('create.entity.addPaymentOption')}
                </Button>
              </>
            )}
          </Form.List>
          </>
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
        open={paymentToggleOpen}
        title={paymentToggleConfirmTitle}
        okText={paymentToggleLabel}
        okButtonProps={{ danger: paymentToggleTarget?.isActive, loading: paymentToggleLoading }}
        cancelText={translate('buttons.cancel')}
        onCancel={() => {
          setPaymentToggleOpen(false);
          setPaymentToggleTarget(null);
        }}
        onOk={() => void performPaymentOptionToggle()}
        destroyOnClose
      >
        <p>
          {paymentToggleTarget?.name != null && paymentToggleTarget.name !== '' ? (
            <>
              <strong>«{paymentToggleTarget.name}»</strong>
              <br />
            </>
          ) : null}
          {paymentToggleConfirmBody}
        </p>
      </Modal>
    </>
  );
}
