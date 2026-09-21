<template>
  <q-page class="contenedor-pagina">
    <div class="contenedor-formulario">
      <div class="row items-center q-gutter-sm q-mb-lg">
        <q-btn flat round icon="arrow_back" aria-label="Volver" @click="enrutador.back()" />
        <h1 class="titulo-pagina">Editar publicación</h1>
      </div>

      <estado-contenido
        v-if="!producto"
        tipo="error"
        titulo="Publicación no encontrada"
        mensaje="No pudimos encontrar esta publicación."
      />
      <formulario-producto
        v-else
        :categorias="categorias"
        :producto="producto"
        etiqueta-boton="Guardar cambios"
        :guardando="guardando"
        @guardar="guardarCambios"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EstadoContenido from 'components/EstadoContenido.vue';
import FormularioProducto from 'components/FormularioProducto.vue';
import type { DatosFormularioProducto } from 'src/models/FormularioProducto';
import { actualizarProducto } from 'src/services/servicioProductos';
import { useTiendaProductos } from 'src/stores/tiendaProductos';
import { obtenerMensajeError } from 'src/services/servicioApi';
import { useQuasar } from 'quasar';

const ruta = useRoute();
const enrutador = useRouter();
const tienda = useTiendaProductos();
const producto = computed(
  () =>
    tienda.misPublicaciones.find(
      (item) => item.id === Number(ruta.params.id) && item.estado === 'activo',
    ) ?? null,
);
const categorias = computed(() => tienda.categorias);
const q = useQuasar();
const guardando = ref(false);

async function guardarCambios(datos: DatosFormularioProducto): Promise<void> {
  if (!producto.value) return;
  guardando.value = true;
  try {
    await actualizarProducto(producto.value.id, datos);
    await enrutador.replace({ name: 'mis-publicaciones' });
  } catch (error) {
    q.notify({ type: 'negative', message: obtenerMensajeError(error) });
  } finally {
    guardando.value = false;
  }
}
onMounted(async () => {
  await Promise.all([tienda.cargarCategorias(), tienda.cargarMisPublicaciones()]);
});
</script>
