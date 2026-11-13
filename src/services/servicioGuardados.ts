const PREFIJO = 'comarapa-market:guardados';

function clave(usuarioId: number): string {
  return `${PREFIJO}:${usuarioId}`;
}

export function obtenerIdsGuardados(usuarioId: number): number[] {
  try {
    const datos = JSON.parse(localStorage.getItem(clave(usuarioId)) ?? '[]') as unknown;
    return Array.isArray(datos)
      ? datos.filter((id): id is number => Number.isInteger(id) && id > 0)
      : [];
  } catch {
    return [];
  }
}

export function estaGuardado(usuarioId: number, productoId: number): boolean {
  return obtenerIdsGuardados(usuarioId).includes(productoId);
}

export function alternarGuardado(usuarioId: number, productoId: number): boolean {
  const ids = obtenerIdsGuardados(usuarioId);
  const guardado = ids.includes(productoId);
  const nuevosIds = guardado ? ids.filter((id) => id !== productoId) : [productoId, ...ids];
  localStorage.setItem(clave(usuarioId), JSON.stringify(nuevosIds));
  return !guardado;
}
