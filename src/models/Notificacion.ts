export interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  ruta: string | null;
  datos: Record<string, unknown> | null;
  leida: boolean;
  fecha: string;
}
