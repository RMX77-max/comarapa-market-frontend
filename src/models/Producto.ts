import type { Categoria } from './Categoria';
import type { ResumenUsuario } from './Usuario';

export type EstadoProducto = 'activo' | 'vendido' | 'eliminado';
export type EstadoModeracion = 'pendiente' | 'aprobada' | 'rechazada' | 'correccion' | 'oculta';

export interface Producto {
  id: number;
  titulo: string;
  precio: number;
  precio_solicitado?: number | null;
  precio_minimo?: number | null;
  comision?: number | null;
  precio_final?: number | null;
  descripcion: string;
  ubicacion: string;
  url_imagen: string | null;
  imagenes?: string[];
  estado: EstadoProducto;
  estado_moderacion: EstadoModeracion;
  motivo_moderacion: string | null;
  categoria: Categoria;
  vendedor: ResumenUsuario;
  fecha_publicacion: string;
}
