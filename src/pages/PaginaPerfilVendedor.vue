<template>
  <q-page class="contenedor-pagina pagina-vendedor">
    <estado-contenido v-if="cargando" tipo="cargando" />
    <template v-else-if="vendedor">
      <section class="cabecera-vendedor">
        <q-avatar size="76px">
          <img v-if="vendedor.url_foto_perfil" :src="vendedor.url_foto_perfil" alt="" />
          <span v-else>{{ vendedor.nombre.charAt(0).toUpperCase() }}</span>
        </q-avatar>
        <div>
          <h1>{{ vendedor.nombre }}</h1>
          <p v-if="vendedor.ubicacion"><q-icon name="place" /> {{ vendedor.ubicacion }}</p>
          <small>{{ productos.length }} publicaciones disponibles</small>
        </div>
      </section>
      <div class="cuadricula-productos">
        <tarjeta-producto
          v-for="producto in productos"
          :key="producto.id"
          :producto="producto"
          @abrir="abrir"
        />
      </div>
    </template>
    <estado-contenido v-else titulo="Vendedor no disponible" icono="person_off" />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EstadoContenido from 'components/EstadoContenido.vue';
import TarjetaProducto from 'components/TarjetaProducto.vue';
import type { Producto } from 'src/models/Producto';
import type { ResumenUsuario } from 'src/models/Usuario';
import { listarProductos } from 'src/services/servicioProductos';

const ruta = useRoute();
const enrutador = useRouter();
const vendedor = ref<ResumenUsuario | null>(null);
const productos = ref<Producto[]>([]);
const cargando = ref(true);
function abrir(producto: Producto): void {
  void enrutador.push({ name: 'detalle-producto', params: { id: producto.id } });
}
onMounted(async () => {
  const id = Number(ruta.params.id);
  try {
    const datos = await listarProductos();
    productos.value = datos.productos.filter((producto) => producto.vendedor.id === id);
    vendedor.value = productos.value[0]?.vendedor ?? null;
  } finally {
    cargando.value = false;
  }
});
</script>

<style scoped lang="scss">
.cabecera-vendedor {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  border: 1px solid var(--borde);
  border-radius: var(--radio-grande);
  background: var(--fondo);
}
.cabecera-vendedor .q-avatar {
  background: var(--azul-suave);
  color: var(--azul-marino);
}
.cabecera-vendedor h1 {
  margin: 0;
  color: var(--azul-marino);
  font-size: 1.45rem;
}
.cabecera-vendedor p,
.cabecera-vendedor small {
  margin: 4px 0 0;
  color: var(--texto-secundario);
}
</style>
