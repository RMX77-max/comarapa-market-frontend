<template>
  <q-page class="pagina-auditoria">
    <header class="cabecera-pagina-admin">
      <div>
        <p>Seguridad y control</p>
        <h1>Auditoría administrativa</h1>
        <span>Historial inalterable de las acciones sensibles del sistema.</span>
      </div>
      <q-icon name="manage_search" />
    </header>

    <section class="filtros-auditoria" aria-label="Filtros de auditoría">
      <q-input
        v-model="buscar"
        outlined
        dense
        clearable
        debounce="400"
        placeholder="Buscar por persona o descripción"
        @update:model-value="reiniciarYCargar"
      >
        <template #prepend><q-icon name="search" /></template>
      </q-input>
      <q-select
        v-model="accion"
        outlined
        dense
        emit-value
        map-options
        :options="opcionesAccion"
        label="Tipo de acción"
        @update:model-value="reiniciarYCargar"
      />
    </section>

    <estado-contenido v-if="cargando" tipo="cargando" />
    <estado-contenido
      v-else-if="error"
      tipo="error"
      titulo="No pudimos cargar la auditoría"
      :mensaje="error"
      etiqueta-accion="Reintentar"
      @accion="cargar"
    />
    <estado-contenido
      v-else-if="!auditorias.length"
      tipo="vacio"
      titulo="No hay registros"
      mensaje="No existen acciones que coincidan con los filtros seleccionados."
    />

    <section v-else class="lista-auditoria" aria-live="polite">
      <article v-for="registro in auditorias" :key="registro.id" class="registro-auditoria">
        <div class="registro-auditoria__icono"><q-icon :name="iconoAccion(registro.accion)" /></div>
        <div class="registro-auditoria__contenido">
          <div class="registro-auditoria__titulo">
            <strong>{{ etiquetaAccion(registro.accion) }}</strong>
            <time :datetime="registro.fecha">{{ formatearFecha(registro.fecha) }}</time>
          </div>
          <p>{{ registro.descripcion }}</p>
          <div class="registro-auditoria__metadatos">
            <span><q-icon name="person" /> {{ registro.actor?.nombre || 'Sistema' }}</span>
            <span v-if="registro.direccion_ip"><q-icon name="language" /> {{ registro.direccion_ip }}</span>
            <span v-if="registro.entidad_tipo">
              <q-icon name="tag" /> {{ registro.entidad_tipo }} {{ registro.entidad_id }}
            </span>
          </div>
          <q-expansion-item
            v-if="registro.valores_anteriores || registro.valores_nuevos"
            dense
            label="Ver cambios"
            header-class="registro-auditoria__expansion"
          >
            <div class="cambios-auditoria">
              <div><b>Antes</b><pre>{{ mostrarJson(registro.valores_anteriores) }}</pre></div>
              <div><b>Después</b><pre>{{ mostrarJson(registro.valores_nuevos) }}</pre></div>
            </div>
          </q-expansion-item>
        </div>
      </article>
    </section>

    <q-pagination
      v-if="paginacion.ultima_pagina > 1"
      v-model="pagina"
      class="paginacion-auditoria"
      color="primary"
      :max="paginacion.ultima_pagina"
      boundary-numbers
      @update:model-value="cargar"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EstadoContenido from 'components/EstadoContenido.vue';
import type { AuditoriaAdministrativa } from 'src/models/Administracion';
import type { Paginacion } from 'src/models/Api';
import { listarAuditoriaAdministrativa } from 'src/services/servicioAdministracion';
import { obtenerMensajeError } from 'src/services/servicioApi';

const auditorias = ref<AuditoriaAdministrativa[]>([]);
const cargando = ref(true);
const error = ref('');
const buscar = ref('');
const accion = ref('');
const pagina = ref(1);
const paginacion = ref<Paginacion>({ pagina_actual: 1, ultima_pagina: 1, por_pagina: 20, total: 0 });
const opcionesAccion = [
  { label: 'Todas las acciones', value: '' },
  { label: 'Inicio de sesión', value: 'inicio_sesion_administrativa' },
  { label: 'Cierre de sesión', value: 'cierre_sesion_administrativa' },
  { label: 'Cambio de rol', value: 'cambio_rol_sistema' },
];

