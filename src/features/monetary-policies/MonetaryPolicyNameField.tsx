import { useTranslate } from '@refinedev/core';
import { Button, Form, Input, Space } from 'antd';
import { useEffect, useRef } from 'react';
import { normalizeMonetaryPolicyParams } from './MonetaryPolicyParamsFields.js';
import { formatRelativeBandsShortName } from './MonetaryPolicyParamsSummary.js';

type Props = {
  disabled?: boolean;
  kind?: string;
};

/**
 * Name field that auto-suggests a compact label from relative_bands params.
 * Stops overwriting once the user edits the name (until "Regenerar nombre").
 */
export function MonetaryPolicyNameField({ disabled, kind = 'relative_bands' }: Props) {
  const translate = useTranslate();
  const form = Form.useFormInstance();
  const params = Form.useWatch('params', form) as Record<string, unknown> | undefined;
  const name = Form.useWatch('name', form) as string | undefined;

  const lockedRef = useRef(false);
  const prevSuggestedRef = useRef<string | null>(null);

  const apiParams =
    kind === 'none' ? null : normalizeMonetaryPolicyParams(kind, params);
  const suggested =
    kind === 'none'
      ? translate('pages.monetaryPolicies.kindLabels.none')
      : formatRelativeBandsShortName(apiParams, translate);

  useEffect(() => {
    if (disabled || !suggested) return;

    if (prevSuggestedRef.current === null) {
      prevSuggestedRef.current = suggested;
      if (!name?.trim()) {
        form.setFieldValue('name', suggested);
      }
      return;
    }

    if (suggested === prevSuggestedRef.current) return;

    if (!lockedRef.current && (!name?.trim() || name === prevSuggestedRef.current)) {
      form.setFieldValue('name', suggested);
    } else if (name?.trim() && name !== prevSuggestedRef.current) {
      lockedRef.current = true;
    }
    prevSuggestedRef.current = suggested;
  }, [suggested, name, form, disabled]);

  return (
    <Form.Item
      label={translate('table.monetaryPolicies.name')}
      name="name"
      style={{ marginTop: 24 }}
      rules={[{ required: true, message: translate('form.validation.requiredField') }]}
      extra={
        <Space size="middle" wrap>
          <span>{translate('pages.monetaryPolicies.nameAutoHint')}</span>
          {!disabled && suggested && (
            <Button
              type="link"
              size="small"
              style={{ padding: 0, height: 'auto' }}
              onClick={() => {
                lockedRef.current = false;
                prevSuggestedRef.current = suggested;
                form.setFieldValue('name', suggested);
              }}
            >
              {translate('pages.monetaryPolicies.nameRegenerate')}
            </Button>
          )}
        </Space>
      }
    >
      <Input.TextArea
        rows={2}
        maxLength={2000}
        showCount
        disabled={disabled}
        onChange={() => {
          lockedRef.current = true;
        }}
      />
    </Form.Item>
  );
}
