import { describe, expect, it } from 'vitest';
import routes from './routes';

describe('rutas administrativas', () => {
  it('mantiene todas las páginas administrativas dentro de su layout', () => {
    const administracion = routes.find((ruta) => ruta.path === '/administracion');
    const autenticacion = routes.find((ruta) => ruta.path === '/iniciar-sesion');
    const registro = routes.find((ruta) => ruta.path === '/registro');
    const nombresAdministrativos = [
      'administracion',
      'administracion-notificaciones',
      'administracion-publicaciones',
      'auditoria-administrativa',
    ];

    expect(administracion?.children?.map((ruta) => ruta.name)).toEqual(
      expect.arrayContaining(nombresAdministrativos),
    );
    expect(autenticacion?.children?.map((ruta) => ruta.name)).not.toEqual(
      expect.arrayContaining(nombresAdministrativos),
    );
    expect(registro?.children?.map((ruta) => ruta.name)).not.toEqual(
      expect.arrayContaining(nombresAdministrativos),
    );
  });
});
