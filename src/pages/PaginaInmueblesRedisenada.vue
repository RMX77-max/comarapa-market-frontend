<template>
  <q-page class="inmobiliaria">
    <section class="hero-inmobiliaria">
      <div class="hero-inmobiliaria__contenido">
        <span class="sobrelinea">INMOBILIARIA COMARAPA</span>
        <h1>Un espacio para encontrar tu próximo lugar</h1>
        <p>Explora propiedades revisadas por nuestro equipo o envía la tuya para publicarla.</p>
        <div class="hero-inmobiliaria__acciones">
          <q-btn
            color="primary"
            icon="search"
            label="Ver propiedades"
            unelevated
            @click="irCatalogo"
          /><q-btn
            outline
            color="primary"
            icon="add_home_work"
            label="Publicar inmueble"
            @click="dialogo = true"
          />
        </div>
      </div>
      <div class="hero-inmobiliaria__arte">
        <q-icon name="location_city" /><span>Venta · Alquiler · Anticrético</span>
      </div>
    </section>
    <section ref="catalogo" class="catalogo-inmuebles">
      <div class="titulo-catalogo">
        <div>
          <span class="sobrelinea">OPORTUNIDADES</span>
          <h2>Propiedades disponibles</h2>
        </div>
        <span>{{ filtrados.length }} resultados</span>
      </div>
      <div class="filtros">
        <q-btn
          v-for="opcion in filtros"
          :key="opcion.value"
          :outline="filtro !== opcion.value"
          :color="filtro === opcion.value ? 'primary' : 'grey-7'"
          rounded
          no-caps
          :label="opcion.label"
          @click="filtro = opcion.value"
        />
      </div>
      <div v-if="cargando" class="grid-inmuebles">
        <q-skeleton v-for="n in 3" :key="n" height="320px" type="rect" />
      </div>
      <div v-else-if="filtrados.length" class="grid-inmuebles">
        <article v-for="i in filtrados" :key="i.id" class="tarjeta-inmueble">
          <div class="tarjeta-inmueble__foto">
            <q-img :src="i.imagenes[0]" ratio="1.45" /><q-badge>{{
              etiquetaOperacion(i.tipo_operacion)
            }}</q-badge>
          </div>
          <div class="tarjeta-inmueble__contenido">
            <span class="tipo"
              ><q-icon name="home_work" /> {{ etiquetaTipo(i.tipo_inmueble) }}</span
            >
            <h3>{{ i.titulo }}</h3>
            <strong>Bs {{ formatearNumero(i.precio) }}</strong>
            <p><q-icon name="place" /> {{ i.ciudad }}{{ i.zona ? ' · ' + i.zona : '' }}</p>
            <q-btn
              flat
              color="primary"
              no-caps
              icon-right="arrow_forward"
              label="Consultar con Comarapa Market"
              :to="{ name: 'soporte' }"
            />
          </div>
        </article>
      </div>
      <div v-else class="sin-resultados">
        <q-icon name="holiday_village" /><strong>No hay inmuebles en esta categoría</strong
        ><span>Prueba otro filtro o publica una propiedad.</span>
      </div>
    </section>
    <section v-if="propios.length" class="mis-inmuebles">
      <h2>Mis inmuebles enviados</h2>
      <div class="estados">
        <article v-for="i in propios" :key="i.id">
          <q-avatar :color="colorEstado(i.estado)" text-color="white" icon="home_work" />
          <div>
            <strong>{{ i.titulo }}</strong
            ><span>{{ etiquetaEstado(i.estado) }}</span>
          </div>
        </article>
      </div>
    </section>
    <q-dialog v-model="dialogo" maximized-position="bottom"
      ><q-card class="dialogo-inmueble"
        ><q-card-section class="cabecera-dialogo"
          ><div>
            <span class="sobrelinea">NUEVA PUBLICACIÓN</span>
            <h2>Publicar un inmueble</h2>
          </div>
          <q-btn flat round icon="close" v-close-popup /></q-card-section
        ><q-card-section
          ><q-form class="formulario-inmueble" @submit="publicar"
            ><q-input
              v-model="titulo"
              outlined
              label="Título del inmueble"
              :rules="[requerido]" /><q-input
              v-model="ciudad"
              outlined
              label="Ciudad"
              :rules="[requerido]" /><q-input
              v-model="zona"
              outlined
              label="Zona o barrio (opcional)" /><q-select
              v-model="tipo"
              outlined
              emit-value
              map-options
              :options="tipos"
              label="Tipo de inmueble" /><q-select
              v-model="operacion"
              outlined
              emit-value
              map-options
              :options="operaciones"
              label="Operación" /><q-input
              v-model.number="precio"
              outlined
              type="number"
              min="1"
              prefix="Bs"
              label="Precio solicitado"
              :rules="[(v) => Number(v) > 0 || 'Ingresa un precio válido']" /><q-input
              v-model="descripcion"
              class="ancho"
              outlined
              type="textarea"
              autogrow
              label="Describe el inmueble"
              :rules="[requerido]" /><q-file
              v-model="imagenes"
              class="ancho"
              outlined
              multiple
              accept="image/*"
              label="Fotografías (máximo 8)"
              :rules="[(v) => v?.length > 0 || 'Agrega al menos una fotografía']"
              ><template #prepend><q-icon name="add_photo_alternate" /></template></q-file
            ><q-banner class="ancho aviso-revision"
              ><q-icon name="verified_user" /> Nuestro equipo revisará la información y definirá el
              precio público antes de mostrarla.</q-banner
            ><q-btn
              class="ancho"
              type="submit"
              color="primary"
              icon="send"
              label="Enviar para revisión"
              unelevated
              :loading="enviando" /></q-form></q-card-section></q-card
    ></q-dialog>
  </q-page>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';
