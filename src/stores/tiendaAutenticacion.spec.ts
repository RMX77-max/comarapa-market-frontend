import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useTiendaAutenticacion } from './tiendaAutenticacion';

describe('tiendaAutenticacion', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('establece y limpia una sesión', () => {
    const tienda = useTiendaAutenticacion();
    tienda.establecerSesion(
      { id: 7, nombre: 'Ana', ubicacion: 'Comarapa', url_foto_perfil: null },
      'token-prueba',
    );
    expect(tienda.estaAutenticado).toBe(true);
    expect(tienda.usuario?.nombre).toBe('Ana');
    tienda.limpiarSesion();
    expect(tienda.estaAutenticado).toBe(false);
    expect(tienda.usuario).toBeNull();
  });
});
