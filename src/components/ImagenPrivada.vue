<template>
  <img v-if="urlTemporal" class="imagen-privada" :src="urlTemporal" :alt="alt" loading="lazy" />
  <div v-else class="imagen-privada imagen-privada--cargando" aria-hidden="true" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { servicioApi } from 'src/services/servicioApi';

const props = withDefaults(defineProps<{ src: string; alt?: string }>(), { alt: '' });
const urlTemporal = ref('');
let controlador: AbortController | null = null;

function liberar(): void {
  controlador?.abort();
  controlador = null;
  if (urlTemporal.value) URL.revokeObjectURL(urlTemporal.value);
  urlTemporal.value = '';
}

watch(
  () => props.src,
  async (src) => {
    liberar();
    if (!src) return;
    controlador = new AbortController();
    try {
      const respuesta = await servicioApi.get<Blob>(src, { responseType: 'blob', signal: controlador.signal });
      urlTemporal.value = URL.createObjectURL(respuesta.data);
    } catch {
      // Conserva el marcador neutro si la imagen no está autorizada.
    }
  },
  { immediate: true },
);

onBeforeUnmount(liberar);
</script>

<style scoped>
.imagen-privada { display: block; width: 100%; height: 100%; object-fit: cover; }
.imagen-privada--cargando { min-height: 84px; background: var(--superficie-suave); }
</style>
