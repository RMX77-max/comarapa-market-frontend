export function formatearFechaCorta(fecha: string): string {
  const valor = new Date(fecha);
  const hoy = new Date();

  if (valor.toDateString() === hoy.toDateString()) {
    return new Intl.DateTimeFormat('es-BO', { hour: '2-digit', minute: '2-digit' }).format(valor);
  }

  return new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'short' }).format(valor);
}
