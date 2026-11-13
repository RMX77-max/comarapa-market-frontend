<template>
  <q-page class="contenedor-pagina">
    <div class="contenedor-formulario">
      <h1 class="titulo-pagina q-mb-lg">Nueva publicación</h1>
      <formulario-producto
        :categorias="categorias"
        :guardando="guardando"
        @guardar="crearPublicacion"
      />
      <q-banner v-if="error" class="bg-red-1 text-negative q-mt-md" role="alert">{{
        error
      }}</q-banner>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import FormularioProducto from 'components/FormularioProducto.vue';
import type { DatosFormularioProducto } from 'src/models/FormularioProducto';
import { crearProducto } from 'src/services/servicioProductos';
import { obtenerMensajeError } from 'src/services/servicioApi';
import { useTiendaProductos } from 'src/stores/tiendaProductos';
import { useQuasar } from 'quasar';

const enrutador = useRouter();
const tienda = useTiendaProductos();
const categorias = computed(() => tienda.categorias);
const guardando = ref(false);
const error = ref('');
const q = useQuasar();

async function crearPublicacion(datos: DatosFormularioProducto): Promise<void> {
  guardando.value = true;
  error.value = '';
  try {
    await crearProducto(datos);
    q.notify({
      type: 'positive',
      message: 'Publicación enviada. La revisaremos antes de mostrarla en el marketplace.',
    });
    await enrutador.replace({ name: 'mis-publicaciones' });
  } catch (causa) {
    error.value = obtenerMensajeError(causa);
  } finally {
    guardando.value = false;
  }
}
onMounted(() => void tienda.cargarCategorias());
</script>
