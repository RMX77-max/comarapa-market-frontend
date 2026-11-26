<template>
  <q-page
    ref="paginaElemento"
    class="pagina-conversacion"
    :class="{ 'pagina-conversacion--administracion': enAdministracion }"
    :style="{ height: alturaDisponible }"
  >
    <estado-contenido v-if="tienda.cargando" tipo="cargando" />
    <estado-contenido
      v-else-if="!conversacion"
      tipo="error"
      titulo="Conversación no encontrada"
      mensaje="No tienes acceso a esta conversación."
      etiqueta-accion="Volver a mensajes"
      @accion="volver"
    />

    <div
      v-else
      class="contenido-conversacion"
      :class="{ 'contenido-conversacion--administracion': enAdministracion }"
    >
      <section class="columna-chat">
        <header class="cabecera-chat">
          <q-btn flat round icon="arrow_back" aria-label="Volver" @click="volver" />
          <avatar-usuario
            :nombre="conversacion.otra_persona.nombre"
            :url="conversacion.otra_persona.url_foto_perfil"
            tamano="42px"
          />
          <div>
            <strong>{{ conversacion.otra_persona.nombre }}</strong
            ><span>{{ conversacion.producto.titulo }}</span>
          </div>
          <q-img
            v-if="conversacion.producto.url_imagen"
            class="cabecera-chat__producto"
            :src="conversacion.producto.url_imagen"
            :alt="conversacion.producto.titulo"
          />
          <q-btn
            v-if="enAdministracion && q.screen.lt.md"
            class="cabecera-chat__operacion"
            color="primary"
            round
            unelevated
            icon="receipt_long"
            aria-label="Ver producto y operación"
            @click="mostrarPanelMovil = true"
          />
        </header>

        <main ref="contenedorMensajes" class="mensajes-chat" aria-live="polite">
          <burbuja-mensaje
            v-for="elemento in mensajes"
            :key="elemento.id"
            :mensaje="elemento"
            :propio="elemento.remitente.id === usuario?.id"
          />
          <panel-operacion-venta
            v-if="!enAdministracion && conversacion.operacion"
            :conversacion="conversacion"
            :es-administrador="false"
            :ubicacion-compartida="ultimaUbicacionCompartida"
            @actualizada="recargar"
          />
        </main>

        <q-banner v-if="!conversacion.puede_responder" class="aviso-archivado"
          >Esta conversación pertenece al historial anterior y es de solo lectura.</q-banner
        >
        <q-form v-else class="compositor-chat" @submit="enviarMensaje">
          <q-btn
            flat
            round
            color="primary"
            icon="add_location_alt"
            aria-label="Compartir mi ubicación"
            :loading="compartiendoUbicacion"
            @pointerdown.prevent
            @click="compartirUbicacion"
          >
            <q-tooltip>Compartir mi ubicación</q-tooltip>
          </q-btn>
          <q-input
            v-model="mensaje"
            class="campo-formulario"
            placeholder="Escribe un mensaje"
            maxlength="2000"
            outlined
            dense
            hide-bottom-space
            aria-label="Escribe un mensaje"
          />
          <q-btn
            color="primary"
            icon="send"
            round
            unelevated
            type="submit"
            aria-label="Enviar mensaje"
            :disable="!mensaje.trim()"
            @pointerdown.prevent
          />
        </q-form>
      </section>
      <panel-operacion-venta
        v-if="enAdministracion && !q.screen.lt.md"
        :conversacion="conversacion"
        :es-administrador="true"
        :ubicacion-compartida="ultimaUbicacionCompartida"
        @actualizada="recargar"
      />

      <q-dialog v-if="enAdministracion" v-model="mostrarPanelMovil" position="bottom">
        <q-card class="modal-operacion-movil">
          <q-card-section class="modal-operacion-movil__cabecera">
            <div>
              <strong>Producto y operación</strong>
              <small>Información y acciones de la venta</small>
            </div>
            <q-btn v-close-popup flat round dense icon="close" aria-label="Cerrar" />
          </q-card-section>
          <panel-operacion-venta
            :conversacion="conversacion"
            :es-administrador="true"
            :ubicacion-compartida="ultimaUbicacionCompartida"
            @actualizada="recargar"
          />
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AvatarUsuario from 'components/AvatarUsuario.vue';
import BurbujaMensaje from 'components/BurbujaMensaje.vue';
import EstadoContenido from 'components/EstadoContenido.vue';
import PanelOperacionVenta from 'components/PanelOperacionVenta.vue';
import { useTiendaMensajes } from 'src/stores/tiendaMensajes';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';
import { obtenerMensajeError } from 'src/services/servicioApi';
import { obtenerCoordenadasDispositivo } from 'src/services/servicioGeolocalizacion';
import { useQuasar } from 'quasar';

