<template>
  <q-layout view="hHh lpR fFf">
    <encabezado-principal />

    <q-page-container>
      <boton-volver-perfil v-if="mostrarVolverPerfil" />
      <router-view />
    </q-page-container>

    <barra-navegacion />
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import BarraNavegacion from 'components/BarraNavegacion.vue';
import BotonVolverPerfil from 'components/BotonVolverPerfil.vue';
import EncabezadoPrincipal from 'components/EncabezadoPrincipal.vue';

const prestamosHabilitados = process.env.PRESTAMOS_HABILITADOS === 'true';
const ruta = useRoute();
const rutasDePerfil = new Set([
  'mis-publicaciones',
  'guardados',
  'ajustes',
  'ordenes',
  'soporte',
  'solicitar-producto',
  'inmuebles',
  ...(prestamosHabilitados ? ['solicitar-prestamo'] : []),
]);
const mostrarVolverPerfil = computed(
  () => typeof ruta.name === 'string' && rutasDePerfil.has(ruta.name),
);
</script>
