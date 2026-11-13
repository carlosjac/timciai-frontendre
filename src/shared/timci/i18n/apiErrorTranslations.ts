/**
 * Traducción de errores del API (códigos y mensajes en inglés), alineado con timci-admin (`frontend/src/shared/i18n/provider.ts` y `http/errors.ts`).
 */

/** Mapa código → mensaje en español. */
export const apiErrorMessagesEs: Record<string, string> = {
  NOT_FOUND: 'No encontrado',
  USER_NOT_FOUND: 'Usuario no encontrado',
  INVALID_USER: 'Usuario no válido',
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos',
  INVALID_OR_EXPIRED_TOKEN: 'Token inválido o expirado',
  UNAUTHORIZED: 'No autenticado',
  FORBIDDEN: 'No tienes permiso para esta acción',
  FORBIDDEN_ENTITY: 'No tienes permiso para acceder a este recurso en esta entidad',
  FORBIDDEN_ENTITY_FIELD: 'Solo el usuario root puede modificar este campo de la entidad',
  ENTITY_CURRENCY_NOT_ACCEPTED: 'La moneda no está aceptada por la entidad',
  SUPPORTED_CURRENCY_IN_USE:
    'No se puede quitar una moneda que tiene registros relacionados en la entidad',
  TAX_MANAGEMENT_IMMUTABLE:
    'Gestionar impuestos se define al crear la entidad y no se puede cambiar después',
  FORBIDDEN_PAYMENT_OPTION_REMOVAL:
    'No se puede quitar un medio de pago guardado; desactívalo en su lugar',
  PAYMENT_OPTION_IN_USE:
    'No se puede desactivar el medio de pago porque tiene cobros asociados',
  FORBIDDEN_GLOBAL_TENANT: 'El tenant global no puede desactivarse',
  FORBIDDEN_ROOT_ROLE: 'El rol root no puede desactivarse',
  FORBIDDEN_ROOT_GLOBAL_ASSIGNMENT:
    'No se puede revocar la asignación del rol root en el tenant global',
  FORBIDDEN_IMPERSONATE: 'Solo el usuario root puede impersonar a otro usuario',
  FORBIDDEN_IMPERSONATE_SELF: 'No puedes impersonarte a ti mismo',
  FORBIDDEN_IMPERSONATE_NESTED: 'Ya estás impersonando; primero deja de impersonar',
  FORBIDDEN_IMPERSONATE_ROOT: 'No se puede impersonar a un usuario root',
  FORBIDDEN_IMPERSONATE_INACTIVE: 'No se puede impersonar a un usuario inactivo',
  NOT_IMPERSONATING: 'La sesión actual no es una impersonación',
  IMPERSONATOR_UNAVAILABLE: 'El usuario impersonador no está disponible',
  CONFLICT_NAME: 'Ya existe un registro con ese nombre',
  INVALID_MONETARY_POLICY_KIND: 'Tipo de política monetaria no válido',
  INVALID_MONETARY_POLICY_PARAMS:
    'Los parámetros de la política monetaria son incompletos o inválidos. Revisá que las franjas cubran toda la línea de tiempo (desde «Sin límite» hasta «Sin límite»).',
  CONFLICT_INACTIVE_NAME:
    'Ya existe un registro inactivo con ese nombre. Búscalo en el listado (Activo: No) y reactívalo.',
  CONFLICT_ISO_CODE: 'Ya existe un país con ese código ISO',
  CONFLICT_INACTIVE_ISO_CODE:
    'Ya existe un país inactivo con ese código ISO. Búscalo en el listado (Activo: No) y reactívalo.',
  CONFLICT_CURRENCY_CODE: 'Ya existe una moneda con ese código',
  CONFLICT_INACTIVE_CURRENCY_CODE:
    'Ya existe una moneda inactiva con ese código. Búscala en el listado (Activo: No) y reactívala.',
  CONFLICT_INACTIVE_CURRENCY_NAME:
    'Ya existe una moneda inactiva con ese nombre. Búscala en el listado (Activo: No) y reactívala.',
  CONFLICT_EMAIL: 'Ya existe un usuario con ese email',
  SIGNUP_NOT_ACCEPTED:
    'No pudimos aceptar la solicitud. Revise los datos o espere la revisión.',
  SIGNUP_NAME_PENDING: 'Ya hay una solicitud pendiente con ese nombre de entidad.',
  SIGNUP_DOCUMENT_TAKEN: 'Ya existe una entidad con ese tipo y número de documento.',
  SIGNUP_DOCUMENT_PENDING: 'Ya hay una solicitud pendiente con ese documento.',
  SIGNUP_EMAIL_TAKEN: 'Ya existe una cuenta con ese correo de acceso.',
  SIGNUP_EMAIL_PENDING: 'Ya hay una solicitud pendiente con ese correo de acceso.',
  SIGNUP_NOT_PENDING: 'La solicitud ya no está pendiente.',
  CONFLICT_DOCUMENT: 'Ya existe un cliente con ese tipo y número de documento en esta entidad',
  IMPORT_FILE_UNREADABLE: 'No se pudo leer el archivo. Usá la plantilla Excel descargada.',
  IMPORT_TEMPLATE_INVALID: 'El archivo no coincide con la plantilla de importación de clientes',
  IMPORT_FILE_TOO_LARGE: 'El archivo supera el tamaño máximo permitido (50 MB)',
  CONFLICT_IMPORT_JOB_ACTIVE:
    'Ya hay una importación en cola o en curso para este recurso en la entidad',
  CONFLICT_CODE: 'Ya existe una acción con ese código',
  DOCUMENT_TYPE_NOT_FOUND: 'Tipo de documento no encontrado',
  DOCUMENT_TYPE_COUNTRY_MISMATCH: 'El tipo de documento no corresponde al país',
  DOCUMENT_TYPE_PERSON_TYPE_MISMATCH:
    'El tipo de documento no aplica al tipo de persona seleccionado (física/jurídica)',
  DOCUMENT_TYPE_GENERIC_NOT_ALLOWED:
    'No se puede usar un tipo de documento genérico cuando el país tiene tipos específicos',
  DOCUMENT_TYPE_ONLY_GENERIC_ALLOWED:
    'Solo se admite el tipo de documento genérico cuando el país no tiene tipos específicos',
  VALIDATION: 'Error de validación. Revise los datos enviados.',
  PERSISTENCE_ERROR: 'Error al guardar. Intenta de nuevo.',
  INTERNAL_ERROR: 'Error interno del servidor',
  INVALID_ID: 'Identificador inválido',
  WRONG_PASSWORD: 'La contraseña actual no es correcta',
  UNKNOWN: 'Error inesperado',
};

