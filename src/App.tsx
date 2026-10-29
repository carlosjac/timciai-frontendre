import { Authenticated, Refine } from '@refinedev/core';
import { RefineThemes, useNotificationProvider } from '@refinedev/antd';
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
  PercentageOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  UnorderedListOutlined,
  TeamOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  UserSwitchOutlined,
  ShoppingCartOutlined,
  FallOutlined,
  RiseOutlined,
  WalletOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import { App as AntdApp, ConfigProvider, theme as antdTheme } from 'antd';
import esES from 'antd/locale/es_ES';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router';
import { Suspense, useMemo } from 'react';
import { AppHeader } from './app-shell/AppHeader.js';
import { lazyPage } from './app-shell/lazyPage.js';
import { TimciPageChunkFallback } from './app-shell/TimciPageChunkFallback.js';
import { TimciLoginPage } from './app-shell/TimciLoginPage.js';
import { NavigateToFirstAccessibleList } from './app-shell/NavigateToFirstAccessibleList.js';
import { TimciNotFoundPage } from './app-shell/TimciNotFoundPage.js';
import { timciGuarded } from './app-shell/timciGuarded.js';
import { TimciThemedSider } from './app-shell/TimciThemedSider.js';
import { createTimciAuthProvider } from './providers/authProvider.js';
import { createTimciAccessControlProvider } from './providers/accessControlProvider.js';
import { createTimciDataProvider } from './providers/timciDataProvider.js';
import { createTimciI18nProvider } from './i18n/index.js';
import { esMessages } from './i18n/locale.es.js';
import { UserPreferencesProvider } from './features/preferences/UserPreferencesProvider.js';
import { useUserPreferences } from './features/preferences/useUserPreferences.js';

