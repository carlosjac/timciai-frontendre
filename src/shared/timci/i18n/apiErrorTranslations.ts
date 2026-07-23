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
  FORBIDDEN_PAYMENT_OPTION_REMOVAL:
    'No se puede quitar un medio de pago guardado; desactívalo en su lugar',
  PAYMENT_OPTION_IN_USE:
    'No se puede desactivar el medio de pago porque tiene cobros asociados',
  FORBIDDEN_GLOBAL_TENANT: 'El tenant global no puede desactivarse',
  FORBIDDEN_ROOT_ROLE: 'El rol root no puede desactivarse',
  FORBIDDEN_ROOT_GLOBAL_ASSIGNMENT:
    'No se puede revocar la asignación del rol root en el tenant global',
  FORBIDDEN_ROOT_GLOBAL_PERMISSION:
    'No se puede quitar un permiso del rol root en el tenant global',
  VALIDATION: 'Error de validación. Revisa los datos enviados.',
  CONFLICT_NAME: 'Ya existe un registro con ese nombre',
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
  CONFLICT_DOCUMENT: 'Ya existe un cliente con ese tipo y número de documento en esta entidad',
  CONFLICT_CODE: 'Ya existe una acción con ese código',
  DOCUMENT_TYPE_NOT_FOUND: 'Tipo de documento no encontrado',
  DOCUMENT_TYPE_COUNTRY_MISMATCH: 'El tipo de documento no corresponde al país',
  DOCUMENT_TYPE_PERSON_TYPE_MISMATCH:
    'El tipo de documento no aplica al tipo de persona seleccionado (física/jurídica)',
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
  'Price list not found': 'Lista de precios no encontrada',
  'Sellable item not found': 'Ítem vendible no encontrado',
};

/** Mensajes de validación tipo Fastify/Ajv en inglés → español. */
export function normalizeValidationMessage(message: string): string {
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
  return message;
}

/**
 * Traduce un ítem de error del API (código + mensaje inglés) a texto en español para mostrar al usuario.
 */
export function translateTimciApiErrorMessage(code: string | undefined, message: string): string {
  const trimmed = message.trim();
  const c = code?.trim() ?? '';

  if (c === 'VALIDATION') {
    if (trimmed && documentValidationMessagesEs[trimmed]) {
      return documentValidationMessagesEs[trimmed];
    }
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
