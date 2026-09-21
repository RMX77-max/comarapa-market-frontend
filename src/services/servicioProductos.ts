import type { Paginacion, RespuestaApi } from 'src/models/Api';
import type { Categoria } from 'src/models/Categoria';
import type { DatosFormularioProducto, FiltrosProductos } from 'src/models/FormularioProducto';
import type { Producto } from 'src/models/Producto';
import { servicioApi } from './servicioApi';

export async function listarCategorias(): Promise<Categoria[]> {
  const respuesta = await servicioApi.get<RespuestaApi<{ categorias: Categoria[] }>>('/categorias');
  return respuesta.data.datos.categorias;
}

export async function listarProductos(
  filtros: FiltrosProductos = {},
): Promise<{ productos: Producto[]; paginacion: Paginacion }> {
  const respuesta = await servicioApi.get<
    RespuestaApi<{ productos: Producto[]; paginacion: Paginacion }>
  >('/productos', {
    params: filtros,
  });
  return respuesta.data.datos;
}

export async function obtenerProducto(id: number): Promise<Producto> {
  const respuesta = await servicioApi.get<RespuestaApi<{ producto: Producto }>>(`/productos/${id}`);
  return respuesta.data.datos.producto;
}

function crearFormulario(datos: DatosFormularioProducto, metodo?: 'PUT'): FormData {
  const formulario = new FormData();
  if (metodo) formulario.append('_method', metodo);
  formulario.append('titulo', datos.titulo);
  formulario.append('precio', String(datos.precio));
  formulario.append('categoria_id', String(datos.categoria_id));
  formulario.append('descripcion', datos.descripcion);
  formulario.append('ubicacion', datos.ubicacion);
  datos.imagenes?.forEach((imagen) => formulario.append('imagenes[]', imagen));
  return formulario;
}

export async function crearProducto(datos: DatosFormularioProducto): Promise<Producto> {
  const respuesta = await servicioApi.post<RespuestaApi<{ producto: Producto }>>(
    '/productos',
    crearFormulario(datos),
  );
  return respuesta.data.datos.producto;
}

export async function actualizarProducto(
  id: number,
  datos: DatosFormularioProducto,
): Promise<Producto> {
  const respuesta = await servicioApi.post<RespuestaApi<{ producto: Producto }>>(
    `/productos/${id}`,
    crearFormulario(datos, 'PUT'),
  );
  return respuesta.data.datos.producto;
}

export async function listarMisPublicaciones(
  page = 1,
): Promise<{ productos: Producto[]; paginacion: Paginacion }> {
  const respuesta = await servicioApi.get<
    RespuestaApi<{ productos: Producto[]; paginacion: Paginacion }>
  >('/mis-publicaciones', { params: { page } });
  return respuesta.data.datos;
}

export async function marcarComoVendido(id: number): Promise<Producto> {
  const respuesta = await servicioApi.patch<RespuestaApi<{ producto: Producto }>>(
    `/productos/${id}/vendido`,
  );
  return respuesta.data.datos.producto;
}

export async function marcarComoDisponible(id: number): Promise<Producto> {
  const respuesta = await servicioApi.patch<RespuestaApi<{ producto: Producto }>>(
    `/productos/${id}/disponible`,
  );
  return respuesta.data.datos.producto;
}

export async function eliminarProducto(id: number): Promise<void> {
  await servicioApi.delete(`/productos/${id}`);
}
