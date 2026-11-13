import { servicioApi } from './servicioApi';
import type { RespuestaApi } from 'src/models/Api';
import type { Producto } from 'src/models/Producto';
import type { MovimientoCaja, OperacionVenta } from 'src/models/OperacionVenta';
export interface SolicitudSoporte { id:number;asunto:string;mensaje:string;estado:string;respuesta:string|null;created_at:string;usuario?:{name:string;email:string};producto?:Pick<Producto,'id'|'titulo'|'estado'|'estado_moderacion'>|null; }
export interface ReporteAdmin { id:number;categoria:string;descripcion:string;estado:string;reportante?:{name:string}; }
export interface ConfiguracionQr { banco:string;titular:string;moneda:string;url_imagen:string; }
export type Orden = OperacionVenta & { producto?: { id:number;titulo:string;estado:string;url_imagen:string|null } };
export interface ResumenCaja { desde:string;hasta:string;productos_vendidos:number;ingresos:number;egresos:number;saldo:number;pagado_vendedores:number;gastos:number; }
export interface MovimientoCajaAdmin extends MovimientoCaja { orden_id:number;codigo:string|null;producto:string|null; }
export async function solicitarRecuperacion(email:string):Promise<void>{await servicioApi.post('/recuperar-contrasena',{email});}
export async function restablecerContrasena(datos:Record<string,string>):Promise<void>{await servicioApi.post('/restablecer-contrasena',datos);}
export async function crearSoporte(datos:{asunto:string;mensaje:string;producto_id?:number|null}):Promise<void>{await servicioApi.post('/soporte',datos);}
export async function listarSoportePropio():Promise<SolicitudSoporte[]>{return(await servicioApi.get<RespuestaApi<{solicitudes:SolicitudSoporte[]}>>('/soporte')).data.datos.solicitudes;}
export async function listarPublicacionesActivasSoporte():Promise<Producto[]>{return(await servicioApi.get<RespuestaApi<{productos:Producto[]}>>('/soporte/publicaciones-activas')).data.datos.productos;}
export async function listarSoporteAdmin():Promise<SolicitudSoporte[]>{return(await servicioApi.get<RespuestaApi<{solicitudes:SolicitudSoporte[]}>>('/administracion/soporte')).data.datos.solicitudes;}
export async function actualizarSoporte(id:number,datos:object):Promise<void>{await servicioApi.patch(`/administracion/soporte/${id}`,datos);}
export async function crearReporte(datos:object):Promise<void>{await servicioApi.post('/reportes',datos);}
export async function listarReportesAdmin():Promise<ReporteAdmin[]>{return(await servicioApi.get<RespuestaApi<{reportes:ReporteAdmin[]}>>('/administracion/reportes')).data.datos.reportes;}
export async function resolverReporte(id:number,datos:object):Promise<void>{await servicioApi.patch(`/administracion/reportes/${id}`,datos);}
export async function listarOrdenes():Promise<Orden[]>{return(await servicioApi.get<RespuestaApi<{ordenes:Orden[]}>>('/ordenes')).data.datos.ordenes;}
export async function listarOrdenesAdmin():Promise<Orden[]>{return(await servicioApi.get<RespuestaApi<{ordenes:Orden[]}>>('/administracion/ordenes')).data.datos.ordenes;}
export async function obtenerResumenCaja():Promise<{resumen:ResumenCaja;movimientos:MovimientoCajaAdmin[]}>{return(await servicioApi.get<RespuestaApi<{resumen:ResumenCaja;movimientos:MovimientoCajaAdmin[]}>>('/administracion/caja/resumen')).data.datos;}
export async function obtenerConfiguracionPago():Promise<ConfiguracionQr|null>{return(await servicioApi.get<RespuestaApi<{configuracion:ConfiguracionQr|null}>>('/administracion/configuracion-pago')).data.datos.configuracion;}
export async function guardarConfiguracionPago(datos:FormData):Promise<void>{await servicioApi.post('/administracion/configuracion-pago',datos);}

export async function crearOperacionDesdeConversacion(
  conversacionId: number,
  datos: { precio_final: number; metodo_pago: string; notas?: string },
): Promise<OperacionVenta> {
  const respuesta = await servicioApi.post<RespuestaApi<{ orden: OperacionVenta }>>(
    `/administracion/conversaciones/${conversacionId}/operacion`,
    datos,
  );
  return respuesta.data.datos.orden;
}

export async function actualizarOperacion(
  ordenId: number,
  datos: { accion: string; monto?: number; referencia?: string; notas?: string; motivo?: string },
): Promise<OperacionVenta> {
  const respuesta = await servicioApi.patch<RespuestaApi<{ orden: OperacionVenta }>>(
    `/administracion/ordenes/${ordenId}`,
    datos,
  );
  return respuesta.data.datos.orden;
}

export async function subirComprobante(ordenId: number, archivo: File): Promise<OperacionVenta> {
  const datos = new FormData();
  datos.append('comprobante', archivo);
  const respuesta = await servicioApi.post<RespuestaApi<{ orden: OperacionVenta }>>(
    `/ordenes/${ordenId}/comprobante`,
    datos,
  );
  return respuesta.data.datos.orden;
}

export async function descargarArchivoOperacion(
  ordenId: number,
  tipo: 'qr' | 'comprobante',
  nombre: string,
): Promise<void> {
  const respuesta = await servicioApi.get<Blob>(`/ordenes/${ordenId}/${tipo}`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(respuesta.data);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.style.display = 'none';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
