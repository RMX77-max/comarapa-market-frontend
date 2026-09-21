export interface RemitenteMensaje {
  id: number;
  nombre: string;
}

export interface Mensaje {
  id: number;
  mensaje: string;
  remitente: RemitenteMensaje;
  fecha_envio: string;
}
