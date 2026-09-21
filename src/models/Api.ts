export interface RespuestaApi<T> {
  exito: boolean;
  mensaje: string;
  datos: T;
}

export interface Paginacion {
  pagina_actual: number;
  ultima_pagina: number;
  por_pagina: number;
  total: number;
}

export interface ErrorValidacionApi {
  exito: false;
  mensaje: string;
  errores?: Record<string, string[]>;
}
