import { Grid } from 'antd';
import type { CSSProperties } from 'react';

const contentStyle: CSSProperties = { overflowWrap: 'anywhere' };

/**
 * Description label width is comfortable on desktop and dropped on narrow screens
 * so a long id or email can wrap instead of widening the page.
 */
export function useTimciDescriptionStyles(): {
  label: CSSProperties;
  content: CSSProperties;
} {
  const screens = Grid.useBreakpoint();
  const narrow = screens.sm === false;

  return {
    label: narrow
      ? { verticalAlign: 'top' }
      : { width: 220, maxWidth: 280, verticalAlign: 'top' },
    content: contentStyle,
  };
}
