<template>
  <q-page class="contenedor-pagina detalle-producto">
    <q-btn
      class="boton-volver"
      rounded
      no-caps
      unelevated
      icon="arrow_back_ios_new"
      label="Volver"
      @click="enrutador.back()"
    />
    <estado-contenido v-if="tienda.cargando" tipo="cargando" />
    <estado-contenido
      v-else-if="!producto"
      tipo="error"
      titulo="Producto no disponible"
      mensaje="La publicación no existe o fue eliminada."
      etiqueta-accion="Volver al inicio"
      @accion="enrutador.push({ name: 'inicio' })"
    />
    <template v-else>
      <article class="detalle-producto__contenido">
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

          <q-form v-if="!esPropietario" class="consulta-rapida" @submit="contactar">
            <q-input
              v-model="mensajeConsulta"
              outlined
              dense
              aria-label="Mensaje para consultar por el producto"
            />
            <q-btn
              color="primary"
              icon="send"
              label="Enviar"
              unelevated
              no-caps
              type="submit"
              :loading="contactando"
              :disable="!mensajeConsulta.trim()"
            />
          </q-form>
          <div v-if="!esPropietario" class="acciones-producto">
            <q-btn outline color="primary" icon="share" label="Compartir" no-caps>
              <q-menu auto-close
                ><q-list class="menu-compartir" separator>
                  <q-item v-if="puedeCompartir" clickable @click="compartirNativo"
                    ><q-item-section avatar><q-icon name="ios_share" /></q-item-section
                    ><q-item-section>Compartir con...</q-item-section></q-item
                  >
                  <q-item clickable @click="compartirWhatsApp"
                    ><q-item-section avatar><q-icon name="chat" /></q-item-section
                    ><q-item-section>WhatsApp</q-item-section></q-item
                  >
                  <q-item clickable @click="compartirFacebook"
                    ><q-item-section avatar><q-icon name="facebook" /></q-item-section
                    ><q-item-section>Facebook</q-item-section></q-item
                  >
                  <q-item clickable @click="copiarEnlace"
                    ><q-item-section avatar><q-icon name="link" /></q-item-section
                    ><q-item-section>Copiar enlace</q-item-section></q-item
                  >
                </q-list></q-menu
              >
            </q-btn>
            <q-btn
              outline
              color="primary"
              :icon="guardado ? 'bookmark' : 'bookmark_border'"
              :label="guardado ? 'Guardado' : 'Guardar'"
              no-caps
              @click="cambiarGuardado"
            />
            <q-btn flat color="negative" icon="flag" label="Reportar" no-caps @click="reportar" />
          </div>
          <q-banner v-else class="aviso-propietario rounded-borders"
            ><q-icon name="storefront" size="24px" /> Esta es tu publicación.</q-banner
          >

          <router-link
            class="perfil-vendedor"
            :to="{ name: 'perfil-vendedor', params: { id: producto.vendedor.id } }"
          >
            <q-avatar size="56px"
              ><img
                v-if="producto.vendedor.url_foto_perfil"
                :src="producto.vendedor.url_foto_perfil"
                alt=""
              /><span v-else>{{ producto.vendedor.nombre.charAt(0).toUpperCase() }}</span></q-avatar
            >
            <div>
              <small>Publicado por</small><strong>{{ producto.vendedor.nombre }}</strong
              ><span>Ver perfil y otras publicaciones</span>
            </div>
            <q-icon name="chevron_right" />
          </router-link>
        </div>
      </article>

      <section v-if="relacionados.length" class="productos-relacionados">
        <h2>También te puede interesar</h2>
        <div class="productos-relacionados__rejilla">
          <tarjeta-producto
            v-for="relacionado in relacionados"
            :key="relacionado.id"
            :producto="relacionado"
            @abrir="abrirRelacionado"
          />
        </div>
      </section>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import EstadoContenido from 'components/EstadoContenido.vue';
import ImagenProductoVacia from 'components/ImagenProductoVacia.vue';
import TarjetaProducto from 'components/TarjetaProducto.vue';
import type { Producto } from 'src/models/Producto';
import { formatearPrecio } from 'src/utils/formatearPrecio';
import { useTiendaProductos } from 'src/stores/tiendaProductos';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';
import { crearConversacion, enviarMensaje } from 'src/services/servicioMensajes';
import { obtenerMensajeError } from 'src/services/servicioApi';
import { crearReporte } from 'src/services/servicioOperaciones';
import { listarProductos } from 'src/services/servicioProductos';
import { alternarGuardado, estaGuardado } from 'src/services/servicioGuardados';

const ruta = useRoute(),
  enrutador = useRouter(),
  tienda = useTiendaProductos(),
  autenticacion = useTiendaAutenticacion(),
  q = useQuasar();
const producto = computed(() => tienda.productoActual);
const imagenesProducto = computed(() => [
  ...new Set(
    producto.value?.imagenes?.length
      ? producto.value.imagenes
      : producto.value?.url_imagen
        ? [producto.value.url_imagen]
        : [],
  ),
]);
const esPropietario = computed(() =>
  Boolean(autenticacion.usuario && producto.value?.vendedor.id === autenticacion.usuario.id),
);
const indiceImagen = ref(0),
  contactando = ref(false),
  mensajeConsulta = ref('Hola, me interesa. ¿Sigue disponible?'),
  guardado = ref(false),
  relacionados = ref<Producto[]>([]);
const puedeCompartir = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

