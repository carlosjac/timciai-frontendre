import { App } from 'antd';
import type { NotificationInstance } from 'antd/es/notification/interface';
import { useMemo } from 'react';

const PLACEMENT = 'bottomRight' as const;

export type TimciNotify = {
  success: (description: string) => void;
  error: (description: string) => void;
  warning: (description: string) => void;
};

export function createTimciNotify(notification: NotificationInstance): TimciNotify {
  const open = (type: 'success' | 'error' | 'warning', description: string) => {
    notification.open({
      type,
      message: description,
      placement: PLACEMENT,
      duration: type === 'error' ? 0 : 4,
    });
  };
  return {
    success: (description) => open('success', description),
    error: (description) => open('error', description),
    warning: (description) => open('warning', description),
  };
}

export function useTimciNotify(): TimciNotify {
  const { notification } = App.useApp();
  return useMemo(() => createTimciNotify(notification), [notification]);
}
