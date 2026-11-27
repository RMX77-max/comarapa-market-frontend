<template>
  <q-page class="contenedor-pagina pagina-perfil">
    <div class="contenedor-formulario">
      <section v-if="usuario" class="tarjeta-perfil">
        <div
          class="portada-perfil"
          :class="{ 'portada-perfil--predeterminada': !usuario.url_foto_portada }"
        >
          <img
            v-if="usuario.url_foto_portada"
            :src="usuario.url_foto_portada"
            alt="Portada del perfil"
          />
          <div v-else class="paisaje-marca"><q-icon name="landscape" /><span>Comarapa</span></div>
        </div>
        <div class="contenido-perfil">
          <div class="bloque-identidad">
            <avatar-usuario
              class="avatar-superpuesto"
              :nombre="usuario.nombre"
              :url="usuario.url_foto_perfil"
              tamano="104px"
            />
            <div class="identidad-perfil">
              <div class="nombre-verificado">
                <h1>{{ usuario.nombre }}</h1>
                <q-icon
                  v-if="usuario.telefono_verificado"
                  name="verified"
                  class="insignia-verificada"
                  ><q-tooltip>Celular verificado</q-tooltip></q-icon
                >
              </div>
              <p><q-icon name="place" /> {{ usuario.ubicacion || 'Ubicación no configurada' }}</p>
            </div>
          </div>
          <p class="biografia-perfil">
            {{ usuario.biografia || 'Agrega una descripción sobre ti.' }}
          </p>
          <q-btn
            class="boton-editar-perfil"
            color="primary"
            icon="edit"
            label="Editar perfil"
            unelevated
            no-caps
            :to="{ name: 'editar-perfil' }"
          />
        </div>
      </section>

      <q-list class="opciones-perfil q-mt-lg" separator>
        <q-item clickable @click="usuario?.telefono_verificado ? undefined : abrirVerificacion()">
          <q-item-section avatar
            ><q-icon
              :name="usuario?.telefono_verificado ? 'verified' : 'phone_android'"
              :color="usuario?.telefono_verificado ? 'positive' : 'warning'"
          /></q-item-section>
          <q-item-section
            ><q-item-label>Verificación</q-item-label
            ><q-item-label caption>{{
              usuario?.telefono_verificado
                ? 'Celular verificado'
                : 'Verifica tu celular para publicar y comprar'
            }}</q-item-label></q-item-section
          >
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
        <q-item v-if="autenticacion.esAdministrador" clickable :to="{ name: 'administracion' }">
          <q-item-section avatar
            ><q-icon name="admin_panel_settings" color="primary"
          /></q-item-section>
          <q-item-section
            ><q-item-label>Panel administrativo</q-item-label
            ><q-item-label caption>Gestiona la plataforma</q-item-label></q-item-section
          >
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
        <q-item clickable :to="{ name: 'mis-publicaciones' }">
          <q-item-section avatar><q-icon name="inventory_2" color="primary" /></q-item-section>
          <q-item-section
            ><q-item-label>Mis publicaciones</q-item-label
            ><q-item-label caption
              >Administra tus productos publicados</q-item-label
            ></q-item-section
          >
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
        <q-item clickable :to="{ name: 'guardados' }">
          <q-item-section avatar><q-icon name="bookmark" color="primary" /></q-item-section>
          <q-item-section
            ><q-item-label>Guardados</q-item-label
            ><q-item-label caption>Productos que te interesan</q-item-label></q-item-section
          >
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
        <q-item clickable :to="{ name: 'ajustes' }">
          <q-item-section avatar><q-icon name="contrast" color="primary" /></q-item-section>
          <q-item-section
            ><q-item-label>Apariencia</q-item-label
            ><q-item-label caption
              >Personaliza el tema de la aplicación</q-item-label
            ></q-item-section
          >
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
        <q-item clickable :to="{ name: 'ordenes' }"
          ><q-item-section avatar><q-icon name="shopping_bag" color="primary" /></q-item-section
          ><q-item-section
            ><q-item-label>Compras</q-item-label
            ><q-item-label caption>Revisa tus operaciones</q-item-label></q-item-section
          ><q-item-section side><q-icon name="chevron_right" /></q-item-section
        ></q-item>
        <q-item clickable :to="{ name: 'soporte' }"
          ><q-item-section avatar><q-icon name="support_agent" color="primary" /></q-item-section
          ><q-item-section
            ><q-item-label>Soporte</q-item-label
            ><q-item-label caption>Solicita ayuda a nuestro equipo</q-item-label></q-item-section
          ><q-item-section side><q-icon name="chevron_right" /></q-item-section
        ></q-item>
        <q-item clickable :to="{ name: 'solicitar-producto' }"
          ><q-item-section avatar><q-icon name="manage_search" color="primary" /></q-item-section
          ><q-item-section
            ><q-item-label>Solicitar un producto</q-item-label
            ><q-item-label caption>Publica lo que estás buscando</q-item-label></q-item-section
          ><q-item-section side><q-icon name="chevron_right" /></q-item-section
        ></q-item>
        <q-item clickable :to="{ name: 'inmuebles' }"
          ><q-item-section avatar
            ><q-icon name="real_estate_agent" color="primary" /></q-item-section
          ><q-item-section
            ><q-item-label>Inmuebles</q-item-label
            ><q-item-label caption>Publica o consulta propiedades</q-item-label></q-item-section
          ><q-item-section side><q-icon name="chevron_right" /></q-item-section
        ></q-item>
        <q-item v-if="prestamosHabilitados" clickable :to="{ name: 'solicitar-prestamo' }"
          ><q-item-section avatar><q-icon name="request_quote" color="primary" /></q-item-section
          ><q-item-section
            ><q-item-label>Solicitar préstamo</q-item-label
            ><q-item-label caption>Envía una solicitud con garantía</q-item-label></q-item-section
          ><q-item-section side><q-icon name="chevron_right" /></q-item-section
        ></q-item>
        <q-item clickable class="text-negative" @click="cerrarSesion">
          <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
          <q-item-section>Cerrar sesión</q-item-section>
        </q-item>
      </q-list>
      <q-dialog v-model="dialogoTelefono">
        <q-card class="dialogo-telefono">
          <q-card-section class="encabezado-verificacion">
            <q-icon name="phone_android" />
            <div>
              <h3>Verificar celular</h3>
              <p>{{ telefonoVisible }}</p>
            </div>
          </q-card-section>
          <q-card-section v-if="!solicitud" class="texto-verificacion">
            Te enviaremos un código por WhatsApp cuando administración atienda tu solicitud.
            <q-input
              v-if="!usuario?.telefono"
              v-model.trim="telefonoNuevo"
              class="q-mt-md"
              outlined
              prefix="+591"
              inputmode="numeric"
              maxlength="8"
              label="Celular"
            />
          </q-card-section>
          <q-card-section v-else class="contenido-codigo">
            <template v-if="solicitud.estado === 'pendiente'">
              <q-icon name="schedule_send" class="icono-estado-verificacion" />
              <p>
                Tu solicitud está pendiente. Cuando administración envíe el código por WhatsApp,
                podrás introducirlo aquí sin crear otra solicitud.
              </p>
            </template>
            <template v-else-if="solicitud.estado === 'codigo_expirado'">
              <q-icon name="timer_off" class="icono-estado-verificacion" />
              <p>El código anterior venció. Administración puede enviarte uno nuevo.</p>
            </template>
            <p v-else>Introduce el código que recibiste por WhatsApp.</p>
            <q-input
              v-if="solicitud.estado === 'codigo_enviado'"
              v-model.trim="codigo"
              outlined
              inputmode="numeric"
              maxlength="6"
              autocomplete="one-time-code"
              label="Código de 6 dígitos"
            />
          </q-card-section>
          <q-card-actions vertical>
            <q-btn
              v-if="!solicitud"
              color="primary"
              unelevated
              no-caps
              label="Verificar"
              :loading="procesando"
              @click="solicitarCodigo"
            />
            <q-btn
              v-else-if="solicitud.estado === 'codigo_enviado'"
              color="primary"
              unelevated
              no-caps
              label="Confirmar código"
              :disable="codigo.length !== 6"
              :loading="procesando"
              @click="confirmarCodigo"
            />
            <q-btn
              v-else
              outline
              color="primary"
              no-caps
              label="Actualizar estado"
              :loading="procesando"
              @click="cargarSolicitudActiva"
            />
            <q-btn flat no-caps label="Volver" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AvatarUsuario from 'components/AvatarUsuario.vue';
