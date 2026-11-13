import { usePermissions, useTranslate } from '@refinedev/core';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router';
import {
  getFirstAccessibleListPath,
  type TimciPermissionsData,
} from '../shared/timci/actionCodes.js';

/**
 * Shown for authenticated routes that do not match any defined path.
 */
export function TimciNotFoundPage() {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { data: permData } = usePermissions<TimciPermissionsData>({});

  const title = translate('pages.notFound.title');
  const description = translate('pages.notFound.description');
  const goHomeLabel = translate('pages.notFound.goHome');

  return (
    <main aria-labelledby="timci-not-found-title">
      <Result
        status="404"
        title={
          <span id="timci-not-found-title" data-timci-page-title={title}>
            {title}
          </span>
        }
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
