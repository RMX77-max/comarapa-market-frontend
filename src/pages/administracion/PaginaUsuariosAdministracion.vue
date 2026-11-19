<template>
  <q-page class="pagina-admin-lista"
    ><header>
      <p>ADMINISTRACIÓN</p>
      <h1>Usuarios</h1>
    </header>
    <div class="filtros">
      <q-input
        v-model="buscar"
        outlined
        dense
        clearable
        debounce="400"
        placeholder="Nombre, celular o correo"
        @update:model-value="recargar"
      /><q-select
        v-model="estado"
        outlined
        dense
        emit-value
        map-options
        :options="estados"
        @update:model-value="recargar"
      />
    </div>
    <section v-if="verificaciones.length" class="verificaciones">
      <h2>Verificaciones pendientes</h2>
      <article v-for="v in verificaciones" :key="v.id">
        <div>
          <strong>{{ v.usuario.nombre }}</strong
          ><span
            >{{ v.telefono }} ·
            {{ v.tipo === 'recuperacion' ? 'Recuperar contraseña' : 'Verificar celular' }}</span
          >
        </div>
        <div class="acciones-verificacion">
          <q-btn flat color="negative" no-caps label="Rechazar" @click="rechazar(v)" />
          <q-btn
            color="primary"
            unelevated
            no-caps
            icon="send"
            :label="v.codigo_enviado_en ? 'Reenviar código' : 'Enviar código'"
            @click="enviarCodigo(v)"
          />
        </div>
      </article>
    </section>
    <estado-contenido v-if="cargando" tipo="cargando" /><estado-contenido
      v-else-if="error"
      tipo="error"
      :mensaje="error"
      etiqueta-accion="Reintentar"
      @accion="cargar" />
    <q-list v-else bordered separator class="lista-usuarios"
      ><q-item v-for="usuario in usuarios" :key="usuario.id"
        ><q-item-section avatar
          ><q-avatar color="blue-1" text-color="secondary">{{
            usuario.nombre.charAt(0)
          }}</q-avatar></q-item-section
        ><q-item-section
          ><q-item-label class="nombre-usuario">{{ usuario.nombre }}</q-item-label
          ><q-item-label caption>
            {{ usuario.telefono || usuario.email || 'Sin datos de contacto' }}
            <q-icon
              v-if="usuario.telefono_verificado"
              name="verified"
              color="positive"
              size="15px"
              title="Celular verificado"
            /> </q-item-label
          ><q-item-label caption
            >{{ usuario.publicaciones }} publicaciones · {{ usuario.rol }}</q-item-label
          ><q-item-label caption v-if="usuario.motivo">{{
            usuario.motivo
          }}</q-item-label></q-item-section
        ><q-item-section side
          ><div class="acciones">
            <q-badge
              :color="
                usuario.estado === 'activo'
                  ? 'positive'
                  : usuario.estado === 'suspendido'
                    ? 'orange'
                    : 'negative'
              "
              >{{ usuario.estado }}</q-badge
            ><q-btn flat round dense icon="more_vert" aria-label="Acciones del usuario"
              ><q-menu anchor="bottom right" self="top right"
                ><q-list class="menu-acciones"
                  ><q-item
                    v-if="usuario.estado !== 'activo'"
                    clickable
                    v-close-popup
                    @click="accion(usuario, 'activo')"
                    ><q-item-section avatar
                      ><q-icon name="check_circle" color="positive" /></q-item-section
                    ><q-item-section>Reactivar</q-item-section></q-item
                  ><q-item clickable v-close-popup @click="accion(usuario, 'suspendido')"
                    ><q-item-section avatar
                      ><q-icon name="pause_circle" color="warning" /></q-item-section
                    ><q-item-section>Suspender</q-item-section></q-item
                  ><q-item clickable v-close-popup @click="accion(usuario, 'bloqueado')"
                    ><q-item-section avatar><q-icon name="block" color="negative" /></q-item-section
                    ><q-item-section>Bloquear</q-item-section></q-item
                  ><q-separator v-if="auth.esSuperadministrador" /><q-item
                    v-if="auth.esSuperadministrador && usuario.rol === 'usuario'"
                    clickable
                    v-close-popup
                    @click="rol(usuario, 'administrador')"
                    ><q-item-section avatar><q-icon name="admin_panel_settings" /></q-item-section
                    ><q-item-section>Hacer administrador</q-item-section></q-item
                  ><q-item
                    v-if="auth.esSuperadministrador && usuario.rol === 'administrador'"
                    clickable
                    v-close-popup
                    @click="rol(usuario, 'usuario')"
                    ><q-item-section avatar><q-icon name="person" /></q-item-section
                    ><q-item-section>Quitar administración</q-item-section></q-item
                  ></q-list
                ></q-menu
              ></q-btn
            >
          </div></q-item-section
        ></q-item
      ></q-list
    >
    <q-pagination
      v-if="paginas > 1"
      v-model="pagina"
      :max="paginas"
      class="paginacion"
      @update:model-value="cargar"
  /></q-page>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import EstadoContenido from 'components/EstadoContenido.vue';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';
