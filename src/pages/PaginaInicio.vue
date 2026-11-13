<template>
  <q-page class="contenedor-pagina pagina-inicio">
    <section class="presentacion-inicio">
      <div class="presentacion-inicio__contenido">
        <h1>¡Encuentra lo<br /><em>que buscas!</em></h1>
        <p class="presentacion-inicio__mensaje">
          Compra y vende productos cerca de ti,<br />de forma fácil, segura y rápida.
        </p>
        <div class="acciones-hero" aria-label="Servicios principales">
          <button
            class="accion-hero accion-hero--inmuebles"
            type="button"
            @click="enrutador.push({ name: 'inmuebles' })"
          >
            <span class="accion-hero__icono"><q-icon name="holiday_village" /></span>
            <span><strong>Inmobiliaria</strong><small>Casas, terrenos y alquileres</small></span>
            <q-icon name="arrow_forward" />
          </button>
          <button
            class="accion-hero accion-hero--prestamos"
            type="button"
            @click="enrutador.push({ name: 'solicitar-prestamo' })"
          >
            <span class="accion-hero__icono"><q-icon name="request_quote" /></span>
            <span><strong>Préstamos</strong><small>Solicita una evaluación</small></span>
            <q-icon name="arrow_forward" />
          </button>
          <button
            class="accion-hero accion-hero--busqueda"
            type="button"
            @click="enrutador.push({ name: 'solicitar-producto' })"
          >
            <span class="accion-hero__icono"><q-icon name="travel_explore" /></span>
            <span><strong>¿Buscas algo?</strong><small>Publica lo que necesitas</small></span>
            <q-icon name="arrow_forward" />
          </button>
        </div>
      </div>
      <div class="presentacion-inicio__visual" aria-hidden="true">
        <img src="/hero-marketplace-v2.png" alt="" />
      </div>
    </section>

    <nav class="acciones-movil-fijas" aria-label="Servicios principales">
      <q-btn flat no-caps icon="holiday_village" label="Inmobiliaria" :to="{ name: 'inmuebles' }" />
      <q-btn
        flat
        no-caps
        icon="request_quote"
        label="Préstamos"
        :to="{ name: 'solicitar-prestamo' }"
      />
      <q-btn
        flat
        no-caps
        icon="travel_explore"
        label="¿Buscas algo?"
        :to="{ name: 'solicitar-producto' }"
      />
    </nav>

    <section aria-labelledby="titulo-categorias">
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
      <div class="encabezado-seccion">
        <div>
          <span class="etiqueta-tipo etiqueta-tipo--venta"><q-icon name="sell" /> SE VENDE</span>
          <h2 id="titulo-recientes">Productos disponibles</h2>
        </div>
      </div>
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

    <section class="necesidades-inicio" aria-labelledby="titulo-necesidades">
      <div class="encabezado-seccion">
        <div>
          <span class="etiqueta-tipo etiqueta-tipo--busqueda"
            ><q-icon name="search" /> SE BUSCA</span
          >
          <h2 id="titulo-necesidades">Productos solicitados</h2>
        </div>
        <q-btn
          flat
          no-caps
          color="primary"
          label="Publicar necesidad"
          icon-right="add"
          :to="{ name: 'solicitar-producto' }"
        />
      </div>
      <div v-if="necesidades.length" class="necesidades-inicio__rejilla">
        <article v-for="necesidad in necesidades" :key="necesidad.id">
          <div class="necesidad__cabecera">
            <q-badge color="deep-orange-7" rounded>SE BUSCA</q-badge>
            <q-icon name="campaign" />
          </div>
          <h3>{{ necesidad.nombre }}</h3>
          <p>{{ necesidad.descripcion }}</p>
          <strong v-if="necesidad.presupuesto">
            Presupuesto: Bs {{ Number(necesidad.presupuesto).toLocaleString('es-BO') }}
          </strong>
          <small><q-icon name="place" /> {{ necesidad.ciudad }}</small>
        </article>
      </div>
      <div v-else class="necesidades-inicio__vacio">Todavía no hay necesidades publicadas.</div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import TarjetaProducto from 'components/TarjetaProducto.vue';
import EstadoContenido from 'components/EstadoContenido.vue';
import type { Producto } from 'src/models/Producto';
import { useTiendaProductos } from 'src/stores/tiendaProductos';
import { obtenerImagenCategoria } from 'src/utils/imagenesCategoria';
import {
  listarNecesidadesProductos,
  type SolicitudProductoEspecial,
} from 'src/services/servicioServiciosEspeciales';

