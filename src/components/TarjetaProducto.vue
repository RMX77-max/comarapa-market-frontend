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
      <span v-if="mostrarTipo" class="tarjeta-producto__tipo">
        <q-icon name="sell" /> En venta
      </span>
      <span v-if="mostrarEstado && producto.estado === 'vendido'" class="tarjeta-producto__estado"
        >Vendido</span
      >
      <span
        v-else-if="mostrarEstado && producto.estado_moderacion !== 'aprobada'"
        class="tarjeta-producto__estado"
        :class="`tarjeta-producto__estado--${producto.estado_moderacion}`"
        >{{ etiquetaModeracion }}</span
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
import { computed } from 'vue';
import ImagenProductoVacia from './ImagenProductoVacia.vue';
import type { Producto } from 'src/models/Producto';
import { formatearPrecio } from 'src/utils/formatearPrecio';
import { formatearFechaCorta } from 'src/utils/formatearFecha';

const propiedades = withDefaults(
  defineProps<{ producto: Producto; mostrarEstado?: boolean; mostrarTipo?: boolean }>(),
  { mostrarEstado: false, mostrarTipo: true },
);
const etiquetaModeracion = computed(
  () =>
    ({
      pendiente: 'En revisión',
      rechazada: 'Rechazada',
      correccion: 'Requiere cambios',
      oculta: 'Oculta',
      aprobada: 'Aprobada',
    })[propiedades.producto.estado_moderacion],
);
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
    outline: 2px solid var(--coral);
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
  &__tipo {
    position: absolute;
    top: 10px;
    left: 10px;
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 5px 9px;
    border-radius: 999px;
    background: rgb(0 70 40 / 92%);
    color: white;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    backdrop-filter: blur(6px);
  }
  &__estado--pendiente {
    background: rgb(156 99 22 / 92%);
  }
  &__estado--rechazada,
  &__estado--oculta {
    background: rgb(166 45 45 / 92%);
  }
  &__estado--correccion {
    background: rgb(54 91 151 / 92%);
  }

  &__contenido {
    padding: 12px 14px 14px;

    h3 {
      display: -webkit-box;
      min-height: 40px;
      margin: 4px 0 2px;
      overflow: hidden;
      color: var(--azul-marino);
      font-family: var(--fuente-titulos);
      font-size: var(--tamano-tarjeta);
      font-weight: 600;
      line-height: 1.3;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    p {
      margin: 0;
      color: var(--verde-principal);
      font-family: var(--fuente-titulos);
      font-size: var(--tamano-precio);
      font-weight: 700;
    }
  }

  &__meta {
    display: flex;
    gap: 3px;
    margin-top: 5px;
    overflow: hidden;
    color: var(--texto-secundario);
    font-size: var(--tamano-meta);
    white-space: nowrap;

    span:first-child {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
