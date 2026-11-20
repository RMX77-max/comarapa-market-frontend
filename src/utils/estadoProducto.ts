const etiquetasEstado: Record<number, string> = {
  1: 'Pésimo',
  2: 'Muy deteriorado',
  3: 'Deteriorado',
  4: 'Regular',
  5: 'Seminuevo',
  6: 'Buen estado',
  7: 'Muy buen estado',
  8: 'Excelente',
  9: 'Casi nuevo',
  10: 'Estado perfecto',
};

export const opcionesEstadoProducto = Object.entries(etiquetasEstado).map(([valor, etiqueta]) => ({
  value: Number(valor),
  label: `${valor}/10 · ${etiqueta}`,
}));

export function formatearEstadoProducto(valor?: number | null): string {
  if (!valor) return 'Estado no indicado';
  return `${valor}/10 · ${etiquetasEstado[valor] ?? 'Estado indicado'}`;
}
