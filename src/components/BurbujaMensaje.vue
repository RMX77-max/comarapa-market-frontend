<template>
  <div class="fila-mensaje" :class="{ 'fila-mensaje--propio': propio }">
    <div class="burbuja-mensaje" :class="{ 'burbuja-mensaje--propia': propio }">
      <p>{{ mensaje.mensaje }}</p>
      <time :datetime="mensaje.fecha_envio">{{ formatearFechaCorta(mensaje.fecha_envio) }}</time>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Mensaje } from 'src/models/Mensaje';
import { formatearFechaCorta } from 'src/utils/formatearFecha';

defineProps<{ mensaje: Mensaje; propio: boolean }>();
</script>

<style scoped lang="scss">
.fila-mensaje {
  display: flex;
  justify-content: flex-start;

  &--propio {
    justify-content: flex-end;
  }
}

.burbuja-mensaje {
  max-width: min(82%, 460px);
  padding: 10px 13px 7px;
  border-radius: 16px 16px 16px 4px;
  background: #eef1ef;

  &--propia {
    border-radius: 16px 16px 4px;
    background: var(--verde-claro);
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