const ruta = useRoute();
const enrutador = useRouter();
const conversacionId = Number(ruta.params.id);
const tienda = useTiendaMensajes();
const autenticacion = useTiendaAutenticacion();
const q = useQuasar();
const conversacion = computed(() => tienda.conversacionActual);
const usuario = computed(() => autenticacion.usuario);
const mensajes = computed(() => tienda.mensajes);
const mensaje = ref('');
const compartiendoUbicacion = ref(false);
const mostrarPanelMovil = ref(false);
const contenedorMensajes = ref<HTMLElement | null>(null);
const paginaElemento = ref<{ $el?: HTMLElement } | HTMLElement | null>(null);
const alturaDisponible = ref('calc(100dvh - 58px)');
const enAdministracion = computed(() => ruta.path.startsWith('/administracion/'));
let temporizadorMensajes: ReturnType<typeof setInterval> | undefined;
let actualizandoMensajes = false;
const ultimaUbicacionCompartida = computed(() => {
  for (let indice = mensajes.value.length - 1; indice >= 0; indice -= 1) {
    const contenido = mensajes.value[indice]?.mensaje ?? '';
    const coincidencia = contenido.match(
      /https:\/\/www\.google\.com\/maps\?q=-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?/i,
    );
    if (coincidencia?.[0]) return coincidencia[0];
  }
  return '';
});

function actualizarAlturaDisponible(): void {
  const referencia = paginaElemento.value;
  const elemento = referencia instanceof HTMLElement ? referencia : referencia?.$el;
  if (!elemento) return;
  const ventanaVisual = window.visualViewport;
  const limiteInferior = ventanaVisual
    ? ventanaVisual.height + ventanaVisual.offsetTop
    : window.innerHeight;
  alturaDisponible.value = `${Math.max(320, Math.floor(limiteInferior - elemento.getBoundingClientRect().top))}px`;
}

function volver(): void {
  void enrutador.replace({ name: enAdministracion.value ? 'administracion-mensajes' : 'mensajes' });
}

async function desplazarAlFinal(): Promise<void> {
  await nextTick();
  if (contenedorMensajes.value)
    contenedorMensajes.value.scrollTop = contenedorMensajes.value.scrollHeight;
}

async function enviarMensaje(): Promise<void> {
  if (!usuario.value || !mensaje.value.trim()) return;
  const contenido = mensaje.value.trim();
  try {
    await tienda.enviar(conversacionId, contenido);
    mensaje.value = '';
    await desplazarAlFinal();
  } catch (error) {
    q.notify({ type: 'negative', message: obtenerMensajeError(error) });
  }
}

async function compartirUbicacion(): Promise<void> {
  compartiendoUbicacion.value = true;
  try {
    const coordenadas = await obtenerCoordenadasDispositivo();
    const url = `https://www.google.com/maps?q=${coordenadas.latitud.toFixed(7)},${coordenadas.longitud.toFixed(7)}`;
    mensaje.value = `📍 Mi ubicación actual\n${url}`;
    await enviarMensaje();
  } catch (error) {
    q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'No pudimos obtener tu ubicación.',
    });
  } finally {
    compartiendoUbicacion.value = false;
  }
}

async function recargar(): Promise<void> {
  await tienda.cargarConversacion(conversacionId);
}

