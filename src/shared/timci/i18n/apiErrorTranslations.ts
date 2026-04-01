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
  FORBIDDEN_GLOBAL_TENANT: 'El tenant global no puede desactivarse',
  VALIDATION: 'Error de validación. Revisa los datos enviados.',
  CONFLICT_NAME: 'Ya existe un registro con ese nombre',
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

const documentValidationMessagesEs: Record<string, string> = {
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
    return apiErrorMessagesEs.VALIDATION;
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
