<template>
  <q-page class="contenedor-pagina">
    <div class="encabezado-publicaciones">
      <h1 class="titulo-pagina">Mis publicaciones</h1>
    </div>

    <estado-contenido v-if="tienda.cargando" tipo="cargando" />
    <estado-contenido
      v-else-if="tienda.error"
      tipo="error"
      :mensaje="tienda.error"
      etiqueta-accion="Reintentar"
      @accion="recargar"
    />
    <estado-contenido
      v-else-if="publicaciones.length === 0"
      titulo="Aún no tienes publicaciones"
      mensaje="Publica tu primer producto para comenzar."
      icono="inventory_2"
      etiqueta-accion="Nueva publicación"
      @accion="enrutador.push({ name: 'publicar' })"
    />
    <div v-else class="cuadricula-productos q-mt-lg">
      <tarjeta-producto
        v-for="producto in publicaciones"
        :key="producto.id"
        :producto="producto"
        mostrar-estado
        @abrir="abrirProducto"
      >
        <template #acciones>
          <div class="acciones-publicacion" @click.stop>
            <q-btn
              v-if="producto.estado === 'activo'"
              flat
              round
              icon="edit_square"
              color="primary"
              aria-label="Editar"
              :to="{ name: 'editar-publicacion', params: { id: producto.id } }"
              ><q-tooltip>Editar publicación</q-tooltip></q-btn
            >
            <q-btn
              v-if="producto.estado === 'activo'"
              flat
              round
              icon="sell"
              color="primary"
              aria-label="Marcar vendido"
              @click="marcarVendido(producto.id)"
              ><q-tooltip>Marcar como vendido</q-tooltip></q-btn
            >
            <q-btn
              v-else-if="producto.estado === 'vendido'"
              flat
              round
              icon="published_with_changes"
              color="orange-9"
              aria-label="Volver a publicar"
              @click="marcarDisponible(producto.id)"
              ><q-tooltip>Volver a marcar como disponible</q-tooltip></q-btn
            >
            <q-btn
              flat
              round
              icon="delete_forever"
              color="negative"
              aria-label="Eliminar"
              @click="eliminar(producto.id)"
              ><q-tooltip>Eliminar publicación</q-tooltip></q-btn
            >
          </div>
        </template>
      </tarjeta-producto>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import EstadoContenido from 'components/EstadoContenido.vue';
import TarjetaProducto from 'components/TarjetaProducto.vue';
import type { Producto } from 'src/models/Producto';
import {
  eliminarProducto,
  marcarComoDisponible,
  marcarComoVendido,
} from 'src/services/servicioProductos';
import { obtenerMensajeError } from 'src/services/servicioApi';
import { useTiendaProductos } from 'src/stores/tiendaProductos';
import { useQuasar } from 'quasar';

const enrutador = useRouter();
const tienda = useTiendaProductos();
const publicaciones = computed(() => tienda.misPublicaciones);
const q = useQuasar();

async function recargar(): Promise<void> {
  await tienda.cargarMisPublicaciones();
}
function abrirProducto(producto: Producto): void {
  if (producto.estado !== 'activo') {
    q.notify({
      message: 'Reactiva el producto para verlo y editarlo nuevamente.',
      icon: 'info',
      color: 'primary',
    });
    return;
  }
  void enrutador.push({ name: 'detalle-producto', params: { id: producto.id } });
}
async function marcarVendido(id: number): Promise<void> {
  try {
    await marcarComoVendido(id);
    await recargar();
  } catch (error) {
    q.notify({ type: 'negative', message: obtenerMensajeError(error) });
  }
}
async function marcarDisponible(id: number): Promise<void> {
  try {
    await marcarComoDisponible(id);
    q.notify({ type: 'positive', message: 'El producto vuelve a estar disponible.' });
    await recargar();
  } catch (error) {
    q.notify({ type: 'negative', message: obtenerMensajeError(error) });
  }
}
async function eliminar(id: number): Promise<void> {
  if (!window.confirm('¿Quieres eliminar esta publicación?')) return;
  try {
    await eliminarProducto(id);
    await recargar();
  } catch (error) {
    q.notify({ type: 'negative', message: obtenerMensajeError(error) });
  }
}
onMounted(() => void recargar());
</script>

<style scoped lang="scss">
.encabezado-publicaciones {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}
.encabezado-publicaciones .titulo-pagina {
  font-size: clamp(1.45rem, 5vw, 2.15rem);
  white-space: nowrap;
}
.acciones-publicacion {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 8px;
  border-top: 1px solid var(--borde);
  padding-top: 10px;

  .q-btn {
    width: 42px;
    height: 42px;
    background: var(--verde-claro);
    font-size: 1.2rem;
  }
  .q-btn.text-negative {
    background: #fff0ee;
  }
  .q-btn.text-orange-9 {
    background: #fff3df;
  }
}
</style>
