import {
  categoriasSimuladas,
  conversacionesSimuladas,
  mensajesSimulados,
  productosSimulados,
} from 'src/datos/datosSimulados';
import type { Categoria } from 'src/models/Categoria';
import type { Conversacion } from 'src/models/Conversacion';
import type { Mensaje } from 'src/models/Mensaje';
import type { Producto } from 'src/models/Producto';
import type { Usuario } from 'src/models/Usuario';

export interface DatosFormularioProducto {
  titulo: string;
  precio: number;
  categoria_id: number;
  descripcion: string;
  ubicacion: string;
  url_imagen?: string | null;
}

let productos = structuredClone(productosSimulados);
let conversaciones = structuredClone(conversacionesSimuladas);
const mensajesPorConversacion = new Map<number, Mensaje[]>([
  [1, structuredClone(mensajesSimulados)],
]);

export function listarCategoriasSimuladas(): Categoria[] {
  return structuredClone(categoriasSimuladas);
}

export function listarProductosSimulados(): Producto[] {
  return structuredClone(productos.filter((producto) => producto.estado === 'activo'));
}

export function buscarProductosSimulados(busqueda = '', categoriaId?: number): Producto[] {
  const termino = busqueda.trim().toLocaleLowerCase('es');

  return listarProductosSimulados().filter((producto) => {
    const coincideTexto =
      !termino ||
      producto.titulo.toLocaleLowerCase('es').includes(termino) ||
      producto.descripcion.toLocaleLowerCase('es').includes(termino);
    const coincideCategoria = !categoriaId || producto.categoria.id === categoriaId;

    return coincideTexto && coincideCategoria;
  });
}

export function obtenerProductoSimulado(id: number): Producto | null {
  const producto = productos.find((elemento) => elemento.id === id);
  return producto ? structuredClone(producto) : null;
}

export function crearProductoSimulado(datos: DatosFormularioProducto, usuario: Usuario): Producto {
  const categoria = categoriasSimuladas.find((elemento) => elemento.id === datos.categoria_id);
  if (!categoria) throw new Error('La categoría seleccionada no existe.');

  const producto: Producto = {
    id: Math.max(0, ...productos.map((elemento) => elemento.id)) + 1,
    titulo: datos.titulo,
    precio: datos.precio,
    descripcion: datos.descripcion,
    ubicacion: datos.ubicacion,
    url_imagen: datos.url_imagen ?? null,
    estado: 'activo',
    categoria,
    vendedor: {
      id: usuario.id,
      nombre: usuario.nombre,
      ubicacion: usuario.ubicacion,
      url_foto_perfil: usuario.url_foto_perfil,
    },
    fecha_publicacion: new Date().toISOString(),
  };

  productos = [producto, ...productos];
  return structuredClone(producto);
}

export function actualizarProductoSimulado(
  id: number,
  datos: DatosFormularioProducto,
): Producto | null {
  const indice = productos.findIndex((producto) => producto.id === id);
  const categoria = categoriasSimuladas.find((elemento) => elemento.id === datos.categoria_id);
  if (indice < 0 || !categoria) return null;

  const productoActual = productos[indice]!;
  const actualizado: Producto = {
    ...productoActual,
    titulo: datos.titulo,
    precio: datos.precio,
    descripcion: datos.descripcion,
    ubicacion: datos.ubicacion,
    url_imagen: datos.url_imagen ?? productoActual.url_imagen,
    categoria,
  };

  productos.splice(indice, 1, actualizado);
  return structuredClone(actualizado);
}

export function listarPublicacionesSimuladas(usuarioId: number): Producto[] {
  return structuredClone(productos.filter((producto) => producto.vendedor.id === usuarioId));
}

export function marcarVendidoSimulado(id: number): void {
  const producto = productos.find((elemento) => elemento.id === id);
  if (producto) producto.estado = 'vendido';
}

export function eliminarProductoSimulado(id: number): void {
  productos = productos.filter((producto) => producto.id !== id);
}

export function listarConversacionesSimuladas(): Conversacion[] {
  return structuredClone(conversaciones);
}

export function obtenerConversacionSimulada(id: number): Conversacion | null {
  const conversacion = conversaciones.find((elemento) => elemento.id === id);
  return conversacion ? structuredClone(conversacion) : null;
}

export function listarMensajesSimulados(conversacionId: number): Mensaje[] {
  return structuredClone(mensajesPorConversacion.get(conversacionId) ?? []);
}

export function enviarMensajeSimulado(
  conversacionId: number,
  contenido: string,
  usuario: Usuario,
): Mensaje {
  const mensajes = mensajesPorConversacion.get(conversacionId) ?? [];
  const mensaje: Mensaje = {
    id: Math.max(0, ...mensajes.map((elemento) => elemento.id)) + 1,
    mensaje: contenido.trim(),
    remitente: { id: usuario.id, nombre: usuario.nombre },
    fecha_envio: new Date().toISOString(),
  };

  mensajes.push(mensaje);
  mensajesPorConversacion.set(conversacionId, mensajes);
  conversaciones = conversaciones.map((conversacion) =>
    conversacion.id === conversacionId
      ? { ...conversacion, ultimo_mensaje: mensaje, fecha_ultima_actividad: mensaje.fecha_envio }
      : conversacion,
  );

  return structuredClone(mensaje);
}
