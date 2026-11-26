import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export interface CoordenadasDispositivo {
  latitud: number;
  longitud: number;
  precision: number;
}

const OPCIONES_UBICACION = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
} as const;

export async function obtenerCoordenadasDispositivo(): Promise<CoordenadasDispositivo> {
  if (Capacitor.isNativePlatform()) {
    let permisos;
    try {
      permisos = await Geolocation.checkPermissions();
      if (permisos.location === 'prompt' || permisos.location === 'prompt-with-rationale') {
        permisos = await Geolocation.requestPermissions({ permissions: ['location'] });
      }
    } catch {
      throw new Error('Activa la ubicación del dispositivo e inténtalo nuevamente.');
    }

    if (permisos.location !== 'granted') {
      throw new Error('Debes permitir el acceso a tu ubicación para continuar.');
    }

    try {
      const posicion = await Geolocation.getCurrentPosition(OPCIONES_UBICACION);
      return {
        latitud: posicion.coords.latitude,
        longitud: posicion.coords.longitude,
        precision: posicion.coords.accuracy,
      };
    } catch {
      throw new Error('No pudimos determinar tu ubicación. Verifica el GPS e inténtalo nuevamente.');
    }
  }

  if (!navigator.geolocation) {
    throw new Error('Este dispositivo no permite obtener la ubicación.');
  }

  return new Promise((resolver, rechazar) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolver({
          latitud: coords.latitude,
          longitud: coords.longitude,
          precision: coords.accuracy,
        }),
      (error) => {
        const mensajes: Record<number, string> = {
          1: 'Debes permitir el acceso a tu ubicación para continuar.',
          2: 'No pudimos determinar tu ubicación. Activa el GPS e inténtalo nuevamente.',
          3: 'La ubicación tardó demasiado. Inténtalo nuevamente en un lugar con mejor señal.',
        };
        rechazar(new Error(mensajes[error.code] ?? 'No fue posible obtener tu ubicación.'));
      },
      OPCIONES_UBICACION,
    );
  });
}
