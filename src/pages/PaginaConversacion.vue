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

    <div v-else class="contenido-conversacion" :class="{ 'contenido-conversacion--administracion': enAdministracion }">
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
          @actualizada="recargar"
        />
      </main>

      <q-banner v-if="!conversacion.puede_responder" class="aviso-archivado">Esta conversación pertenece al historial anterior y es de solo lectura.</q-banner>
      <q-form v-else class="compositor-chat" @submit="enviarMensaje">
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
        />
      </q-form>
      </section>
      <panel-operacion-venta
        v-if="enAdministracion"
        :conversacion="conversacion"
        :es-administrador="true"
        @actualizada="recargar"
      />
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
const contenedorMensajes = ref<HTMLElement | null>(null);
const paginaElemento = ref<{ $el?: HTMLElement } | HTMLElement | null>(null);
const alturaDisponible = ref('calc(100dvh - 72px)');
const enAdministracion = computed(() => ruta.path.startsWith('/administracion/'));

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

async function recargar(): Promise<void> {
  await tienda.cargarConversacion(conversacionId);
}

onMounted(async () => {
  await nextTick();
  actualizarAlturaDisponible();
  window.addEventListener('resize', actualizarAlturaDisponible, { passive: true });
  window.visualViewport?.addEventListener('resize', actualizarAlturaDisponible, { passive: true });
  window.visualViewport?.addEventListener('scroll', actualizarAlturaDisponible, { passive: true });
  await tienda.cargarConversacion(conversacionId);
  await desplazarAlFinal();
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', actualizarAlturaDisponible);
  window.visualViewport?.removeEventListener('resize', actualizarAlturaDisponible);
  window.visualViewport?.removeEventListener('scroll', actualizarAlturaDisponible);
});
</script>

<style scoped lang="scss">
.pagina-conversacion {
  height: calc(100vh - 72px);
  height: calc(100dvh - 72px);
  min-height: 0 !important;
  max-width: 760px;
  margin: 0 auto;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--fondo);
}
.pagina-conversacion--administracion { max-width: 1280px; margin-block: 18px; border: 1px solid var(--borde); border-radius: 20px; box-shadow: var(--sombra-suave); }
.contenido-conversacion{min-height:100%;height:auto}.contenido-conversacion--administracion{display:grid;grid-template-columns:minmax(0,1fr) minmax(310px,350px);overflow:hidden}
.columna-chat{display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden;background:var(--fondo)}
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
  position: sticky;
  bottom: 0;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
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

@media(max-width:900px){.contenido-conversacion--administracion{grid-template-columns:minmax(0,1fr) 310px}}
@media(max-width:760px){.pagina-conversacion--administracion{margin-block:0;border:0;border-radius:0;box-shadow:none}.contenido-conversacion--administracion{display:block;overflow-y:auto}.contenido-conversacion--administracion .columna-chat{height:calc(100dvh - 72px)}.contenido-conversacion--administracion>.panel-operacion{border-top:1px solid var(--borde)}}
</style>
