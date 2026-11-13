<template>
  <q-page class="prestamos"
    ><section class="hero-prestamo">
      <div>
        <span class="sobrelinea">SOLICITUD PRIVADA</span>
        <h1>Un respaldo cuando lo necesitas</h1>
        <p>
          Solicita una evaluación dejando un objeto como garantía. Solo el equipo administrativo
          podrá revisar tus datos.
        </p>
        <div class="confianza">
          <span><q-icon name="lock" /> Información privada</span
          ><span><q-icon name="verified_user" /> Revisión administrativa</span>
        </div>
      </div>
      <button type="button" @click="irFormulario">
        <q-icon name="request_quote" /><strong>Solicitar ahora</strong><span>Completa 4 datos</span
        ><q-icon name="arrow_forward" />
      </button>
    </section>
    <section ref="formulario" class="contenido-prestamo">
      <div class="pasos">
        <span class="sobrelinea">¿CÓMO FUNCIONA?</span>
        <h2>Una solicitud sencilla</h2>
        <ol>
          <li>
            <b>1</b>
            <div>
              <strong>Completa tus datos</strong><span>Nombre, ciudad, monto y garantía.</span>
            </div>
          </li>
          <li>
            <b>2</b>
            <div>
              <strong>Revisamos tu solicitud</strong
              ><span>Un administrador evalúa la información.</span>
            </div>
          </li>
          <li>
            <b>3</b>
            <div>
              <strong>Recibe una respuesta</strong
              ><span>Te notificaremos dentro de la aplicación.</span>
            </div>
          </li>
        </ol>
      </div>
      <q-card flat bordered class="tarjeta-solicitud"
        ><q-card-section
          ><div class="titulo-form">
            <q-avatar color="green-1" text-color="primary" icon="description" />
            <div>
              <h2>Nueva solicitud</h2>
              <p>Todos los campos son obligatorios.</p>
            </div>
          </div>
          <q-form class="column q-gutter-md" @submit="enviar"
            ><q-input v-model="nombre" outlined label="Nombre completo" :rules="[requerido]"
              ><template #prepend><q-icon name="person_outline" /></template></q-input
            ><q-input v-model="ciudad" outlined label="Ciudad" :rules="[requerido]"
              ><template #prepend><q-icon name="location_on" /></template></q-input
            ><q-input
              v-model.number="monto"
              outlined
              type="number"
              min="1"
              prefix="Bs"
              label="Cantidad que necesita"
              :rules="[(v) => Number(v) > 0 || 'Ingresa un monto válido']"
              ><template #prepend><q-icon name="payments" /></template></q-input
            ><q-input
              v-model="garantia"
              outlined
              type="textarea"
              autogrow
              label="Objeto que dejará como garantía"
              hint="Describe claramente el objeto"
              :rules="[requerido]" />
            <q-file
              v-model="imagenes"
              outlined
              multiple
              accept="image/jpeg,image/png,image/webp"
              label="Fotografías de la garantía (1 a 6)"
              hint="Cada fotografía puede pesar hasta 5 MB"
              :rules="[validarImagenes]"
              @update:model-value="actualizarVistasPrevias"
            >
              <template #prepend><q-icon name="add_photo_alternate" /></template>
            </q-file>
            <div v-if="vistasPrevias.length" class="vistas-garantia">
              <q-img
                v-for="(vista, indice) in vistasPrevias"
                :key="vista"
                :src="vista"
                :alt="`Fotografía ${indice + 1} de la garantía`"
                ratio="1"
                fit="cover"
              />
            </div>
            <q-btn
              type="submit"
              color="primary"
              icon="lock"
              label="Enviar solicitud privada"
              :loading="enviando"
              unelevated /></q-form></q-card-section
      ></q-card>
    </section>
    <section class="historial">
      <div>
        <span class="sobrelinea">SEGUIMIENTO</span>
        <h2>Mis solicitudes</h2>
      </div>
      <div v-if="solicitudes.length" class="lista-prestamos">
        <article v-for="s in solicitudes" :key="s.id">
          <q-avatar
            :color="colorEstado(s.estado)"
            text-color="white"
            :icon="iconoEstado(s.estado)"
          />
          <div class="datos">
            <strong>Bs {{ formatearNumero(s.monto_solicitado) }}</strong
            ><span>{{ s.objeto_garantia }}</span
            ><small>{{ s.ciudad }}</small>
            <div v-if="s.imagenes_garantia?.length" class="imagenes-historial">
              <imagen-privada
                v-for="imagen in s.imagenes_garantia"
                :key="imagen"
                :src="imagen"
                alt="Fotografía privada de la garantía"
              />
            </div>
            <p v-if="s.respuesta">{{ s.respuesta }}</p>
          </div>
          <q-badge :color="colorEstado(s.estado)">{{ etiquetaEstado(s.estado) }}</q-badge>
        </article>
      </div>
      <div v-else class="sin-solicitudes">
        <q-icon name="inbox" /><span>Aún no enviaste ninguna solicitud.</span>
      </div>
    </section></q-page
  >
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import ImagenPrivada from 'src/components/ImagenPrivada.vue';
import {
  crearSolicitudPrestamo,
  misSolicitudesPrestamos,
  type SolicitudPrestamo,
} from 'src/services/servicioServiciosEspeciales';
import { obtenerMensajeError } from 'src/services/servicioApi';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';
const auth = useTiendaAutenticacion(),
  q = useQuasar(),
  formulario = ref<HTMLElement | null>(null),
  nombre = ref(auth.usuario?.nombre ?? ''),
  ciudad = ref(auth.usuario?.ubicacion ?? 'Comarapa'),
  monto = ref<number | null>(null),
  garantia = ref(''),
  imagenes = ref<File[]>([]),
  vistasPrevias = ref<string[]>([]),
  enviando = ref(false),
  solicitudes = ref<SolicitudPrestamo[]>([]),
  requerido = (v: string) => !!v?.trim() || 'Campo obligatorio';
