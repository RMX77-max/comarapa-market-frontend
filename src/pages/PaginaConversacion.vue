<template>
  <q-page class="pagina-conversacion">
    <estado-contenido v-if="tienda.cargando" tipo="cargando" />
    <estado-contenido
      v-else-if="!conversacion"
      tipo="error"
      titulo="Conversación no encontrada"
      mensaje="No tienes acceso a esta conversación."
      etiqueta-accion="Volver a mensajes"
      @accion="enrutador.replace({ name: 'mensajes' })"
    />

    <template v-else>
      <header class="cabecera-chat">
        <q-btn flat round icon="arrow_back" aria-label="Volver" :to="{ name: 'mensajes' }" />
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
      </main>

      <q-form class="compositor-chat" @submit="enviarMensaje">
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
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AvatarUsuario from 'components/AvatarUsuario.vue';
import BurbujaMensaje from 'components/BurbujaMensaje.vue';
import EstadoContenido from 'components/EstadoContenido.vue';
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

onMounted(async () => {
  await tienda.cargarConversacion(conversacionId);
  await desplazarAlFinal();
});
</script>

<style scoped lang="scss">
.pagina-conversacion {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  height: calc(100vh - 64px);
  max-width: 760px;
  margin: 0 auto;
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
.cabecera-chat span {
  max-width: 220px;
  overflow: hidden;
  color: var(--texto-secundario);
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mensajes-chat {
  display: grid;
  gap: 10px;
  align-content: start;
  overflow-y: auto;
  padding: 18px 14px;
  background: #fafbfa;
}
.compositor-chat {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--borde);
  background: var(--fondo);
}
</style>
