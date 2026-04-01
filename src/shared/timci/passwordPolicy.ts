/** Misma regla que timci-admin (UserCreate / ChangePasswordDialog). */
export function isTimciPasswordPolicyValid(p: string): boolean {
  return (
    p.length >= 8 &&
    /[A-Z]/.test(p) &&
    /[a-z]/.test(p) &&
    /[0-9]/.test(p) &&
    /[^A-Za-z0-9]/.test(p)
  );
}
