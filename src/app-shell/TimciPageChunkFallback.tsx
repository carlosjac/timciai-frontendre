import { Spin } from 'antd';
import { esMessages } from '../i18n/locale.es.js';

/** Fallback while a route chunk loads (same visual language as route guards). */
export function TimciPageChunkFallback() {
  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', padding: '48px 16px' }}
      role="status"
      aria-label={esMessages.app.loadingPage}
    >
      <Spin size="large" />
    </div>
  );
}
