import { useThemedLayoutContext } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { MenuOutlined } from '@ant-design/icons';
import { Button, Grid, Space } from 'antd';
import { HeaderUserMenu } from './HeaderUserMenu.js';
import { TenantPicker } from './TenantPicker.js';

export function AppHeader() {
  const translate = useTranslate();
  const { setMobileSiderOpen } = useThemedLayoutContext();
  const screens = Grid.useBreakpoint();
  const comfortable = !!screens.md;
  /** Same breakpoint as Refine ThemedSider (drawer below `lg`). */
  const mobileNav = screens.lg === false;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        width: '100%',
        paddingInline: 16,
        gap: 8,
        rowGap: 8,
      }}
    >
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {mobileNav ? (
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: 18 }} />}
            onClick={() => setMobileSiderOpen(true)}
            aria-label={translate('header.openNavigation')}
          />
        ) : null}
      </div>

      <Space
        size={comfortable ? 'middle' : 'small'}
        align="center"
        wrap
        style={{
          marginLeft: 'auto',
          justifyContent: 'flex-end',
          flex: '0 1 auto',
          minWidth: 0,
        }}
      >
        <TenantPicker compact={!comfortable} />
        {comfortable ? (
          <HeaderUserMenu />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <HeaderUserMenu compact />
          </div>
        )}
      </Space>
    </div>
  );
}
