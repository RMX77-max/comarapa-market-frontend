import type { RespuestaApi } from 'src/models/Api';
import type { Notificacion } from 'src/models/Notificacion';
import { servicioApi } from './servicioApi';

export async function listarNotificaciones(): Promise<{
  notificaciones: Notificacion[];
  no_leidas: number;
}> {
  const respuesta = await servicioApi.get<
    RespuestaApi<{ notificaciones: Notificacion[]; no_leidas: number }>
  >('/notificaciones');
  return respuesta.data.datos;
}

export async function marcarNotificacionLeida(id: number): Promise<void> {
  await servicioApi.patch(`/notificaciones/${id}/leer`);
}

export async function marcarTodasLeidas(): Promise<void> {
  await servicioApi.patch('/notificaciones/leer-todas');
}
