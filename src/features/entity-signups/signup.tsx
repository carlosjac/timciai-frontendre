import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { useTranslate } from '@refinedev/core';
import { TimciWordmark } from '../../app-shell/TimciBrand.js';
import { Alert, Button, Card, Form, Input, InputNumber, Select, Typography, theme } from 'antd';
import { Link } from 'react-router';
import { getV1Base } from '../../config.js';
import { timciFetch } from '../../shared/timci/http.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';

type Catalog = {
  countries: { id: string; name: string }[];
  documentTypes: {
    id: string;
    name: string;
    countryId: string | null;
    appliesTo: string;
    validationHint: string | null;
  }[];
  currencies: { id: string; code: string; name: string }[];
};

type PaymentRow = {
  name?: string;
  details?: string;
  currencyIds?: string[];
};

const FIELDS = [
  'name',
  'countryId',
  'personType',
  'documentTypeId',
  'documentNumber',
  'address',
  'email',
  'phone',
  'defaultCountryId',
  'supportedCurrencyIds',
  'defaultCurrencyId',
  'baseCurrencyId',
  'defaultPaymentTermDays',
  'paymentOptions',
  'testNotificationEmail',
  'adminName',
  'adminEmail',
  'password',
  'passwordConfirm',
] as const;

function filterDocumentTypes(
  catalog: Catalog,
  countryId: string | undefined,
  personType: string | undefined,
): Catalog['documentTypes'] {
  if (!countryId) return [];

  return catalog.documentTypes.filter((row) => {
    if (row.countryId != null && row.countryId !== countryId) return false;
    if (row.countryId == null && catalog.documentTypes.some((item) => item.countryId === countryId)) {
      return false;
    }
    if (personType === 'physical_person' && row.appliesTo === 'legal_person') return false;
    if (personType === 'legal_person' && row.appliesTo === 'physical_person') return false;

    return true;
  });
}

