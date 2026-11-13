import type { RespuestaApi } from 'src/models/Api';
import { servicioApi } from './servicioApi';
export interface SolicitudProductoEspecial {
  id: number;
  nombre: string;
  ciudad: string;
  presupuesto: number | null;
  descripcion: string;
  estado: string;
  respuesta: string | null;
  created_at?: string;
  usuario?: { name: string; email: string };
}
export interface SolicitudPrestamo {
  id: number;
  nombre: string;
  ciudad: string;
  monto_solicitado: number;
  objeto_garantia: string;
  imagenes_garantia: string[];
  estado: string;
  respuesta: string | null;
  usuario?: { name: string; email: string };
}
export interface Inmueble {
  id: number;
  titulo: string;
  ciudad: string;
  zona: string | null;
  tipo_inmueble: string;
  tipo_operacion: string;
  precio: number;
  precio_solicitado: number;
  descripcion: string;
  imagenes: string[];
  estado: string;
  motivo_revision: string | null;
  usuario?: { name: string; email: string };
}
export async function crearSolicitudProducto(
  datos: Omit<SolicitudProductoEspecial, 'id' | 'estado' | 'respuesta' | 'usuario'>,
): Promise<void> {
  await servicioApi.post('/solicitudes-productos', datos);
}
export async function misSolicitudesProductos(): Promise<SolicitudProductoEspecial[]> {
  return (
    await servicioApi.get<RespuestaApi<{ solicitudes: SolicitudProductoEspecial[] }>>(
      '/solicitudes-productos',
    )
  ).data.datos.solicitudes;
}
export async function listarNecesidadesProductos(): Promise<SolicitudProductoEspecial[]> {
  return (
    await servicioApi.get<RespuestaApi<{ necesidades: SolicitudProductoEspecial[] }>>(
      '/necesidades-productos',
    )
  ).data.datos.necesidades;
}
export async function crearSolicitudPrestamo(datos: FormData): Promise<void> {
  await servicioApi.post('/solicitudes-prestamos', datos);
}
export async function misSolicitudesPrestamos(): Promise<SolicitudPrestamo[]> {
  return (
    await servicioApi.get<RespuestaApi<{ solicitudes: SolicitudPrestamo[] }>>(
      '/solicitudes-prestamos',
    )
  ).data.datos.solicitudes;
}
export async function crearInmueble(datos: FormData): Promise<void> {
  await servicioApi.post('/inmuebles', datos);
}
export async function misInmuebles(): Promise<Inmueble[]> {
  return (await servicioApi.get<RespuestaApi<{ inmuebles: Inmueble[] }>>('/mis-inmuebles')).data
    .datos.inmuebles;
}
export async function listarInmuebles(): Promise<Inmueble[]> {
  return (await servicioApi.get<RespuestaApi<{ inmuebles: Inmueble[] }>>('/inmuebles')).data.datos
    .inmuebles;
}
export async function listarServiciosAdmin(): Promise<{
  productos: SolicitudProductoEspecial[];
  inmuebles: Inmueble[];
  prestamos: SolicitudPrestamo[];
}> {
  return (
    await servicioApi.get<
      RespuestaApi<{
        productos: SolicitudProductoEspecial[];
        inmuebles: Inmueble[];
        prestamos: SolicitudPrestamo[];
      }>
    >('/administracion/servicios-especiales')
  ).data.datos;
}
export async function revisarSolicitudProducto(id: number, datos: object): Promise<void> {
  await servicioApi.patch(`/administracion/solicitudes-productos/${id}`, datos);
}
export async function revisarPrestamo(id: number, datos: object): Promise<void> {
  await servicioApi.patch(`/administracion/solicitudes-prestamos/${id}`, datos);
}
export async function revisarInmueble(id: number, datos: object): Promise<void> {
  await servicioApi.patch(`/administracion/inmuebles/${id}`, datos);
}
