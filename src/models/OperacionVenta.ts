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
  precio_minimo_vendedor?: number;
  precio_final: number;
  precio: number;
  costo_envio: number;
  total_cobrado: number;
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
  direccion_recoleccion?: string | null;
  ubicacion_recoleccion_url?: string | null;
  direccion_entrega?: string | null;
  ubicacion_entrega_url?: string | null;
  metodo_pago_vendedor?: 'qr' | 'efectivo' | null;
  qr_vendedor?: { nombre: string; url: string; enviado_en: string | null } | null;
  comprobante_pago_vendedor?: { nombre: string; url: string; enviado_en: string | null } | null;
  pago_vendedor_confirmado_en?: string | null;
  pago_vendedor_reportado_en?: string | null;
  motivo_reporte_pago_vendedor?: string | null;
  motivo_cancelacion: string | null;
  notas?: string | null;
  comprador?: { id: number; nombre: string; email: string };
  vendedor?: { id: number; nombre: string; email: string };
  movimientos?: MovimientoCaja[];
}
