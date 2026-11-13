<template>
  <q-page class="pagina-especial pagina-necesidad"
    ><header>
      <q-icon name="manage_search" />
      <div>
        <span>PUBLICA UNA NECESIDAD</span>
        <h1>¿Qué producto estás buscando?</h1>
        <p>Cuéntanos qué necesitas. Después de revisarlo aparecerá como “Se busca”.</p>
      </div>
    </header>
    <div class="rejilla">
      <q-card flat bordered
        ><q-card-section
          ><q-form class="column q-gutter-md" @submit="enviar"
            ><q-input
              v-model="nombre"
              outlined
              label="Producto que necesitas"
              :rules="[requerido]" /><q-input
              v-model="ciudad"
              outlined
              label="Ciudad"
              :rules="[requerido]" /><q-input
              v-model.number="presupuesto"
              outlined
              type="number"
              min="1"
              prefix="Bs"
              label="Presupuesto aproximado (opcional)" /><q-input
              v-model="descripcion"
              outlined
              type="textarea"
              autogrow
              label="Características o detalles"
              :rules="[requerido]" /><q-btn
              type="submit"
              color="primary"
              icon="send"
              label="Enviar solicitud"
              :loading="enviando"
              unelevated /></q-form></q-card-section
      ></q-card>
      <section>
        <h2>Mis solicitudes</h2>
        <q-list bordered separator
          ><q-item v-for="s in solicitudes" :key="s.id"
            ><q-item-section
              ><q-item-label class="text-weight-bold">{{ s.nombre }}</q-item-label
              ><q-item-label caption>{{ s.ciudad }} · {{ s.estado }}</q-item-label
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
  crearSolicitudProducto,
  misSolicitudesProductos,
  type SolicitudProductoEspecial,
} from 'src/services/servicioServiciosEspeciales';
import { obtenerMensajeError } from 'src/services/servicioApi';
const q = useQuasar(),
  nombre = ref(''),
  ciudad = ref('Comarapa'),
  presupuesto = ref<number | null>(null),
  descripcion = ref(''),
  enviando = ref(false),
  solicitudes = ref<SolicitudProductoEspecial[]>([]),
  requerido = (v: string) => !!v?.trim() || 'Campo obligatorio';
async function cargar() {
  solicitudes.value = await misSolicitudesProductos();
}
async function enviar() {
  enviando.value = true;
  try {
    await crearSolicitudProducto({
      nombre: nombre.value,
      ciudad: ciudad.value,
      presupuesto: presupuesto.value,
      descripcion: descripcion.value,
    });
    nombre.value = '';
    descripcion.value = '';
    q.notify({ type: 'positive', message: 'Solicitud enviada.' });
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

.pagina-necesidad :deep(.q-field__native),
.pagina-necesidad :deep(.q-field__label),
.pagina-necesidad :deep(.q-btn__content) {
  font-size: 0.95rem;
}

@media (max-width: 600px) {
  .pagina-necesidad {
    padding: 14px 14px 96px;
  }

  .pagina-necesidad > header {
    padding: 18px;
    border-radius: 18px;
  }

  .pagina-necesidad > header h1 {
    margin-top: 3px;
    font-size: 1.55rem;
    line-height: 1.16;
  }

  .pagina-necesidad > header p {
    margin-top: 5px;
    font-size: 0.88rem;
    line-height: 1.4;
  }

  .pagina-necesidad .rejilla {
    gap: 18px;
    margin-top: 16px;
  }

  .pagina-necesidad :deep(.q-card__section) {
    padding: 16px;
  }

  .pagina-necesidad h2 {
    margin: 0 0 10px;
    font-size: 1.3rem;
  }

  .pagina-necesidad :deep(.q-field__control) {
    min-height: 48px;
  }

  .pagina-necesidad :deep(.q-field__native),
  .pagina-necesidad :deep(.q-field__label),
  .pagina-necesidad :deep(.q-btn__content) {
    font-size: 0.875rem;
  }
}
</style>
