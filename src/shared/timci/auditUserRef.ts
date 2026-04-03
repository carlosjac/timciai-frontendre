/**
 * Mirrors backend `AuditUserRef`: persisted user id + display name from the same BC read model.
 */
export type TimciAuditUserRef = {
  id: string;
  name: string;
};
