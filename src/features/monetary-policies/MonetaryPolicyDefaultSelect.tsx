import { useTranslate } from '@refinedev/core';
import { Form, Select } from 'antd';
import { useEffect, useState } from 'react';
import { fetchActiveMonetaryPolicies } from '../../shared/timci/monetaryPoliciesApi.js';

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
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const handle = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        try {
          const items = await fetchActiveMonetaryPolicies(tenantId, entityId, search);
          if (!cancelled) {
            setOptions(
              items.map((policy) => ({
                value: policy.id,
                label: policy.name.replace(/\s+/g, ' ').trim(),
              })),
            );
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [enabled, tenantId, entityId, search]);

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
        filterOption={false}
        onSearch={setSearch}
        loading={enabled && loading}
        allowClear={!required}
        options={enabled ? options : []}
        placeholder={translate('create.entity.defaultMonetaryPolicyPlaceholder')}
      />
    </Form.Item>
  );
}
