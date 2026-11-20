export interface DatosFormularioProducto {
  titulo: string;
  precio: number;
  precio_minimo: number;
  categoria_id: number;
  descripcion: string;
  estado_producto: number;
  ubicacion: string;
  direccion_recoleccion: string;
  ubicacion_recoleccion_url?: string;
  imagenes?: File[];
}

export interface FiltrosProductos {
  buscar?: string;
  categoria?: number;
  page?: number;
}