async function contactar(): Promise<void> {
  if (!producto.value || !mensajeConsulta.value.trim()) return;
  contactando.value = true;
  try {
    const conversacion = await crearConversacion(producto.value.id);
    await enviarMensaje(conversacion.id, mensajeConsulta.value.trim());
    await enrutador.push({ name: 'conversacion', params: { id: conversacion.id } });
  } catch (error) {
    q.notify({ type: 'negative', message: obtenerMensajeError(error) });
  } finally {
    contactando.value = false;
  }
}
async function reportar(): Promise<void> {
  if (!producto.value) return;
  const descripcion = window.prompt('Describe el problema con esta publicación:')?.trim();
  if (!descripcion) return;
  try {
    await crearReporte({
      producto_id: producto.value.id,
      usuario_reportado_id: producto.value.vendedor.id,
      categoria: 'publicacion_inadecuada',
      descripcion,
    });
    q.notify({ type: 'positive', message: 'Reporte enviado.' });
  } catch (error) {
    q.notify({ type: 'negative', message: obtenerMensajeError(error) });
  }
}
function datosCompartir() {
  return {
    title: producto.value?.titulo ?? 'Comarapa Market',
    text: producto.value ? `${producto.value.titulo} en Comarapa Market` : 'Comarapa Market',
    url: window.location.href,
  };
}
async function compartirNativo(): Promise<void> {
  try {
    await navigator.share(datosCompartir());
  } catch {
    /* El usuario puede cerrar el menú. */
  }
}
function compartirWhatsApp(): void {
  const datos = datosCompartir();
  window.open(
    `https://wa.me/?text=${encodeURIComponent(`${datos.text} ${datos.url}`)}`,
    '_blank',
    'noopener,noreferrer',
  );
}
function compartirFacebook(): void {
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
    '_blank',
    'noopener,noreferrer',
  );
}
async function copiarEnlace(): Promise<void> {
  await navigator.clipboard.writeText(window.location.href);
  q.notify({ type: 'positive', message: 'Enlace copiado.' });
}
function cambiarGuardado(): void {
  if (!producto.value || !autenticacion.usuario) return;
  guardado.value = alternarGuardado(autenticacion.usuario.id, producto.value.id);
  q.notify({
    message: guardado.value ? 'Publicación guardada.' : 'Publicación eliminada de Guardados.',
  });
}
function abrirRelacionado(relacionado: Producto): void {
  void enrutador.push({ name: 'detalle-producto', params: { id: relacionado.id } });
}
async function cargarDetalle(): Promise<void> {
  indiceImagen.value = 0;
  await tienda.cargarProducto(Number(ruta.params.id));
  if (!producto.value) return;
  guardado.value = autenticacion.usuario
    ? estaGuardado(autenticacion.usuario.id, producto.value.id)
    : false;
  try {
    const datos = await listarProductos({ categoria: producto.value.categoria.id });
    relacionados.value = datos.productos
      .filter((item) => item.id !== producto.value?.id)
      .slice(0, 2);
  } catch {
    relacionados.value = [];
  }
}
onMounted(cargarDetalle);
watch(() => ruta.params.id, cargarDetalle);
</script>

<style scoped lang="scss">
.detalle-producto {
  &__contenido {
    display: grid;
    gap: 24px;
    margin-top: 14px;
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
  &__categoria,
  &__precio {
    color: var(--coral);
    font-weight: 700;
  }
  &__categoria {
    font-size: 0.82rem;
  }
  &__precio {
    font-size: 1.6rem;
  }
  &__ubicacion {
    margin: 16px 0;
    color: var(--texto-secundario);
  }
}
.boton-volver {
  height: 42px;
  padding: 0 16px;
  background: var(--fondo);
  color: var(--azul-marino);
  box-shadow: 0 6px 18px rgb(19 43 91 / 12%);
}
.consulta-rapida {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  margin-top: 22px;
}
.acciones-producto {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.acciones-producto > .q-btn {
  flex: 1 1 auto;
}
.menu-compartir {
  min-width: 210px;
}
.perfil-vendedor {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  margin-top: 22px;
  padding: 16px;
  border: 1px solid var(--borde);
  border-radius: var(--radio-medio);
  background: var(--fondo);
  color: var(--texto-principal);
  text-decoration: none;
}
.perfil-vendedor .q-avatar {
  background: var(--azul-suave);
  color: var(--azul-marino);
  font-family: var(--fuente-titulos);
  font-size: 1.3rem;
}
.perfil-vendedor small,
.perfil-vendedor strong,
.perfil-vendedor span {
  display: block;
}
.perfil-vendedor small,
.perfil-vendedor span {
  color: var(--texto-secundario);
  font-size: 0.78rem;
}
.aviso-propietario {
  background: var(--azul-suave);
  color: var(--azul-marino);
  font-weight: 600;
  text-align: center;
}
.productos-relacionados {
  margin-top: 34px;
}
.productos-relacionados > h2 {
  margin: 0 0 14px;
  color: var(--azul-marino);
  font-size: clamp(1rem, 4vw, 1.35rem);
  white-space: nowrap;
}
.productos-relacionados__rejilla {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
@media (min-width: 800px) {
  .detalle-producto__contenido {
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
    align-items: start;
  }
  .productos-relacionados__rejilla {
    max-width: 760px;
  }
}
@media (max-width: 430px) {
  .consulta-rapida {
    grid-template-columns: 1fr;
  }
  .consulta-rapida .q-btn {
    width: 100%;
  }
}
</style>