const forbiddenMessagesEs: Record<string, string> = {
  'You do not have permission for this action': 'No tienes permiso para esta acción',
  'You can only edit your tenant entity': 'Solo puedes editar la entidad de tu inquilino',
  'You can only activate your tenant entity': 'Solo puedes activar la entidad de tu inquilino',
  'You can only deactivate your tenant entity': 'Solo puedes desactivar la entidad de tu inquilino',
};

const documentValidationMessagesEs: Record<string, string> = {
  'ISO code must be exactly 2 uppercase letters':
    'El código ISO debe tener exactamente 2 letras mayúsculas',
  'Currency code must be exactly 3 uppercase letters':
    'El código de moneda debe tener exactamente 3 letras mayúsculas',
  'Name is required': 'El nombre es obligatorio',
  'CUIT has invalid check digit': 'El CUIT tiene dígito verificador inválido',
  'CUIL has invalid check digit': 'El CUIL tiene dígito verificador inválido',
  'CUIT must have 11 digits (no hyphens)': 'El CUIT debe tener 11 dígitos (sin guiones)',
  'CUIL must have 11 digits (no hyphens)': 'El CUIL debe tener 11 dígitos (sin guiones)',
  'DNI must have 7 or 8 numeric digits': 'El DNI debe tener 7 u 8 dígitos numéricos',
  'Enrolment Book number must have 8 digits': 'La Libreta de Enrolamiento debe tener 8 dígitos',
  'Civic Book number must have 8 digits': 'La Libreta Cívica debe tener 8 dígitos',
  'Passport must be alphanumeric, 6 to 20 characters, no spaces':
    'El pasaporte debe ser alfanumérico, de 6 a 20 caracteres, sin espacios',
  'Document number is required': 'El número de documento es obligatorio',
  'Document number must not exceed 100 characters':
    'El número de documento no puede superar 100 caracteres',
  'Cannot deactivate the last active payment option for this entity':
    'No se puede desactivar el único medio de pago activo',
  'At least one active payment option is required':
    'Debe haber al menos un medio de pago activo',
  'Payment option is already inactive for this entity':
    'El medio de pago ya está inactivo',
  'Validity period overlaps an existing price for this price list, sellable item and currency':
    'El período de vigencia se solapa con un precio existente para esta lista de precios, ítem vendible y moneda',
  'Valid from must be on or before valid to (null valid to means no end date)':
    'La fecha «válido desde» debe ser anterior o igual a «válido hasta» (si «válido hasta» está vacío, no hay fecha de fin)',
  'Currency is required': 'La moneda es obligatoria',
  'Currency is not accepted by the entity': 'La moneda no está aceptada por la entidad',
  'At least one supported currency is required': 'Debe haber al menos una moneda aceptada',
  'Default currency must be one of the supported currencies':
    'La moneda por defecto debe estar entre las monedas aceptadas',
  'Base currency must be one of the supported currencies':
    'La moneda base debe estar entre las monedas aceptadas',
  'Price list not found': 'Lista de precios no encontrada',
  'Sellable item not found': 'Ítem vendible no encontrado',
  'bands must start with an open from (−∞)':
    'La primera franja debe empezar con «Desde: Sin límite» para cubrir pagos adelantados.',
  'bands must end with an open to (+∞)':
    'La última franja debe terminar con «Hasta: Sin límite» para cubrir pagos muy atrasados.',
  'Cannot void: transaction has active incoming allocations; void those first':
    'No se puede anular esta transacción porque tiene cobros o créditos imputados. Para poder anularla tenés que, en cada cobro o crédito vinculado: (1) anularlo, o (2) corregir sus imputaciones y quitar el enlace a esta venta o débito. Cuando ya no queden imputaciones activas, volvé a intentar anular.',
  'Only registered transactions can be voided':
    'Solo se pueden anular transacciones registradas',
  'Address is required': 'El domicilio es obligatorio',
  'Person type is required': 'El tipo de persona es obligatorio',
  'Invalid person type': 'Tipo de persona no válido',
  'Document type is required': 'El tipo de documento es obligatorio',
  'Contact name is required': 'El nombre de contacto es obligatorio',
  'Contact email is required': 'El email de contacto es obligatorio',
  'Price list is required when the entity has more than one':
    'La lista de precios es obligatoria cuando la entidad tiene más de una',
  'Entity has no active price list': 'La entidad no tiene una lista de precios activa',
  'Active must be Sí or No': 'Activo debe ser Sí o No',
  'The file could not be read as an Excel workbook':
    'No se pudo leer el archivo. Usá la plantilla Excel descargada.',
  'Workbook is missing the Clientes sheet': 'Falta la hoja Clientes en el archivo',
  'Payment term days must be a non-negative integer':
    'El plazo de pago debe ser un número entero mayor o igual a 0',
  'Amount is required': 'El importe es obligatorio',
  'Amount must be a valid decimal': 'El importe debe ser un número decimal válido',
  'Duplicate opening balance for this currency': 'Hay un saldo inicial duplicado para esta moneda',
  'Failed to save import results': 'No se pudieron guardar los resultados de la importación',
  'Unexpected error processing row': 'Error inesperado al procesar la fila',
  'Import job failed': 'La importación no pudo completarse',
  'Email is required': 'El email es obligatorio',
  'Email does not have a valid format': 'El email no tiene un formato válido',
  'Email format is invalid': 'El email no tiene un formato válido',
  'Phone is required': 'El teléfono es obligatorio',
  'Country is required': 'El país es obligatorio',
  'Entity is required': 'La entidad es obligatoria',
  'Name must not exceed 100 characters': 'El nombre no puede superar 100 caracteres',
  'Address must not exceed 100 characters': 'El domicilio no puede superar 100 caracteres',
  'Phone must not exceed 50 characters': 'El teléfono no puede superar 50 caracteres',
  'Customer must have at least one contact': 'El cliente debe tener al menos un contacto',
  'Contact id is required': 'Falta el identificador del contacto',
  'Contact id must be unique': 'El identificador del contacto debe ser único',
  'A customer with this document type and number already exists in this entity':
    'Ya existe un cliente con ese tipo y número de documento en esta entidad',
  'Default currency not found in catalog': 'La moneda por defecto no está en el catálogo',
  'Default overdue notification policy key must be one of the entity available policies':
    'La política de mora no está disponible para esta entidad',
  'Unknown overdue notification policy key': 'Política de mora no válida',
  'Clientes sheet has no headers': 'La hoja Clientes no tiene encabezados',
  'A spreadsheet file is required': 'Debe seleccionar un archivo Excel',
  'FX quote is required for opening balances in a currency other than the entity base':
    'Falta la cotización para el saldo inicial en una moneda distinta de la moneda base',
  'Currency ISO code is required': 'El código de moneda es obligatorio',
  'Amount must be a valid decimal number': 'El importe debe ser un número decimal válido',
  'Amount must be greater than zero': 'El importe debe ser mayor que cero',
  'Person type must be physical_person or legal_person':
    'El tipo de persona debe ser Persona física o Persona jurídica',
  'Document type not found': 'Tipo de documento no encontrado',
  'Document type does not match customer country':
    'El tipo de documento no corresponde al país',
  'Document type does not apply to selected person type (individual/legal)':
    'El tipo de documento no aplica al tipo de persona seleccionado (física/jurídica)',
  'Generic document type is not allowed when the country has specific document types':
    'No se puede usar un tipo de documento genérico cuando el país tiene tipos específicos',
  'Only the generic document type is allowed when the country has no specific document types':
    'Solo se admite el tipo de documento genérico cuando el país no tiene tipos específicos',
  'Entity not found': 'Entidad no encontrada',
  'Opening balance side must be debit or credit':
    'El saldo inicial debe ser un importe distinto de cero (positivo o negativo)',
};