export function EntitySignupPage(): ReactElement {
  const translate = useTranslate();
  const { token } = theme.useToken();
  const pageStyle = { minHeight: '100vh', padding: 16, background: token.colorBgLayout };
  const [form] = Form.useForm();
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: FIELDS,
  });
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [catalogError, setCatalogError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    let cancelled = false;
    void timciFetch(`${getV1Base()}/public/entity-signups/catalog`)
      .then((result) => {
        if (!cancelled) setCatalog(result.json as Catalog);
      })
      .catch(() => {
        if (!cancelled) setCatalogError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const countryOptions = useMemo(
    () => (catalog?.countries ?? []).map((row) => ({ value: row.id, label: row.name })),
    [catalog],
  );
  const currencyOptions = useMemo(
    () =>
      (catalog?.currencies ?? []).map((row) => ({
        value: row.id,
        label: `${row.code} — ${row.name}`,
      })),
    [catalog],
  );

  const onFinish = async (values: Record<string, unknown>) => {
    clearServerErrors(form);
    setSubmitting(true);
    const supported = (values.supportedCurrencyIds as string[] | undefined) ?? [];
    const options = ((values.paymentOptions as PaymentRow[] | undefined) ?? []).map((row, index) => ({
      ordinal: index,
      name: row.name?.trim() ?? '',
      details: row.details?.trim() ? row.details.trim() : '-',
      currencyIds: row.currencyIds?.length ? row.currencyIds : supported,
      isActive: true,
    }));
    const payload = {
      name: values.name,
      fantasyName: null,
      countryId: values.countryId,
      personType: values.personType,
      documentTypeId: values.documentTypeId,
      documentNumber: values.documentNumber,
      address: values.address,
      email: values.email,
      phone: values.phone,
      defaultCountryId: values.defaultCountryId,
      supportedCurrencyIds: supported,
      defaultCurrencyId: values.defaultCurrencyId,
      baseCurrencyId: values.baseCurrencyId,
      defaultPaymentTermDays: values.defaultPaymentTermDays,
      paymentOptions: options,
      testNotificationEmail:
        typeof values.testNotificationEmail === 'string' && values.testNotificationEmail.trim()
          ? values.testNotificationEmail.trim()
          : null,
      adminName: values.adminName,
      adminEmail: values.adminEmail,
      password: values.password,
      timciHp: honeypot,
    };
    try {
      await timciFetch(`${getV1Base()}/public/entity-signups`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setDone(true);
    } catch (error) {
      applyServerError(form, error);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <main style={pageStyle}>
        <div style={{ maxWidth: '40rem', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <Link to="/login" style={{ lineHeight: 0 }}>
              <TimciWordmark height={48} />
            </Link>
          </div>
          <Typography.Title level={2} data-timci-page-title={translate('pages.signup.sentTitle')}>
            {translate('pages.signup.sentTitle')}
          </Typography.Title>
          <Typography.Paragraph>{translate('pages.signup.sentBody')}</Typography.Paragraph>
          <Link to="/login">{translate('pages.signup.goLogin')}</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: '40rem', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Link to="/login" style={{ lineHeight: 0 }}>
            <TimciWordmark height={48} />
          </Link>
        </div>
        <Typography.Title level={2} data-timci-page-title={translate('pages.signup.title')}>
          {translate('pages.signup.title')}
        </Typography.Title>
        <Typography.Paragraph>{translate('pages.signup.intro')}</Typography.Paragraph>
        {catalogError ? (
          <Alert type="error" showIcon message={translate('pages.signup.catalogError')} />
        ) : null}
        {!catalog && !catalogError ? (
          <Typography.Paragraph>{translate('pages.signup.loading')}</Typography.Paragraph>
        ) : null}
        <Form
          form={form}
          layout="vertical"
          requiredMark
          disabled={!catalog || submitting}
          initialValues={{
            personType: 'legal_person',
            defaultPaymentTermDays: 5,
            paymentOptions: [{ name: 'Principal', details: '', currencyIds: [] }],
          }}
          onValuesChange={(changed) => {
            if ('countryId' in changed || 'personType' in changed) {
              if ('countryId' in changed && changed.countryId) {
                form.setFieldValue('defaultCountryId', changed.countryId);
              }
              const countryId = form.getFieldValue('countryId') as string | undefined;
              const personType = form.getFieldValue('personType') as string | undefined;
              const filtered = catalog ? filterDocumentTypes(catalog, countryId, personType) : [];
              const selected = form.getFieldValue('documentTypeId') as string | undefined;
              if (selected && !filtered.some((row) => row.id === selected)) {
                form.setFieldValue('documentTypeId', undefined);
              }
            }
            if ('supportedCurrencyIds' in changed) {
              const ids = (changed.supportedCurrencyIds as string[] | undefined) ?? [];
              if (ids.length === 1 && ids[0]) {
                form.setFieldsValue({ defaultCurrencyId: ids[0], baseCurrencyId: ids[0] });
                form.setFieldValue(['paymentOptions', 0, 'currencyIds'], [ids[0]]);
              }
            }
          }}
          onFinish={(values) => void onFinish(values)}
        >
          <TimciFormServerAlert messages={generalMessages} />
          <div
            inert
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '-10000px',
              width: 1,
              height: 1,
              overflow: 'hidden',
            }}
          >
            <input
              tabIndex={-1}
              autoComplete="off"
              name="timciHp"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
            />
          </div>
          <Card title={translate('pages.signup.identity')} style={{ marginBottom: 16 }}>
            <Form.Item
              label={translate('create.entity.personType')}
              name="personType"
              extra={translate('pages.signup.hints.personType')}
              rules={[{ required: true, message: translate('form.validation.requiredField') }]}
            >
              <Select
                options={[
                  { value: 'physical_person', label: translate('create.documentType.physical') },
                  { value: 'legal_person', label: translate('create.documentType.legal') },
                ]}
              />
            </Form.Item>
            <Form.Item
              label={translate('create.entity.entityName')}
              name="name"
              extra={translate('pages.signup.hints.entityName')}
              rules={[{ required: true, message: translate('form.validation.requiredField') }]}
            >
              <Input autoComplete="organization" />
            </Form.Item>
            <Form.Item
              label={translate('create.entity.country')}
              name="countryId"
              extra={translate('pages.signup.hints.country')}
              rules={[{ required: true, message: translate('form.validation.requiredField') }]}
            >
              <Select showSearch optionFilterProp="label" options={countryOptions} />
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
              {() => {
                const countryId = form.getFieldValue('countryId') as string | undefined;
                const personType = form.getFieldValue('personType') as string | undefined;
                const filtered = catalog ? filterDocumentTypes(catalog, countryId, personType) : [];
                const selected = form.getFieldValue('documentTypeId') as string | undefined;
                const hint = filtered.find((row) => row.id === selected)?.validationHint;
                const numberHelp = hint
                  ? translate('pages.signup.hints.documentNumberFormat', { format: hint })
                  : translate('pages.signup.hints.documentNumber');

                return (
                  <>
                    <Form.Item
                      label={translate('create.entity.documentType')}
                      name="documentTypeId"
                      extra={translate('pages.signup.hints.documentType')}
                      rules={[{ required: true, message: translate('form.validation.requiredField') }]}
                    >
                      <Select
                        showSearch
                        optionFilterProp="label"
                        options={filtered.map((row) => ({ value: row.id, label: row.name }))}
                        disabled={!countryId}
                      />
                    </Form.Item>
                    <Form.Item
                      label={translate('create.entity.documentNumber')}
                      name="documentNumber"
                      extra={numberHelp}
                      rules={[{ required: true, message: translate('form.validation.requiredField') }]}
                    >
                      <Input />
                    </Form.Item>
                  </>
                );
              }}
            </Form.Item>
          </Card>
          <Card title={translate('pages.signup.contact')} style={{ marginBottom: 16 }}>
            <Form.Item
              label={translate('create.entity.address')}
              name="address"
              extra={translate('pages.signup.hints.address')}
              rules={[{ required: true, message: translate('form.validation.requiredField') }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              label={translate('pages.signup.entityEmail')}
              name="email"
              extra={translate('pages.signup.hints.entityEmail')}
              rules={[
                { required: true, message: translate('form.validation.requiredField') },
                { type: 'email', message: translate('pages.login.errors.validEmail') },
              ]}
            >
              <Input type="email" autoComplete="email" />
            </Form.Item>
            <Form.Item
              label={translate('create.entity.phone')}
              name="phone"
              extra={translate('pages.signup.hints.phone')}
              rules={[{ required: true, message: translate('form.validation.requiredField') }]}
            >
              <Input type="tel" autoComplete="tel" />
            </Form.Item>
          </Card>
          <Card title={translate('pages.signup.operation')} style={{ marginBottom: 16 }}>
            <Form.Item
              label={translate('create.entity.defaultCountry')}
              name="defaultCountryId"
              extra={translate('pages.signup.hints.defaultCountry')}
              rules={[{ required: true, message: translate('form.validation.requiredField') }]}
            >
              <Select showSearch optionFilterProp="label" options={countryOptions} />
            </Form.Item>
            <Form.Item
              label={translate('create.entity.supportedCurrencies')}
              name="supportedCurrencyIds"
              extra={translate('pages.signup.hints.supportedCurrencies')}
              rules={[
                { required: true, message: translate('create.entity.supportedCurrenciesMinOne') },
              ]}
            >
              <Select mode="multiple" showSearch optionFilterProp="label" options={currencyOptions} />
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
              {() => {
                const supported = (form.getFieldValue('supportedCurrencyIds') as string[] | undefined) ?? [];
                const options = currencyOptions.filter((row) => supported.includes(row.value));

                return (
                  <>
                    <Form.Item
                      label={translate('create.entity.defaultCurrency')}
                      name="defaultCurrencyId"
                      extra={translate('pages.signup.hints.defaultCurrency')}
                      rules={[{ required: true, message: translate('form.validation.requiredField') }]}
                    >
                      <Select showSearch optionFilterProp="label" options={options} />
                    </Form.Item>
                    <Form.Item
                      label={translate('create.entity.baseCurrency')}
                      name="baseCurrencyId"
                      extra={translate('pages.signup.hints.baseCurrency')}
                      rules={[{ required: true, message: translate('form.validation.requiredField') }]}
                    >
                      <Select showSearch optionFilterProp="label" options={options} />
                    </Form.Item>
                  </>
                );
              }}
            </Form.Item>
            <Form.Item
              label={translate('create.entity.defaultPaymentTermDays')}
              name="defaultPaymentTermDays"
              extra={translate('pages.signup.hints.paymentTermDays')}
              rules={[{ required: true, message: translate('form.validation.requiredField') }]}
            >
              <InputNumber min={0} precision={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label={translate('create.entity.testNotificationEmail')}
              name="testNotificationEmail"
              extra={translate('create.entity.testNotificationEmailHint')}
              rules={[{ type: 'email', message: translate('pages.login.errors.validEmail') }]}
            >
              <Input type="email" />
            </Form.Item>
          </Card>
          <Card title={translate('create.entity.paymentOptionsSection')} style={{ marginBottom: 16 }}>
            <Typography.Paragraph type="secondary">
              {translate('pages.signup.hints.paymentSection')}
            </Typography.Paragraph>
            <Form.List name="paymentOptions">
              {(fields, { add, remove }) => (
                <div style={{ display: 'grid', gap: 12 }}>
                  {fields.map((field) => (
                    <div key={field.key} style={{ display: 'grid', gap: 8 }}>
                      <Form.Item
                        label={translate('create.entity.paymentOptionName')}
                        name={[field.name, 'name']}
                        extra={translate('pages.signup.hints.paymentOptionName')}
                        rules={[{ required: true, message: translate('form.validation.requiredField') }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        label={translate('create.entity.paymentOptionDetails')}
                        name={[field.name, 'details']}
                        extra={translate('pages.signup.hints.paymentOptionDetails')}
                      >
                        <Input.TextArea rows={2} />
                      </Form.Item>
                      <Form.Item noStyle shouldUpdate>
                        {() => {
                          const supported =
                            (form.getFieldValue('supportedCurrencyIds') as string[] | undefined) ?? [];
                          const options = currencyOptions.filter((row) => supported.includes(row.value));

                          return (
                            <Form.Item
                              label={translate('create.entity.paymentOptionCurrencies')}
                              name={[field.name, 'currencyIds']}
                              extra={translate('pages.signup.hints.paymentOptionCurrencies')}
                            >
                              <Select mode="multiple" optionFilterProp="label" options={options} />
                            </Form.Item>
                          );
                        }}
                      </Form.Item>
                      {fields.length > 1 ? (
                        <Button onClick={() => remove(field.name)}>
                          {translate('create.entity.removePaymentOption')}
                        </Button>
                      ) : null}
                    </div>
                  ))}
                  <Button onClick={() => add({ name: '', details: '', currencyIds: [] })}>
                    {translate('create.entity.addPaymentOption')}
                  </Button>
                </div>
              )}
            </Form.List>
          </Card>
          <Card title={translate('pages.signup.account')} style={{ marginBottom: 16 }}>
            <Form.Item
              label={translate('pages.signup.adminName')}
              name="adminName"
              extra={translate('pages.signup.hints.adminName')}
              rules={[{ required: true, message: translate('form.validation.requiredField') }]}
            >
              <Input autoComplete="name" />
            </Form.Item>
            <Form.Item
              label={translate('pages.signup.adminEmail')}
              name="adminEmail"
              extra={translate('pages.signup.hints.adminEmail')}
              rules={[
                { required: true, message: translate('form.validation.requiredField') },
                { type: 'email', message: translate('pages.login.errors.validEmail') },
              ]}
            >
              <Input type="email" autoComplete="username" />
            </Form.Item>
            <Form.Item
              label={translate('pages.signup.password')}
              name="password"
              extra={translate('pages.signup.passwordHint')}
              rules={[{ required: true, message: translate('form.validation.requiredField') }]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item
              label={translate('pages.signup.passwordConfirm')}
              name="passwordConfirm"
              extra={translate('pages.signup.hints.passwordConfirm')}
              dependencies={['password']}
              rules={[
                { required: true, message: translate('form.validation.requiredField') },
                ({ getFieldValue }) => ({
                  validator(_rule, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve();

                    return Promise.reject(new Error(translate('pages.signup.passwordMismatch')));
                  },
                }),
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
          </Card>
          <Button type="primary" htmlType="submit" loading={submitting} block>
            {translate('pages.signup.submit')}
          </Button>
          <Typography.Paragraph style={{ marginTop: 16 }}>
            <Link to="/login">{translate('pages.signup.goLogin')}</Link>
          </Typography.Paragraph>
        </Form>
      </div>
    </main>
  );
}
