<template>
  <q-input
    :model-value="modelValue"
    class="campo-formulario"
    aria-label="Buscar productos"
    placeholder="Buscar productos, servicios..."
    outlined
    clearable
    debounce="250"
    @update:model-value="$emit('update:modelValue', String($event ?? ''))"
    @keyup.enter="$emit('buscar')"
  >
    <template #prepend><q-icon name="search" /></template>
    <template #append>
      <q-btn
        v-if="!mostrarBotonBuscar"
        flat
        round
        dense
        :icon="categoriaId ? 'filter_alt' : 'tune'"
        :color="categoriaId ? 'primary' : undefined"
        aria-label="Filtrar por categoría"
        @click="opcionesCategoria.length === 0 && $emit('filtros')"
      >
        <q-menu
          v-if="opcionesCategoria.length > 0"
          class="menu-categorias"
          anchor="bottom right"
          self="top right"
          :offset="[0, 8]"
        >
          <q-list class="menu-categorias__lista">
            <q-item-label header>Filtrar por categoría</q-item-label>
            <q-item
              v-close-popup
              clickable
              :active="categoriaId === null"
              active-class="menu-categorias__activa"
              @click="$emit('update:categoriaId', null)"
            >
              <q-item-section avatar><q-icon name="apps" /></q-item-section>
              <q-item-section>Todas las categorías</q-item-section>
              <q-item-section v-if="categoriaId === null" side>
                <q-icon name="check" color="primary" />
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item
              v-for="categoria in opcionesCategoria"
              :key="categoria.id"
              v-close-popup
              clickable
              :active="categoriaId === categoria.id"
              active-class="menu-categorias__activa"
              @click="$emit('update:categoriaId', categoria.id)"
            >
              <q-item-section avatar>
                <q-avatar class="menu-categorias__avatar" size="38px">
                  <img
                    v-if="obtenerImagenCategoria(categoria.slug)"
                    :src="obtenerImagenCategoria(categoria.slug)"
                    alt=""
                  />
                  <q-icon v-else name="category" color="primary" />
                </q-avatar>
              </q-item-section>
              <q-item-section>{{ categoria.nombre }}</q-item-section>
              <q-item-section v-if="categoriaId === categoria.id" side>
                <q-icon name="check" color="primary" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-btn
        v-else
        class="campo-busqueda__boton"
        color="primary"
        unelevated
        no-caps
        label="Buscar"
        @click="$emit('buscar')"
      />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import type { Categoria } from 'src/models/Categoria';
import { obtenerImagenCategoria } from 'src/utils/imagenesCategoria';

withDefaults(
  defineProps<{
    modelValue: string;
    mostrarBotonBuscar?: boolean;
    categoriaId?: number | null;
    opcionesCategoria?: Categoria[];
  }>(),
  {
    mostrarBotonBuscar: false,
    categoriaId: null,
    opcionesCategoria: () => [],
  },
);
defineEmits<{
  'update:modelValue': [valor: string];
  'update:categoriaId': [valor: number | null];
  buscar: [];
  filtros: [];
}>();
</script>

<style scoped lang="scss">
.campo-busqueda__boton {
  min-width: 112px;
  min-height: 44px;
  border-radius: 14px;
  font-weight: 700;
}

.menu-categorias__lista {
  width: min(320px, calc(100vw - 32px));
  max-height: min(440px, 70vh);
  padding: 6px;
  overflow-y: auto;
}

.menu-categorias__lista .q-item {
  min-height: 52px;
  border-radius: 12px;
}

.menu-categorias__activa {
  color: var(--primario-oscuro);
  background: var(--coral-suave);
}

.menu-categorias__avatar {
  background: var(--azul-suave);
}

@media (max-width: 420px) {
  .campo-busqueda__boton {
    min-width: 48px;

    :deep(.q-btn__content) {
      font-size: 0;
    }

    :deep(.q-btn__content)::after {
      font-family: 'Material Icons';
      font-size: 22px;
      content: 'search';
    }
  }
}
</style>
