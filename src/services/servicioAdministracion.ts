import type { AuditoriaAdministrativa, ResumenAdministrativo } from 'src/models/Administracion';
import type { Paginacion, RespuestaApi } from 'src/models/Api';
import type { EstadoModeracion, Producto } from 'src/models/Producto';
import { servicioApi } from './servicioApi';

export async function obtenerResumenAdministrativo(): Promise<ResumenAdministrativo> {
  const respuesta =
    await servicioApi.get<RespuestaApi<ResumenAdministrativo>>('/administracion/resumen');

  return respuesta.data.datos;
}

export async function listarPublicacionesModeracion(parametros: {
  pagina?: number;
  estado?: EstadoModeracion | '';
  buscar?: string;
}): Promise<{ productos: Producto[]; paginacion: Paginacion }> {
  const respuesta = await servicioApi.get<
    RespuestaApi<{ productos: Producto[]; paginacion: Paginacion }>
  >('/administracion/publicaciones', { params: parametros });
  return respuesta.data.datos;
}

export async function moderarPublicacion(
  id: number,
  estado: Exclude<EstadoModeracion, 'pendiente'>,
  motivo?: string,
): Promise<Producto> {
  const respuesta = await servicioApi.patch<RespuestaApi<{ producto: Producto }>>(
    `/administracion/publicaciones/${id}/moderacion`,
    { estado, motivo },
  );
  return respuesta.data.datos.producto;
}

export async function actualizarPreciosPublicacion(
  id: number,
  datos: { precio_publico: number; precio_minimo: number },
): Promise<Producto> {
  const respuesta = await servicioApi.patch<RespuestaApi<{ producto: Producto }>>(
    `/administracion/publicaciones/${id}/precios`,
    datos,
  );
  return respuesta.data.datos.producto;
}

export interface UsuarioAdministrado {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string | null;
  telefono_verificado: boolean;
  rol: 'usuario' | 'administrador' | 'superadministrador';
  estado: 'activo' | 'suspendido' | 'bloqueado';
  motivo: string | null;
  suspendido_hasta: string | null;
  publicaciones: number;
  fecha: string;
}
export async function listarUsuariosAdministracion(params: {
  pagina?: number;
  buscar?: string | undefined;
  estado?: string | undefined;
}) {
  const respuesta = await servicioApi.get<
    RespuestaApi<{ usuarios: UsuarioAdministrado[]; paginacion: Paginacion }>
  >('/administracion/usuarios', { params });
  return respuesta.data.datos;
}
export async function cambiarEstadoUsuario(
  id: number,
  estado: string,
  motivo?: string,
): Promise<void> {
  await servicioApi.patch(`/administracion/usuarios/${id}/estado`, { estado, motivo });
}
export async function cambiarRolUsuario(id: number, rol: string): Promise<void> {
  await servicioApi.patch(`/administracion/usuarios/${id}/rol`, { rol });
}
export interface VerificacionTelefonoAdmin {
  id: number;
  tipo: 'verificacion' | 'recuperacion';
  telefono: string;
  codigo_enviado_en: string | null;
  expira_en: string;
  usuario: { id: number; nombre: string; email: string | null };
}
export async function listarVerificacionesTelefono(): Promise<VerificacionTelefonoAdmin[]> {
  return (
    await servicioApi.get<RespuestaApi<{ solicitudes: VerificacionTelefonoAdmin[] }>>(
      '/administracion/verificaciones-telefono',
    )
  ).data.datos.solicitudes;
}
export async function revisarVerificacionTelefono(
  id: number,
  accion: 'aprobar' | 'rechazar',
  codigo?: string,
): Promise<void> {
  await servicioApi.patch(`/administracion/verificaciones-telefono/${id}`, { accion, codigo });
}
export async function prepararEnvioCodigo(
  id: number,
): Promise<{ whatsapp_url: string; expira_en: string }> {
  return (
    await servicioApi.post<RespuestaApi<{ whatsapp_url: string; expira_en: string }>>(
      `/administracion/verificaciones-telefono/${id}/preparar-envio`,
    )
  ).data.datos;
}

export async function listarAuditoriaAdministrativa(parametros: {
  pagina?: number;
  accion?: string;
  buscar?: string;
}): Promise<{ auditorias: AuditoriaAdministrativa[]; paginacion: Paginacion }> {
  const respuesta = await servicioApi.get<
    RespuestaApi<{ auditorias: AuditoriaAdministrativa[]; paginacion: Paginacion }>
  >('/administracion/auditoria', { params: parametros });

  return respuesta.data.datos;
}
