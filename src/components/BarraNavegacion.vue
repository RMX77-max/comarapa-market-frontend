<template>
  <q-footer v-if="!ocultarNavegacion" class="barra-inferior">
    <nav class="barra-inferior__contenido" aria-label="Navegación principal">
      <q-btn
        v-for="opcion in opciones"
        :key="opcion.nombre"
        :class="[
          'barra-inferior__opcion',
          { 'barra-inferior__opcion--activa': ruta.name === opcion.nombre },
          { 'barra-inferior__opcion--vender': opcion.nombre === 'publicar' },
        ]"
        :icon="opcion.icono"
        :label="opcion.etiqueta"
        :to="{ name: opcion.nombre }"
        flat
        no-caps
        stack
      />
    </nav>
  </q-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const ruta = useRoute();
const ocultarNavegacion = computed(() => Boolean(ruta.meta.ocultarNavegacion));

const opciones = [
  { nombre: 'inicio', etiqueta: 'Inicio', icono: 'home' },
  { nombre: 'buscar', etiqueta: 'Buscar', icono: 'search' },
  { nombre: 'publicar', etiqueta: 'Vender', icono: 'add_circle' },
  { nombre: 'mensajes', etiqueta: 'Mensajes', icono: 'chat_bubble_outline' },
  { nombre: 'perfil', etiqueta: 'Perfil', icono: 'person_outline' },
] as const;
</script>

<style scoped lang="scss">
.barra-inferior {
  border-top: 1px solid var(--borde);
  background: rgb(255 255 255 / 97%);
  color: var(--texto-secundario);
  backdrop-filter: blur(12px);

  &__contenido {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    width: min(100%, 680px);
    min-height: 68px;
    margin: 0 auto;
    padding-bottom: env(safe-area-inset-bottom);
  }

  &__opcion {
    min-width: 0;
    border-radius: 0;
    color: var(--texto-secundario);
    font-size: 0.7rem;

    &--activa {
      color: var(--verde-principal);
    }

    &--vender {
      color: var(--verde-principal);

      :deep(.q-icon) {
        padding: 9px;
        border-radius: 50%;
        background: var(--verde-principal);
        color: white;
        font-size: 29px;
        transform: translateY(-7px);
      }
    }
  }
}

@media (min-width: 900px) {
  .barra-inferior {
    display: none;
  }
}
</style>
