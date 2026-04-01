/**
 * Spanish UI strings (default locale). Structure matches Refine / app i18n key paths (dot notation).
 */
export const esMessages = {
  form: {
    serverError: {
      title: 'No se pudo guardar',
      generic: 'Ha ocurrido un error',
    },
  },
  app: {
    title: 'Timci',
  },
  auth: {
    login: {
      missingCredentials: 'Introduce correo y contraseña.',
    },
  },
  nav: {
    users: 'Usuarios',
    tenants: 'Inquilinos',
    roles: 'Roles',
    actions: 'Acciones',
    assignments: 'Asignaciones',
    permissions: 'Permisos',
    countries: 'Países',
    entities: 'Entidades',
    customers: 'Clientes',
    documentTypes: 'Tipos de documento',
    currencies: 'Monedas',
    preferences: 'Preferencias',
    changePassword: 'Cambiar contraseña',
  },
  tenant: {
    label: 'Organización',
    placeholder: 'Seleccionar organización',
    selectFirst: 'Selecciona una organización en la cabecera para cargar este listado.',
  },
  header: {
    logout: 'Cerrar sesión',
    openNavigation: 'Abrir menú de navegación',
    accountMenu: 'Menú de cuenta',
  },
  list: {
    a11y: {
      listTable: 'Tabla de datos',
      openColumnFilter: 'Abrir filtro para la columna',
      removeFilterForColumn: 'Quitar filtro',
      columnPickerGroup: 'Elegir columnas visibles en la tabla',
    },
    columns: 'Columnas visibles',
    columnsMinOne: 'Debe quedar al menos una columna visible.',
    export: {
      button: 'Exportar CSV',
      success: 'Exportación completada',
      error: 'No se pudo exportar',
      exporting: 'Exportando…',
    },
    filter: {
      search: 'Filtrar',
      reset: 'Limpiar',
      placeholder: 'Buscar…',
      applied: 'Filtros activos',
      clearAll: 'Quitar todos',
      boolPlaceholder: 'Elegir…',
      boolYes: 'Sí',
      boolNo: 'No',
      op: {
        eq: 'Igual a',
        contains: 'Contiene',
        startsWith: 'Empieza por',
        endsWith: 'Termina en',
        gt: 'Mayor que',
        gte: 'Mayor o igual',
        lt: 'Menor que',
        lte: 'Menor o igual',
        between: 'Entre',
        before: 'Antes del día',
        after: 'Después del día',
        onOrBefore: 'Hasta el día (incl.)',
        onOrAfter: 'Desde el día (incl.)',
      },
    },
  },
  pages: {
    login: {
      title: 'Iniciar sesión en tu cuenta',
      divider: 'o',
      fields: {
        email: 'Correo electrónico',
        password: 'Contraseña',
      },
      errors: {
        requiredEmail: 'El correo es obligatorio',
        validEmail: 'Correo no válido',
        requiredPassword: 'La contraseña es obligatoria',
      },
      buttons: {
        rememberMe: 'Recordarme',
        forgotPassword: '¿Olvidaste la contraseña?',
        noAccount: '¿No tienes cuenta?',
      },
      signin: 'Entrar',
      signup: 'Registrarse',
    },
    users: { title: 'Usuarios' },
    tenants: { title: 'Inquilinos' },
    roles: { title: 'Roles' },
    actions: { title: 'Acciones' },
    permissions: { title: 'Permisos' },
    userTenantRoles: { title: 'Asignaciones' },
    countries: { title: 'Países' },
    entities: { title: 'Entidades' },
    customers: { title: 'Clientes' },
    documentTypes: { title: 'Tipos de documento' },
    currencies: { title: 'Monedas' },
    changePassword: {
      title: 'Cambiar contraseña',
      policyHint:
        'Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un dígito y un símbolo.',
      fields: {
        current: 'Contraseña actual',
        new: 'Nueva contraseña',
        confirm: 'Confirmar nueva contraseña',
      },
      submit: 'Actualizar contraseña',
      success: 'Contraseña actualizada. Inicia sesión con tu nueva contraseña.',
      error: 'No se pudo cambiar la contraseña',
      validation: {
        policy:
          'La contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula, dígito y símbolo.',
        mismatch: 'La nueva contraseña y la confirmación no coinciden',
        currentRequired: 'Indica tu contraseña actual',
        newRequired: 'Indica la nueva contraseña',
        confirmRequired: 'Confirma la nueva contraseña',
      },
    },
    preferences: {
      title: 'Preferencias de usuario',
      save: 'Guardar preferencias',
      saved: 'Preferencias guardadas',
      preview: 'Vista previa (ahora en tu zona)',
      fields: {
        timeZone: 'Zona horaria',
        dateFormat: 'Formato de fecha',
        theme: 'Tema de la interfaz',
      },
      validation: {
        timeZone: 'Elige una zona horaria',
        dateFormat: 'Elige un formato de fecha',
        theme: 'Elige un tema',
      },
      theme: {
        light: 'Claro',
        dark: 'Oscuro',
      },
      dateFormats: {
        ddmmyyyy: '31/12/2024 (día/mes/año)',
        yyyymmdd: '2024-12-31 (ISO)',
        mmddyyyy: '12/31/2024 (mes/día/año)',
      },
    },
  },
  table: {
    users: {
      email: 'Correo',
      name: 'Nombre',
      active: 'Activo',
      yes: 'Sí',
      no: 'No',
    },
    tenants: {
      name: 'Nombre',
      active: 'Activo',
    },
    roles: {
      name: 'Nombre',
      createdAt: 'Creado',
    },
    actions: {
      code: 'Código',
      name: 'Nombre',
      global: 'Global',
    },
    permissions: {
      roleName: 'Rol',
      tenantName: 'Organización',
      actionName: 'Acción',
      createdAt: 'Creado',
      createdByName: 'Creado por',
    },
    userTenantRoles: {
      userName: 'Usuario',
      tenantName: 'Organización',
      roleName: 'Rol',
      createdAt: 'Creado',
      createdByName: 'Creado por',
    },
    countries: {
      name: 'Nombre',
      iso: 'ISO',
    },
    entities: {
      name: 'Nombre',
    },
    customers: {
      name: 'Nombre',
      document: 'Documento',
      active: 'Activo',
    },
    documentTypes: {
      name: 'Nombre',
    },
    currencies: {
      code: 'Código',
      name: 'Nombre',
    },
  },
} as const;
