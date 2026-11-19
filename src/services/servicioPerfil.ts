import type { RespuestaApi } from 'src/models/Api';
import type { ResumenUsuario, Usuario } from 'src/models/Usuario';
import type { Producto } from 'src/models/Producto';
import { servicioApi } from './servicioApi';

export async function obtenerPerfil(): Promise<Usuario> {
  const respuesta = await servicioApi.get<RespuestaApi<{ usuario: Usuario }>>('/perfil');
  return respuesta.data.datos.usuario;
}

export async function actualizarPerfil(datos: {
  nombre: string;
  ubicacion: string;
  biografia: string;
  foto?: File;
  portada?: File;
  eliminarPortada?: boolean;
}): Promise<Usuario> {
  const formulario = new FormData();
  formulario.append('_method', 'PUT');
  formulario.append('nombre', datos.nombre);
  formulario.append('ubicacion', datos.ubicacion);
  formulario.append('biografia', datos.biografia);
  if (datos.foto) formulario.append('foto_perfil', datos.foto);
  if (datos.portada) formulario.append('foto_portada', datos.portada);
  if (datos.eliminarPortada) formulario.append('eliminar_portada', '1');
  const respuesta = await servicioApi.post<RespuestaApi<{ usuario: Usuario }>>(
    '/perfil',
    formulario,
  );
  return respuesta.data.datos.usuario;
}

export async function obtenerPerfilPublico(
  id: number,
): Promise<{ usuario: ResumenUsuario; productos: Producto[] }> {
  return (
    await servicioApi.get<RespuestaApi<{ usuario: ResumenUsuario; productos: Producto[] }>>(
      `/usuarios/${id}/perfil`,
    )
  ).data.datos;
}