import {
  cerrarSesion as solicitarCierre,
  confirmarVerificacionTelefono,
  obtenerSolicitudVerificacionTelefono,
  solicitarVerificacionTelefono,
  type SolicitudVerificacionTelefono,
} from 'src/services/servicioAutenticacion';
import { useQuasar } from 'quasar';
import { obtenerMensajeError } from 'src/services/servicioApi';
import { obtenerPerfil } from 'src/services/servicioPerfil';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';

const prestamosHabilitados = process.env.PRESTAMOS_HABILITADOS === 'true';
const enrutador = useRouter();
const autenticacion = useTiendaAutenticacion();
const usuario = computed(() => autenticacion.usuario);
const q = useQuasar();
const dialogoTelefono = ref(false),
  procesando = ref(false),
  codigo = ref(''),
  telefonoNuevo = ref(''),
  solicitud = ref<SolicitudVerificacionTelefono | null>(null);
const telefonoVisible = computed(
  () =>
    usuario.value?.telefono?.replace(/^(\+591)(\d{2})\d{3}(\d{3})$/, '$1 $2•••$3') ??
    'Celular registrado',
);
async function abrirVerificacion(): Promise<void> {
  codigo.value = '';
  telefonoNuevo.value = '';
  dialogoTelefono.value = true;
  await cargarSolicitudActiva();
}
async function cargarSolicitudActiva(): Promise<void> {
  procesando.value = true;
  try {
    solicitud.value = await obtenerSolicitudVerificacionTelefono();
  } catch (e) {
    q.notify({ type: 'negative', message: obtenerMensajeError(e) });
  } finally {
    procesando.value = false;
  }
}
async function solicitarCodigo(): Promise<void> {
  if (!usuario.value?.telefono && !/^\d{8}$/.test(telefonoNuevo.value)) {
    q.notify({ type: 'warning', message: 'Ingresa los 8 dígitos de tu celular.' });
    return;
  }
  procesando.value = true;
  try {
    solicitud.value = await solicitarVerificacionTelefono(
      usuario.value?.telefono ? undefined : `+591${telefonoNuevo.value}`,
    );
  } catch (e) {
    q.notify({ type: 'negative', message: obtenerMensajeError(e) });
  } finally {
    procesando.value = false;
  }
}
async function confirmarCodigo(): Promise<void> {
  if (!solicitud.value) return;
  procesando.value = true;
  try {
    await confirmarVerificacionTelefono(solicitud.value.solicitud_id, codigo.value);
    autenticacion.actualizarUsuario(await obtenerPerfil());
    dialogoTelefono.value = false;
    q.notify({ type: 'positive', message: 'Celular verificado.' });
  } catch (e) {
    q.notify({ type: 'negative', message: obtenerMensajeError(e) });
  } finally {
    procesando.value = false;
  }
}

