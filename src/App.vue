<template>
  <router-view />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';

const autenticacion = useTiendaAutenticacion();
const enrutador = useRouter();
function sesionExpirada(): void {
  autenticacion.limpiarSesion();
  void enrutador.replace({ name: 'iniciar-sesion', query: { sesion: 'expirada' } });
}
onMounted(() => window.addEventListener('comarapa-market:sesion-expirada', sesionExpirada));
onBeforeUnmount(() =>
  window.removeEventListener('comarapa-market:sesion-expirada', sesionExpirada),
);
</script>
