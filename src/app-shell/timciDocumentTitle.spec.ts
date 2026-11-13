import { describe, expect, it } from 'vitest';
import { timciDocumentTitle } from './timciDocumentTitle.js';

describe('timciDocumentTitle', () => {
  it('names list, create, edit and show in Spanish', () => {
    expect(timciDocumentTitle('/countries', 'countries', 'list')).toBe('Países | Timci');
    expect(timciDocumentTitle('/countries/create', 'countries', 'create')).toBe('Crear país | Timci');
    expect(timciDocumentTitle('/countries/edit/1', 'countries', 'edit')).toBe('Editar país | Timci');
    expect(timciDocumentTitle('/countries/show/1', 'countries', 'show')).toBe('País | Timci');
  });

  it('uses the heading already on screen', () => {
    expect(timciDocumentTitle('/customers/show/1', 'customers', 'show', 'Ada Lovelace')).toBe(
      'Ada Lovelace | Timci',
    );
    expect(timciDocumentTitle('/sales/show/1', 'sales', 'show', 'Nº 12')).toBe('Nº 12 | Timci');
  });

  it('names screens that are not a resource action', () => {
    expect(timciDocumentTitle('/login')).toBe('Iniciar sesión en tu cuenta | Timci');
    expect(timciDocumentTitle('/signup')).toBe('Solicitar el alta | Timci');
    expect(timciDocumentTitle('/preferences')).toBe('Preferencias de usuario | Timci');
    expect(timciDocumentTitle('/change-password')).toBe('Cambiar contraseña | Timci');
    expect(timciDocumentTitle('/customers/import-jobs', 'customers', 'list')).toBe(
      'Importaciones de clientes | Timci',
    );
    expect(timciDocumentTitle('/customers/import-jobs/job-1', 'customers', 'list')).toBe(
      'Resultado de la importación | Timci',
    );
    expect(timciDocumentTitle('/reports/aging', 'reports', 'list')).toBe(
      'Informes · Antigüedad de saldos | Timci',
    );
    expect(timciDocumentTitle('/bi', 'dashboard', 'list', 'Panel de plataforma')).toBe(
      'Panel de plataforma | Timci',
    );
  });

  it('names an unknown path as not found', () => {
    expect(timciDocumentTitle('/no-existe')).toBe('Página no encontrada | Timci');
    expect(timciDocumentTitle('/')).toBe('Timci');
  });
});
