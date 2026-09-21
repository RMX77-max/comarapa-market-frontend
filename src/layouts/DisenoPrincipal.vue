<template>
  <q-layout view="hHh lpR fFf">
    <encabezado-principal />

    <q-page-container>
      <router-view />
    </q-page-container>

    <barra-navegacion />
  </q-layout>
</template>

<script setup lang="ts">
import BarraNavegacion from 'components/BarraNavegacion.vue';
import EncabezadoPrincipal from 'components/EncabezadoPrincipal.vue';
</script>
