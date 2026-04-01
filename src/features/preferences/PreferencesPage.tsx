import { List } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { App, Button, Card, Form, Radio, Select, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { useUserPreferences } from './useUserPreferences.js';
import {
  getTimeZoneSelectOptions,
  timeZoneOptionMatchesQuery,
} from './timeZones.js';
import {
  ALLOWED_DATE_FORMATS,
  type UserPreferencesState,
} from './storage.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';

const DATE_FORMAT_LABEL_KEYS: Record<(typeof ALLOWED_DATE_FORMATS)[number], string> = {
  'DD/MM/YYYY': 'pages.preferences.dateFormats.ddmmyyyy',
  'YYYY-MM-DD': 'pages.preferences.dateFormats.yyyymmdd',
  'MM/DD/YYYY': 'pages.preferences.dateFormats.mmddyyyy',
};

const DATE_FORMAT_OPTIONS = ALLOWED_DATE_FORMATS.map((value) => ({
  value,
  labelKey: DATE_FORMAT_LABEL_KEYS[value],
}));

type FormValues = Pick<UserPreferencesState, 'timeZone' | 'dateFormat' | 'theme'>;

const PREF_FIELD_NAMES: readonly string[] = ['timeZone', 'dateFormat', 'theme'];

export function PreferencesPage() {
  const translate = useTranslate();
  const { message } = App.useApp();
  const prefs = useUserPreferences();
  const [form] = Form.useForm<FormValues>();
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: PREF_FIELD_NAMES,
  });

  const tzOptions = useMemo(() => getTimeZoneSelectOptions(), []);

  const dateFormatOptions = useMemo(
    () =>
      DATE_FORMAT_OPTIONS.map((o) => ({
        value: o.value,
        label: translate(o.labelKey, undefined, o.value),
      })),
    [translate],
  );

  useEffect(() => {
    form.setFieldsValue({
      timeZone: prefs.timeZone,
      dateFormat: prefs.dateFormat,
      theme: prefs.theme,
    });
  }, [form, prefs.timeZone, prefs.dateFormat, prefs.theme]);

  const watchedFormat = Form.useWatch('dateFormat', form) ?? prefs.dateFormat;
  const watchedTz = Form.useWatch('timeZone', form) ?? prefs.timeZone;

  const previewSample = useMemo(() => {
    try {
      return dayjs().tz(watchedTz).format(watchedFormat);
    } catch {
      return dayjs().format(watchedFormat);
    }
  }, [watchedFormat, watchedTz]);

  const onFinish = async (values: FormValues) => {
    clearServerErrors(form);
    try {
      prefs.setPreferences(values);
      message.success(translate('pages.preferences.saved'));
    } catch (e: unknown) {
      applyServerError(form, e);
    }
  };

  return (
    <List title={translate('pages.preferences.title')}>
      <Card style={{ maxWidth: 560, width: '100%' }}>
        <Form<FormValues>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={() => clearServerErrors(form)}
        >
          <TimciFormServerAlert messages={generalMessages} />
          <Form.Item
            name="timeZone"
            label={translate('pages.preferences.fields.timeZone')}
            rules={[{ required: true, message: translate('pages.preferences.validation.timeZone') }]}
          >
            <Select
              showSearch
              options={tzOptions}
              popupMatchSelectWidth={false}
              dropdownStyle={{ minWidth: 320 }}
              filterOption={(input, option) =>
                timeZoneOptionMatchesQuery(String(option?.label ?? ''), input)
              }
            />
          </Form.Item>

          <Form.Item
            name="dateFormat"
            label={translate('pages.preferences.fields.dateFormat')}
            rules={[{ required: true, message: translate('pages.preferences.validation.dateFormat') }]}
          >
            <Select
              options={dateFormatOptions}
              aria-describedby="timci-preferences-preview"
            />
          </Form.Item>

          <Form.Item
            name="theme"
            label={translate('pages.preferences.fields.theme')}
            rules={[{ required: true, message: translate('pages.preferences.validation.theme') }]}
          >
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              style={{ display: 'flex', width: '100%' }}
            >
              <Radio.Button value="light" style={{ flex: 1, textAlign: 'center' }}>
                {translate('pages.preferences.theme.light')}
              </Radio.Button>
              <Radio.Button value="dark" style={{ flex: 1, textAlign: 'center' }}>
                {translate('pages.preferences.theme.dark')}
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Typography.Paragraph
            id="timci-preferences-preview"
            type="secondary"
            style={{ marginBottom: 16 }}
          >
            {translate('pages.preferences.preview')}: <Typography.Text code>{previewSample}</Typography.Text>
          </Typography.Paragraph>

          <Button type="primary" htmlType="submit">
            {translate('pages.preferences.save')}
          </Button>
        </Form>
      </Card>
    </List>
  );
}
