import { useTranslate } from '@refinedev/core';
import { Form, Select } from 'antd';
import { useEffect, useState } from 'react';
import {
  fetchActiveMonetaryPolicies,
  type MonetaryPolicyListItem,
} from '../../shared/timci/monetaryPoliciesApi.js';

type Props = {
  tenantId: string;
  entityId: string;
  /** Form field name; default `defaultMonetaryPolicyId`. */
  name?: string;
  required?: boolean;
  labelKey?: string;
};

/**
 * Select of active monetary policies for the entity (default assignment).
 */
export function MonetaryPolicyDefaultSelect({
  tenantId,
  entityId,
  name = 'defaultMonetaryPolicyId',
  required = true,
  labelKey = 'create.entity.defaultMonetaryPolicy',
}: Props) {
  const translate = useTranslate();
  const enabled = Boolean(tenantId && entityId);
  const [options, setOptions] = useState<MonetaryPolicyListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const items = await fetchActiveMonetaryPolicies(tenantId, entityId);
        if (!cancelled) setOptions(items);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, tenantId, entityId]);

  return (
    <Form.Item
      label={translate(labelKey)}
      name={name}
      rules={
        required
          ? [{ required: true, message: translate('form.validation.requiredField') }]
          : undefined
      }
    >
      <Select
        showSearch
        loading={enabled && loading}
        optionFilterProp="label"
        allowClear={!required}
        options={(enabled ? options : []).map((p) => ({
          value: p.id,
          label: p.name.replace(/\s+/g, ' ').trim(),
        }))}
        placeholder={translate('create.entity.defaultMonetaryPolicyPlaceholder')}
      />
    </Form.Item>
  );
}
