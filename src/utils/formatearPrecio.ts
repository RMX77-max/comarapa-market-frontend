const formateadorBoliviano = new Intl.NumberFormat('es-BO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatearPrecio(precio: number): string {
  return `Bs ${formateadorBoliviano.format(precio)}`;
}
