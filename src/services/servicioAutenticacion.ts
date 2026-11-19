import type { RespuestaApi } from 'src/models/Api';
import type { Usuario } from 'src/models/Usuario';
export { solicitarRecuperacion, restablecerContrasena } from './servicioOperaciones';
import { servicioApi } from './servicioApi';

interface DatosSesion {
  usuario: Usuario;
  token: string;
}

export async function registrar(datos: {
  nombre: string;
  telefono: string;
  email?: string;
  contrasena: string;
  confirmacion_contrasena: string;
}): Promise<DatosSesion> {
  const respuesta = await servicioApi.post<RespuestaApi<DatosSesion>>('/registro', datos);
  return respuesta.data.datos;
}

export async function iniciarSesion(
  identificador: string,
  contrasena: string,
): Promise<DatosSesion> {
  const respuesta = await servicioApi.post<RespuestaApi<DatosSesion>>('/iniciar-sesion', {
    identificador,
    contrasena,
  });
  return respuesta.data.datos;
}

export interface SolicitudVerificacionTelefono {
  solicitud_id: number;
  telefono: string;
}
export async function solicitarVerificacionTelefono(
  telefono?: string,
): Promise<SolicitudVerificacionTelefono> {
  return (
    await servicioApi.post<RespuestaApi<SolicitudVerificacionTelefono>>(
      '/telefono/verificacion',
      telefono ? { telefono } : {},
    )
  ).data.datos;
}
export async function confirmarVerificacionTelefono(
  solicitud_id: number,
  codigo: string,
): Promise<void> {
  await servicioApi.post('/telefono/verificacion/confirmar', { solicitud_id, codigo });
}

export async function obtenerUsuarioAutenticado(): Promise<Usuario> {
  const respuesta = await servicioApi.get<RespuestaApi<{ usuario: Usuario }>>('/usuario');
  return respuesta.data.datos.usuario;
}

export async function cerrarSesion(): Promise<void> {
  await servicioApi.post('/cerrar-sesion');
}
