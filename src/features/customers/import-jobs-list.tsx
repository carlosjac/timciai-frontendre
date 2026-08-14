import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { TimciImportJobList } from '../../shared/timci/import/TimciImportJobList.js';

export function CustomerImportJobsList() {
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = getStoredTenantId();

  return (
    <TimciImportJobList
      tenantId={tenantId}
      resource="customers"
      titleKey="pages.customers.import.historyTitle"
      backPath="/customers"
      detailPath={(jobId) => `/customers/import-jobs/${encodeURIComponent(jobId)}`}
      datePrefs={{ dateFormat, timeZone }}
    />
  );
}
