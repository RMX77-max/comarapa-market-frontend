<template>
  <q-select
    :model-value="modelValue"
    class="campo-formulario"
    :options="opciones"
    label="Categoría"
    option-label="nombre"
    option-value="id"
    emit-value
    map-options
    outlined
    clearable
    @update:model-value="$emit('update:modelValue', $event as number | null)"
  >
    <template #option="alcance">
      <q-item v-bind="alcance.itemProps">
        <q-item-section avatar>
          <q-avatar color="green-1" size="40px">
            <img
              v-if="obtenerImagenCategoria(alcance.opt.slug)"
              :src="obtenerImagenCategoria(alcance.opt.slug)"
              alt=""
            />
            <q-icon v-else name="category" color="primary" />
          </q-avatar>
        </q-item-section>
        <q-item-section
          ><q-item-label>{{ alcance.opt.nombre }}</q-item-label></q-item-section
        >
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import type { Categoria } from 'src/models/Categoria';
import { obtenerImagenCategoria } from 'src/utils/imagenesCategoria';

defineProps<{ modelValue: number | null; opciones: Categoria[] }>();
defineEmits<{ 'update:modelValue': [valor: number | null] }>();
</script>
