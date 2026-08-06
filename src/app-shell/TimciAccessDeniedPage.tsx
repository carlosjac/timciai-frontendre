import { usePermissions, useTranslate } from '@refinedev/core';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router';
import {
  getFirstAccessibleListPath,
  type TimciPermissionsData,
} from '../shared/timci/actionCodes.js';

/**
 * Shown when the user opens a deep link / route without the required action code.
 */
export function TimciAccessDeniedPage() {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { data: permData } = usePermissions<TimciPermissionsData>({});

  const title = translate('pages.accessDenied.title');
  const description = translate('pages.accessDenied.description');
  const goHomeLabel = translate('pages.accessDenied.goHome');

  return (
    <main aria-labelledby="timci-access-denied-title">
      <Result
        status="403"
        title={<span id="timci-access-denied-title">{title}</span>}
        subTitle={description}
        extra={
          <Button
            type="primary"
            onClick={() => {
              const codes = permData?.actionCodes ?? [];
              navigate(getFirstAccessibleListPath(codes), { replace: true });
            }}
          >
            {goHomeLabel}
          </Button>
        }
      />
    </main>
  );
}
