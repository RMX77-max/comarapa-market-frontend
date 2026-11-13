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
  email: string;
  contrasena: string;
  confirmacion_contrasena: string;
}): Promise<DatosSesion> {
  const respuesta = await servicioApi.post<RespuestaApi<DatosSesion>>('/registro', datos);
  return respuesta.data.datos;
}

export async function iniciarSesion(email: string, contrasena: string): Promise<DatosSesion> {
  const respuesta = await servicioApi.post<RespuestaApi<DatosSesion>>('/iniciar-sesion', {
    email,
    contrasena,
  });
  return respuesta.data.datos;
}

export async function obtenerUsuarioAutenticado(): Promise<Usuario> {
  const respuesta = await servicioApi.get<RespuestaApi<{ usuario: Usuario }>>('/usuario');
  return respuesta.data.datos.usuario;
}

export async function cerrarSesion(): Promise<void> {
  await servicioApi.post('/cerrar-sesion');
}
