<template>
  <q-avatar :size="tamano" color="green-1" text-color="primary">
    <q-img v-if="url" :src="url"
      ><template #error>{{ inicial }}</template></q-img
    >
    <span v-else>{{ inicial }}</span>
  </q-avatar>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const propiedades = withDefaults(
  defineProps<{ nombre: string; url?: string | null; tamano?: string }>(),
  {
    url: null,
    tamano: '48px',
  },
);
const inicial = computed(() => propiedades.nombre.trim().charAt(0).toLocaleUpperCase('es'));
</script>
