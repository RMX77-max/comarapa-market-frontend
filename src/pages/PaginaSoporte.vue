<template>
  <q-page class="pagina-soporte">
    <section class="cabecera-soporte">
      <div>
        <span class="etiqueta">CENTRO DE AYUDA</span>
        <h1>¿Cómo podemos ayudarte?</h1>
        <p>Cuéntanos el problema y te responderemos desde la aplicación.</p>
      </div>
      <q-icon name="support_agent" />
    </section>
    <div class="rejilla-soporte">
      <q-card flat bordered class="tarjeta-formulario"
        ><q-card-section><h2>Nueva solicitud</h2></q-card-section
        ><q-card-section>
          <q-form class="column q-gutter-md" @submit="enviar">
            <q-select
              v-model="tipo"
              :options="tipos"
              outlined
              emit-value
              map-options
              label="Tipo de consulta"
            />
            <q-select
              v-model="productoId"
              :options="opcionesProductos"
              outlined
              emit-value
              map-options
              clearable
              label="Publicación relacionada (opcional)"
              hint="Solo aparecen tus publicaciones activas"
              ><template #prepend><q-icon name="inventory_2" /></template
              ><template #no-option
                ><q-item
                  ><q-item-section class="text-grey-7"
                    >No tienes publicaciones activas</q-item-section
                  ></q-item
                ></template
              ></q-select
            >
            <q-input
              v-model="asunto"
              outlined
              label="Asunto"
              maxlength="150"
              counter
              :rules="[(v) => Boolean(v?.trim()) || 'Escribe un asunto']"
            />
            <q-input
              v-model="mensaje"
              outlined
              type="textarea"
              autogrow
              label="Describe lo ocurrido"
              maxlength="3000"
              counter
              :rules="[(v) => Boolean(v?.trim()) || 'Describe el problema']"
            />
            <q-banner v-if="error" class="bg-red-1 text-negative rounded-borders">{{
              error
            }}</q-banner>
            <q-btn
              type="submit"
              color="primary"
              icon="send"
              label="Enviar solicitud"
              unelevated
              :loading="enviando"
            />
          </q-form> </q-card-section
      ></q-card>
      <section class="historial-soporte">
        <div class="titulo-historial">
          <h2>Mis solicitudes</h2>
          <q-btn
            flat
            round
            icon="refresh"
            aria-label="Actualizar"
            :loading="cargando"
            @click="cargar"
          />
        </div>
        <q-skeleton v-if="cargando" type="rect" height="150px" />
        <q-banner v-else-if="errorCarga" class="bg-red-1 text-negative rounded-borders"
          >{{ errorCarga
          }}<template #action><q-btn flat label="Reintentar" @click="cargar" /></template
        ></q-banner>
        <div v-else-if="!solicitudes.length" class="vacio">
          <q-icon name="mark_email_unread" />
          <p>Aún no enviaste solicitudes.</p>
        </div>
        <q-list v-else class="lista-solicitudes" separator
          ><q-item v-for="solicitud in solicitudes" :key="solicitud.id"
            ><q-item-section avatar
              ><q-avatar
                :color="colorEstado(solicitud.estado)"
                text-color="white"
                :icon="iconoEstado(solicitud.estado)" /></q-item-section
            ><q-item-section
              ><q-item-label class="text-weight-bold">{{ solicitud.asunto }}</q-item-label
              ><q-item-label v-if="solicitud.producto" caption
                ><q-icon name="inventory_2" /> {{ solicitud.producto.titulo }}</q-item-label
              ><q-item-label caption>{{ solicitud.mensaje }}</q-item-label>
              <div v-if="solicitud.respuesta" class="respuesta">
                <strong>Respuesta de soporte</strong><span>{{ solicitud.respuesta }}</span>
              </div></q-item-section
            ><q-item-section side top
              ><q-badge
                :color="colorEstado(solicitud.estado)"
                :label="etiquetaEstado(solicitud.estado)" /></q-item-section></q-item
        ></q-list>
      </section>
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import type { Producto } from 'src/models/Producto';
import { obtenerMensajeError } from 'src/services/servicioApi';
import {
  crearSoporte,
  listarPublicacionesActivasSoporte,
  listarSoportePropio,
  type SolicitudSoporte,
} from 'src/services/servicioOperaciones';
const q = useQuasar(),
  tipo = ref('publicacion'),
  asunto = ref(''),
  mensaje = ref(''),
  productoId = ref<number | null>(null),
  productos = ref<Producto[]>([]),
  solicitudes = ref<SolicitudSoporte[]>([]),
  cargando = ref(false),
  enviando = ref(false),
  error = ref(''),
  errorCarga = ref('');