const UserList = lazyPage(() => import('./features/users/list.js'), 'UserList');
const UserCreate = lazyPage(() => import('./features/users/create.js'), 'UserCreate');
const UserShow = lazyPage(() => import('./features/users/show.js'), 'UserShow');
const UserEdit = lazyPage(() => import('./features/users/edit.js'), 'UserEdit');
const TenantList = lazyPage(() => import('./features/tenants/list.js'), 'TenantList');
const TenantCreate = lazyPage(() => import('./features/tenants/create.js'), 'TenantCreate');
const TenantShow = lazyPage(() => import('./features/tenants/show.js'), 'TenantShow');
const TenantEdit = lazyPage(() => import('./features/tenants/edit.js'), 'TenantEdit');
const SessionList = lazyPage(() => import('./features/sessions/list.js'), 'SessionList');
const RoleList = lazyPage(() => import('./features/roles/list.js'), 'RoleList');
const RoleCreate = lazyPage(() => import('./features/roles/create.js'), 'RoleCreate');
const RoleShow = lazyPage(() => import('./features/roles/show.js'), 'RoleShow');
const RoleEdit = lazyPage(() => import('./features/roles/edit.js'), 'RoleEdit');
const ActionList = lazyPage(() => import('./features/actions/list.js'), 'ActionList');
const ActionCreate = lazyPage(() => import('./features/actions/create.js'), 'ActionCreate');
const RateSnapshotList = lazyPage(
  () => import('./features/rate-snapshots/list.js'),
  'RateSnapshotList',
);
const RateSnapshotShow = lazyPage(
  () => import('./features/rate-snapshots/show.js'),
  'RateSnapshotShow',
);
const UserTenantRoleList = lazyPage(
  () => import('./features/user-tenant-roles/list.js'),
  'UserTenantRoleList',
);
const UserTenantRoleCreate = lazyPage(
  () => import('./features/user-tenant-roles/create.js'),
  'UserTenantRoleCreate',
);
const CountryList = lazyPage(() => import('./features/countries/list.js'), 'CountryList');
const CountryCreate = lazyPage(() => import('./features/countries/create.js'), 'CountryCreate');
const CountryShow = lazyPage(() => import('./features/countries/show.js'), 'CountryShow');
const CountryEdit = lazyPage(() => import('./features/countries/edit.js'), 'CountryEdit');
const EntityList = lazyPage(() => import('./features/entities/list.js'), 'EntityList');
const EntityCreate = lazyPage(() => import('./features/entities/create.js'), 'EntityCreate');
const EntityShow = lazyPage(() => import('./features/entities/show.js'), 'EntityShow');
const EntityEdit = lazyPage(() => import('./features/entities/edit.js'), 'EntityEdit');
const EntitySettingsPage = lazyPage(
  () => import('./features/entities/settings.js'),
  'EntitySettingsPage',
);
const SellableItemList = lazyPage(
  () => import('./features/sellable-items/list.js'),
  'SellableItemList',
);
const SellableItemCreate = lazyPage(
  () => import('./features/sellable-items/create.js'),
  'SellableItemCreate',
);
const SellableItemShow = lazyPage(
  () => import('./features/sellable-items/show.js'),
  'SellableItemShow',
);
const SellableItemEdit = lazyPage(
  () => import('./features/sellable-items/edit.js'),
  'SellableItemEdit',
);
const PriceListList = lazyPage(() => import('./features/price-lists/list.js'), 'PriceListList');
const PriceListCreate = lazyPage(
  () => import('./features/price-lists/create.js'),
  'PriceListCreate',
);
const PriceListShow = lazyPage(() => import('./features/price-lists/show.js'), 'PriceListShow');
const PriceListEdit = lazyPage(() => import('./features/price-lists/edit.js'), 'PriceListEdit');
const MonetaryPolicyList = lazyPage(
  () => import('./features/monetary-policies/list.js'),
  'MonetaryPolicyList',
);
const MonetaryPolicyCreate = lazyPage(
  () => import('./features/monetary-policies/create.js'),
  'MonetaryPolicyCreate',
);
const MonetaryPolicyShow = lazyPage(
  () => import('./features/monetary-policies/show.js'),
  'MonetaryPolicyShow',
);
const MonetaryPolicyEdit = lazyPage(
  () => import('./features/monetary-policies/edit.js'),
  'MonetaryPolicyEdit',
);
const CustomerList = lazyPage(() => import('./features/customers/list.js'), 'CustomerList');
const CustomerImportJobsList = lazyPage(
  () => import('./features/customers/import-jobs-list.js'),
  'CustomerImportJobsList',
);
const CustomerImportJobShow = lazyPage(
  () => import('./features/customers/import-job-show.js'),
  'CustomerImportJobShow',
);
const CustomerCreate = lazyPage(() => import('./features/customers/create.js'), 'CustomerCreate');
const CustomerShow = lazyPage(() => import('./features/customers/show.js'), 'CustomerShow');
const CustomerEdit = lazyPage(() => import('./features/customers/edit.js'), 'CustomerEdit');
const SaleList = lazyPage(() => import('./features/sales/list.js'), 'SaleList');
const SaleCreate = lazyPage(() => import('./features/sales/create.js'), 'SaleCreate');
const SaleShow = lazyPage(() => import('./features/sales/show.js'), 'SaleShow');
const SaleEdit = lazyPage(() => import('./features/sales/edit.js'), 'SaleEdit');
const DebitList = lazyPage(() => import('./features/debits/list.js'), 'DebitList');
const DebitCreate = lazyPage(() => import('./features/debits/create.js'), 'DebitCreate');
const DebitShow = lazyPage(() => import('./features/debits/show.js'), 'DebitShow');
const DebitEdit = lazyPage(() => import('./features/debits/edit.js'), 'DebitEdit');
const CreditList = lazyPage(() => import('./features/credits/list.js'), 'CreditList');
const CreditCreate = lazyPage(() => import('./features/credits/create.js'), 'CreditCreate');
const CreditShow = lazyPage(() => import('./features/credits/show.js'), 'CreditShow');
const CreditEdit = lazyPage(() => import('./features/credits/edit.js'), 'CreditEdit');
const CollectionList = lazyPage(() => import('./features/collections/list.js'), 'CollectionList');
const CollectionCreate = lazyPage(
  () => import('./features/collections/create.js'),
  'CollectionCreate',
);
const CollectionShow = lazyPage(() => import('./features/collections/show.js'), 'CollectionShow');
const CollectionEdit = lazyPage(() => import('./features/collections/edit.js'), 'CollectionEdit');
const DocumentList = lazyPage(() => import('./features/documents/list.js'), 'DocumentList');
const DocumentShow = lazyPage(() => import('./features/documents/show.js'), 'DocumentShow');
const DocumentTypeList = lazyPage(
  () => import('./features/document-types/list.js'),
  'DocumentTypeList',
);
const DocumentTypeCreate = lazyPage(
  () => import('./features/document-types/create.js'),
  'DocumentTypeCreate',
);
const DocumentTypeEdit = lazyPage(
  () => import('./features/document-types/edit.js'),
  'DocumentTypeEdit',
);
const DocumentTypeShow = lazyPage(
  () => import('./features/document-types/show.js'),
  'DocumentTypeShow',
);
const CurrencyList = lazyPage(() => import('./features/currencies/list.js'), 'CurrencyList');
const CurrencyCreate = lazyPage(() => import('./features/currencies/create.js'), 'CurrencyCreate');
const CurrencyShow = lazyPage(() => import('./features/currencies/show.js'), 'CurrencyShow');
const CurrencyEdit = lazyPage(() => import('./features/currencies/edit.js'), 'CurrencyEdit');
const PermissionList = lazyPage(() => import('./features/permissions/list.js'), 'PermissionList');
const PermissionCreate = lazyPage(
  () => import('./features/permissions/create.js'),
  'PermissionCreate',
);
const PreferencesPage = lazyPage(
  () => import('./features/preferences/PreferencesPage.js'),
  'PreferencesPage',
);
const ChangePasswordPage = lazyPage(
  () => import('./features/change-password/ChangePasswordPage.js'),
  'ChangePasswordPage',
);

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
        show: '/countries/show/:id',
        edit: '/countries/edit/:id',
        meta: { label: esMessages.nav.countries, icon: <GlobalOutlined /> },
      },
      {
        name: 'currencies',
        list: '/currencies',
        create: '/currencies/create',
        show: '/currencies/show/:id',
        edit: '/currencies/edit/:id',
        meta: { label: esMessages.nav.currencies, icon: <DollarOutlined /> },
      },
      {
        name: 'rateSnapshots',
        list: '/rate-snapshots',
        show: '/rate-snapshots/show/:id',
        meta: { label: esMessages.nav.rateSnapshots, icon: <LineChartOutlined /> },
      },
      {
        name: 'document_types',
        list: '/document-types',
        create: '/document-types/create',
        show: '/document-types/show/:id',
        edit: '/document-types/edit/:id',
        meta: { label: esMessages.nav.documentTypes, icon: <FileTextOutlined /> },
      },
      {
        name: 'customers',
        list: '/customers',
        create: '/customers/create',
        show: '/customers/show/:id',
        edit: '/customers/edit/:id',
        meta: { label: esMessages.nav.customers, icon: <IdcardOutlined /> },
      },
      {
        name: 'entities',
        list: '/entities',
        create: '/entities/create',
        show: '/entities/show/:id',
        edit: '/entities/edit/:id',
        meta: { label: esMessages.nav.entities, icon: <ApartmentOutlined /> },
      },
      {
        name: 'entity_settings',
        list: '/entity-settings',
        meta: { label: esMessages.nav.entitySettings, icon: <ApartmentOutlined /> },
      },
      {
        name: 'sellable_items',
        list: '/sellable-items',
        create: '/sellable-items/create',
        show: '/sellable-items/show/:id',
        edit: '/sellable-items/edit/:id',
        meta: { label: esMessages.nav.sellableItems, icon: <ShoppingOutlined /> },
      },
      {
        name: 'price_lists',
        list: '/price-lists',
        create: '/price-lists/create',
        show: '/price-lists/show/:id',
        edit: '/price-lists/edit/:id',
        meta: { label: esMessages.nav.priceLists, icon: <UnorderedListOutlined /> },
      },
      {
        name: 'monetary_policies',
        list: '/monetary-policies',
        create: '/monetary-policies/create',
        show: '/monetary-policies/show/:id',
        edit: '/monetary-policies/edit/:id',
        meta: { label: esMessages.nav.monetaryPolicies, icon: <PercentageOutlined /> },
      },
      {
        name: 'sales',
        list: '/sales',
        create: '/sales/create',
        show: '/sales/show/:id',
        edit: '/sales/edit/:id',
        meta: { label: esMessages.nav.sales, icon: <ShoppingCartOutlined /> },
      },
      {
        name: 'debits',
        list: '/debits',
        create: '/debits/create',
        show: '/debits/show/:id',
        edit: '/debits/edit/:id',
        meta: { label: esMessages.nav.debits, icon: <RiseOutlined /> },
      },
      {
        name: 'credits',
        list: '/credits',
        create: '/credits/create',
        show: '/credits/show/:id',
        edit: '/credits/edit/:id',
        meta: { label: esMessages.nav.credits, icon: <FallOutlined /> },
      },
      {
        name: 'collections',
        list: '/collections',
        create: '/collections/create',
        show: '/collections/show/:id',
        edit: '/collections/edit/:id',
        meta: { label: esMessages.nav.collections, icon: <WalletOutlined /> },
      },
      {
        name: 'documents',
        list: '/documents',
        show: '/documents/show/:id',
        meta: { label: esMessages.nav.documents, icon: <FileDoneOutlined /> },
      },
      {
        name: 'price_list_items',
        meta: { hide: true, label: esMessages.pages.priceListItems.resourceLabel },
      },
      {
        name: 'users',
        list: '/users',
        create: '/users/create',
        show: '/users/show/:id',
        edit: '/users/edit/:id',
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
        show: '/tenants/show/:id',
        edit: '/tenants/edit/:id',
        meta: { label: esMessages.nav.tenants, icon: <ClusterOutlined /> },
      },
      {
        name: 'roles',
        list: '/roles',
        create: '/roles/create',
        show: '/roles/show/:id',
        edit: '/roles/edit/:id',
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
            <Route path="/login" element={<TimciLoginPage />} />
            <Route
              element={
                <Authenticated key="app" redirectOnFail="/login">
                  <ThemedLayout Header={AppHeader} Sider={TimciThemedSider}>
                    <Suspense fallback={<TimciPageChunkFallback />}>
                      <Outlet />
                    </Suspense>
                  </ThemedLayout>
                </Authenticated>
              }
            >
              <Route index element={<NavigateToFirstAccessibleList />} />
              <Route path="/users" element={timciGuarded('users', 'list', <UserList />)} />
              <Route path="/users/create" element={timciGuarded('users', 'create', <UserCreate />)} />
              <Route path="/users/show/:id" element={timciGuarded('users', 'show', <UserShow />)} />
              <Route path="/users/edit/:id" element={timciGuarded('users', 'edit', <UserEdit />)} />
              <Route path="/sessions" element={timciGuarded('sessions', 'list', <SessionList />)} />
              <Route path="/tenants" element={timciGuarded('tenants', 'list', <TenantList />)} />
              <Route
                path="/tenants/create"
                element={timciGuarded('tenants', 'create', <TenantCreate />)}
              />
              <Route
                path="/tenants/show/:id"
                element={timciGuarded('tenants', 'show', <TenantShow />)}
              />
              <Route
                path="/tenants/edit/:id"
                element={timciGuarded('tenants', 'edit', <TenantEdit />)}
              />
              <Route path="/roles" element={timciGuarded('roles', 'list', <RoleList />)} />
              <Route path="/roles/create" element={timciGuarded('roles', 'create', <RoleCreate />)} />
              <Route path="/roles/show/:id" element={timciGuarded('roles', 'show', <RoleShow />)} />
              <Route path="/roles/edit/:id" element={timciGuarded('roles', 'edit', <RoleEdit />)} />
              <Route path="/actions" element={timciGuarded('actions', 'list', <ActionList />)} />
              <Route
                path="/actions/create"
                element={timciGuarded('actions', 'create', <ActionCreate />)}
              />
              <Route
                path="/user-tenant-roles"
                element={timciGuarded('userTenantRoles', 'list', <UserTenantRoleList />)}
              />
              <Route
                path="/user-tenant-roles/create"
                element={timciGuarded('userTenantRoles', 'create', <UserTenantRoleCreate />)}
              />
              <Route
                path="/permissions"
                element={timciGuarded('permissions', 'list', <PermissionList />)}
              />
              <Route
                path="/permissions/create"
                element={timciGuarded('permissions', 'create', <PermissionCreate />)}
              />
              <Route path="/countries" element={timciGuarded('countries', 'list', <CountryList />)} />
              <Route
                path="/countries/create"
                element={timciGuarded('countries', 'create', <CountryCreate />)}
              />
              <Route
                path="/countries/show/:id"
                element={timciGuarded('countries', 'show', <CountryShow />)}
              />
              <Route
                path="/countries/edit/:id"
                element={timciGuarded('countries', 'edit', <CountryEdit />)}
              />
              <Route path="/entities" element={timciGuarded('entities', 'list', <EntityList />)} />
              <Route
                path="/entities/create"
                element={timciGuarded('entities', 'create', <EntityCreate />)}
              />
              <Route
                path="/entities/show/:id"
                element={timciGuarded('entities', 'show', <EntityShow />)}
              />
              <Route
                path="/entities/edit/:id"
                element={timciGuarded('entities', 'edit', <EntityEdit />)}
              />
              <Route
                path="/entity-settings"
                element={timciGuarded('entity_settings', 'list', <EntitySettingsPage />)}
              />
              <Route
                path="/sellable-items"
                element={timciGuarded('sellable_items', 'list', <SellableItemList />)}
              />
              <Route
                path="/sellable-items/create"
                element={timciGuarded('sellable_items', 'create', <SellableItemCreate />)}
              />
              <Route
                path="/sellable-items/show/:id"
                element={timciGuarded('sellable_items', 'show', <SellableItemShow />)}
              />
              <Route
                path="/sellable-items/edit/:id"
                element={timciGuarded('sellable_items', 'edit', <SellableItemEdit />)}
              />
              <Route
                path="/price-lists"
                element={timciGuarded('price_lists', 'list', <PriceListList />)}
              />
              <Route
                path="/price-lists/create"
                element={timciGuarded('price_lists', 'create', <PriceListCreate />)}
              />
              <Route
                path="/price-lists/show/:id"
                element={timciGuarded('price_lists', 'show', <PriceListShow />)}
              />
              <Route
                path="/price-lists/edit/:id"
                element={timciGuarded('price_lists', 'edit', <PriceListEdit />)}
              />
              <Route
                path="/monetary-policies"
                element={timciGuarded('monetary_policies', 'list', <MonetaryPolicyList />)}
              />
              <Route
                path="/monetary-policies/create"
                element={timciGuarded('monetary_policies', 'create', <MonetaryPolicyCreate />)}
              />
              <Route
                path="/monetary-policies/show/:id"
                element={timciGuarded('monetary_policies', 'show', <MonetaryPolicyShow />)}
              />
              <Route
                path="/monetary-policies/edit/:id"
                element={timciGuarded('monetary_policies', 'edit', <MonetaryPolicyEdit />)}
              />
              <Route path="/customers" element={timciGuarded('customers', 'list', <CustomerList />)} />
              <Route
                path="/customers/import-jobs"
                element={timciGuarded('customers', 'list', <CustomerImportJobsList />)}
              />
              <Route
                path="/customers/import-jobs/:jobId"
                element={timciGuarded('customers', 'list', <CustomerImportJobShow />)}
              />
              <Route
                path="/customers/create"
                element={timciGuarded('customers', 'create', <CustomerCreate />)}
              />
              <Route
                path="/customers/show/:id"
                element={timciGuarded('customers', 'show', <CustomerShow />)}
              />
              <Route
                path="/customers/edit/:id"
                element={timciGuarded('customers', 'edit', <CustomerEdit />)}
              />
              <Route path="/sales" element={timciGuarded('sales', 'list', <SaleList />)} />
              <Route path="/sales/create" element={timciGuarded('sales', 'create', <SaleCreate />)} />
              <Route path="/sales/show/:id" element={timciGuarded('sales', 'show', <SaleShow />)} />
              <Route path="/sales/edit/:id" element={timciGuarded('sales', 'edit', <SaleEdit />)} />
              <Route path="/debits" element={timciGuarded('debits', 'list', <DebitList />)} />
              <Route
                path="/debits/create"
                element={timciGuarded('debits', 'create', <DebitCreate />)}
              />
              <Route
                path="/debits/show/:id"
                element={timciGuarded('debits', 'show', <DebitShow />)}
              />
              <Route path="/debits/edit/:id" element={timciGuarded('debits', 'edit', <DebitEdit />)} />
              <Route path="/credits" element={timciGuarded('credits', 'list', <CreditList />)} />
              <Route
                path="/credits/create"
                element={timciGuarded('credits', 'create', <CreditCreate />)}
              />
              <Route
                path="/credits/show/:id"
                element={timciGuarded('credits', 'show', <CreditShow />)}
              />
              <Route
                path="/credits/edit/:id"
                element={timciGuarded('credits', 'edit', <CreditEdit />)}
              />
              <Route
                path="/collections"
                element={timciGuarded('collections', 'list', <CollectionList />)}
              />
              <Route
                path="/collections/create"
                element={timciGuarded('collections', 'create', <CollectionCreate />)}
              />
              <Route
                path="/collections/show/:id"
                element={timciGuarded('collections', 'show', <CollectionShow />)}
              />
              <Route
                path="/collections/edit/:id"
                element={timciGuarded('collections', 'edit', <CollectionEdit />)}
              />
              <Route
                path="/documents"
                element={timciGuarded('documents', 'list', <DocumentList />)}
              />
              <Route
                path="/documents/show/:id"
                element={timciGuarded('documents', 'show', <DocumentShow />)}
              />
              <Route
                path="/document-types"
                element={timciGuarded('document_types', 'list', <DocumentTypeList />)}
              />
              <Route
                path="/document-types/create"
                element={timciGuarded('document_types', 'create', <DocumentTypeCreate />)}
              />
              <Route
                path="/document-types/show/:id"
                element={timciGuarded('document_types', 'show', <DocumentTypeShow />)}
              />
              <Route
                path="/document-types/edit/:id"
                element={timciGuarded('document_types', 'edit', <DocumentTypeEdit />)}
              />
              <Route
                path="/currencies"
                element={timciGuarded('currencies', 'list', <CurrencyList />)}
              />
              <Route
                path="/currencies/create"
                element={timciGuarded('currencies', 'create', <CurrencyCreate />)}
              />
              <Route
                path="/currencies/show/:id"
                element={timciGuarded('currencies', 'show', <CurrencyShow />)}
              />
              <Route
                path="/currencies/edit/:id"
                element={timciGuarded('currencies', 'edit', <CurrencyEdit />)}
              />
              <Route
                path="/rate-snapshots"
                element={timciGuarded('rateSnapshots', 'list', <RateSnapshotList />)}
              />
              <Route
                path="/rate-snapshots/show/:id"
                element={timciGuarded('rateSnapshots', 'show', <RateSnapshotShow />)}
              />
              <Route path="/preferences" element={<PreferencesPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route path="*" element={<TimciNotFoundPage />} />
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
