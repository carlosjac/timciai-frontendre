import { useTranslate } from '@refinedev/core';
import { Select, Space, theme } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { getV1Base, TENANT_STORAGE_KEY } from '../config.js';
import { getStoredTenantId, setStoredTenantId } from '../shared/timci/apiUrl.js';
import { timciFetch } from '../shared/timci/http.js';

type TenantOption = { id: string; name: string };

type TenantPickerProps = {
  /** Narrow header: full-width select and smaller min width. */
  compact?: boolean;
};

/**
 * Lista de organizaciones desde GET /authorization/me/tenants (mismo criterio que `frontend` TenantProvider).
 */
export function TenantPicker({ compact = false }: TenantPickerProps) {
  const { token } = theme.useToken();
  const translate = useTranslate();
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState<string | null>(() => getStoredTenantId());

  const applySelection = useCallback((list: TenantOption[], stored: string | null) => {
    const validStored = stored && list.some((t) => t.id === stored);
    const id = validStored ? stored : (list[0]?.id ?? null);
    setValue(id);
    if (id) setStoredTenantId(id);
    else if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TENANT_STORAGE_KEY);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const v1 = getV1Base();
      const { json } = await timciFetch(`${v1}/authorization/me/tenants`);
      const data = json as { tenants?: TenantOption[] };
      const list = Array.isArray(data?.tenants) ? data.tenants : [];
      setTenants(list);
      applySelection(list, getStoredTenantId());
    } catch {
      setTenants([]);
      setValue(null);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(TENANT_STORAGE_KEY);
      }
    } finally {
      setLoading(false);
    }
  }, [applySelection]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== TENANT_STORAGE_KEY) return;
      setValue(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <Space
      size="small"
      wrap
      style={compact ? { width: '100%' } : undefined}
    >
      <label
        htmlFor="timci-tenant-select"
        style={{
          color: token.colorTextSecondary,
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          whiteSpace: compact ? 'normal' : undefined,
        }}
      >
        {translate('tenant.label')}
      </label>
      <Select
        id="timci-tenant-select"
        allowClear
        showSearch
        placeholder={translate('tenant.placeholder')}
        style={{
          minWidth: compact ? 140 : 220,
          maxWidth: '100%',
          width: compact ? '100%' : undefined,
          flex: compact ? '1 1 auto' : undefined,
        }}
        loading={loading}
        value={value ?? undefined}
        options={tenants.map((t) => ({ value: t.id, label: t.name }))}
        optionFilterProp="label"
        onChange={(id) => {
          if (id == null) {
            localStorage.removeItem(TENANT_STORAGE_KEY);
            setValue(null);
          } else {
            setStoredTenantId(id);
            setValue(id);
          }
          window.location.reload();
        }}
      />
    </Space>
  );
}
