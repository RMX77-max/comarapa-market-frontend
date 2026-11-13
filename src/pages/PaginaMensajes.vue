<template>
  <q-page
    class="contenedor-pagina pagina-mensajes"
    :class="{ 'pagina-mensajes--administracion': enAdministracion }"
  >
    <header v-if="enAdministracion" class="cabecera-mensajes-admin">
      <div><span>ATENCIÓN AL CLIENTE</span><h1>Mensajes</h1><p>Gestiona las consultas de compradores desde un solo lugar.</p></div>
      <q-badge color="primary" rounded :label="`${conversaciones.length} conversaciones`" />
    </header>
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
      mensaje="Cuando escribas por un producto, la conversación con nuestro equipo aparecerá aquí."
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
import { useRoute } from 'vue-router';
import ElementoConversacion from 'components/ElementoConversacion.vue';
import EstadoContenido from 'components/EstadoContenido.vue';
import { useTiendaMensajes } from 'src/stores/tiendaMensajes';

const tienda = useTiendaMensajes();
const ruta = useRoute();
const conversaciones = computed(() => tienda.conversaciones);
const enAdministracion = computed(() => ruta.path.startsWith('/administracion/'));
onMounted(() => void tienda.cargarConversaciones());
</script>

<style scoped lang="scss">
.pagina-mensajes {
  max-width: 760px;
  padding-top: 0;
}
.lista-conversaciones {
  margin-top: 0 !important;
  overflow: hidden;
  border-radius: var(--radio-medio);
  background: var(--fondo);
}
.pagina-mensajes--administracion { max-width: 1240px; padding-top: clamp(20px,4vw,42px); }
.pagina-mensajes--administracion .lista-conversaciones { margin-top: 24px !important; }
.cabecera-mensajes-admin { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:24px; }
.cabecera-mensajes-admin span { color:var(--coral); font-size:.72rem; font-weight:800; letter-spacing:.1em; }
.cabecera-mensajes-admin h1 { margin:2px 0; color:var(--azul-marino); font-size:clamp(1.8rem,4vw,2.7rem); }
.cabecera-mensajes-admin p { margin:0; color:var(--texto-secundario); font-size:.95rem; }
.pagina-mensajes--administracion .lista-conversaciones { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; padding:14px; background:transparent; }
.pagina-mensajes--administracion :deep(.elemento-conversacion) { min-width:0; border:1px solid var(--borde); border-radius:16px; background:var(--fondo); box-shadow:0 8px 24px rgb(19 43 91 / 7%); }
.pagina-mensajes--administracion :deep(.elemento-conversacion:hover) { border-color:var(--coral); transform:translateY(-1px); }
@media(max-width:760px){.pagina-mensajes--administracion .lista-conversaciones{grid-template-columns:1fr;padding:0}.cabecera-mensajes-admin{align-items:flex-start;flex-direction:column}.cabecera-mensajes-admin h1{font-size:1.75rem}}
</style>
