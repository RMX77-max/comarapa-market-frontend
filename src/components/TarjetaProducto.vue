<template>
  <q-card
    class="tarjeta-producto"
    flat
    bordered
    role="link"
    tabindex="0"
    @click="$emit('abrir', producto)"
    @keydown.enter="$emit('abrir', producto)"
    @keydown.space.prevent="$emit('abrir', producto)"
  >
    <div class="tarjeta-producto__imagen">
      <q-img v-if="producto.url_imagen" :src="producto.url_imagen" :ratio="4 / 3" fit="cover">
        <template #error><imagen-producto-vacia /></template>
      </q-img>
      <imagen-producto-vacia v-else />
      <span v-if="mostrarEstado && producto.estado === 'vendido'" class="tarjeta-producto__estado"
        >Vendido</span
      >
    </div>

    <q-card-section class="tarjeta-producto__contenido">
      <p>{{ formatearPrecio(producto.precio) }}</p>
      <h3>{{ producto.titulo }}</h3>
      <div class="tarjeta-producto__meta">
        <span><q-icon name="place" /> {{ producto.ubicacion }}</span>
        <span>· {{ formatearFechaCorta(producto.fecha_publicacion) }}</span>
      </div>
      <slot name="acciones" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import ImagenProductoVacia from './ImagenProductoVacia.vue';
import type { Producto } from 'src/models/Producto';
import { formatearPrecio } from 'src/utils/formatearPrecio';
import { formatearFechaCorta } from 'src/utils/formatearFecha';

withDefaults(defineProps<{ producto: Producto; mostrarEstado?: boolean }>(), {
  mostrarEstado: false,
});
defineEmits<{ abrir: [producto: Producto] }>();
</script>

<style scoped lang="scss">
.tarjeta-producto {
  position: relative;
  overflow: hidden;
  border-color: var(--borde);
  border-radius: 18px;
  background: var(--fondo);
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;

  &:hover {
    box-shadow: var(--sombra-suave);
    transform: translateY(-2px);
  }

  &:focus-within {
    outline: 2px solid var(--verde-secundario);
    outline-offset: 2px;
  }

  &__imagen {
    position: relative;
    aspect-ratio: 4 / 3;
  }

  &__estado {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 4px 9px;
    border-radius: 999px;
    background: rgb(36 48 41 / 86%);
    color: white;
    font-size: 0.72rem;
  }

  &__contenido {
    padding: 12px 14px 14px;

    h3 {
      display: -webkit-box;
      min-height: 40px;
      margin: 4px 0 2px;
      overflow: hidden;
      font-size: 1rem;
      font-weight: 500;
      line-height: 1.3;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    p {
      margin: 0;
      color: var(--verde-principal);
      font-size: 1.14rem;
      font-weight: 700;
    }
  }

  &__meta {
    display: flex;
    gap: 3px;
    margin-top: 5px;
    overflow: hidden;
    color: var(--texto-secundario);
    font-size: 0.72rem;
    white-space: nowrap;

    span:first-child {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