const tipos = [
  { label: 'Problema con una publicación', value: 'publicacion' },
  { label: 'Problema con mi cuenta', value: 'cuenta' },
  { label: 'Pagos o compras', value: 'pago' },
  { label: 'Otra consulta', value: 'otro' },
];
const opcionesProductos = computed(() =>
  productos.value.map((p) => ({ label: p.titulo, value: p.id })),
);
async function cargar() {
  cargando.value = true;
  errorCarga.value = '';
  try {
    [solicitudes.value, productos.value] = await Promise.all([
      listarSoportePropio(),
      listarPublicacionesActivasSoporte(),
    ]);
  } catch (e) {
    errorCarga.value = obtenerMensajeError(e);
  } finally {
    cargando.value = false;
  }
}
async function enviar() {
  enviando.value = true;
  error.value = '';
  try {
    await crearSoporte({
      asunto: `${tipos.find((t) => t.value === tipo.value)?.label}: ${asunto.value.trim()}`,
      mensaje: mensaje.value.trim(),
      producto_id: productoId.value,
    });
    asunto.value = '';
    mensaje.value = '';
    productoId.value = null;
    q.notify({ type: 'positive', message: 'Solicitud enviada correctamente.' });
    await cargar();
  } catch (e) {
    error.value = obtenerMensajeError(e);
  } finally {
    enviando.value = false;
  }
}
function etiquetaEstado(v: string) {
  return (
    (
      {
        abierta: 'Abierta',
        en_proceso: 'En proceso',
        resuelta: 'Resuelta',
        cerrada: 'Cerrada',
      } as Record<string, string>
    )[v] ?? v
  );
}
function colorEstado(v: string) {
  return (
    (
      {
        abierta: 'orange-8',
        en_proceso: 'blue-7',
        resuelta: 'positive',
        cerrada: 'grey-7',
      } as Record<string, string>
    )[v] ?? 'grey'
  );
}
function iconoEstado(v: string) {
  return v === 'resuelta' ? 'check' : v === 'en_proceso' ? 'hourglass_top' : 'support_agent';
}
onMounted(() => void cargar());
</script>
<style scoped lang="scss">
.pagina-soporte {
  width: min(100%, 1100px);
  margin: auto;
  padding: clamp(20px, 4vw, 42px) clamp(14px, 3vw, 28px) 110px;
}
.cabecera-soporte {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(22px, 4vw, 38px);
  border-radius: 24px;
  background: var(--superficie-suave);
}
.cabecera-soporte h1,
.cabecera-soporte p,
.tarjeta-formulario h2,
.titulo-historial h2 {
  margin: 0;
}
.cabecera-soporte p {
  margin-top: 8px;
  color: var(--texto-secundario);
}
.cabecera-soporte > .q-icon {
  font-size: clamp(56px, 10vw, 96px);
  color: var(--coral);
  opacity: 0.85;
}
.etiqueta {
  color: var(--coral);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.09em;
}
.rejilla-soporte {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  gap: 24px;
  margin-top: 24px;
}
.tarjeta-formulario,
.lista-solicitudes {
  overflow: hidden;
  border-radius: 20px;
  background: var(--fondo);
}
.titulo-historial {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.lista-solicitudes {
  border: 1px solid var(--borde);
}
.lista-solicitudes .q-item {
  padding-block: 16px;
}
.respuesta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--azul-suave);
  color: var(--azul-marino);
}
.vacio {
  padding: 44px 20px;
  border: 1px dashed var(--borde);
  border-radius: 18px;
  text-align: center;
  color: var(--texto-secundario);
}
.vacio .q-icon {
  font-size: 48px;
  color: var(--coral);
}
@media (max-width: 760px) {
  .pagina-soporte {
    padding: 14px 14px 96px;
  }
  .cabecera-soporte {
    padding: 18px;
    border-radius: 18px;
  }
  .cabecera-soporte h1 {
    margin-top: 3px;
    font-size: 1.55rem;
    line-height: 1.16;
  }
  .cabecera-soporte p {
    margin-top: 5px;
    font-size: 0.86rem;
    line-height: 1.4;
  }
  .rejilla-soporte {
    gap: 18px;
    margin-top: 16px;
    grid-template-columns: 1fr;
  }
  .cabecera-soporte > .q-icon {
    display: none;
  }
  .tarjeta-formulario,
  .lista-solicitudes {
    border-radius: 16px;
  }
  .tarjeta-formulario :deep(.q-card__section) {
    padding: 16px;
  }
  .tarjeta-formulario h2,
  .titulo-historial h2 {
    font-size: 1.3rem;
  }
  .pagina-soporte :deep(.q-field__native),
  .pagina-soporte :deep(.q-field__label),
  .pagina-soporte :deep(.q-btn__content) {
    font-size: 0.875rem;
  }
  .lista-solicitudes .q-item {
    align-items: flex-start;
    flex-wrap: wrap;
    padding: 14px;
  }
  .lista-solicitudes .q-item__section--avatar {
    min-width: 46px;
  }
  .lista-solicitudes .q-item__section--side {
    width: 100%;
    padding: 8px 0 0 46px;
    align-items: flex-start;
  }
  .respuesta {
    font-size: 0.84rem;
    line-height: 1.4;
  }
  .vacio {
    padding: 30px 16px;
    font-size: 0.88rem;
  }
}
</style>
