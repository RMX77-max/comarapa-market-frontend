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
      <q-btn flat round dense icon="tune" aria-label="Ver filtros" @click="$emit('filtros')" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>();
defineEmits<{ 'update:modelValue': [valor: string]; buscar: []; filtros: [] }>();
</script>
