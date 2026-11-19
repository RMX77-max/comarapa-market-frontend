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
    async refrescarConversaciones(): Promise<void> {
      try {
        this.conversaciones = (await listarConversaciones()).conversaciones;
      } catch {
        // El refresco silencioso no reemplaza el contenido visible por un error temporal.
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
    async refrescarConversacion(id: number): Promise<boolean> {
      try {
        const datos = await obtenerConversacion(id);
        const ultimoActual = this.mensajes.at(-1)?.id ?? 0;
        const ultimoRecibido = datos.mensajes.at(-1)?.id ?? 0;
        const huboCambios =
          ultimoActual !== ultimoRecibido ||
          this.conversacionActual?.operacion?.estado !== datos.conversacion.operacion?.estado;
        this.conversacionActual = datos.conversacion;
        this.mensajes = datos.mensajes;
        return huboCambios;
      } catch {
        return false;
      }
    },
    async enviar(id: number, contenido: string) {
      const nuevo = await enviarMensaje(id, contenido);
      this.mensajes.push(nuevo);
      return nuevo;
    },
  },
});
