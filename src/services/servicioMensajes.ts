import type { Paginacion, RespuestaApi } from 'src/models/Api';
import type { Conversacion } from 'src/models/Conversacion';
import type { Mensaje } from 'src/models/Mensaje';
import { servicioApi } from './servicioApi';

export async function crearConversacion(
  productoId: number,
  mensaje?: string,
): Promise<Conversacion> {
  const respuesta = await servicioApi.post<RespuestaApi<{ conversacion: Conversacion }>>(
    '/conversaciones',
    {
      producto_id: productoId,
      mensaje,
    },
  );
  return respuesta.data.datos.conversacion;
}

export async function listarConversaciones(
  page = 1,
): Promise<{ conversaciones: Conversacion[]; paginacion: Paginacion }> {
  const respuesta = await servicioApi.get<
    RespuestaApi<{ conversaciones: Conversacion[]; paginacion: Paginacion }>
  >('/conversaciones', { params: { page } });
  return respuesta.data.datos;
}

export async function obtenerConversacion(
  id: number,
  page = 1,
): Promise<{
  conversacion: Conversacion;
  mensajes: Mensaje[];
  paginacion: Paginacion;
}> {
  const respuesta = await servicioApi.get<
    RespuestaApi<{ conversacion: Conversacion; mensajes: Mensaje[]; paginacion: Paginacion }>
  >(`/conversaciones/${id}`, { params: { page } });
  return respuesta.data.datos;
}

export async function enviarMensaje(id: number, mensaje: string): Promise<Mensaje> {
  const respuesta = await servicioApi.post<RespuestaApi<{ mensaje: Mensaje }>>(
    `/conversaciones/${id}/mensajes`,
    { mensaje },
  );
  return respuesta.data.datos.mensaje;
}
