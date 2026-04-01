import { Authenticated, Refine } from '@refinedev/core';
import { RefineThemes, useNotificationProvider, AuthPage } from '@refinedev/antd';
import { ThemedLayout } from '@refinedev/antd';
import refineRouterProvider, { DocumentTitleHandler } from '@refinedev/react-router';
import {
  ApartmentOutlined,
  ClusterOutlined,
  LaptopOutlined,
  DollarOutlined,
  FileTextOutlined,
  GlobalOutlined,
  IdcardOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  UnorderedListOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { App as AntdApp, ConfigProvider, theme as antdTheme } from 'antd';
import esES from 'antd/locale/es_ES';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router';
import { useMemo } from 'react';
import { AppHeader } from './app-shell/AppHeader.js';
import { NavigateToFirstAccessibleList } from './app-shell/NavigateToFirstAccessibleList.js';
import { TimciThemedSider } from './app-shell/TimciThemedSider.js';
import { createTimciAuthProvider } from './providers/authProvider.js';
import { createTimciAccessControlProvider } from './providers/accessControlProvider.js';
import { createTimciDataProvider } from './providers/timciDataProvider.js';
import { createTimciI18nProvider } from './i18n/index.js';
import { esMessages } from './i18n/locale.es.js';
import { UserPreferencesProvider } from './features/preferences/UserPreferencesProvider.js';
import { useUserPreferences } from './features/preferences/useUserPreferences.js';
import { UserList } from './features/users/list.js';
import { UserCreate } from './features/users/create.js';
import { TenantList } from './features/tenants/list.js';
import { TenantCreate } from './features/tenants/create.js';
import { SessionList } from './features/sessions/list.js';
import { RoleList } from './features/roles/list.js';
import { RoleCreate } from './features/roles/create.js';
import { ActionList } from './features/actions/list.js';
import { ActionCreate } from './features/actions/create.js';
import { UserTenantRoleList } from './features/user-tenant-roles/list.js';
import { UserTenantRoleCreate } from './features/user-tenant-roles/create.js';
import { CountryList } from './features/countries/list.js';
import { CountryCreate } from './features/countries/create.js';
import { EntityList } from './features/entities/list.js';
import { EntityCreate } from './features/entities/create.js';
import { SellableItemList } from './features/sellable-items/list.js';
import { SellableItemCreate } from './features/sellable-items/create.js';
import { SellableItemEdit } from './features/sellable-items/edit.js';
import { PriceListList } from './features/price-lists/list.js';
import { PriceListCreate } from './features/price-lists/create.js';
import { PriceListEdit } from './features/price-lists/edit.js';
import { CustomerList } from './features/customers/list.js';
import { CustomerCreate } from './features/customers/create.js';
import { DocumentTypeList } from './features/document-types/list.js';
import { DocumentTypeCreate } from './features/document-types/create.js';
import { CurrencyList } from './features/currencies/list.js';
import { PermissionList } from './features/permissions/list.js';
import { PermissionCreate } from './features/permissions/create.js';
import { PreferencesPage } from './features/preferences/PreferencesPage.js';
import { ChangePasswordPage } from './features/change-password/ChangePasswordPage.js';

const authProvider = createTimciAuthProvider();
const accessControlProvider = createTimciAccessControlProvider();
const dataProvider = createTimciDataProvider();
const i18nProvider = createTimciI18nProvider();

function TimciRefineTree() {
  const { theme: themeMode } = useUserPreferences();
  const antdThemeConfig = useMemo(
    () => ({
      ...RefineThemes.Blue,
      algorithm:
        themeMode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    }),
    [themeMode],
  );

  const resources = useMemo(
    () => [
      {
        name: 'countries',
        list: '/countries',
        create: '/countries/create',
        meta: { label: esMessages.nav.countries, icon: <GlobalOutlined /> },
      },
      {
        name: 'currencies',
        list: '/currencies',
        meta: { label: esMessages.nav.currencies, icon: <DollarOutlined /> },
      },
      {
        name: 'document_types',
        list: '/document-types',
        create: '/document-types/create',
        meta: { label: esMessages.nav.documentTypes, icon: <FileTextOutlined /> },
      },
      {
        name: 'customers',
        list: '/customers',
        create: '/customers/create',
        meta: { label: esMessages.nav.customers, icon: <IdcardOutlined /> },
      },
      {
        name: 'entities',
        list: '/entities',
        create: '/entities/create',
        meta: { label: esMessages.nav.entities, icon: <ApartmentOutlined /> },
      },
      {
        name: 'sellable_items',
        list: '/sellable-items',
        create: '/sellable-items/create',
        edit: '/sellable-items/edit/:id',
        meta: { label: esMessages.nav.sellableItems, icon: <ShoppingOutlined /> },
      },
      {
        name: 'price_lists',
        list: '/price-lists',
        create: '/price-lists/create',
        edit: '/price-lists/edit/:id',
        meta: { label: esMessages.nav.priceLists, icon: <UnorderedListOutlined /> },
      },
      {
        name: 'price_list_items',
        meta: { hide: true, label: esMessages.pages.priceListItems.resourceLabel },
      },
      {
        name: 'users',
        list: '/users',
        create: '/users/create',
        meta: { label: esMessages.nav.users, icon: <TeamOutlined /> },
      },
      {
        name: 'sessions',
        list: '/sessions',
        meta: { label: esMessages.nav.sessions, icon: <LaptopOutlined /> },
      },
      {
        name: 'tenants',
        list: '/tenants',
        create: '/tenants/create',
        meta: { label: esMessages.nav.tenants, icon: <ClusterOutlined /> },
      },
      {
        name: 'roles',
        list: '/roles',
        create: '/roles/create',
        meta: { label: esMessages.nav.roles, icon: <SafetyCertificateOutlined /> },
      },
      {
        name: 'actions',
        list: '/actions',
        create: '/actions/create',
        meta: { label: esMessages.nav.actions, icon: <ThunderboltOutlined /> },
      },
      {
        name: 'userTenantRoles',
        list: '/user-tenant-roles',
        create: '/user-tenant-roles/create',
        meta: { label: esMessages.nav.assignments, icon: <UserSwitchOutlined /> },
      },
      {
        name: 'permissions',
        list: '/permissions',
        create: '/permissions/create',
        meta: { label: esMessages.nav.permissions, icon: <KeyOutlined /> },
      },
    ],
    [],
  );

  return (
    <div className="timci-app">
      <ConfigProvider locale={esES} theme={antdThemeConfig}>
        <AntdApp>
          <Refine
            routerProvider={refineRouterProvider}
            dataProvider={dataProvider}
            authProvider={authProvider}
            accessControlProvider={accessControlProvider}
            i18nProvider={i18nProvider}
            notificationProvider={useNotificationProvider}
            resources={resources}
            options={{
              syncWithLocation: true,
              title: { text: esMessages.app.title },
            }}
          >
          <DocumentTitleHandler />
          <Routes>
            <Route
              path="/login"
              element={
                <main style={{ minHeight: '100vh' }} aria-label={esMessages.pages.login.title}>
                  <AuthPage type="login" registerLink={false} forgotPasswordLink={false} />
                </main>
              }
            />
            <Route
              element={
                <Authenticated key="app" redirectOnFail="/login">
                  <ThemedLayout Header={AppHeader} Sider={TimciThemedSider}>
                    <Outlet />
                  </ThemedLayout>
                </Authenticated>
              }
            >
              <Route index element={<NavigateToFirstAccessibleList />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/users/create" element={<UserCreate />} />
              <Route path="/sessions" element={<SessionList />} />
              <Route path="/tenants" element={<TenantList />} />
              <Route path="/tenants/create" element={<TenantCreate />} />
              <Route path="/roles" element={<RoleList />} />
              <Route path="/roles/create" element={<RoleCreate />} />
              <Route path="/actions" element={<ActionList />} />
              <Route path="/actions/create" element={<ActionCreate />} />
              <Route path="/user-tenant-roles" element={<UserTenantRoleList />} />
              <Route path="/user-tenant-roles/create" element={<UserTenantRoleCreate />} />
              <Route path="/permissions" element={<PermissionList />} />
              <Route path="/permissions/create" element={<PermissionCreate />} />
              <Route path="/countries" element={<CountryList />} />
              <Route path="/countries/create" element={<CountryCreate />} />
              <Route path="/entities" element={<EntityList />} />
              <Route path="/entities/create" element={<EntityCreate />} />
              <Route path="/sellable-items" element={<SellableItemList />} />
              <Route path="/sellable-items/create" element={<SellableItemCreate />} />
              <Route path="/sellable-items/edit/:id" element={<SellableItemEdit />} />
              <Route path="/price-lists" element={<PriceListList />} />
              <Route path="/price-lists/create" element={<PriceListCreate />} />
              <Route path="/price-lists/edit/:id" element={<PriceListEdit />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/customers/create" element={<CustomerCreate />} />
              <Route path="/document-types" element={<DocumentTypeList />} />
              <Route path="/document-types/create" element={<DocumentTypeCreate />} />
              <Route path="/currencies" element={<CurrencyList />} />
              <Route path="/preferences" element={<PreferencesPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route path="*" element={<NavigateToFirstAccessibleList />} />
            </Route>
          </Routes>
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UserPreferencesProvider>
        <TimciRefineTree />
      </UserPreferencesProvider>
    </BrowserRouter>
  );
}