import {
  cambiarEstadoUsuario,
  cambiarRolUsuario,
  listarUsuariosAdministracion,
  listarVerificacionesTelefono,
  prepararEnvioCodigo,
  revisarVerificacionTelefono,
  type UsuarioAdministrado,
  type VerificacionTelefonoAdmin,
} from 'src/services/servicioAdministracion';
import { obtenerMensajeError } from 'src/services/servicioApi';
const q = useQuasar(),
  auth = useTiendaAutenticacion(),
  usuarios = ref<UsuarioAdministrado[]>([]),
  verificaciones = ref<VerificacionTelefonoAdmin[]>([]),
  buscar = ref(''),
  estado = ref(''),
  pagina = ref(1),
  paginas = ref(1),
  cargando = ref(true),
  error = ref('');
const estados = [
  { label: 'Todos', value: '' },
  { label: 'Activos', value: 'activo' },
  { label: 'Suspendidos', value: 'suspendido' },
  { label: 'Bloqueados', value: 'bloqueado' },
];
async function cargar() {
  cargando.value = true;
  try {
    const r = await listarUsuariosAdministracion({
      pagina: pagina.value,
      buscar: buscar.value || undefined,
      estado: estado.value || undefined,
    });
    usuarios.value = r.usuarios;
    verificaciones.value = await listarVerificacionesTelefono();
    paginas.value = r.paginacion.ultima_pagina;
  } catch (e) {
    error.value = obtenerMensajeError(e);
  } finally {
    cargando.value = false;
  }
}
async function enviarCodigo(v: VerificacionTelefonoAdmin): Promise<void> {
  const ventanaWhatsApp = window.open('about:blank', '_blank');
  try {
    const envio = await prepararEnvioCodigo(v.id);
    if (ventanaWhatsApp) ventanaWhatsApp.location.href = envio.whatsapp_url;
    else window.location.href = envio.whatsapp_url;
    q.notify({ type: 'positive', message: 'WhatsApp preparado. Confirma el envío del mensaje.' });
    await cargar();
  } catch (e) {
    ventanaWhatsApp?.close();
    q.notify({ type: 'negative', message: obtenerMensajeError(e) });
  }
}
function rechazar(v: VerificacionTelefonoAdmin): void {
  q.dialog({
    title: 'Rechazar solicitud',
    message: `¿Deseas rechazar la solicitud de ${v.usuario.nombre}?`,
    cancel: true,
  }).onOk(() => void confirmarRechazo(v));
}
async function confirmarRechazo(v: VerificacionTelefonoAdmin): Promise<void> {
  try {
    await revisarVerificacionTelefono(v.id, 'rechazar');
    q.notify({ type: 'positive', message: 'Solicitud rechazada.' });
    await cargar();
  } catch (e) {
    q.notify({ type: 'negative', message: obtenerMensajeError(e) });
  }
}
function recargar() {
  pagina.value = 1;
  void cargar();
}
async function accion(u: UsuarioAdministrado, e: string) {
  const motivo = e === 'activo' ? undefined : window.prompt(`Motivo para ${e}:`)?.trim();
  if (e !== 'activo' && !motivo) return;
  try {
    await cambiarEstadoUsuario(u.id, e, motivo);
    await cargar();
  } catch (x) {
    q.notify({ type: 'negative', message: obtenerMensajeError(x) });
  }
}
async function rol(u: UsuarioAdministrado, r: string) {
  if (!window.confirm('Este cambio cerrará sus sesiones. ¿Continuar?')) return;
  try {
    await cambiarRolUsuario(u.id, r);
    await cargar();
  } catch (x) {
    q.notify({ type: 'negative', message: obtenerMensajeError(x) });
  }
}
onMounted(cargar);
</script>
<style scoped lang="scss">
.pagina-admin-lista {
  width: min(100%, 1100px);
  margin: auto;
  padding: clamp(18px, 4vw, 42px);
}
header p,
header h1 {
  margin: 0;
}
header p {
  color: var(--coral);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.09em;
}
header h1 {
  color: var(--azul-marino);
  font-size: clamp(1.75rem, 5vw, 2.65rem);
  line-height: 1.1;
}
header {
  margin-bottom: 20px;
}
.filtros {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 12px;
  margin-bottom: 18px;
}
.lista-usuarios {
  overflow: hidden;
  border-radius: 16px;
  background: var(--fondo);
}
.lista-usuarios .q-item {
  min-height: 82px;
}
.nombre-usuario {
  font-weight: 700;
}
.acciones {
  display: flex;
  align-items: center;
  gap: 6px;
}
.acciones-verificacion {
  display: flex !important;
  align-items: center;
  gap: 6px;
}
.menu-acciones {
  min-width: 230px;
}
.paginacion {
  justify-content: center;
  margin-top: 20px;
}
.verificaciones {
  display: grid;
  gap: 10px;
  margin-bottom: 18px;
  padding: 16px;
  border: 1px solid var(--borde);
  border-radius: 16px;
  background: var(--fondo);
}
.verificaciones h2 {
  margin: 0;
  font-size: 1.1rem;
}
.verificaciones article {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  background: var(--fondo-secundario);
}
.verificaciones article div {
  display: grid;
}
.verificaciones span {
  color: var(--texto-secundario);
  font-size: 0.78rem;
}
@media (max-width: 600px) {
  .filtros {
    grid-template-columns: 1fr;
  }
  .pagina-admin-lista {
    padding-inline: 14px;
  }
  .lista-usuarios .q-item {
    padding: 12px 10px;
  }
  .lista-usuarios :deep(.q-item__section--avatar) {
    min-width: 48px;
  }
  .acciones {
    flex-direction: column-reverse;
    gap: 2px;
  }
  header h1 {
    font-size: 1.75rem;
  }
}
</style>
