import { describe, expect, it } from 'vitest';
import { resolverUrlArchivo } from './servicioApi';

describe('resolverUrlArchivo', () => {
  it('dirige los archivos locales al servidor de la API', () => {
    expect(resolverUrlArchivo('http://localhost/storage/productos/foto.jpg')).toBe(
      'http://127.0.0.1:8000/storage/productos/foto.jpg',
    );
    expect(resolverUrlArchivo('/storage/perfiles/foto.jpg')).toBe(
      'http://127.0.0.1:8000/storage/perfiles/foto.jpg',
    );
  });

  it('conserva archivos embebidos y servidores externos', () => {
    expect(resolverUrlArchivo('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
    expect(resolverUrlArchivo('https://cdn.ejemplo.com/foto.png')).toBe(
      'https://cdn.ejemplo.com/foto.png',
    );
  });
});
