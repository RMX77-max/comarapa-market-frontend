import type { Mensaje } from './Mensaje';
import type { EstadoProducto } from './Producto';

export interface ProductoConversacion {
  id: number;
  titulo: string;
  url_imagen: string | null;
  estado: EstadoProducto;
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
}
