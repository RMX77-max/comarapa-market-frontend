<template>
  <div class="fila-mensaje" :class="{ 'fila-mensaje--propio': propio }">
    <div class="burbuja-mensaje" :class="{ 'burbuja-mensaje--propia': propio }">
      <p v-if="!ubicacionCompartida">{{ mensaje.mensaje }}</p>
      <div v-else class="ubicacion-compartida">
        <q-icon name="location_on" />
        <div><strong>Ubicación compartida</strong><span>Abre el punto exacto en el mapa</span></div>
        <q-btn
          :href="ubicacionCompartida"
          target="_blank"
          flat
          round
          icon="open_in_new"
          aria-label="Abrir ubicación en Google Maps"
        />
      </div>
      <time :datetime="mensaje.fecha_envio">{{ formatearFechaCorta(mensaje.fecha_envio) }}</time>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Mensaje } from 'src/models/Mensaje';
import { formatearFechaCorta } from 'src/utils/formatearFecha';

const propiedades = defineProps<{ mensaje: Mensaje; propio: boolean }>();
const ubicacionCompartida = computed(
  () =>
    propiedades.mensaje.mensaje.match(
      /https:\/\/www\.google\.com\/maps\?q=-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?/i,
    )?.[0] ?? '',
);
</script>

<style scoped lang="scss">
.fila-mensaje {
  display: flex;
  justify-content: flex-start;

  &--propio {
    justify-content: flex-end;
  }
}

.ubicacion-compartida {
  display: flex;
  align-items: center;
  gap: 9px;

  > .q-icon {
    color: var(--primario);
    font-size: 26px;
  }

  > div {
    display: grid;
  }

  strong {
    font-size: 0.85rem;
  }

  span {
    color: var(--texto-secundario);
    font-size: 0.7rem;
  }
}

.burbuja-mensaje {
  max-width: min(82%, 460px);
  padding: 10px 13px 7px;
  border-radius: 16px 16px 16px 4px;
  border: 1px solid var(--borde);
  background: var(--fondo);
  box-shadow: 0 1px 2px rgb(0 0 0 / 7%);

  &--propia {
    border-radius: 16px 16px 4px;
    border-color: color-mix(in srgb, var(--primario) 25%, var(--borde));
    background: color-mix(in srgb, var(--primario) 13%, var(--fondo));
  }

  p {
    margin: 0;
    white-space: pre-wrap;
  }

  time {
    display: block;
    margin-top: 4px;
    color: var(--texto-secundario);
    font-size: 0.68rem;
    text-align: right;
  }
}
</style>
