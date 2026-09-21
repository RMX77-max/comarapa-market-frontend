<template>
  <q-page class="contenedor-pagina pagina-mensajes">
    <h1 class="titulo-pagina">Mensajes</h1>

    <estado-contenido v-if="tienda.cargando" tipo="cargando" />
    <estado-contenido
      v-else-if="tienda.error"
      tipo="error"
      :mensaje="tienda.error"
      etiqueta-accion="Reintentar"
      @accion="tienda.cargarConversaciones"
    />
    <estado-contenido
      v-else-if="conversaciones.length === 0"
      titulo="Aún no tienes mensajes"
      mensaje="Cuando contactes a un vendedor, la conversación aparecerá aquí."
      icono="chat_bubble_outline"
    />
    <q-list v-else class="lista-conversaciones q-mt-lg">
      <elemento-conversacion
        v-for="conversacion in conversaciones"
        :key="conversacion.id"
        :conversacion="conversacion"
      />
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import ElementoConversacion from 'components/ElementoConversacion.vue';
import EstadoContenido from 'components/EstadoContenido.vue';
import { useTiendaMensajes } from 'src/stores/tiendaMensajes';

const tienda = useTiendaMensajes();
const conversaciones = computed(() => tienda.conversaciones);
onMounted(() => void tienda.cargarConversaciones());
</script>

<style scoped lang="scss">
.pagina-mensajes {
  max-width: 760px;
}
.lista-conversaciones {
  overflow: hidden;
  border-radius: var(--radio-medio);
  background: var(--fondo);
}
</style>
