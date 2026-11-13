<template>
  <q-page class="pagina-especial"
    ><header>
      <q-icon name="request_quote" />
      <div>
        <span>SOLICITUD PRIVADA</span>
        <h1>Solicitar un préstamo</h1>
        <p>La información será revisada únicamente por administración.</p>
      </div>
    </header>
    <div class="rejilla">
      <q-card flat bordered
        ><q-card-section
          ><q-form class="column q-gutter-md" @submit="enviar"
            ><q-input
              v-model="nombre"
              outlined
              label="Nombre completo"
              :rules="[requerido]" /><q-input
              v-model="ciudad"
              outlined
              label="Ciudad"
              :rules="[requerido]" /><q-input
              v-model.number="monto"
              outlined
              type="number"
              min="1"
              prefix="Bs"
              label="Cantidad que necesita"
              :rules="[(v) => Number(v) > 0 || 'Ingresa un monto válido']" /><q-input
              v-model="garantia"
              outlined
              type="textarea"
              autogrow
              label="Objeto que dejará como garantía"
              :rules="[requerido]" /><q-btn
              type="submit"
              color="primary"
              icon="lock"
              label="Enviar solicitud privada"
              :loading="enviando"
              unelevated /></q-form></q-card-section
      ></q-card>
      <section>
        <h2>Mis solicitudes</h2>
        <q-list bordered separator
          ><q-item v-for="s in solicitudes" :key="s.id"
            ><q-item-section
              ><q-item-label class="text-weight-bold">Bs {{ s.monto_solicitado }}</q-item-label
              ><q-item-label caption>{{ s.ciudad }} · {{ s.estado }}</q-item-label
              ><q-item-label>{{ s.objeto_garantia }}</q-item-label
              ><q-item-label v-if="s.respuesta" class="respuesta">{{
                s.respuesta
              }}</q-item-label></q-item-section
            ></q-item
          ></q-list
        >
      </section>
    </div></q-page
  >
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import {
  crearSolicitudPrestamo,
  misSolicitudesPrestamos,
  type SolicitudPrestamo,
} from 'src/services/servicioServiciosEspeciales';
import { obtenerMensajeError } from 'src/services/servicioApi';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';
const auth = useTiendaAutenticacion(),
  q = useQuasar(),
  nombre = ref(auth.usuario?.nombre ?? ''),
  ciudad = ref(auth.usuario?.ubicacion ?? 'Comarapa'),
  monto = ref<number | null>(null),
  garantia = ref(''),
  enviando = ref(false),
  solicitudes = ref<SolicitudPrestamo[]>([]),
  requerido = (v: string) => !!v?.trim() || 'Campo obligatorio';
async function cargar() {
  solicitudes.value = await misSolicitudesPrestamos();
}
async function enviar() {
  if (!monto.value) return;
  enviando.value = true;
  try {
    const datos = new FormData();
    datos.append('nombre', nombre.value);
    datos.append('ciudad', ciudad.value);
    datos.append('monto_solicitado', String(monto.value));
    datos.append('objeto_garantia', garantia.value);
    await crearSolicitudPrestamo(datos);
    monto.value = null;
    garantia.value = '';
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
@import 'src/css/paginas-especiales.scss';
</style>
