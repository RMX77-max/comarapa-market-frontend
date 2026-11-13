import type { AuditoriaAdministrativa, ResumenAdministrativo } from 'src/models/Administracion';
import type { Paginacion, RespuestaApi } from 'src/models/Api';
import type { EstadoModeracion, Producto } from 'src/models/Producto';
import { servicioApi } from './servicioApi';

export async function obtenerResumenAdministrativo(): Promise<ResumenAdministrativo> {
  const respuesta = await servicioApi.get<RespuestaApi<ResumenAdministrativo>>(
    '/administracion/resumen',
  );

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

export async function actualizarPreciosPublicacion(id:number,datos:{precio_publico:number;precio_minimo:number|null;comision:number|null;precio_final:number|null}):Promise<Producto>{const respuesta=await servicioApi.patch<RespuestaApi<{producto:Producto}>>(`/administracion/publicaciones/${id}/precios`,datos);return respuesta.data.datos.producto;}

export interface UsuarioAdministrado {
  id: number; nombre: string; email: string; rol: 'usuario'|'administrador'|'superadministrador';
  estado: 'activo'|'suspendido'|'bloqueado'; motivo: string|null; suspendido_hasta: string|null;
  publicaciones: number; fecha: string;
}
export async function listarUsuariosAdministracion(params: { pagina?:number; buscar?:string|undefined; estado?:string|undefined }) {
  const respuesta=await servicioApi.get<RespuestaApi<{usuarios:UsuarioAdministrado[];paginacion:Paginacion}>>('/administracion/usuarios',{params});
  return respuesta.data.datos;
}
export async function cambiarEstadoUsuario(id:number, estado:string, motivo?:string):Promise<void>{ await servicioApi.patch(`/administracion/usuarios/${id}/estado`,{estado,motivo}); }
export async function cambiarRolUsuario(id:number, rol:string):Promise<void>{ await servicioApi.patch(`/administracion/usuarios/${id}/rol`,{rol}); }

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
