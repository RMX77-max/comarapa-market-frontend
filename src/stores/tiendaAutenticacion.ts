import { defineStore } from 'pinia';
import type { Usuario } from 'src/models/Usuario';
import {
  cargarSesionPersistida,
  eliminarSesionPersistida,
  guardarSesionPersistida,
} from 'src/services/servicioAlmacenamientoSesion';

export const useTiendaAutenticacion = defineStore('autenticacion', {
  state: () => ({
    usuario: null as Usuario | null,
    token: '',
    sesionInicializada: false,
  }),
  getters: {
    estaAutenticado: (estado) => Boolean(estado.token),
    esAdministrador: (estado) =>
      estado.usuario?.rol === 'administrador' || estado.usuario?.rol === 'superadministrador',
    esSuperadministrador: (estado) => estado.usuario?.rol === 'superadministrador',
  },
  actions: {
    async inicializarSesion() {
      if (this.sesionInicializada) return;
      const sesion = await cargarSesionPersistida();
      this.usuario = sesion?.usuario ?? null;
      this.token = sesion?.token ?? '';
      this.sesionInicializada = true;
    },
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
      eliminarSesionPersistida();
    },
    persistir() {
      if (this.usuario && this.token) {
        guardarSesionPersistida({ usuario: this.usuario, token: this.token });
      }
    },
  },
});
