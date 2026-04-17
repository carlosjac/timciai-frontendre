import { useLink, useMenu, usePermissions, type TreeMenuItem } from '@refinedev/core';
import { ThemedTitle, useThemedLayoutContext, type RefineThemedLayoutSiderProps } from '@refinedev/antd';
import {
  BarsOutlined,
  LeftOutlined,
  RightOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Button, ConfigProvider, Drawer, Grid, Layout, Menu, Spin, theme, type MenuProps } from 'antd';
import { useContext, useMemo, type CSSProperties } from 'react';
import {
  canSeeResourceMenuItem,
  type TimciPermissionsData,
} from '../shared/timci/actionCodes.js';

const DRAWER_MENU_BUTTON_STYLE: CSSProperties = {
  borderStartStartRadius: 0,
  borderEndStartRadius: 0,
  position: 'fixed',
  top: 64,
  zIndex: 999,
};

type MenuBuildCtx = {
  selectedKey: string | undefined;
  siderCollapsed: boolean;
  activeItemDisabled: boolean;
  Link: ReturnType<typeof useLink>;
};

/**
 * Misma regla que `accessControlProvider` + `CanAccess`: visibilidad por `menu.*` en action-codes.
 * Filtramos el árbol aquí para poder usar `Menu` con `items` sin filas vacías.
 */
function filterMenuTreeByCodes(tree: TreeMenuItem[], codes: string[]): TreeMenuItem[] {
  const out: TreeMenuItem[] = [];
  for (const item of tree) {
    if (item.children.length > 0) {
      if (!canSeeResourceMenuItem(item.name, codes)) continue;
      const kids = filterMenuTreeByCodes(item.children, codes);
      if (kids.length === 0) continue;
      out.push({ ...item, children: kids });
    } else if (canSeeResourceMenuItem(item.name, codes)) {
      out.push(item);
    }
  }
  return out;
}

function treeToMenuItems(
  tree: TreeMenuItem[],
  ctx: MenuBuildCtx,
): NonNullable<MenuProps['items']> {
  return tree.map((item) => {
    const { key, name, children, meta, list: route } = item;
    const labelText = item?.label ?? meta?.label ?? name;
    const icon = meta?.icon;
    const { Link } = ctx;

    if (children.length > 0) {
      return {
        key: item.key,
        icon: icon ?? <UnorderedListOutlined />,
        label: labelText,
        children: treeToMenuItems(children, ctx),
      };
    }

    const isSelected = key === ctx.selectedKey;
    const parentName = meta?.parent;
    const isRoute = !(parentName !== undefined && children.length === 0);
    const linkStyle: CSSProperties =
      ctx.activeItemDisabled && isSelected ? { pointerEvents: 'none' } : {};

    return {
      key: item.key,
      icon: icon ?? (isRoute ? <UnorderedListOutlined /> : undefined),
      label: (
        <>
          <Link to={route ?? ''} style={linkStyle}>
            {labelText}
          </Link>
          {!ctx.siderCollapsed && isSelected ? <div className="ant-menu-tree-arrow" /> : null}
        </>
      ),
    };
  });
}

/**
 * Sider del layout Refine sin ítem "Logout" (el cierre de sesión está en el header).
 * Usa `Menu` con `items` (sin API deprecada `children`) y filtra entradas con los mismos
 * `actionCodes` que `getPermissions` / `accessControlProvider` (solo frontend).
 */