const ENGLISH_SUBJECT_ES: Record<string, string> = {
  email: 'El email',
  name: 'El nombre',
  address: 'El domicilio',
  phone: 'El teléfono',
  'contact name': 'El nombre de contacto',
  'contact email': 'El email de contacto',
  'document type': 'El tipo de documento',
  'document number': 'El número de documento',
  amount: 'El importe',
  'fx rate': 'La cotización',
  'amount in base': 'El importe en moneda base',
  currency: 'La moneda',
  'price list': 'La lista de precios',
  'person type': 'El tipo de persona',
  country: 'El país',
  entity: 'La entidad',
};

function subjectEs(raw: string): string {
  const mapped = ENGLISH_SUBJECT_ES[raw.trim().toLowerCase()];

  return mapped ?? raw.trim();
}

const RATE_LIMIT_UNIT_ES: Record<string, [string, string]> = {
  millisecond: ['milisegundo', 'milisegundos'],
  second: ['segundo', 'segundos'],
  minute: ['minuto', 'minutos'],
  hour: ['hora', 'horas'],
  day: ['día', 'días'],
  week: ['semana', 'semanas'],
  year: ['año', 'años'],
};

/** Mensajes de validación tipo Fastify/Ajv en inglés → español. */
export function normalizeValidationMessage(message: string): string {
  const trimmedEarly = message.trim();
  const rateLimit = trimmedEarly.match(
    /^Rate limit exceeded, retry in (\d+) (millisecond|second|minute|hour|day|week|year)s?$/i,
  );
  if (rateLimit) {
    const count = Number(rateLimit[1]);
    const unit = RATE_LIMIT_UNIT_ES[rateLimit[2]!.toLowerCase()];
    const label = count === 1 ? unit![0] : unit![1];
    return `Demasiados intentos. Volvé a intentar en ${count} ${label}.`;
  }

  const m = message.toLowerCase();
  if (m.includes('body/') || m.includes('body.')) {
    if (m.includes('phone') && (m.includes('50') || m.includes('more')))
      return 'El teléfono del contacto no puede superar 50 caracteres';
    if (m.includes('email') && (m.includes('255') || m.includes('more')))
      return 'El email del contacto no puede superar 255 caracteres';
    if (m.includes('name') && (m.includes('100') || m.includes('more')))
      return 'El nombre del contacto no puede superar 100 caracteres';
    if (m.includes('more') && m.includes('character'))
      return 'El valor no puede superar el máximo de caracteres permitido';
  }
  if (/body\/email must match format "email"/i.test(message)) return 'El email no tiene un formato válido';

  const trimmed = message.trim();
  if (trimmed === 'Subscription start date cannot be more than one year before today') {
    return 'La fecha desde puede tener como máximo un año de antigüedad';
  }
  const formatMatch =
    trimmed.match(/^(.+) does not have a valid format$/i) ??
    trimmed.match(/^(.+) format is invalid$/i);
  if (formatMatch) return `${subjectEs(formatMatch[1])} no tiene un formato válido`;

  const maxLen = trimmed.match(/^(.+) must not exceed (\d+) characters$/i);
  if (maxLen) return `${subjectEs(maxLen[1])} no puede superar ${maxLen[2]} caracteres`;

  const validDecimal = trimmed.match(/^(.+) must be a valid decimal(?: number)?$/i);
  if (validDecimal) return `${subjectEs(validDecimal[1])} debe ser un número decimal válido`;

  const boolMatch = trimmed.match(/^(.+) must be a boolean$/i);
  if (boolMatch) return `${subjectEs(boolMatch[1])} debe ser verdadero o falso`;

  const gtZero = trimmed.match(/^(.+) must be greater than zero$/i);
  if (gtZero) return `${subjectEs(gtZero[1])} debe ser mayor que cero`;

  const notFound = trimmed.match(/^(.+) not found$/i);
  if (notFound) return `${subjectEs(notFound[1])} no se encontró`;

  return message;
}

