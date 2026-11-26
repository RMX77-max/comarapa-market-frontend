<template>
  <router-view />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';
import { inicializarTema } from 'src/composables/useTema';
import {
  desvincularDispositivoPush,
  inicializarNotificacionesPush,
} from 'src/services/servicioPush';

inicializarTema();

const autenticacion = useTiendaAutenticacion();
const enrutador = useRouter();
function sesionExpirada(): void {
  autenticacion.limpiarSesion();
  void enrutador.replace({ name: 'iniciar-sesion', query: { sesion: 'expirada' } });
}
onMounted(() => window.addEventListener('comarapa-market:sesion-expirada', sesionExpirada));
watch(
  () => autenticacion.estaAutenticado,
  (estaAutenticado) => {
    if (estaAutenticado) {
      void inicializarNotificacionesPush(enrutador).catch((error) => {
        console.warn('No fue posible inicializar las notificaciones push.', error);
      });
    } else {
      void desvincularDispositivoPush().catch((error) => {
        console.warn('No fue posible desvincular el dispositivo de las notificaciones push.', error);
      });
    }
  },
  { immediate: true },
);
onBeforeUnmount(() =>
  window.removeEventListener('comarapa-market:sesion-expirada', sesionExpirada),
);
</script>
