import { AuthPage } from '@refinedev/antd';
import { Typography } from 'antd';
import { Link, Navigate, useSearchParams } from 'react-router';
import { esMessages } from '../i18n/locale.es.js';
import { TimciWordmark } from './TimciBrand.js';
import { isPostLogoutLoginHome } from '../shared/timci/postLogoutLoginHome.js';
import { sanitizeLoginReturnTo } from '../shared/timci/safeLoginReturnTo.js';

/**
 * Login entry.
 * - Deep link while logged out: keep safe Refine `?to=` so login returns there.
 * - After explicit logout, or unsafe `?to=`: drop `to` → authProvider `redirectTo` (home).
 */
export function TimciLoginPage() {
  const [searchParams] = useSearchParams();
  const rawTo = searchParams.get('to');

  if (isPostLogoutLoginHome() && rawTo != null) {
    return <Navigate to="/login" replace />;
  }

  if (rawTo != null && sanitizeLoginReturnTo(rawTo) == null) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main
      style={{ minHeight: '100vh' }}
      aria-label={esMessages.pages.login.title}
      data-timci-page-title={esMessages.pages.login.title}
    >
      <AuthPage
        type="login"
        title={
          <Link to="/" style={{ lineHeight: 0 }}>
            <TimciWordmark height={48} />
          </Link>
        }
        rememberMe={false}
        forgotPasswordLink={false}
        registerLink={
          <Typography.Paragraph style={{ marginTop: 8, marginBottom: 0, fontSize: 12 }}>
            {esMessages.pages.login.buttons.noAccount}{' '}
            <Link to="/signup">{esMessages.pages.login.requestSignup}</Link>
          </Typography.Paragraph>
        }
      />
    </main>
  );
}