async function cerrarSesion(): Promise<void> {
  try {
    await solicitarCierre();
  } finally {
    autenticacion.limpiarSesion();
  }
  await enrutador.replace({ name: 'iniciar-sesion' });
}
onMounted(async () => {
  try {
    autenticacion.actualizarUsuario(await obtenerPerfil());
  } catch {
    /* El interceptor gestiona la sesión inválida. */
  }
});
</script>

<style scoped lang="scss">
.tarjeta-perfil {
  position: relative;
  margin-top: 18px;
  padding-bottom: 1px;
  border-radius: 26px;
  background: transparent;
}
.portada-perfil {
  height: clamp(150px, 31vw, 230px);
  overflow: hidden;
  border-radius: 26px 26px 18px 18px;
  background: #edf3eb;
  box-shadow: 0 8px 24px rgba(0, 70, 40, 0.09);
}
.portada-perfil img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.portada-perfil--predeterminada {
  background: linear-gradient(135deg, #edf3eb 0%, #9bdf9d 55%, #409951 100%);
}
.paisaje-marca {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #004628;
  font-weight: 800;
  font-size: clamp(1.4rem, 5vw, 2.2rem);
}
.paisaje-marca .q-icon {
  font-size: clamp(48px, 12vw, 86px);
}
.contenido-perfil {
  position: relative;
  z-index: 1;
  margin: -28px 14px 0;
  padding: 18px clamp(18px, 4vw, 28px) 22px;
  border: 1px solid var(--borde);
  border-radius: 24px;
  background: var(--fondo);
  box-shadow: 0 12px 30px rgba(0, 70, 40, 0.12);
}
.bloque-identidad {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
  gap: clamp(12px, 3vw, 18px);
  align-items: center;
  min-width: 0;
}
.avatar-superpuesto {
  overflow: hidden;
  align-self: start;
  margin-top: -58px;
  box-sizing: border-box;
  border: 5px solid #fff;
  border-radius: 50%;
  box-shadow: 0 6px 18px rgba(23, 43, 77, 0.18);
}
.avatar-superpuesto :deep(.q-avatar__content),
.avatar-superpuesto :deep(.q-img),
.avatar-superpuesto :deep(.q-img__container),
.avatar-superpuesto :deep(img) {
  width: 100%;
  height: 100%;
}
.avatar-superpuesto :deep(img) {
  display: block;
  object-fit: cover;
}
.nombre-verificado {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}
.nombre-verificado h1 {
  min-width: 0;
  overflow-wrap: anywhere;
  margin: 0;
  color: var(--texto-principal);
  font-size: clamp(1.55rem, 5vw, 2rem);
  line-height: 1.1;
}
.insignia-verificada {
  flex: none;
  color: #07843d;
  font-size: 29px;
}
.identidad-perfil > p {
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  align-items: center;
  gap: 4px;
  margin: 8px 0 0;
  padding: 5px 10px 5px 7px;
  border-radius: 999px;
  color: var(--texto-secundario);
  background: var(--verde-suave, #e9f6ed);
  font-size: 0.86rem;
  line-height: 1.2;
}
.identidad-perfil > p .q-icon {
  color: #07843d;
  font-size: 20px;
}
.biografia-perfil {
  margin: 12px 0 16px;
  color: var(--texto-principal);
  font-size: 0.98rem;
  line-height: 1.55;
  white-space: pre-line;
}
.boton-editar-perfil {
  width: 100%;
  min-height: 48px;
  border-radius: 14px;
  font-weight: 700;
}
.opciones-perfil {
  overflow: hidden;
  border: 1px solid var(--borde);
  border-radius: var(--radio-medio);
  background: var(--fondo);
}
.opciones-perfil .q-item {
  min-height: 66px;
}
.dialogo-telefono {
  width: min(90vw, 380px);
  border-radius: 20px;
}
.encabezado-verificacion {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
}
.encabezado-verificacion > .q-icon {
  display: grid;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  color: var(--primary);
  background: var(--fondo-secundario);
  font-size: 25px;
  place-items: center;
}
.dialogo-telefono h3 {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.2;
}
.dialogo-telefono p {
  margin: 4px 0 0;
  color: var(--texto-secundario);
  font-size: 0.88rem;
}
.texto-verificacion,
.contenido-codigo {
  padding-top: 8px;
  font-size: 0.9rem;
  line-height: 1.45;
}
.contenido-codigo {
  display: grid;
  gap: 12px;
}
.icono-estado-verificacion {
  justify-self: center;
  color: var(--primary);
  font-size: 2.25rem;
}
.dialogo-telefono .q-card__actions {
  gap: 4px;
  padding: 8px 16px 16px;
}

@media (max-width: 480px) {
  .pagina-perfil {
    width: 100%;
    padding-top: 0;
    padding-right: 0;
    padding-left: 0;
  }
  .contenedor-formulario {
    width: 100%;
    max-width: none;
  }
  .tarjeta-perfil {
    width: 100%;
    margin-top: 0;
    margin-inline: 0;
    border-radius: 0 0 22px 22px;
  }
  .opciones-perfil {
    margin-right: 16px;
    margin-left: 16px;
  }
  .portada-perfil {
    height: 168px;
    border-radius: 0 0 18px 18px;
  }
  .portada-perfil img {
    object-position: center top;
  }
  .contenido-perfil {
    margin: -22px 12px 0;
    padding: 16px 16px 18px;
    border-radius: 21px;
  }
  .bloque-identidad {
    grid-template-columns: 92px minmax(0, 1fr);
    gap: 12px;
  }
  .avatar-superpuesto {
    width: 92px !important;
    height: 92px !important;
    margin-top: -48px;
    font-size: 92px !important;
    border-width: 4px;
  }
  .nombre-verificado {
    gap: 5px;
  }
  .nombre-verificado h1 {
    font-size: clamp(1.25rem, 5.8vw, 1.55rem);
  }
  .insignia-verificada {
    font-size: 24px;
  }
  .identidad-perfil > p {
    margin-top: 6px;
    padding-block: 4px;
    font-size: 0.78rem;
  }
  .biografia-perfil {
    margin-top: 8px;
    font-size: 0.92rem;
  }
  .opciones-perfil .q-item {
    padding-inline: 14px;
  }
}
</style>
