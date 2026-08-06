/** sessionStorage: after explicit logout, next successful login goes home (ignore `?to=`). */
export const POST_LOGOUT_LOGIN_HOME_KEY = 'timci.postLogoutLoginHome';

export function markPostLogoutLoginHome(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(POST_LOGOUT_LOGIN_HOME_KEY, '1');
}

export function consumePostLogoutLoginHome(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  const marked = sessionStorage.getItem(POST_LOGOUT_LOGIN_HOME_KEY) === '1';
  if (marked) sessionStorage.removeItem(POST_LOGOUT_LOGIN_HOME_KEY);
  return marked;
}

export function isPostLogoutLoginHome(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(POST_LOGOUT_LOGIN_HOME_KEY) === '1';
}