async function actualizarMensajesSilenciosamente(): Promise<void> {
  if (actualizandoMensajes) return;
  actualizandoMensajes = true;
  try {
    const huboCambios = await tienda.refrescarConversacion(conversacionId);
    if (huboCambios) await desplazarAlFinal();
  } finally {
    actualizandoMensajes = false;
  }
}

onMounted(async () => {
  await nextTick();
  actualizarAlturaDisponible();
  window.addEventListener('resize', actualizarAlturaDisponible, { passive: true });
  window.visualViewport?.addEventListener('resize', actualizarAlturaDisponible, { passive: true });
  window.visualViewport?.addEventListener('scroll', actualizarAlturaDisponible, { passive: true });
  await tienda.cargarConversacion(conversacionId);
  await desplazarAlFinal();
  await actualizarMensajesSilenciosamente();
  temporizadorMensajes = setInterval(() => void actualizarMensajesSilenciosamente(), 2000);
});
onBeforeUnmount(() => {
  if (temporizadorMensajes) clearInterval(temporizadorMensajes);
  window.removeEventListener('resize', actualizarAlturaDisponible);
  window.visualViewport?.removeEventListener('resize', actualizarAlturaDisponible);
  window.visualViewport?.removeEventListener('scroll', actualizarAlturaDisponible);
});
</script>

<style scoped lang="scss">
.pagina-conversacion {
  height: calc(100vh - 58px);
  height: calc(100dvh - 58px);
  min-height: 0 !important;
  max-width: 760px;
  margin: 0 auto;
  overflow-x: hidden;
  overflow: hidden;
  background: var(--fondo);
}
.pagina-conversacion--administracion {
  max-width: 1280px;
  margin-block: 18px;
  border: 1px solid var(--borde);
  border-radius: 20px;
  box-shadow: var(--sombra-suave);
}
.contenido-conversacion {
  height: 100%;
  min-height: 0;
}
.contenido-conversacion--administracion {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(310px, 350px);
  overflow: hidden;
}
.columna-chat {
  display: flex;
  height: 100%;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--fondo);
}
.cabecera-chat {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--borde);
}
.cabecera-chat strong,
.cabecera-chat span {
  display: block;
}
.cabecera-chat__producto {
  width: 52px;
  height: 52px;
  margin-left: auto;
  border-radius: 10px;
}
.cabecera-chat__operacion {
  flex: 0 0 auto;
}
.cabecera-chat span {
  max-width: 220px;
  overflow: hidden;
  color: var(--texto-secundario);
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mensajes-chat {
  flex: 1 1 auto;
  display: grid;
  gap: 10px;
  align-content: start;
  overflow-y: auto;
  overscroll-behavior: auto;
  min-height: 0;
  padding: 18px 14px;
  background: var(--fondo-secundario);
}
.compositor-chat {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--borde);
  background: var(--fondo);
}
.aviso-archivado {
  border-top: 1px solid var(--borde);
  background: #fff8e1;
  color: #6d4c00;
  text-align: center;
}

@media (max-width: 900px) {
  .contenido-conversacion--administracion {
    grid-template-columns: minmax(0, 1fr) 310px;
  }
}
@media (max-width: 760px) {
  .pagina-conversacion--administracion {
    margin-block: 0;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }
  .contenido-conversacion--administracion {
    display: block;
    height: 100%;
    overflow: hidden;
  }
  .contenido-conversacion--administracion .columna-chat {
    height: 100%;
  }
  .cabecera-chat__producto { width: 42px; height: 42px; }
}

.modal-operacion-movil {
  width: 100%;
  max-width: 100% !important;
  height: min(90dvh, 760px);
  overflow: hidden;
  border-radius: 22px 22px 0 0;
  background: var(--fondo-secundario);
}
.modal-operacion-movil__cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--borde);
  background: var(--fondo);
}
.modal-operacion-movil__cabecera div { display: grid; }
.modal-operacion-movil__cabecera small { color: var(--texto-secundario); font-size: .72rem; }
.modal-operacion-movil :deep(.panel-operacion) { height: calc(100% - 62px); }
</style>
