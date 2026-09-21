import { defineStore } from 'pinia';
import type { Conversacion } from 'src/models/Conversacion';
import type { Mensaje } from 'src/models/Mensaje';
import {
  enviarMensaje,
  listarConversaciones,
  obtenerConversacion,
} from 'src/services/servicioMensajes';
import { obtenerMensajeError } from 'src/services/servicioApi';

export const useTiendaMensajes = defineStore('mensajes', {
  state: () => ({
    conversaciones: [] as Conversacion[],
    conversacionActual: null as Conversacion | null,
    mensajes: [] as Mensaje[],
    cargando: false,
    error: '',
  }),
  actions: {
    async cargarConversaciones() {
      this.cargando = true;
      this.error = '';
      try {
        this.conversaciones = (await listarConversaciones()).conversaciones;
      } catch (error) {
        this.error = obtenerMensajeError(error);
      } finally {
        this.cargando = false;
      }
    },
    async cargarConversacion(id: number) {
      this.cargando = true;
      this.error = '';
      try {
        const datos = await obtenerConversacion(id);
        this.conversacionActual = datos.conversacion;
        this.mensajes = datos.mensajes;
      } catch (error) {
        this.error = obtenerMensajeError(error);
      } finally {
        this.cargando = false;
      }
    },
    async enviar(id: number, contenido: string) {
      const nuevo = await enviarMensaje(id, contenido);
      this.mensajes.push(nuevo);
      return nuevo;
    },
  },
});
