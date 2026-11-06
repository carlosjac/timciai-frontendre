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
    expect(translateTimciApiErrorMessage('VALIDATION', 'Email does not have a valid format')).toBe(
      'El email no tiene un formato válido',
    );
  });

  it('translates required and length messages used in customer import', () => {
    expect(translateTimciApiErrorMessage('VALIDATION', 'Name is required')).toBe(
      'El nombre es obligatorio',
    );
    expect(translateTimciApiErrorMessage('VALIDATION', 'Contact email is required')).toBe(
      'El email de contacto es obligatorio',
    );
    expect(translateTimciApiErrorMessage('VALIDATION', 'Name must not exceed 100 characters')).toBe(
      'El nombre no puede superar 100 caracteres',
    );
    expect(translateTimciApiErrorMessage('VALIDATION', 'Phone must not exceed 50 characters')).toBe(
      'El teléfono no puede superar 50 caracteres',
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