import {
  crearInmueble,
  listarInmuebles,
  misInmuebles,
  type Inmueble,
} from 'src/services/servicioServiciosEspeciales';
import { obtenerMensajeError } from 'src/services/servicioApi';
const auth = useTiendaAutenticacion(),
  q = useQuasar(),
  catalogo = ref<HTMLElement | null>(null),
  dialogo = ref(false),
  cargando = ref(false),
  enviando = ref(false),
  inmuebles = ref<Inmueble[]>([]),
  propios = ref<Inmueble[]>([]),
  filtro = ref('todos'),
  titulo = ref(''),
  ciudad = ref('Comarapa'),
  zona = ref(''),
  tipo = ref('casa'),
  operacion = ref('venta'),
  precio = ref<number | null>(null),
  descripcion = ref(''),
  imagenes = ref<File[]>([]);
const filtros = [
    { label: 'Todos', value: 'todos' },
    { label: 'En venta', value: 'venta' },
    { label: 'En alquiler', value: 'alquiler' },
    { label: 'Anticrético', value: 'anticretico' },
  ],
  tipos = [
    { label: 'Casa', value: 'casa' },
    { label: 'Terreno', value: 'terreno' },
    { label: 'Departamento', value: 'departamento' },
    { label: 'Local comercial', value: 'local' },
    { label: 'Quinta', value: 'quinta' },
    { label: 'Otro', value: 'otro' },
  ],
  operaciones = filtros.slice(1),
  filtrados = computed(() =>
    filtro.value === 'todos'
      ? inmuebles.value
      : inmuebles.value.filter((i) => i.tipo_operacion === filtro.value),
  ),
  requerido = (v: string) => !!v?.trim() || 'Campo obligatorio';
