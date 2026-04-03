import { useTranslate } from '@refinedev/core';
import { Collapse, Space, theme } from 'antd';
import type { CSSProperties, ReactNode } from 'react';
import type { TimciAuditUserRef } from '../auditUserRef.js';
import { timciAuditUserDisplayText } from '../auditUserDisplay.js';
import { formatTimciUserDateTime, type TimciUserDateTimePrefs } from '../formatUserDateTime.js';

export type TimciFormAuditLabelKeys = {
  sectionTitle: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

const DEFAULT_LABEL_KEYS: TimciFormAuditLabelKeys = {
  sectionTitle: 'audit.sectionTitle',
  createdAt: 'audit.createdAt',
  updatedAt: 'audit.updatedAt',
  createdBy: 'audit.createdBy',
  updatedBy: 'audit.updatedBy',
};

export type TimciFormAuditCollapseProps = TimciUserDateTimePrefs & {
  createdAt?: unknown;
  updatedAt?: unknown;
  /** Backend `AuditUserRef` (`{ id, name }`). */
  createdBy?: TimciAuditUserRef | null;
  updatedBy?: TimciAuditUserRef | null;
  /** Claves i18n; por defecto `audit.*` */
  labelKeys?: Partial<TimciFormAuditLabelKeys>;
  /** Contenido extra dentro del panel (debajo de las filas estándar) */
  extra?: ReactNode;
  style?: CSSProperties;
  maxWidth?: number;
};

function hasNonEmptyString(v: unknown): boolean {
  return v != null && String(v).trim() !== '';
}

function auditRefHasSomething(ref: TimciAuditUserRef | null | undefined): boolean {
  if (ref == null) return false;
  const id = typeof ref.id === 'string' ? ref.id.trim() : '';
  const name = typeof ref.name === 'string' ? ref.name.trim() : '';
  return id !== '' || name !== '';
}

/**
 * Panel colapsable con filas de auditoría (fechas con formato y zona del usuario, con segundos).
 * Úsalo en formularios de edición pasando `dateFormat` y `timeZone` desde `useUserPreferences()`.
 */
export function TimciFormAuditCollapse(props: TimciFormAuditCollapseProps) {
  const translate = useTranslate();
  const { token } = theme.useToken();
  const keys = { ...DEFAULT_LABEL_KEYS, ...props.labelKeys };

  const rows: { key: string; content: ReactNode }[] = [];

  if (hasNonEmptyString(props.createdAt)) {
    rows.push({
      key: 'createdAt',
      content: (
        <div style={{ color: token.colorTextSecondary }}>
          {translate(keys.createdAt)}:{' '}
          {formatTimciUserDateTime(props.createdAt, props)}
        </div>
      ),
    });
  }
  if (hasNonEmptyString(props.updatedAt)) {
    rows.push({
      key: 'updatedAt',
      content: (
        <div style={{ color: token.colorTextSecondary }}>
          {translate(keys.updatedAt)}:{' '}
          {formatTimciUserDateTime(props.updatedAt, props)}
        </div>
      ),
    });
  }
  if (auditRefHasSomething(props.createdBy)) {
    const label = timciAuditUserDisplayText(
      { createdBy: props.createdBy ?? undefined },
      'created',
    );
    rows.push({
      key: 'createdBy',
      content: (
        <div style={{ color: token.colorTextSecondary }}>
          {translate(keys.createdBy)}:{' '}
          {label || translate('audit.userNameUnavailable')}
        </div>
      ),
    });
  }
  if (auditRefHasSomething(props.updatedBy)) {
    const label = timciAuditUserDisplayText(
      { updatedBy: props.updatedBy ?? undefined },
      'updated',
    );
    rows.push({
      key: 'updatedBy',
      content: (
        <div style={{ color: token.colorTextSecondary }}>
          {translate(keys.updatedBy)}:{' '}
          {label || translate('audit.userNameUnavailable')}
        </div>
      ),
    });
  }

  if (rows.length === 0 && props.extra == null) {
    return null;
  }

  return (
    <Collapse
      bordered={false}
      style={{ marginTop: 16, maxWidth: props.maxWidth ?? 640, ...props.style }}
      items={[
        {
          key: 'audit',
          label: translate(keys.sectionTitle),
          children: (
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {rows.map((r) => (
                <span key={r.key}>{r.content}</span>
              ))}
              {props.extra}
            </Space>
          ),
        },
      ]}
    />
  );
}
