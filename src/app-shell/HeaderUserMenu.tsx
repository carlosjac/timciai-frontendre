import { useGetIdentity, useLogout, useTranslate } from '@refinedev/core';
import {
  DownOutlined,
  KeyOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Space, Spin, type MenuProps } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router';

type MeIdentity = { id: string; name: string; email: string };

type HeaderUserMenuProps = {
  compact?: boolean;
};

export function HeaderUserMenu({ compact = false }: HeaderUserMenuProps) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();
  const { data: identity, isLoading } = useGetIdentity<MeIdentity>();
  const [menuOpen, setMenuOpen] = useState(false);

  const items: MenuProps['items'] = [
    {
      key: 'preferences',
      icon: <SettingOutlined />,
      label: translate('nav.preferences'),
      onClick: () => navigate('/preferences'),
    },
    {
      key: 'change-password',
      icon: <KeyOutlined />,
      label: translate('nav.changePassword'),
      onClick: () => navigate('/change-password'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: translate('header.logout'),
      onClick: () => {
        logout();
      },
    },
  ];

  const displayName = identity?.name ?? identity?.email ?? '…';

  const accountMenuLabel = translate('header.accountMenu');
  const triggerAriaLabel = `${accountMenuLabel}, ${displayName}`;

  return (
    <Dropdown
      menu={{ items }}
      trigger={['click']}
      placement="bottomRight"
      open={menuOpen}
      onOpenChange={setMenuOpen}
    >
      <Button
        type="text"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={triggerAriaLabel}
        style={{
          height: 'auto',
          padding: '4px 10px',
          maxWidth: compact ? '100%' : undefined,
        }}
      >
        <Space size={6} style={{ maxWidth: '100%' }}>
          {isLoading ? <Spin size="small" aria-label={accountMenuLabel} /> : <UserOutlined aria-hidden />}
          <span
            style={{
              maxWidth: compact ? 120 : 220,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              verticalAlign: 'middle',
            }}
          >
            {displayName}
          </span>
          <DownOutlined style={{ fontSize: 10, opacity: 0.75 }} aria-hidden />
        </Space>
      </Button>
    </Dropdown>
  );
}
