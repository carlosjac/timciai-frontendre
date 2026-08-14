import { useParams } from 'react-router';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { TimciImportJobPanel } from '../../shared/timci/import/TimciImportJobPanel.js';

export function CustomerImportJobShow() {
  const { jobId } = useParams<{ jobId: string }>();
  const tenantId = getStoredTenantId();

  return (
    <TimciImportJobPanel
      tenantId={tenantId}
      jobId={jobId ?? ''}
      backPath="/customers/import-jobs"
      titleKey="pages.customers.import.resultsTitle"
    />
  );
}
