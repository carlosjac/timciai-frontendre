import { ThemedSider } from '@refinedev/antd';
import type { RefineThemedLayoutSiderProps } from '@refinedev/antd';

/**
 * Default Refine sider but without the bottom "Logout" item (logout lives in the header menu).
 */
export function TimciThemedSider(props: RefineThemedLayoutSiderProps) {
  return <ThemedSider {...props} render={({ items }) => items} />;
}