function etiquetaAccion(valor: string): string {
  return opcionesAccion.find((opcion) => opcion.value === valor)?.label || valor.replaceAll('_', ' ');
}
function iconoAccion(valor: string): string {
  if (valor.includes('inicio')) return 'login';
  if (valor.includes('cierre')) return 'logout';
  if (valor.includes('rol')) return 'admin_panel_settings';
  return 'history';
}
function formatearFecha(valor: string): string {
  return new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(valor));
}
function mostrarJson(valor: Record<string, unknown> | null): string {
  return valor ? JSON.stringify(valor, null, 2) : 'Sin datos';
}
async function cargar(): Promise<void> {
  cargando.value = true;
  error.value = '';
  try {
    const resultado = await listarAuditoriaAdministrativa({
      pagina: pagina.value,
      ...(accion.value && { accion: accion.value }),
      ...(buscar.value?.trim() && { buscar: buscar.value.trim() }),
    });
    auditorias.value = resultado.auditorias;
    paginacion.value = resultado.paginacion;
  } catch (excepcion) {
    error.value = obtenerMensajeError(excepcion);
  } finally {
    cargando.value = false;
  }
}
function reiniciarYCargar(): void {
  pagina.value = 1;
  void cargar();
}

void cargar();
</script>

<style scoped lang="scss">
.pagina-auditoria { width: min(100%, 1120px); margin: 0 auto; padding: clamp(20px, 4vw, 42px); }
.cabecera-pagina-admin { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.cabecera-pagina-admin p, .cabecera-pagina-admin h1, .cabecera-pagina-admin span { margin: 0; }
.cabecera-pagina-admin p { color: var(--verde-principal); font-weight: 600; }
.cabecera-pagina-admin h1 { margin: 3px 0; font-size: clamp(1.65rem, 4vw, 2.4rem); }
.cabecera-pagina-admin > .q-icon { color: var(--verde-principal); font-size: 4.5rem; opacity: .14; }
.filtros-auditoria { display: grid; grid-template-columns: minmax(0, 1fr) minmax(190px, 280px); gap: 12px; margin-bottom: 20px; }
.lista-auditoria { display: grid; gap: 12px; }
.registro-auditoria { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 14px; padding: 18px; border: 1px solid var(--borde); border-radius: 16px; background: var(--fondo); }
.registro-auditoria__icono { display: grid; width: 42px; height: 42px; border-radius: 12px; color: var(--verde-principal); background: var(--verde-claro); place-items: center; font-size: 1.35rem; }
.registro-auditoria__titulo { display: flex; gap: 12px; align-items: start; justify-content: space-between; text-transform: capitalize; }
.registro-auditoria__titulo time { color: var(--texto-secundario); font-size: .78rem; white-space: nowrap; }
.registro-auditoria p { margin: 5px 0 9px; }
.registro-auditoria__metadatos { display: flex; flex-wrap: wrap; gap: 8px 16px; color: var(--texto-secundario); font-size: .8rem; }
.cambios-auditoria { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; padding: 10px 0; }
.cambios-auditoria > div { min-width: 0; padding: 10px; border-radius: 10px; background: var(--fondo-secundario); }
.cambios-auditoria pre { overflow-x: auto; margin: 6px 0 0; font-size: .75rem; white-space: pre-wrap; }
.paginacion-auditoria { margin-top: 24px; justify-content: center; }
@media (max-width: 600px) {
  .filtros-auditoria, .cambios-auditoria { grid-template-columns: 1fr; }
  .cabecera-pagina-admin > .q-icon { display: none; }
  .registro-auditoria__titulo { display: block; }
  .registro-auditoria__titulo time { display: block; margin-top: 3px; }
}
</style>