/**
 * Traduce un ítem de error del API (código + mensaje inglés) a texto en español para mostrar al usuario.
 */
export function translateTimciApiErrorMessage(code: string | undefined, message: string): string {
  const trimmed = message.trim();
  const c = code?.trim() ?? '';

  const overlapMatch = trimmed.match(
    /^bands\[(\d+)\] and bands\[(\d+)\] overlap or leave a gap$/,
  );
  if (overlapMatch) {
    return `Las franjas ${Number(overlapMatch[1]) + 1} y ${Number(overlapMatch[2]) + 1} se solapan o dejan un hueco. Deben ser consecutivas sin solaparse.`;
  }

  if (trimmed && documentValidationMessagesEs[trimmed]) {
    return documentValidationMessagesEs[trimmed];
  }

  if (trimmed.startsWith('Currency is not accepted by the entity')) {
    return 'La moneda no está aceptada por la entidad';
  }
  if (trimmed.startsWith('Cannot remove a currency that is used by a ')) {
    const kinds = trimmed.slice('Cannot remove a currency that is used by a '.length);
    const kindEs: Record<string, string> = {
      'payment option': 'medio de pago',
      customer: 'cliente',
      'price list item': 'precio',
      'current account': 'cuenta corriente',
      'commercial transaction': 'transacción comercial',
    };
    const translated = kinds
      .split(', ')
      .map((k) => kindEs[k] ?? k)
      .join(', ');
    return `No se puede quitar una moneda que tiene registros relacionados (${translated})`;
  }
  if (trimmed.startsWith('Payment option currency is not supported by the entity')) {
    return 'La moneda del medio de pago no está entre las aceptadas por la entidad';
  }

  const requiredField = trimmed.match(/^(.+) is required$/);
  if (requiredField && !documentValidationMessagesEs[trimmed]) {
    return `${requiredField[1]} es obligatorio`;
  }

  if (/invalid input syntax for type json/i.test(trimmed)) {
    return documentValidationMessagesEs['Failed to save import results'];
  }

  const ambiguousDoc = trimmed.match(/^Ambiguous document type: (.+)$/i);
  if (ambiguousDoc) {
    return `Tipo de documento ambiguo: ${ambiguousDoc[1]}`;
  }

  const unknownValue = trimmed.match(/^Unknown value for (.+): (.+)$/i);
  if (unknownValue) {
    return `Valor no válido para ${unknownValue[1]}: ${unknownValue[2]}`;
  }

  const moreRows = trimmed.match(/^Workbook has more than (\d+) data rows$/);
  if (moreRows) {
    return `El archivo tiene más de ${moreRows[1]} filas de datos`;
  }

  const unknownMatch = trimmed.match(/^Unknown (country|currency|price list|overdue policy|monetary policy|document type): (.+)$/i);
  if (unknownMatch) {
    const kind = unknownMatch[1].toLowerCase();
    const value = unknownMatch[2];
    const labels: Record<string, string> = {
      country: 'país',
      currency: 'moneda',
      'price list': 'lista de precios',
      'overdue policy': 'política de mora',
      'monetary policy': 'política monetaria',
      'document type': 'tipo de documento',
    };
    return `Valor no válido para ${labels[kind] ?? kind}: ${value}`;
  }

  if (trimmed.startsWith('Password must be at least 8 characters')) {
    return 'La contraseña debe tener al menos 8 caracteres, con mayúscula, minúscula, número y símbolo.';
  }

  if (c === 'VALIDATION') {
    if (trimmed) {
      const normalized = normalizeValidationMessage(trimmed);
      return normalized;
    }
    return apiErrorMessagesEs.VALIDATION;
  }

  if (c === 'FORBIDDEN' && trimmed && forbiddenMessagesEs[trimmed]) {
    return forbiddenMessagesEs[trimmed];
  }

  if (c && apiErrorMessagesEs[c]) {
    return apiErrorMessagesEs[c];
  }

  if (trimmed) {
    const normalized = normalizeValidationMessage(trimmed);
    if (normalized !== trimmed) return normalized;

    return trimmed;
  }

  return apiErrorMessagesEs.UNKNOWN;
}

