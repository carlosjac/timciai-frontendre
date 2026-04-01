import { Authenticated, Refine } from '@refinedev/core';
import { RefineThemes, useNotificationProvider, AuthPage } from '@refinedev/antd';
import { ThemedLayout } from '@refinedev/antd';
import refineRouterProvider, { DocumentTitleHandler } from '@refinedev/react-router';
import {
  ApartmentOutlined,
  ClusterOutlined,
  DollarOutlined,
  FileTextOutlined,
  GlobalOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ThunderboltOutlined,
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
import { TenantList } from './features/tenants/list.js';
import { RoleList } from './features/roles/list.js';
import { ActionList } from './features/actions/list.js';
import { CountryList } from './features/countries/list.js';
import { EntityList } from './features/entities/list.js';
import { CustomerList } from './features/customers/list.js';
import { DocumentTypeList } from './features/document-types/list.js';
import { CurrencyList } from './features/currencies/list.js';
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
        meta: { label: esMessages.nav.documentTypes, icon: <FileTextOutlined /> },
      },
      {
        name: 'customers',
        list: '/customers',
        meta: { label: esMessages.nav.customers, icon: <IdcardOutlined /> },
      },
      {
        name: 'entities',
        list: '/entities',
        meta: { label: esMessages.nav.entities, icon: <ApartmentOutlined /> },
      },
      {
        name: 'users',
        list: '/users',
        meta: { label: esMessages.nav.users, icon: <TeamOutlined /> },
      },
      {
        name: 'tenants',
        list: '/tenants',
        meta: { label: esMessages.nav.tenants, icon: <ClusterOutlined /> },
      },
      {
        name: 'roles',
        list: '/roles',
        meta: { label: esMessages.nav.roles, icon: <SafetyCertificateOutlined /> },
      },
      {
        name: 'actions',
        list: '/actions',
        meta: { label: esMessages.nav.actions, icon: <ThunderboltOutlined /> },
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
              <Route path="/tenants" element={<TenantList />} />
              <Route path="/roles" element={<RoleList />} />
              <Route path="/actions" element={<ActionList />} />
              <Route path="/countries" element={<CountryList />} />
              <Route path="/entities" element={<EntityList />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/document-types" element={<DocumentTypeList />} />
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
