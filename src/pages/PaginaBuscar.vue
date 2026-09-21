<template>
  <q-page class="contenedor-pagina">
    <h1 class="titulo-pagina">Buscar</h1>
    <div class="filtros-busqueda q-mt-lg">
      <campo-busqueda v-model="busqueda" />
      <selector-categoria v-model="categoriaId" :opciones="categorias" />
    </div>

    <div class="encabezado-seccion">
      <h2>Resultados</h2>
      <span class="texto-secundario">{{ resultados.length }} productos</span>
    </div>

    <estado-contenido v-if="tienda.cargando" tipo="cargando" />
    <estado-contenido
      v-else-if="tienda.error"
      tipo="error"
      titulo="No pudimos buscar"
      :mensaje="tienda.error"
      etiqueta-accion="Reintentar"
      @accion="buscar"
    />
    <estado-contenido
      v-else-if="resultados.length === 0"
      titulo="No se encontraron productos"
      mensaje="Prueba con otra búsqueda o categoría."
      icono="search_off"
    />
    <div v-else class="cuadricula-productos">
      <tarjeta-producto
        v-for="producto in resultados"
        :key="producto.id"
        :producto="producto"
        @abrir="abrirProducto"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CampoBusqueda from 'components/CampoBusqueda.vue';
import EstadoContenido from 'components/EstadoContenido.vue';
import SelectorCategoria from 'components/SelectorCategoria.vue';
import TarjetaProducto from 'components/TarjetaProducto.vue';
import type { Producto } from 'src/models/Producto';
import { useTiendaProductos } from 'src/stores/tiendaProductos';

const ruta = useRoute();
const enrutador = useRouter();
const busqueda = ref(typeof ruta.query.buscar === 'string' ? ruta.query.buscar : '');
const categoriaInicial = Number(ruta.query.categoria);
const categoriaId = ref<number | null>(
  Number.isInteger(categoriaInicial) && categoriaInicial > 0 ? categoriaInicial : null,
);
const tienda = useTiendaProductos();
const categorias = computed(() => tienda.categorias);
const resultados = computed(() => tienda.productos);
let temporizador: ReturnType<typeof setTimeout> | undefined;

async function buscar(): Promise<void> {
  await tienda.cargarProductos({
    ...(busqueda.value ? { buscar: busqueda.value } : {}),
    ...(categoriaId.value ? { categoria: categoriaId.value } : {}),
  });
}

watch([busqueda, categoriaId], () => {
  clearTimeout(temporizador);
  temporizador = setTimeout(() => void buscar(), 300);
});
onMounted(async () => {
  await tienda.cargarCategorias();
  await buscar();
});

function abrirProducto(producto: Producto): void {
  void enrutador.push({ name: 'detalle-producto', params: { id: producto.id } });
}
</script>

<style scoped lang="scss">
.filtros-busqueda {
  display: grid;
  gap: 12px;
}

@media (min-width: 640px) {
  .filtros-busqueda {
    grid-template-columns: 1fr 280px;
  }
}
</style>
