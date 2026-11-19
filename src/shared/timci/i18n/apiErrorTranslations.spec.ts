import { describe, expect, it } from 'vitest';
import { translateTimciApiErrorMessage } from './apiErrorTranslations.js';

describe('translateTimciApiErrorMessage', () => {
  it('translates contact email format from the domain VO', () => {
    expect(
      translateTimciApiErrorMessage(
        'VALIDATION',
        'Subscription start date cannot be more than one year before today',
      ),
    ).toBe('La fecha desde puede tener como máximo un año de antigüedad');
    expect(
      translateTimciApiErrorMessage('VALIDATION', 'Line date must be a billing date of the subscription'),
    ).toBe('La fecha tiene que ser un vencimiento del abono');
    expect(
      translateTimciApiErrorMessage('VALIDATION', 'Discount percent must be between 0 and 100'),
    ).toBe('El descuento tiene que estar entre 0 y 100');
    expect(translateTimciApiErrorMessage('VALIDATION', 'Email does not have a valid format')).toBe(
      'El correo no tiene un formato válido',
    );
  });

  it('translates required and length messages used in customer import', () => {
    expect(translateTimciApiErrorMessage('VALIDATION', 'Name is required')).toBe(
      'El nombre es obligatorio',
    );
    expect(translateTimciApiErrorMessage('VALIDATION', 'Contact email is required')).toBe(
      'El correo de contacto es obligatorio',
    );
    expect(translateTimciApiErrorMessage('VALIDATION', 'Sellable item is required')).toBe(
      'El producto o servicio es obligatorio',
    );
    expect(translateTimciApiErrorMessage('VALIDATION', 'Warehouse is required')).toBe(
      'Este campo es obligatorio',
    );
    expect(
      translateTimciApiErrorMessage(
        'VALIDATION',
        'Cannot remove a currency that is used by a ledger',
      ),
    ).toBe('No se puede quitar una moneda que tiene registros relacionados (otro registro)');
    expect(translateTimciApiErrorMessage('VALIDATION', 'Name must not exceed 100 characters')).toBe(
      'El nombre no puede superar 100 caracteres',
    );
    expect(translateTimciApiErrorMessage('VALIDATION', 'Phone must not exceed 50 characters')).toBe(
      'El teléfono no puede superar 50 caracteres',
    );
  });

  it('translates signup identity conflicts onto a Spanish message', () => {
    expect(translateTimciApiErrorMessage('SIGNUP_EMAIL_TAKEN', 'An account with this email already exists')).toBe(
      'Ya existe una cuenta con ese correo de acceso.',
    );
    expect(
      translateTimciApiErrorMessage(
        'SIGNUP_VERIFICATION_INVALID',
        'The verification link is invalid or has expired',
      ),
    ).toBe('El enlace de confirmación no es válido o ya venció.');
    expect(
      translateTimciApiErrorMessage('SIGNUP_DOCUMENT_TAKEN', 'An entity with this document already exists'),
    ).toBe('Ya existe una entidad con ese tipo y número de documento.');
  });

  it('translates the rate-limit message with its wait time', () => {
    expect(translateTimciApiErrorMessage(undefined, 'Rate limit exceeded, retry in 25 minutes')).toBe(
      'Demasiados intentos. Volvé a intentar en 25 minutos.',
    );
    expect(translateTimciApiErrorMessage(undefined, 'Rate limit exceeded, retry in 1 minute')).toBe(
      'Demasiados intentos. Volvé a intentar en 1 minuto.',
    );
  });

  it('translates catalog and document messages that can appear per import row', () => {
    expect(translateTimciApiErrorMessage('VALIDATION', 'Unknown country: Narnia')).toBe(
      'Valor no válido para país: Narnia',
    );
    expect(
      translateTimciApiErrorMessage(
        'DOCUMENT_TYPE_PERSON_TYPE_MISMATCH',
        'Document type does not apply to selected person type (individual/legal)',
      ),
    ).toBe('El tipo de documento no aplica al tipo de persona seleccionado (física/jurídica)');
  });
});
