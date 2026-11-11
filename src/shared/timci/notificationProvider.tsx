import type { NotificationProvider } from '@refinedev/core';
import { useTranslate } from '@refinedev/core';
import { App, Button } from 'antd';

/**
 * Same contract as Refine's Ant Design provider, anchored bottom-right so it
 * does not cover page header actions (Registrar, Guardar, Crear).
 * Errors stay until dismissed. Success closes on its own.
 */
export function useTimciNotificationProvider(): NotificationProvider {
  const { notification } = App.useApp();
  const translate = useTranslate();

  const notificationProvider: NotificationProvider = {
    open: ({ key, message, description, type, cancelMutation, undoableTimeout }) => {
      if (type === 'progress') {
        notification.open({
          key,
          placement: 'bottomRight',
          duration: undoableTimeout != null ? undoableTimeout / 1000 : 5,
          message: description ?? null,
          description: message,
          btn: cancelMutation ? (
            <Button
              type="link"
              onClick={() => {
                cancelMutation();
                notification.destroy(key ?? '');
              }}
            >
              {translate('buttons.cancel')}
            </Button>
          ) : undefined,
        });
        return;
      }

      const isError = type === 'error';
      notification.open({
        key,
        placement: 'bottomRight',
        type: isError ? 'error' : type === 'success' ? 'success' : 'info',
        message: description ?? message,
        description: description ? message : undefined,
        duration: isError ? 0 : 4,
      });
    },
    close: (key) => notification.destroy(key),
  };

  return notificationProvider;
}
