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
    // Elimina sesiones antiguas que se compartían entre ventanas.
    window.localStorage.removeItem(CLAVE_SESION);
    const valor = window.sessionStorage.getItem(CLAVE_SESION);
    return valor ? (JSON.parse(valor) as SesionPersistida) : null;
  } catch {
    window.sessionStorage.removeItem(CLAVE_SESION);
    return null;
  }
}

export const useTiendaAutenticacion = defineStore('autenticacion', {
  state: () => {
    const sesion = leerSesion();
    return { usuario: sesion?.usuario ?? (null as Usuario | null), token: sesion?.token ?? '' };
  },
  getters: {
    estaAutenticado: (estado) => Boolean(estado.token),
    esAdministrador: (estado) =>
      estado.usuario?.rol === 'administrador' || estado.usuario?.rol === 'superadministrador',
    esSuperadministrador: (estado) => estado.usuario?.rol === 'superadministrador',
  },
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
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(CLAVE_SESION);
        window.localStorage.removeItem(CLAVE_SESION);
      }
    },
    persistir() {
      if (typeof window !== 'undefined' && this.usuario && this.token) {
        window.sessionStorage.setItem(
          CLAVE_SESION,
          JSON.stringify({ usuario: this.usuario, token: this.token }),
        );
      }
    },
  },
});
