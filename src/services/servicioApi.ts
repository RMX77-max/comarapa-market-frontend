import axios from 'axios';
import type { AxiosError } from 'axios';

export const CLAVE_SESION = 'comarapa_market_sesion';

export const servicioApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1',
  headers: { Accept: 'application/json' },
  timeout: 15000,
});

const camposArchivo = new Set(['url_imagen', 'url_foto_perfil']);
const camposListaArchivos = new Set(['imagenes']);

export function resolverUrlArchivo(url: string | null): string | null {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return url;

  const baseApi = servicioApi.defaults.baseURL || 'http://127.0.0.1:8000/api/v1';
  const origenApi = new URL(baseApi).origin;

  try {
    const destino = new URL(url, origenApi);
    const esServidorLocal = ['localhost', '127.0.0.1'].includes(destino.hostname);
    if (esServidorLocal || !/^https?:/i.test(url)) {
      return `${origenApi}${destino.pathname}${destino.search}${destino.hash}`;
    }
    return destino.toString();
  } catch {
    return url;
  }
}

function normalizarUrlsArchivos(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.map(normalizarUrlsArchivos);
  if (!valor || typeof valor !== 'object') return valor;

  const objeto = valor as Record<string, unknown>;
  for (const [clave, contenido] of Object.entries(objeto)) {
    if (camposArchivo.has(clave) && (typeof contenido === 'string' || contenido === null)) {
      objeto[clave] = resolverUrlArchivo(contenido);
    } else if (camposListaArchivos.has(clave) && Array.isArray(contenido)) {
      objeto[clave] = contenido.map((url) =>
        typeof url === 'string' ? resolverUrlArchivo(url) : url,
      );
    } else {
      objeto[clave] = normalizarUrlsArchivos(contenido);
    }
  }
  return objeto;
}

servicioApi.interceptors.request.use((configuracion) => {
  if (typeof window === 'undefined') return configuracion;
  const sesion = window.localStorage.getItem(CLAVE_SESION);
  if (!sesion) return configuracion;

  try {
    const { token } = JSON.parse(sesion) as { token?: string };
    if (token) configuracion.headers.Authorization = `Bearer ${token}`;
  } catch {
    window.localStorage.removeItem(CLAVE_SESION);
  }
  return configuracion;
});

servicioApi.interceptors.response.use(
  (respuesta) => {
    respuesta.data = normalizarUrlsArchivos(respuesta.data);
    return respuesta;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem(CLAVE_SESION);
      window.dispatchEvent(new CustomEvent('comarapa-market:sesion-expirada'));
    }
    return Promise.reject(error);
  },
);

export function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const datos = error.response?.data as { mensaje?: string } | undefined;
    return datos?.mensaje || 'No fue posible comunicarse con el servidor.';
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}