function irCatalogo() {
  catalogo.value?.scrollIntoView({ behavior: 'smooth' });
}
function etiquetaOperacion(v: string) {
  return operaciones.find((x) => x.value === v)?.label ?? v;
}
function etiquetaTipo(v: string) {
  return tipos.find((x) => x.value === v)?.label ?? v;
}
function formatearNumero(v: number) {
  return new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 }).format(v);
}
function etiquetaEstado(v: string) {
  return (
    (
      {
        pendiente: 'Pendiente de revisión',
        aprobado: 'Publicado',
        rechazado: 'Rechazado',
        oculto: 'Oculto',
        cerrado: 'Cerrado',
      } as Record<string, string>
    )[v] ?? v
  );
}
function colorEstado(v: string) {
  return v === 'aprobado' ? 'positive' : v === 'rechazado' ? 'negative' : 'orange-8';
}
async function cargar() {
  cargando.value = true;
  try {
    inmuebles.value = await listarInmuebles();
    if (auth.estaAutenticado) propios.value = await misInmuebles();
  } catch (e) {
    q.notify({ type: 'negative', message: obtenerMensajeError(e) });
  } finally {
    cargando.value = false;
  }
}
async function publicar() {
  if (!precio.value) return;
  const f = new FormData();
  f.append('titulo', titulo.value);
  f.append('ciudad', ciudad.value);
  f.append('zona', zona.value);
  f.append('tipo_inmueble', tipo.value);
  f.append('tipo_operacion', operacion.value);
  f.append('precio_solicitado', String(precio.value));
  f.append('descripcion', descripcion.value);
  imagenes.value.slice(0, 8).forEach((x) => f.append('imagenes[]', x));
  enviando.value = true;
  try {
    await crearInmueble(f);
    dialogo.value = false;
    titulo.value = '';
    descripcion.value = '';
    imagenes.value = [];
    q.notify({ type: 'positive', message: 'Inmueble enviado para revisión.' });
    await cargar();
  } catch (e) {
    q.notify({ type: 'negative', message: obtenerMensajeError(e) });
  } finally {
    enviando.value = false;
  }
}
onMounted(() => void cargar());
</script>
<style scoped lang="scss">
.inmobiliaria {
  width: min(100%, 1200px);
  margin: auto;
  padding: 20px clamp(14px, 3vw, 32px) 110px;
}
.hero-inmobiliaria {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  min-height: 330px;
  overflow: hidden;
  border-radius: 28px;
  background: linear-gradient(130deg, #e5f1e6 0%, #f7f1dd 100%);
  box-shadow: var(--sombra-suave);
}
.hero-inmobiliaria__contenido {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: clamp(28px, 6vw, 64px);
}
.sobrelinea {
  color: var(--verde-principal);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.11em;
}
.hero-inmobiliaria h1 {
  max-width: 650px;
  margin: 8px 0;
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.06;
}
.hero-inmobiliaria p {
  max-width: 580px;
  color: var(--texto-secundario);
  font-size: 1.05rem;
}
.hero-inmobiliaria__acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
.hero-inmobiliaria__arte {
  display: grid;
  color: var(--verde-principal);
  background: radial-gradient(circle, #fff9 0%, transparent 65%);
  place-items: center;
  align-content: center;
}
.hero-inmobiliaria__arte .q-icon {
  font-size: clamp(100px, 18vw, 210px);
}
.hero-inmobiliaria__arte span {
  font-weight: 700;
}
.catalogo-inmuebles {
  padding-top: 34px;
}
.titulo-catalogo {
  display: flex;
  align-items: end;
  justify-content: space-between;
}
.titulo-catalogo h2,
.mis-inmuebles h2 {
  margin: 3px 0;
  font-size: clamp(1.6rem, 4vw, 2.2rem);
}
.titulo-catalogo > span {
  color: var(--texto-secundario);
}
.filtros {
  display: flex;
  gap: 8px;
  margin: 16px 0;
  overflow-x: auto;
}
.grid-inmuebles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}
.tarjeta-inmueble {
  overflow: hidden;
  border: 1px solid var(--borde);
  border-radius: 20px;
  background: var(--fondo);
  box-shadow: var(--sombra-suave);
  transition: transform 0.2s;
}
.tarjeta-inmueble:hover {
  transform: translateY(-4px);
}
.tarjeta-inmueble__foto {
  position: relative;
}
.tarjeta-inmueble__foto .q-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 7px 10px;
  background: var(--verde-principal);
  text-transform: capitalize;
}
.tarjeta-inmueble__contenido {
  padding: 16px;
}
.tarjeta-inmueble h3 {
  margin: 7px 0 3px;
  font-size: 1.12rem;
}
.tarjeta-inmueble strong {
  color: var(--verde-principal);
  font-size: 1.35rem;
}
.tarjeta-inmueble p,
.tipo {
  color: var(--texto-secundario);
  font-size: 0.8rem;
}
.sin-resultados {
  display: grid;
  gap: 6px;
  padding: 55px;
  border: 1px dashed var(--borde);
  border-radius: 20px;
  text-align: center;
  place-items: center;
}
.sin-resultados .q-icon {
  font-size: 55px;
  color: var(--verde-secundario);
}
.mis-inmuebles {
  margin-top: 34px;
}
.estados {
  display: flex;
  gap: 10px;
  overflow-x: auto;
}
.estados article {
  display: flex;
  flex: 0 0 250px;
  gap: 10px;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--borde);
  border-radius: 15px;
  background: var(--fondo);
}
.estados strong,
.estados span {
  display: block;
}
.estados span {
  color: var(--texto-secundario);
  font-size: 0.78rem;
}
.dialogo-inmueble {
  width: min(96vw, 780px);
  max-width: 780px;
  border-radius: 24px;
}
.cabecera-dialogo {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cabecera-dialogo h2 {
  margin: 3px 0;
}
@media (max-width: 600px) {
  .cabecera-dialogo h2 { font-size: 1.75rem; line-height: 1.08; }
}
.formulario-inmueble {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.ancho {
  grid-column: 1/-1;
}
.aviso-revision {
  border-radius: 12px;
  background: var(--azul-suave);
  color: var(--texto-principal);
}
@media (max-width: 760px) {
  .hero-inmobiliaria {
    grid-template-columns: 1fr;
  }
  .hero-inmobiliaria__arte {
    display: none;
  }
  .grid-inmuebles {
    grid-template-columns: 1fr 1fr;
  }
  .formulario-inmueble {
    grid-template-columns: 1fr;
  }
  .ancho {
    grid-column: auto;
  }
}
@media (max-width: 480px) {
  .grid-inmuebles {
    grid-template-columns: 1fr;
  }
  .hero-inmobiliaria__acciones .q-btn {
    width: 100%;
  }
  .titulo-catalogo > span {
    display: none;
  }
}
</style>