const enrutador = useRouter();
const tienda = useTiendaProductos();
const categorias = computed(() => tienda.categorias);
const productos = computed(() => tienda.productos.slice(0, 8));
const necesidades = ref<SolicitudProductoEspecial[]>([]);
function abrirCategoria(categoria: number): void {
  void enrutador.push({ name: 'buscar', query: { categoria } });
}

function abrirProducto(producto: Producto): void {
  void enrutador.push({ name: 'detalle-producto', params: { id: producto.id } });
}

async function cargar(): Promise<void> {
  const [, , solicitudes] = await Promise.all([
    tienda.cargarCategorias(),
    tienda.cargarProductos(),
    listarNecesidadesProductos(),
  ]);
  necesidades.value = solicitudes;
}
onMounted(() => void cargar());
</script>

<style scoped lang="scss">
.pagina-inicio {
  width: min(100%, 1480px);
  background: var(--fondo-azulado);
}

.etiqueta-tipo {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  margin-bottom: 4px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.etiqueta-tipo--venta {
  color: var(--azul-marino);
}
.etiqueta-tipo--busqueda {
  color: var(--coral);
}

.presentacion-inicio {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(420px, 1.08fr);
  gap: clamp(24px, 4vw, 64px);
  align-items: center;
  min-height: 360px;

  h1 {
    max-width: 660px;
    margin: 8px 0 0;
    color: var(--azul-marino);
    font-family: var(--fuente-titulos);
    font-size: var(--tamano-hero);
    font-weight: 700;
    line-height: 1.15;

    em {
      color: var(--coral);
      font-style: normal;
    }
  }

  &__mensaje {
    margin: 12px 0 24px;
    color: var(--texto-secundario);
  }

  &__visual {
    overflow: hidden;
    border-radius: 38px 0 38px 38px;
    background: var(--azul-suave);

    img {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 9;
      object-fit: cover;
    }
  }
}

.acciones-hero {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.accion-hero {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  min-width: 0;
  padding: 15px;
  border: 1px solid rgb(255 255 255 / 72%);
  border-radius: 18px;
  color: var(--azul-marino);
  text-align: left;
  cursor: pointer;
  box-shadow: 0 10px 28px rgb(0 70 40 / 10%);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;

  &:hover {
    box-shadow: 0 14px 34px rgb(0 70 40 / 16%);
    transform: translateY(-2px);
  }

  &--inmuebles {
    background: var(--superficie-suave);
  }

  &--prestamos {
    background: #e4f1e2;
  }

  &--busqueda {
    background: #d8ecd7;
  }

  &__icono {
    display: grid;
    width: 46px;
    height: 46px;
    border-radius: 14px;
    background: rgb(255 255 255 / 86%);
    color: var(--coral);
    font-size: 25px;
    place-items: center;
  }

  strong,
  small {
    display: block;
  }

  strong {
    font-family: var(--fuente-titulos);
    font-size: 0.98rem;
  }

  small {
    margin-top: 2px;
    overflow: hidden;
    color: var(--texto-secundario);
    font-size: 0.72rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.acciones-movil-fijas {
  display: none;
}

.categorias-inicio {
  display: grid;
  grid-template-columns: repeat(5, minmax(62px, 1fr));
  gap: 10px;
  overflow-x: auto;

  button {
    display: flex;
    gap: 14px;
    align-items: center;
    min-width: 64px;
    padding: 10px 18px;
    border: 0;
    border-radius: 16px;
    background: var(--fondo);
    color: var(--texto-principal);
    font-family: var(--fuente-titulos);
    font-size: var(--tamano-navegacion);
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 8px 24px rgb(0 70 40 / 8%);
  }

  span {
    display: grid;
    width: 58px;
    height: 58px;
    color: var(--azul-marino);
    border-radius: 50%;
    background: var(--coral-suave);
    place-items: center;

    img {
      width: 48px;
      height: 48px;
      object-fit: contain;
    }
  }

  button:nth-child(2) span {
    background: #e0efdd;
  }
  button:nth-child(3) span {
    background: var(--azul-suave);
  }
  button:nth-child(4) span {
    background: #ffe0e9;
  }
  button:nth-child(5) span {
    background: #fff0c5;
  }
}
.servicios-inicio__etiqueta {
  display: block;
  margin-bottom: 2px;
  color: var(--coral);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.necesidades-inicio__rejilla {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
.necesidades-inicio article {
  padding: 18px;
  border: 1px solid var(--borde);
  border-radius: 18px;
  background: var(--fondo);
  box-shadow: 0 8px 24px rgb(0 70 40 / 8%);
}
.necesidad__cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--coral);
  font-size: 26px;
}
.necesidades-inicio h3 {
  margin: 12px 0 6px;
  color: var(--azul-marino);
  font-size: 1.05rem;
}
.necesidades-inicio p {
  display: -webkit-box;
  min-height: 42px;
  margin: 0 0 10px;
  overflow: hidden;
  color: var(--texto-secundario);
  font-size: 0.85rem;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.necesidades-inicio strong,
.necesidades-inicio small {
  display: block;
}
.necesidades-inicio strong {
  margin-bottom: 7px;
  color: var(--coral);
  font-size: 0.84rem;
}
.necesidades-inicio small {
  color: var(--texto-secundario);
}
.necesidades-inicio__vacio {
  padding: 26px;
  border: 1px dashed var(--borde);
  border-radius: 18px;
  color: var(--texto-secundario);
  text-align: center;
}
.servicios-inicio__rejilla {
  display: grid;
  grid-template-columns: minmax(0, 560px);
  gap: 14px;
}
.servicio-destacado {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
  padding: 18px;
  border: 0;
  border-radius: 20px;
  color: var(--texto-principal);
  text-align: left;
  cursor: pointer;
  box-shadow: var(--sombra-suave);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.servicio-destacado:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgb(0 70 40 / 15%);
}
.servicio-destacado--inmuebles {
  background: var(--superficie-suave);
}
.servicio-destacado--prestamos {
  background: #e4f1e2;
}
.servicio-destacado--productos {
  background: #d8ecd7;
}
.servicio-destacado__icono {
  display: grid;
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  border-radius: 15px;
  background: rgb(255 255 255 / 78%);
  color: var(--coral);
  font-size: 26px;
  place-items: center;
}
.servicio-destacado__texto {
  display: grid;
  min-width: 0;
  gap: 3px;
  flex: 1;
}
.servicio-destacado__texto strong {
  font-family: var(--fuente-titulos);
  font-size: 1rem;
}
.servicio-destacado__texto small {
  overflow: hidden;
  color: var(--texto-secundario);
  font-size: 0.8rem;
  line-height: 1.35;
}
@media (max-width: 760px) {
  .presentacion-inicio {
    display: block;
    min-height: 0;

    &__visual {
      display: none;
    }
  }

  .acciones-hero {
    display: none;
  }

  .acciones-movil-fijas {
    position: sticky;
    z-index: 5;
    top: 62px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    margin: 16px -4px 0;
    padding: 7px;
    border: 1px solid rgb(220 228 239 / 80%);
    border-radius: 16px;
    background: rgb(255 255 255 / 94%);
    box-shadow: 0 8px 22px rgb(0 70 40 / 12%);
    backdrop-filter: blur(14px);

    :deep(.q-btn) {
      min-width: 0;
      min-height: 54px;
      padding: 5px 2px;
      border-radius: 11px;
      color: var(--azul-marino);
    }

    :deep(.q-btn:nth-child(1)) {
      background: var(--azul-suave);
    }

    :deep(.q-btn:nth-child(2)) {
      background: var(--coral-suave);
    }

    :deep(.q-btn:nth-child(3)) {
      background: #d8ecd7;
    }

    :deep(.q-btn__content) {
      display: grid;
      gap: 2px;
      font-size: 0.66rem;
      line-height: 1.1;
    }

    :deep(.q-icon) {
      margin: 0;
      color: var(--coral);
      font-size: 21px;
    }
  }


  .categorias-inicio {
    display: grid;
    grid-template-columns: repeat(5, minmax(62px, 1fr));
    gap: 7px;
    margin-inline: -4px;
    padding: 14px 4px 5px;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    button {
      flex-direction: column;
      gap: 6px;
      min-width: 62px;
      padding: 7px 3px 8px;
      border-radius: 14px;
      font-size: 0.68rem;
      line-height: 1.15;
      text-align: center;
      box-shadow: 0 5px 16px rgb(0 70 40 / 8%);
      scroll-snap-align: start;
    }

    span {
      width: 50px;
      height: 50px;

      img {
        width: 43px;
        height: 43px;
      }
    }
  }

  .servicios-inicio__rejilla {
    display: flex;
    margin-inline: calc(-1 * clamp(16px, 3vw, 32px));
    padding: 0 clamp(16px, 3vw, 32px) 6px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  .necesidades-inicio__rejilla {
    display: flex;
    margin-inline: calc(-1 * clamp(16px, 3vw, 32px));
    padding: 0 clamp(16px, 3vw, 32px) 8px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  .necesidades-inicio article {
    flex: 0 0 min(78vw, 290px);
    scroll-snap-align: start;
  }
  .servicio-destacado {
    flex: 0 0 min(82vw, 310px);
    scroll-snap-align: start;
  }
}

@media (min-width: 761px) {
  .categorias-inicio span {
    width: 72px;
    height: 72px;

    img {
      width: 60px;
      height: 60px;
    }
  }
}
</style>
