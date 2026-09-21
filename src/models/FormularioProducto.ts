export interface DatosFormularioProducto {
  titulo: string;
  precio: number;
  categoria_id: number;
  descripcion: string;
  ubicacion: string;
  imagenes?: File[];
}

export interface FiltrosProductos {
  buscar?: string;
  categoria?: number;
  page?: number;
}
