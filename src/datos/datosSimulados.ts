import type { Categoria } from 'src/models/Categoria';
import type { Conversacion } from 'src/models/Conversacion';
import type { Mensaje } from 'src/models/Mensaje';
import type { Producto } from 'src/models/Producto';
import type { Usuario } from 'src/models/Usuario';

export const categoriasSimuladas: Categoria[] = [
  { id: 1, nombre: 'Vehículos', slug: 'vehiculos' },
  { id: 2, nombre: 'Tecnología', slug: 'tecnologia' },
  { id: 3, nombre: 'Hogar', slug: 'hogar' },
  { id: 4, nombre: 'Ropa', slug: 'ropa' },
  { id: 5, nombre: 'Otros', slug: 'otros' },
];

export const usuarioSimulado: Usuario = {
  id: 1,
  nombre: 'Débora B.',
  email: 'debora@ejemplo.com',
  ubicacion: 'Comarapa',
  url_foto_perfil: null,
  fecha_registro: '2026-09-20T12:00:00.000Z',
};

export const productosSimulados: Producto[] = [
  {
    id: 1,
    titulo: 'Moto Honda XR 150',
    precio: 2800,
    descripcion: 'Moto en excelente estado, económica y muy confiable.',
    ubicacion: 'Comarapa',
    url_imagen: null,
    estado: 'activo',
    categoria: categoriasSimuladas[0]!,
    vendedor: {
      id: 2,
      nombre: 'Carlos M.',
      ubicacion: 'Comarapa',
      url_foto_perfil: null,
    },
    fecha_publicacion: '2026-09-19T15:30:00.000Z',
  },
  {
    id: 2,
    titulo: 'iPhone 13 128 GB',
    precio: 1450,
    descripcion: 'Teléfono bien cuidado y funcionando correctamente.',
    ubicacion: 'Comarapa',
    url_imagen: null,
    estado: 'activo',
    categoria: categoriasSimuladas[1]!,
    vendedor: usuarioSimulado,
    fecha_publicacion: '2026-09-18T10:15:00.000Z',
  },
  {
    id: 3,
    titulo: 'Juego de comedor',
    precio: 1200,
    descripcion: 'Mesa de madera con seis sillas.',
    ubicacion: 'Comarapa',
    url_imagen: null,
    estado: 'activo',
    categoria: categoriasSimuladas[2]!,
    vendedor: usuarioSimulado,
    fecha_publicacion: '2026-09-17T09:00:00.000Z',
  },
  {
    id: 4,
    titulo: 'Chaqueta impermeable',
    precio: 350,
    descripcion: 'Chaqueta liviana en excelente estado.',
    ubicacion: 'Saipina',
    url_imagen: null,
    estado: 'activo',
    categoria: categoriasSimuladas[3]!,
    vendedor: usuarioSimulado,
    fecha_publicacion: '2026-09-16T18:45:00.000Z',
  },
];

export const mensajesSimulados: Mensaje[] = [
  {
    id: 1,
    mensaje: 'Hola Carlos, ¿sigue disponible la moto?',
    remitente: { id: usuarioSimulado.id, nombre: usuarioSimulado.nombre },
    fecha_envio: '2026-09-20T14:20:00.000Z',
  },
  {
    id: 2,
    mensaje: 'Hola, sí, todavía está disponible.',
    remitente: { id: 2, nombre: 'Carlos M.' },
    fecha_envio: '2026-09-20T14:24:00.000Z',
  },
];

export const conversacionesSimuladas: Conversacion[] = [
  {
    id: 1,
    producto: {
      id: productosSimulados[0]!.id,
      titulo: productosSimulados[0]!.titulo,
      url_imagen: productosSimulados[0]!.url_imagen,
      estado: productosSimulados[0]!.estado,
    },
    otra_persona: {
      id: 2,
      nombre: 'Carlos M.',
      url_foto_perfil: null,
    },
    ultimo_mensaje: mensajesSimulados[1]!,
    fecha_ultima_actividad: mensajesSimulados[1]!.fecha_envio,
  },
];
