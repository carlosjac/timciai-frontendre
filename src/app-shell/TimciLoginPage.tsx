import { AuthPage } from '@refinedev/antd';
import { Navigate, useSearchParams } from 'react-router';
import { esMessages } from '../i18n/locale.es.js';
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
    <main style={{ minHeight: '100vh' }} aria-label={esMessages.pages.login.title}>
      <AuthPage type="login" registerLink={false} forgotPasswordLink={false} />
    </main>
  );
}
