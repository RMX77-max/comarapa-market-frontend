import type { RespuestaApi } from 'src/models/Api';
import type { Usuario } from 'src/models/Usuario';
import { servicioApi } from './servicioApi';

export async function obtenerPerfil(): Promise<Usuario> {
  const respuesta = await servicioApi.get<RespuestaApi<{ usuario: Usuario }>>('/perfil');
  return respuesta.data.datos.usuario;
}

export async function actualizarPerfil(datos: {
  nombre: string;
  ubicacion: string;
  foto?: File;
}): Promise<Usuario> {
  const formulario = new FormData();
  formulario.append('_method', 'PUT');
  formulario.append('nombre', datos.nombre);
  formulario.append('ubicacion', datos.ubicacion);
  if (datos.foto) formulario.append('foto_perfil', datos.foto);
  const respuesta = await servicioApi.post<RespuestaApi<{ usuario: Usuario }>>(
    '/perfil',
    formulario,
  );
  return respuesta.data.datos.usuario;
}
