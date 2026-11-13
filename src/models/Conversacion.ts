import type { Mensaje } from './Mensaje';
import type { EstadoProducto } from './Producto';
import type { OperacionVenta } from './OperacionVenta';

export interface ProductoConversacion {
  id: number;
  titulo: string;
  url_imagen: string | null;
  estado: EstadoProducto;
  precio: number;
  descripcion: string;
  ubicacion: string;
}

export interface PersonaConversacion {
  id: number;
  nombre: string;
  url_foto_perfil: string | null;
}

export interface Conversacion {
  id: number;
  producto: ProductoConversacion;
  otra_persona: PersonaConversacion;
  ultimo_mensaje: Mensaje | null;
  fecha_ultima_actividad: string;
  estado: 'nueva' | 'en_atencion' | 'resuelta' | 'cerrada' | 'archivada';
  tipo: 'consulta_producto' | 'historial_directo';
  puede_responder: boolean;
  vendedor?: { id: number; nombre: string; email: string };
  operacion: OperacionVenta | null;
}