const validarImagenes = (archivos: File[] | null) => {
  if (!archivos?.length) return 'Agrega al menos una fotografía de la garantía';
  if (archivos.length > 6) return 'Puedes agregar como máximo 6 fotografías';
  if (archivos.some((archivo) => archivo.size > 5 * 1024 * 1024))
    return 'Cada fotografía puede pesar como máximo 5 MB';
  return true;
};
function actualizarVistasPrevias(archivos: File[] | null) {
  vistasPrevias.value.forEach((url) => URL.revokeObjectURL(url));
  vistasPrevias.value = (archivos ?? []).slice(0, 6).map((archivo) => URL.createObjectURL(archivo));
}
function irFormulario() {
  formulario.value?.scrollIntoView({ behavior: 'smooth' });
}
function formatearNumero(v: number) {
  return new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 }).format(v);
}
function etiquetaEstado(v: string) {
  return (
    (
      {
        pendiente: 'Pendiente',
        en_revision: 'En revisión',
        requiere_informacion: 'Requiere información',
        aprobada: 'Aprobada',
        rechazada: 'Rechazada',
        cerrada: 'Cerrada',
      } as Record<string, string>
    )[v] ?? v
  );
}
function colorEstado(v: string) {
  return v === 'aprobada'
    ? 'positive'
    : v === 'rechazada'
      ? 'negative'
      : v === 'en_revision'
        ? 'blue-7'
        : 'orange-8';
}
function iconoEstado(v: string) {
  return v === 'aprobada' ? 'check' : v === 'rechazada' ? 'close' : 'schedule';
}
async function cargar() {
  try {
    solicitudes.value = await misSolicitudesPrestamos();
  } catch (e) {
    q.notify({ type: 'negative', message: obtenerMensajeError(e) });
  }
}
async function enviar() {
  if (!monto.value || validarImagenes(imagenes.value) !== true) return;
  enviando.value = true;
  try {
    const datos = new FormData();
    datos.append('nombre', nombre.value);
    datos.append('ciudad', ciudad.value);
    datos.append('monto_solicitado', String(monto.value));
    datos.append('objeto_garantia', garantia.value);
    imagenes.value.slice(0, 6).forEach((imagen) => datos.append('imagenes[]', imagen));
    await crearSolicitudPrestamo(datos);
    monto.value = null;
    garantia.value = '';
    imagenes.value = [];
    actualizarVistasPrevias([]);
    q.notify({ type: 'positive', message: 'Solicitud enviada de forma privada.' });
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
.prestamos {
  width: min(100%, 1100px);
  margin: auto;
  padding: 20px clamp(14px, 3vw, 32px) 110px;
}
.hero-prestamo {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 28px;
  align-items: center;
  padding: clamp(28px, 6vw, 60px);
  border-radius: 28px;
  background: linear-gradient(135deg, #123f2a, #087440);
  color: #fff;
  box-shadow: 0 18px 40px rgb(8 60 35 / 20%);
}
.sobrelinea {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.11em;
}
.hero-prestamo .sobrelinea {
  color: #b9ddb9;
}
.hero-prestamo h1 {
  max-width: 620px;
  margin: 8px 0;
  font-size: clamp(2rem, 5vw, 3.4rem);
  line-height: 1.05;
}
.hero-prestamo p {
  max-width: 650px;
  color: #e2f1e7;
  font-size: 1.02rem;
}
.confianza {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 20px;
  font-size: 0.82rem;
}
.hero-prestamo button {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 4px 10px;
  align-items: center;
  padding: 24px;
  border: 0;
  border-radius: 22px;
  background: var(--fondo);
  color: var(--texto-principal);
  text-align: left;
  cursor: pointer;
}
.hero-prestamo button > .q-icon:first-child {
  grid-row: 1/3;
  font-size: 38px;
  color: var(--verde-principal);
}
.hero-prestamo button > span {
  color: var(--texto-secundario);
}
.contenido-prestamo {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 34px;
  align-items: start;
  padding-top: 42px;
}
.pasos h2,
.historial h2 {
  margin: 4px 0 18px;
  font-size: clamp(1.6rem, 4vw, 2.2rem);
}
.pasos ol {
  display: grid;
  gap: 18px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.pasos li {
  display: flex;
  gap: 12px;
}
.pasos li > b {
  display: grid;
  flex: 0 0 38px;
  height: 38px;
  border-radius: 50%;
  background: #e1f0e5;
  color: var(--verde-principal);
  place-items: center;
}
.pasos strong,
.pasos span {
  display: block;
}
.pasos span {
  margin-top: 3px;
  color: var(--texto-secundario);
  font-size: 0.85rem;
}
.tarjeta-solicitud {
  border-radius: 22px;
  background: var(--fondo);
  box-shadow: var(--sombra-suave);
}
.tarjeta-solicitud .q-card__section {
  padding: clamp(20px, 4vw, 34px);
}
.vistas-garantia,
.imagenes-historial {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: 8px;
}
.vistas-garantia .q-img,
.imagenes-historial .q-img,
.imagenes-historial .imagen-privada {
  overflow: hidden;
  border-radius: 12px;
  aspect-ratio: 1;
}
.imagenes-historial {
  max-width: 440px;
  margin-top: 8px;
}
.titulo-form {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 22px;
}
.titulo-form h2,
.titulo-form p {
  margin: 0;
}
.titulo-form h2 {
  font-size: clamp(1.15rem, 3vw, 1.45rem);
  line-height: 1.2;
}
.titulo-form p {
  color: var(--texto-secundario);
  font-size: 0.82rem;
}
.historial {
  margin-top: 42px;
}
.lista-prestamos {
  display: grid;
  gap: 10px;
}
.lista-prestamos article {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid var(--borde);
  border-radius: 16px;
  background: var(--fondo);
}
.lista-prestamos .datos {
  display: grid;
  flex: 1;
  gap: 3px;
}
.lista-prestamos .datos > strong {
  color: var(--verde-principal);
  font-size: 1.2rem;
}
.lista-prestamos .datos > span,
.lista-prestamos small {
  color: var(--texto-secundario);
}
.lista-prestamos p {
  margin: 7px 0 0;
  padding: 9px;
  border-radius: 9px;
  background: #edf7ef;
}
.sin-solicitudes {
  display: grid;
  gap: 8px;
  padding: 42px;
  border: 1px dashed var(--borde);
  border-radius: 18px;
  text-align: center;
  place-items: center;
}
.sin-solicitudes .q-icon {
  font-size: 48px;
  color: var(--verde-secundario);
}
@media (max-width: 760px) {
  .hero-prestamo {
    grid-template-columns: 1fr;
  }
  .contenido-prestamo {
    grid-template-columns: 1fr;
  }
  .hero-prestamo button {
    width: 100%;
  }
}
@media (max-width: 430px) {
  .confianza {
    display: grid;
  }
  .hero-prestamo {
    padding: 26px 20px;
  }
  .lista-prestamos article {
    flex-wrap: wrap;
  }
  .lista-prestamos .q-badge {
    margin-left: 58px;
  }
}
</style>
