import { Capacitor } from '@capacitor/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import type { Usuario } from 'src/models/Usuario';

export const CLAVE_SESION = 'comarapa_market_sesion';

export interface SesionPersistida {
  usuario: Usuario;
  token: string;
}

let sesionEnMemoria: SesionPersistida | null = null;

export function esAplicacionNativa(): boolean {
  return Capacitor.isNativePlatform();
}

function esSesionValida(valor: unknown): valor is SesionPersistida {
  if (!valor || typeof valor !== 'object') return false;
  const sesion = valor as Partial<SesionPersistida>;
  return Boolean(sesion.usuario && typeof sesion.token === 'string' && sesion.token);
}

export async function cargarSesionPersistida(): Promise<SesionPersistida | null> {
  if (typeof window === 'undefined') return null;

  try {
    if (esAplicacionNativa()) {
      await SecureStorage.setKeyPrefix('comarapa_market_');
      const contenido = await SecureStorage.getItem(CLAVE_SESION);
      const valor: unknown = contenido ? JSON.parse(contenido) : null;
      sesionEnMemoria = esSesionValida(valor) ? valor : null;
      return sesionEnMemoria;
    }

    // La web conserva sesiones aisladas por pestaña; solo Android persiste al cerrar la app.
    window.localStorage.removeItem(CLAVE_SESION);
    const valor = window.sessionStorage.getItem(CLAVE_SESION);
    sesionEnMemoria = valor ? (JSON.parse(valor) as SesionPersistida) : null;
    return esSesionValida(sesionEnMemoria) ? sesionEnMemoria : null;
  } catch {
    sesionEnMemoria = null;
    window.sessionStorage.removeItem(CLAVE_SESION);
    return null;
  }
}

export function obtenerTokenSesion(): string {
  if (esAplicacionNativa()) return sesionEnMemoria?.token ?? '';
  if (typeof window === 'undefined') return '';

  try {
    const valor = window.sessionStorage.getItem(CLAVE_SESION);
    return valor ? ((JSON.parse(valor) as Partial<SesionPersistida>).token ?? '') : '';
  } catch {
    return '';
  }
}

export function guardarSesionPersistida(sesion: SesionPersistida): void {
  sesionEnMemoria = sesion;
  if (typeof window === 'undefined') return;

  if (esAplicacionNativa()) {
    void SecureStorage.setKeyPrefix('comarapa_market_')
      .then(() => SecureStorage.setItem(CLAVE_SESION, JSON.stringify(sesion)))
      .catch(() => undefined);
    return;
  }

  window.sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

export function eliminarSesionPersistida(): void {
  sesionEnMemoria = null;
  if (typeof window === 'undefined') return;

  window.sessionStorage.removeItem(CLAVE_SESION);
  window.localStorage.removeItem(CLAVE_SESION);

  if (esAplicacionNativa()) {
    void SecureStorage.setKeyPrefix('comarapa_market_')
      .then(() => SecureStorage.remove(CLAVE_SESION))
      .catch(() => undefined);
  }
}
