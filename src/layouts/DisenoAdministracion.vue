<template>
  <q-layout view="hHh LpR fFf" class="diseno-administracion">
    <q-header class="cabecera-administracion">
      <q-toolbar class="cabecera-administracion__contenido">
        <q-btn flat round icon="menu" aria-label="Abrir menú" @click="menuAbierto = !menuAbierto" />
        <marca-comarapa class="marca-administracion" :mostrar-ubicacion="false" />
        <span class="cabecera-administracion__seccion">Administración</span>
        <q-space />
        <boton-notificaciones ruta-todas="/administracion/notificaciones" />
        <q-chip color="green-1" text-color="primary" icon="verified_user">
          {{ etiquetaRol }}
        </q-chip>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="menuAbierto" show-if-above bordered :width="270">
      <div class="menu-administracion">
        <q-list padding>
          <q-item-label header>PRINCIPAL</q-item-label>
          <q-item
            clickable
            exact
            :active="esRutaActiva(['administracion'])"
            active-class="menu-administracion__activo"
            :to="{ name: 'administracion' }"
          >
            <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
            <q-item-section>Resumen</q-item-section>
          </q-item>
          <q-item
            clickable
            :active="esRutaActiva(['administracion-publicaciones'])"
            active-class="menu-administracion__activo"
            :to="{ name: 'administracion-publicaciones' }"
          >
            <q-item-section avatar><q-icon name="inventory_2" /></q-item-section>
            <q-item-section>Publicaciones</q-item-section>
          </q-item>
          <q-item
            clickable
            :active="esRutaActiva(['auditoria-administrativa'])"
            active-class="menu-administracion__activo"
            :to="{ name: 'auditoria-administrativa' }"
          >
            <q-item-section avatar><q-icon name="manage_search" /></q-item-section>
            <q-item-section>Auditoría</q-item-section>
          </q-item>
          <q-item-label header>COMUNIDAD Y OPERACIÓN</q-item-label>
          <q-item
            clickable
            :active="esRutaActiva(['administracion-usuarios'])"
            active-class="menu-administracion__activo"
            :to="{ name: 'administracion-usuarios' }"
          >
            <q-item-section avatar><q-icon name="group" /></q-item-section
            ><q-item-section>Usuarios</q-item-section>
          </q-item>
          <q-item
            clickable
            :active="esRutaActiva(['administracion-operaciones'])"
            active-class="menu-administracion__activo"
            :to="{ name: 'administracion-operaciones' }"
            ><q-item-section avatar><q-icon name="support_agent" /></q-item-section
            ><q-item-section>Operaciones</q-item-section></q-item
          >
          <q-item
            clickable
            :active="esRutaActiva(['administracion-mensajes', 'administracion-mensajes-conversacion'])"
            active-class="menu-administracion__activo"
            :to="{ name: 'administracion-mensajes' }"
            ><q-item-section avatar><q-icon name="chat_bubble_outline" /></q-item-section
            ><q-item-section>Mensajes</q-item-section></q-item
          >
          <q-item
            clickable
            :active="esRutaActiva(['administracion-servicios'])"
            active-class="menu-administracion__activo"
            :to="{ name: 'administracion-servicios' }"
            ><q-item-section avatar><q-icon name="business_center" /></q-item-section
            ><q-item-section>Servicios especiales</q-item-section></q-item
          >
          <q-item v-for="opcion in proximasOpciones" :key="opcion.etiqueta" disable>
            <q-item-section avatar><q-icon :name="opcion.icono" /></q-item-section>
            <q-item-section>{{ opcion.etiqueta }}</q-item-section>
            <q-tooltip>Disponible en una próxima etapa</q-tooltip>
          </q-item>
        </q-list>
        <q-space />
        <q-list bordered separator>
          <q-item clickable :to="{ name: 'inicio' }">
            <q-item-section avatar><q-icon name="storefront" /></q-item-section>
            <q-item-section>Volver al marketplace</q-item-section>
          </q-item>
          <q-item clickable :to="{ name: 'ajustes' }">
            <q-item-section avatar><q-icon name="contrast" /></q-item-section>
            <q-item-section>Apariencia</q-item-section>
          </q-item>
          <q-item clickable class="text-negative" @click="cerrarSesion">
            <q-item-section avatar><q-icon name="logout" /></q-item-section>
            <q-item-section>Cerrar sesión</q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';
import { cerrarSesion as solicitarCierre } from 'src/services/servicioAutenticacion';
import BotonNotificaciones from 'components/BotonNotificaciones.vue';
import MarcaComarapa from 'components/MarcaComarapa.vue';

const menuAbierto = ref(false);
const autenticacion = useTiendaAutenticacion();
const enrutador = useRouter();
const ruta = useRoute();
const etiquetaRol = computed(() =>
  autenticacion.esSuperadministrador ? 'Superadministrador' : 'Administrador',
);
const proximasOpciones: { etiqueta: string; icono: string }[] = [];

function esRutaActiva(nombres: string[]): boolean {
  return typeof ruta.name === 'string' && nombres.includes(ruta.name);
}

async function cerrarSesion(): Promise<void> {
  try {
    await solicitarCierre();
  } finally {
    autenticacion.limpiarSesion();
  }
  await enrutador.replace({ name: 'iniciar-sesion' });
}
</script>

<style scoped lang="scss">
.diseno-administracion {
  background: var(--fondo-azulado);
}
.cabecera-administracion {
  border-bottom: 0;
  background: #004628;
  color: #fff;
  box-shadow: 0 8px 28px rgb(0 70 40 / 18%);
}
.cabecera-administracion__contenido {
  min-height: 70px;
  padding-inline: clamp(12px, 3vw, 28px);
}
.cabecera-administracion__seccion {
  margin-left: 10px;
  padding-left: 10px;
  border-left: 1px solid rgb(255 255 255 / 35%);
  color: rgb(255 255 255 / 70%);
  font-size: 0.75rem;
}
.marca-administracion { min-width: 0; }
.cabecera-administracion :deep(.marca-comarapa__logo) { width: 205px; height: 46px; }
.cabecera-administracion :deep(.q-btn) {
  color: #fff !important;
}
.cabecera-administracion .q-chip {
  background: rgb(255 255 255 / 14%) !important;
  color: #fff !important;
}
.menu-administracion {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 10px;
}
.menu-administracion :deep(.q-item__label--header) {
  padding-top: 18px;
  color: #8a97aa;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.11em;
}
.menu-administracion .q-item {
  min-height: 50px;
  border-radius: 12px;
  color: var(--texto-secundario);
  font-weight: 500;
}
.menu-administracion__activo {
  color: var(--azul-marino) !important;
  background: var(--azul-suave);
  font-weight: 700 !important;
  box-shadow: inset 3px 0 var(--coral);
}
@media (max-width: 480px) {
  .cabecera-administracion__contenido { padding-inline: 6px; }
  .cabecera-administracion :deep(.marca-comarapa__logo) { width: 182px; height: 44px; }
  .cabecera-administracion__seccion { display: none; }
  .cabecera-administracion .q-chip {
    max-width: 48px;
    overflow: hidden;
  }
}
</style>
