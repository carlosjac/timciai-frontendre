import { useTranslate } from '@refinedev/core';
import { App } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

export function useTimciInactiveEditRedirect(options: {
  formLoading: boolean;
  record: { id?: string; isActive?: boolean } | undefined;
  showPathForId: (id: string) => string;
  warningMessageKey: string;
}): boolean {
  const { formLoading, record, showPathForId, warningMessageKey } = options;
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const { message } = App.useApp();
  const translate = useTranslate();

  useEffect(() => {
    if (formLoading || record === undefined) return;
    if (record.isActive === false) {
      const recordId = record.id ?? routeId;
      if (recordId) {
        message.warning(translate(warningMessageKey));
        navigate(showPathForId(String(recordId)), { replace: true });
      }
    }
  }, [formLoading, message, navigate, record, routeId, showPathForId, translate, warningMessageKey]);

  return !formLoading && record?.isActive === false;
}
