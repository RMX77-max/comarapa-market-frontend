<template>
  <q-footer v-if="!ocultarNavegacion && !tecladoVisible" class="barra-inferior">
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const ruta = useRoute();
const ocultarNavegacion = computed(() => Boolean(ruta.meta.ocultarNavegacion));
const tecladoVisible = ref(false);

function esCampoDeTexto(elemento: EventTarget | null): boolean {
  if (!(elemento instanceof HTMLElement)) return false;
  if (elemento instanceof HTMLTextAreaElement || elemento.isContentEditable) return true;
  if (!(elemento instanceof HTMLInputElement)) return false;
  return ![
    'button',
    'checkbox',
    'color',
    'file',
    'hidden',
    'radio',
    'range',
    'reset',
    'submit',
  ].includes(elemento.type);
}
function alEnfocar(evento: FocusEvent): void {
  if (window.innerWidth < 900 && esCampoDeTexto(evento.target)) tecladoVisible.value = true;
}
function alDesenfocar(): void {
  window.setTimeout(() => {
    tecladoVisible.value = window.innerWidth < 900 && esCampoDeTexto(document.activeElement);
  }, 100);
}
onMounted(() => {
  document.addEventListener('focusin', alEnfocar);
  document.addEventListener('focusout', alDesenfocar);
});
onBeforeUnmount(() => {
  document.removeEventListener('focusin', alEnfocar);
  document.removeEventListener('focusout', alDesenfocar);
});

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
  background: var(--fondo);
  color: var(--texto-secundario);
  backdrop-filter: blur(12px);

  &__contenido {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    width: min(100%, 680px);
    min-height: 72px;
    margin: 0 auto;
    padding-bottom: env(safe-area-inset-bottom);
  }

  &__opcion {
    min-width: 0;
    border-radius: 0;
    color: var(--texto-secundario);
    font-size: var(--tamano-navegacion);

    &--activa {
      color: var(--coral);
    }

    &--vender {
      color: var(--coral);

      :deep(.q-icon) {
        padding: 9px;
        border-radius: 50%;
        background: var(--primario-oscuro);
        color: white;
        font-size: 29px;
        box-shadow: 0 7px 18px rgb(0 70 40 / 28%);
        transform: translateY(-7px);
      }
    }
  }
}

:global(.body--dark) .barra-inferior {
  border-top-color: var(--borde);
  background: #10241b;
  color: #b3c2b8;

  .barra-inferior__opcion {
    color: #b3c2b8;
  }

  .barra-inferior__opcion--activa,
  .barra-inferior__opcion--vender {
    color: var(--coral);
  }
}

@media (min-width: 900px) {
  .barra-inferior {
    display: none;
  }
}
</style>
