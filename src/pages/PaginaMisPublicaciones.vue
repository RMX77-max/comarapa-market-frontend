<template>
  <q-page class="contenedor-pagina">
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
              v-if="producto.estado === 'activo' && producto.estado_moderacion !== 'oculta'"
              class="accion-publicacion accion-publicacion--editar"
              unelevated
              no-caps
              dense
              icon="edit_note"
              label="Editar"
              color="primary"
              aria-label="Editar"
              :to="{ name: 'editar-publicacion', params: { id: producto.id } }"
            />
            <q-btn
              class="accion-publicacion accion-publicacion--eliminar"
              unelevated
              no-caps
              dense
              icon="delete_outline"
              label="Eliminar"
              aria-label="Eliminar"
              @click="eliminar(producto.id)"
            />
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
import { eliminarProducto } from 'src/services/servicioProductos';
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
  if (producto.estado !== 'activo' || producto.estado_moderacion !== 'aprobada') {
    q.notify({
      message:
        producto.estado_moderacion === 'pendiente'
          ? 'La publicación todavía está siendo revisada.'
          : producto.motivo_moderacion || 'Esta publicación todavía no está visible públicamente.',
      icon: 'info',
      color: 'primary',
    });
    return;
  }
  void enrutador.push({ name: 'detalle-producto', params: { id: producto.id } });
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
.acciones-publicacion {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin-top: 8px;
  border-top: 1px solid var(--borde);
  padding-top: 8px;
}

.accion-publicacion {
  min-width: 0;
  min-height: 32px;
  padding: 2px 6px;
  border-radius: 9px;
  font-size: clamp(.66rem, 2.7vw, .76rem);
  font-weight: 700;

  :deep(.q-btn__content) {
    flex-wrap: nowrap;
    gap: 3px;
  }

  :deep(.q-icon) {
    font-size: 17px;
  }

  &--editar {
    color: var(--azul-marino) !important;
    background: var(--azul-suave) !important;
  }

  &--eliminar {
    color: var(--peligro) !important;
    background: rgb(184 58 58 / 12%) !important;
  }
}
</style>
