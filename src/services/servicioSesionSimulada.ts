import type { Usuario } from 'src/models/Usuario';

const CLAVE_SESION_SIMULADA = 'comarapa_market_sesion_simulada';

interface SesionSimulada {
  token: string;
  usuario: Usuario;
}

function almacenamientoDisponible(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function guardarSesionSimulada(usuario: Usuario): void {
  if (!almacenamientoDisponible()) return;

  const sesion: SesionSimulada = {
    token: 'token-simulado-frontend',
    usuario,
  };

  window.localStorage.setItem(CLAVE_SESION_SIMULADA, JSON.stringify(sesion));
}

export function obtenerSesionSimulada(): SesionSimulada | null {
  if (!almacenamientoDisponible()) return null;

  const contenido = window.localStorage.getItem(CLAVE_SESION_SIMULADA);
  if (!contenido) return null;

  try {
    return JSON.parse(contenido) as SesionSimulada;
  } catch {
    window.localStorage.removeItem(CLAVE_SESION_SIMULADA);
    return null;
  }
}

export function estaAutenticadoSimulado(): boolean {
  return Boolean(obtenerSesionSimulada()?.token);
}

export function actualizarUsuarioSesionSimulada(usuario: Usuario): void {
  const sesion = obtenerSesionSimulada();
  if (!sesion || !almacenamientoDisponible()) return;

  window.localStorage.setItem(
    CLAVE_SESION_SIMULADA,
    JSON.stringify({
      ...sesion,
      usuario,
    } satisfies SesionSimulada),
  );
}

export function cerrarSesionSimulada(): void {
  if (almacenamientoDisponible()) {
    window.localStorage.removeItem(CLAVE_SESION_SIMULADA);
  }
}
