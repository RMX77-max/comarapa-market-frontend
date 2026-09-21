<template>
  <div class="estado-contenido" role="status">
    <template v-if="tipo === 'cargando'">
      <q-spinner color="primary" size="38px" />
      <p>{{ mensaje || 'Cargando…' }}</p>
    </template>
    <template v-else>
      <q-icon
        :name="tipo === 'error' ? 'error_outline' : icono"
        size="44px"
        :color="tipo === 'error' ? 'negative' : 'grey-6'"
      />
      <h2>{{ titulo }}</h2>
      <p>{{ mensaje }}</p>
      <q-btn
        v-if="etiquetaAccion"
        color="primary"
        :label="etiquetaAccion"
        outline
        no-caps
        @click="$emit('accion')"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tipo?: 'cargando' | 'vacio' | 'error';
    titulo?: string;
    mensaje?: string;
    icono?: string;
    etiquetaAccion?: string;
  }>(),
  {
    tipo: 'vacio',
    titulo: 'No hay contenido',
    mensaje: '',
    icono: 'inventory_2',
    etiquetaAccion: '',
  },
);

defineEmits<{ accion: [] }>();
</script>

<style scoped lang="scss">
.estado-contenido {
  display: grid;
  min-height: 240px;
  padding: 36px 20px;
  place-items: center;
  align-content: center;
  color: var(--texto-secundario);
  text-align: center;

  h2 {
    margin: 14px 0 4px;
    color: var(--texto-principal);
    font-size: 1.15rem;
    font-weight: 600;
  }

  p {
    max-width: 340px;
    margin: 0 0 18px;
  }
}
</style>
