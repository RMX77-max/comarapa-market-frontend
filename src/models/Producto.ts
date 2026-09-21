import type { Categoria } from './Categoria';
import type { ResumenUsuario } from './Usuario';

export type EstadoProducto = 'activo' | 'vendido' | 'eliminado';

export interface Producto {
  id: number;
  titulo: string;
  precio: number;
  descripcion: string;
  ubicacion: string;
  url_imagen: string | null;
  imagenes?: string[];
  estado: EstadoProducto;
  categoria: Categoria;
  vendedor: ResumenUsuario;
  fecha_publicacion: string;
}
