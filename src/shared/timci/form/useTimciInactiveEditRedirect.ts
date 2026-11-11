import { useTranslate } from '@refinedev/core';

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTimciNotify } from '../notifyTimci.js';

export function useTimciInactiveEditRedirect(options: {
  formLoading: boolean;
  record: { id?: string; isActive?: boolean } | undefined;
  showPathForId: (id: string) => string;
  warningMessageKey: string;
}): boolean {
  const { formLoading, record, showPathForId, warningMessageKey } = options;
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const notify = useTimciNotify();
  const translate = useTranslate();

  useEffect(() => {
    if (formLoading || record === undefined) return;
    if (record.isActive === false) {
      const recordId = record.id ?? routeId;
      if (recordId) {
        notify.warning(translate(warningMessageKey));
        navigate(showPathForId(String(recordId)), { replace: true });
      }
    }
  }, [formLoading, notify, navigate, record, routeId, showPathForId, translate, warningMessageKey]);

  return !formLoading && record?.isActive === false;
}
