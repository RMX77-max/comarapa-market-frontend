export type EstadoOperacion =
  | 'precio_acordado'
  | 'esperando_pago'
  | 'comprobante_enviado'
  | 'comprobante_rechazado'
  | 'pago_confirmado'
  | 'producto_recibido'
  | 'producto_entregado'
  | 'vendedor_pagado'
  | 'completada'
  | 'cancelada';

export interface ConfiguracionQrOperacion {
  banco: string;
  titular: string;
  moneda: string;
  url_imagen: string;
  url_descarga: string;
}

export interface MovimientoCaja {
  id: number;
  tipo: 'ingreso' | 'egreso' | 'ajuste';
  concepto: string;
  monto: number;
  metodo_pago: string | null;
  referencia: string | null;
  notas: string | null;
  registrado_en: string;
}

export interface OperacionVenta {
  id: number;
  codigo: string;
  estado: EstadoOperacion;
  producto_id: number;
  conversacion_id: number;
  precio_publicado: number;
  precio_final: number;
  precio: number;
  porcentaje_comision: number;
  comision: number;
  pago_vendedor: number;
  gastos: number;
  utilidad: number;
  metodo_pago: 'qr' | 'efectivo' | 'transferencia';
  qr_habilitado: boolean;
  qr: ConfiguracionQrOperacion | null;
  comprobante: { nombre: string; mime: string; enviado_en: string; url: string } | null;
  pago_confirmado_en: string | null;
  producto_recibido_en: string | null;
  producto_entregado_en: string | null;
  vendedor_pagado_en: string | null;
  motivo_cancelacion: string | null;
  notas?: string | null;
  comprador?: { id: number; nombre: string; email: string };
  vendedor?: { id: number; nombre: string; email: string };
  movimientos?: MovimientoCaja[];
}
