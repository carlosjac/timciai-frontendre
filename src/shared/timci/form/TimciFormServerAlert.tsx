import { useTranslate } from '@refinedev/core';
import { Alert } from 'antd';
import { useEffect, useRef } from 'react';

type TimciFormServerAlertProps = {
  messages: string[];
};

/**
 * Errores de servidor dentro del formulario: visibles hasta que se limpien al reenviar o con éxito.
 * No usa notificación flotante.
 */
export function TimciFormServerAlert({ messages }: TimciFormServerAlertProps) {
  const translate = useTranslate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0 && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div ref={ref}>
      <Alert
        type="error"
        showIcon
        role="alert"
        aria-live="assertive"
        style={{ marginBottom: 16 }}
        message={translate('form.serverError.title')}
        description={
          messages.length === 1 ? (
            messages[0]
          ) : (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {messages.map((m, i) => (
                <li key={`${i}-${m.slice(0, 24)}`}>{m}</li>
              ))}
            </ul>
          )
        }
      />
    </div>
  );
}