export function TimciThemedSider({
  Title: TitleFromProps,
  meta,
  fixed,
  activeItemDisabled = false,
  siderItemsAreCollapsed = true,
}: RefineThemedLayoutSiderProps) {
  const { token } = theme.useToken();
  const {
    siderCollapsed,
    setSiderCollapsed,
    mobileSiderOpen,
    setMobileSiderOpen,
  } = useThemedLayoutContext();

  const direction = useContext(ConfigProvider.ConfigContext)?.direction;
  const Link = useLink();
  const { menuItems, selectedKey, defaultOpenKeys } = useMenu({ meta });
  const { data: permData, isLoading, isFetching } = usePermissions<TimciPermissionsData>({});
  const breakpoint = Grid.useBreakpoint();

  const isMobile = typeof breakpoint.lg === 'undefined' ? false : !breakpoint.lg;

  const RenderToTitle = TitleFromProps ?? ThemedTitle;

  const permissionsWaiting = isLoading || (isFetching && permData == null);

  const visibleTree = useMemo(() => {
    if (permissionsWaiting) return [];
    const c = permData?.actionCodes ?? [];
    return filterMenuTreeByCodes(menuItems, c);
  }, [menuItems, permData?.actionCodes, permissionsWaiting]);

  const menuItemsProp = useMemo(
    () =>
      treeToMenuItems(visibleTree, {
        selectedKey,
        siderCollapsed,
        activeItemDisabled,
        Link,
      }),
    [visibleTree, selectedKey, siderCollapsed, activeItemDisabled, Link],
  );

  const defaultExpandMenuItems = siderItemsAreCollapsed ? [] : visibleTree.map(({ key }) => key);

  const renderMenu = () => (
    <Menu
      items={menuItemsProp}
      selectedKeys={selectedKey ? [selectedKey] : []}
      defaultOpenKeys={[...defaultOpenKeys, ...defaultExpandMenuItems]}
      mode="inline"
      style={{
        paddingTop: '8px',
        border: 'none',
        overflow: 'auto',
        height: 'calc(100% - 72px)',
      }}
      onClick={() => {
        setMobileSiderOpen(false);
      }}
    />
  );

  const renderMenuBody = () => {
    if (permissionsWaiting) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 120,
            height: 'calc(100% - 72px)',
          }}
        >
          <Spin />
        </div>
      );
    }
    return renderMenu();
  };

  const renderDrawerSider = () => (
    <>
      <Drawer
        open={mobileSiderOpen}
        onClose={() => setMobileSiderOpen(false)}
        placement={direction === 'rtl' ? 'right' : 'left'}
        closable={false}
        width={200}
        styles={{
          body: {
            padding: 0,
          },
        }}
        maskClosable
      >
        <Layout>
          <Layout.Sider
            style={{
              height: '100vh',
              backgroundColor: token.colorBgContainer,
              borderRight: `1px solid ${token.colorBgElevated}`,
            }}
          >
            <div
              style={{
                width: '200px',
                padding: '0 16px',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                height: '64px',
                backgroundColor: token.colorBgElevated,
              }}
            >
              <RenderToTitle collapsed={false} />
            </div>
            {renderMenuBody()}
          </Layout.Sider>
        </Layout>
      </Drawer>
      <Button
        style={DRAWER_MENU_BUTTON_STYLE}
        size="large"
        onClick={() => setMobileSiderOpen(true)}
        icon={<BarsOutlined />}
      />
    </>
  );

  if (isMobile) {
    return renderDrawerSider();
  }

  const siderStyles: CSSProperties = {
    backgroundColor: token.colorBgContainer,
    borderRight: `1px solid ${token.colorBgElevated}`,
  };

  if (fixed) {
    siderStyles.position = 'fixed';
    siderStyles.top = 0;
    siderStyles.height = '100vh';
    siderStyles.zIndex = 999;
  }

  const OpenIcon = direction === 'rtl' ? RightOutlined : LeftOutlined;
  const CollapsedIcon = direction === 'rtl' ? LeftOutlined : RightOutlined;
  const IconComponent = siderCollapsed ? CollapsedIcon : OpenIcon;
  const iconProps = { style: { color: token.colorPrimary } };

  return (
    <>
      {fixed ? (
        <div
          style={{
            width: siderCollapsed ? '80px' : '200px',
            transition: 'all 0.2s',
          }}
        />
      ) : null}
      <Layout.Sider
        style={siderStyles}
        collapsible
        collapsed={siderCollapsed}
        onCollapse={(collapsed, type) => {
          if (type === 'clickTrigger') {
            setSiderCollapsed(collapsed);
          }
        }}
        collapsedWidth={80}
        breakpoint="lg"
        trigger={
          <Button
            type="text"
            style={{
              borderRadius: 0,
              height: '100%',
              width: '100%',
              backgroundColor: token.colorBgElevated,
            }}
          >
            <IconComponent {...iconProps} />
          </Button>
        }
      >
        <div
          style={{
            width: siderCollapsed ? '80px' : '200px',
            padding: siderCollapsed ? '0' : '0 16px',
            display: 'flex',
            justifyContent: siderCollapsed ? 'center' : 'flex-start',
            alignItems: 'center',
            height: '64px',
            backgroundColor: token.colorBgElevated,
            fontSize: '14px',
          }}
        >
          <RenderToTitle collapsed={siderCollapsed} />
        </div>
        {renderMenuBody()}
      </Layout.Sider>
    </>
  );
}
