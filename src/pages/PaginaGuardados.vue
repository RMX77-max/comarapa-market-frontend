<template>
  <q-page class="contenedor-pagina pagina-guardados">
    <estado-contenido v-if="cargando" tipo="cargando" />
    <estado-contenido
      v-else-if="!productos.length"
      titulo="No tienes publicaciones guardadas"
      mensaje="Guarda los productos que te interesan para encontrarlos fácilmente después."
      icono="bookmark_border"
    />
    <div v-else class="cuadricula-productos">
      <tarjeta-producto
        v-for="producto in productos"
        :key="producto.id"
        :producto="producto"
        @abrir="abrir"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import EstadoContenido from 'components/EstadoContenido.vue';
import TarjetaProducto from 'components/TarjetaProducto.vue';
import type { Producto } from 'src/models/Producto';
import { obtenerProducto } from 'src/services/servicioProductos';
import { obtenerIdsGuardados } from 'src/services/servicioGuardados';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';

const autenticacion = useTiendaAutenticacion();
const enrutador = useRouter();
const productos = ref<Producto[]>([]);
const cargando = ref(true);

function abrir(producto: Producto): void {
  void enrutador.push({ name: 'detalle-producto', params: { id: producto.id } });
}
onMounted(async () => {
  const ids = autenticacion.usuario ? obtenerIdsGuardados(autenticacion.usuario.id) : [];
  const resultados = await Promise.allSettled(ids.map(obtenerProducto));
  productos.value = resultados.flatMap((resultado) =>
    resultado.status === 'fulfilled' ? [resultado.value] : [],
  );
  cargando.value = false;
});
</script>
