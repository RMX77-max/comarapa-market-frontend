<template>
  <q-page class="contenedor-pagina detalle-producto">
    <q-btn flat round icon="arrow_back" aria-label="Volver" @click="enrutador.back()" />

    <estado-contenido v-if="tienda.cargando" tipo="cargando" />
    <estado-contenido
      v-else-if="!producto"
      tipo="error"
      titulo="Producto no disponible"
      mensaje="La publicación no existe o fue eliminada."
      etiqueta-accion="Volver al inicio"
      @accion="enrutador.push({ name: 'inicio' })"
    />
    <article v-else class="detalle-producto__contenido">
      <div class="detalle-producto__imagen">
        <q-carousel
          v-if="imagenesProducto.length"
          v-model="indiceImagen"
          animated
          arrows
          navigation
          swipeable
          infinite
          class="detalle-producto__carrusel"
        >
          <q-carousel-slide
            v-for="(imagen, indice) in imagenesProducto"
            :key="imagen"
            :name="indice"
            :img-src="imagen"
          />
        </q-carousel>
        <imagen-producto-vacia v-else />
      </div>

      <div class="detalle-producto__informacion">
        <span class="detalle-producto__categoria">{{ producto.categoria.nombre }}</span>
        <h1>{{ producto.titulo }}</h1>
        <div class="detalle-producto__precio">{{ formatearPrecio(producto.precio) }}</div>
        <p>{{ producto.descripcion }}</p>
        <div class="detalle-producto__ubicacion">
          <q-icon name="place" /> {{ producto.ubicacion }}
        </div>

        <section class="tarjeta-vendedor">
          <avatar-usuario
            :nombre="producto.vendedor.nombre"
            :url="producto.vendedor.url_foto_perfil"
            tamano="52px"
          />
          <div>
            <strong>{{ producto.vendedor.nombre }}</strong
            ><span>{{ producto.vendedor.ubicacion }}</span>
          </div>
        </section>

        <q-btn
          v-if="!esPropietario"
          class="boton-principal full-width"
          color="primary"
          icon="chat_bubble_outline"
          label="Enviar mensaje"
          unelevated
          no-caps
          :loading="contactando"
          @click="contactar"
        />
        <q-banner v-else class="aviso-propietario rounded-borders">
          <q-icon name="storefront" size="24px" /> Esta es tu publicación.
        </q-banner>
      </div>
    </article>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AvatarUsuario from 'components/AvatarUsuario.vue';
import EstadoContenido from 'components/EstadoContenido.vue';
import ImagenProductoVacia from 'components/ImagenProductoVacia.vue';
import { formatearPrecio } from 'src/utils/formatearPrecio';
import { useTiendaProductos } from 'src/stores/tiendaProductos';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';
import { crearConversacion } from 'src/services/servicioMensajes';
import { obtenerMensajeError } from 'src/services/servicioApi';
import { useQuasar } from 'quasar';

const ruta = useRoute();
const enrutador = useRouter();
const tienda = useTiendaProductos();
const autenticacion = useTiendaAutenticacion();
const q = useQuasar();
const producto = computed(() => tienda.productoActual);
const imagenesProducto = computed(() => {
  const imagenes = producto.value?.imagenes?.length
    ? producto.value.imagenes
    : producto.value?.url_imagen
      ? [producto.value.url_imagen]
      : [];
  return [...new Set(imagenes)];
});
const esPropietario = computed(() =>
  Boolean(autenticacion.usuario && producto.value?.vendedor.id === autenticacion.usuario.id),
);
const indiceImagen = ref(0);
const contactando = ref(false);

async function contactar(): Promise<void> {
  if (!producto.value) return;
  if (!autenticacion.estaAutenticado) {
    await enrutador.push({ name: 'iniciar-sesion', query: { redireccion: ruta.fullPath } });
    return;
  }
  contactando.value = true;
  try {
    const conversacion = await crearConversacion(producto.value.id);
    await enrutador.push({ name: 'conversacion', params: { id: conversacion.id } });
  } catch (error) {
    q.notify({ type: 'negative', message: obtenerMensajeError(error) });
  } finally {
    contactando.value = false;
  }
}
onMounted(() => void tienda.cargarProducto(Number(ruta.params.id)));
</script>

<style scoped lang="scss">
.detalle-producto {
  &__contenido {
    display: grid;
    gap: 24px;
    margin-top: 12px;
  }
  &__imagen {
    min-height: 290px;
    overflow: hidden;
    border-radius: var(--radio-grande);
    background: #eef1ef;
  }
  &__imagen :deep(.q-img) {
    height: 100%;
    min-height: 290px;
  }
  &__carrusel {
    height: clamp(310px, 65vw, 620px);
    background: #eef1ef;
  }
  &__informacion h1 {
    margin: 8px 0;
    font-size: clamp(1.6rem, 5vw, 2.3rem);
    font-weight: 600;
    line-height: 1.2;
  }
  &__informacion > p {
    color: var(--texto-secundario);
    line-height: 1.65;
  }
  &__categoria {
    color: var(--verde-principal);
    font-size: 0.82rem;
    font-weight: 600;
  }
  &__precio {
    color: var(--verde-principal);
    font-size: 1.6rem;
    font-weight: 700;
  }
  &__ubicacion {
    margin: 16px 0;
    color: var(--texto-secundario);
  }
}

.aviso-propietario {
  background: var(--verde-claro);
  color: var(--verde-principal);
  font-weight: 600;
  text-align: center;
}

.tarjeta-vendedor {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 24px 0;
  padding: 16px;
  border: 1px solid var(--borde);
  border-radius: var(--radio-medio);
  strong,
  span {
    display: block;
  }
  span {
    margin-top: 2px;
    color: var(--texto-secundario);
    font-size: 0.85rem;
  }
}

@media (min-width: 800px) {
  .detalle-producto__contenido {
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
    align-items: start;
  }
}
</style>