export function translateApiErrorsToJoinedMessage(
  errors: Array<{ code?: string; message?: string }>,
): string {
  if (!Array.isArray(errors) || errors.length === 0) {
    return apiErrorMessagesEs.INTERNAL_ERROR;
  }
  const parts = errors
    .map((e) =>
      translateTimciApiErrorMessage(
        typeof e.code === 'string' ? e.code : undefined,
        typeof e.message === 'string' ? e.message : '',
      ),
    )
    .filter(Boolean);
  return parts.join(' • ') || apiErrorMessagesEs.UNKNOWN;
}

/**
 * Primer mensaje de error legible a partir del cuerpo JSON de un fallo HTTP (para `Error.message` en `timciFetch`).
 */
export function buildTimciHttpErrorUserMessage(json: unknown, statusFallback: string): string {
  if (json && typeof json === 'object') {
    const o = json as {
      errors?: Array<{ code?: string; message?: string }>;
      message?: string;
    };
    if (Array.isArray(o.errors) && o.errors.length > 0) {
      return translateApiErrorsToJoinedMessage(o.errors);
    }
    if (o.message != null && String(o.message).trim() !== '') {
      return normalizeValidationMessage(String(o.message).trim());
    }
  }
  if (statusFallback === 'Validation error') {
    return 'Error de validación. Revisa los datos enviados.';
  }
  return statusFallback;
}
