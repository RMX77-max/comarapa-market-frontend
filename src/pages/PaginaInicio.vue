<template>
  <q-page class="contenedor-pagina pagina-inicio">
    <section class="presentacion-inicio">
      <div>
        <h1>¡Hola, busca lo que necesites!</h1>
        <p class="presentacion-inicio__mensaje">Encuentra lo que necesitas cerca de ti.</p>
      </div>
      <campo-busqueda v-model="busqueda" @buscar="irABuscar" @filtros="abrirFiltros" />
    </section>

    <section aria-labelledby="titulo-categorias">
      <div class="encabezado-seccion"><h2 id="titulo-categorias">Categorías</h2></div>
      <div class="categorias-inicio">
        <button
          v-for="categoria in categorias"
          :key="categoria.id"
          type="button"
          @click="abrirCategoria(categoria.id)"
        >
          <span>
            <img
              v-if="obtenerImagenCategoria(categoria.slug)"
              :src="obtenerImagenCategoria(categoria.slug)"
              alt=""
            />
            <q-icon v-else name="category" size="25px" />
          </span>
          {{ categoria.nombre }}
        </button>
      </div>
    </section>

    <section aria-labelledby="titulo-recientes">
      <div class="encabezado-seccion"><h2 id="titulo-recientes">Publicaciones recientes</h2></div>
      <estado-contenido v-if="tienda.cargando" tipo="cargando" />
      <estado-contenido
        v-else-if="tienda.error"
        tipo="error"
        titulo="No pudimos cargar los productos"
        :mensaje="tienda.error"
        etiqueta-accion="Reintentar"
        @accion="cargar"
      />
      <div v-else class="cuadricula-productos">
        <tarjeta-producto
          v-for="producto in productos"
          :key="producto.id"
          :producto="producto"
          @abrir="abrirProducto"
        />
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import CampoBusqueda from 'components/CampoBusqueda.vue';
import TarjetaProducto from 'components/TarjetaProducto.vue';
import EstadoContenido from 'components/EstadoContenido.vue';
import type { Producto } from 'src/models/Producto';
import { useTiendaProductos } from 'src/stores/tiendaProductos';
import { obtenerImagenCategoria } from 'src/utils/imagenesCategoria';

const enrutador = useRouter();
const busqueda = ref('');
const tienda = useTiendaProductos();
const categorias = computed(() => tienda.categorias);
const productos = computed(() => tienda.productos.slice(0, 8));
function irABuscar(): void {
  void enrutador.push({ name: 'buscar', query: { buscar: busqueda.value || undefined } });
}

function abrirFiltros(): void {
  void enrutador.push({ name: 'buscar' });
}

function abrirCategoria(categoria: number): void {
  void enrutador.push({ name: 'buscar', query: { categoria } });
}

function abrirProducto(producto: Producto): void {
  void enrutador.push({ name: 'detalle-producto', params: { id: producto.id } });
}

async function cargar(): Promise<void> {
  await Promise.all([tienda.cargarCategorias(), tienda.cargarProductos()]);
}
onMounted(() => void cargar());
</script>

<style scoped lang="scss">
.pagina-inicio {
  background: linear-gradient(155deg, #f8f7ee 0%, #f3f5e8 52%, #f8f3e9 100%);
}

.presentacion-inicio {
  display: grid;
  gap: 22px;

  h1 {
    max-width: 620px;
    margin: 8px 0 0;
    font-size: clamp(2rem, 6vw, 3.35rem);
    font-weight: 700;
    line-height: 1.15;
  }

  &__mensaje {
    margin: 8px 0 0;
    color: var(--texto-secundario);
  }
}

.categorias-inicio {
  display: grid;
  grid-template-columns: repeat(5, minmax(62px, 1fr));
  gap: 10px;
  overflow-x: auto;

  button {
    display: grid;
    gap: 7px;
    min-width: 64px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--texto-principal);
    font-size: 0.72rem;
    cursor: pointer;
    place-items: center;
  }

  span {
    display: grid;
    width: 58px;
    height: 58px;
    color: var(--verde-principal);
    border-radius: 50%;
    background: #dbe7c1;
    place-items: center;

    img {
      width: 48px;
      height: 48px;
      object-fit: contain;
    }
  }

  button:nth-child(2n) span {
    background: #e8c597;
  }
  button:nth-child(3n) span {
    background: #cbd8a9;
  }
  button:nth-child(4n) span {
    background: #e2b98e;
  }
}

@media (min-width: 720px) {
  .categorias-inicio span {
    width: 72px;
    height: 72px;

    img {
      width: 60px;
      height: 60px;
    }
  }
}

@media (min-width: 720px) {
  .presentacion-inicio {
    grid-template-columns: 1fr minmax(280px, 420px);
    align-items: end;
  }
}
</style>
