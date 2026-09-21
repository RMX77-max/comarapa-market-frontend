import { defineStore } from 'pinia';
import type { Usuario } from 'src/models/Usuario';
import { CLAVE_SESION } from 'src/services/servicioApi';

interface SesionPersistida {
  usuario: Usuario;
  token: string;
}

function leerSesion(): SesionPersistida | null {
  if (typeof window === 'undefined') return null;
  try {
    const valor = window.localStorage.getItem(CLAVE_SESION);
    return valor ? (JSON.parse(valor) as SesionPersistida) : null;
  } catch {
    window.localStorage.removeItem(CLAVE_SESION);
    return null;
  }
}

export const useTiendaAutenticacion = defineStore('autenticacion', {
  state: () => {
    const sesion = leerSesion();
    return { usuario: sesion?.usuario ?? (null as Usuario | null), token: sesion?.token ?? '' };
  },
  getters: { estaAutenticado: (estado) => Boolean(estado.token) },
  actions: {
    establecerSesion(usuario: Usuario, token: string) {
      this.usuario = usuario;
      this.token = token;
      this.persistir();
    },
    actualizarUsuario(usuario: Usuario) {
      this.usuario = usuario;
      this.persistir();
    },
    limpiarSesion() {
      this.usuario = null;
      this.token = '';
      if (typeof window !== 'undefined') window.localStorage.removeItem(CLAVE_SESION);
    },
    persistir() {
      if (typeof window !== 'undefined' && this.usuario && this.token) {
        window.localStorage.setItem(
          CLAVE_SESION,
          JSON.stringify({ usuario: this.usuario, token: this.token }),
        );
      }
    },
  },
});
