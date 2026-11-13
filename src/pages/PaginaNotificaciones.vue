<template>
  <q-page class="pagina-notificaciones">
    <header><div><p>Actividad reciente</p><h1>Notificaciones</h1></div><q-btn v-if="noLeidas" flat no-caps color="primary" label="Marcar todas como leídas" @click="leerTodas" /></header>
    <estado-contenido v-if="cargando" tipo="cargando" />
    <estado-contenido v-else-if="error" tipo="error" :mensaje="error" etiqueta-accion="Reintentar" @accion="cargar" />
    <estado-contenido v-else-if="!notificaciones.length" tipo="vacio" titulo="Sin notificaciones" mensaje="Aquí aparecerán las novedades importantes de tu cuenta." />
    <q-list v-else class="lista-notificaciones" separator>
      <q-item v-for="notificacion in notificaciones" :key="notificacion.id" clickable :class="{ 'notificacion--nueva': !notificacion.leida }" @click="abrir(notificacion)">
        <q-item-section avatar><q-avatar :color="notificacion.leida ? 'grey-3' : 'green-1'" :text-color="notificacion.leida ? 'grey-7' : 'primary'" icon="notifications" /></q-item-section>
        <q-item-section><q-item-label :class="{ 'text-weight-bold': !notificacion.leida }">{{ notificacion.titulo }}</q-item-label><q-item-label caption>{{ notificacion.mensaje }}</q-item-label><q-item-label caption>{{ formatear(notificacion.fecha) }}</q-item-label></q-item-section>
        <q-item-section side><q-icon v-if="notificacion.ruta" name="chevron_right" /></q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import EstadoContenido from 'components/EstadoContenido.vue';
import type { Notificacion } from 'src/models/Notificacion';
import { listarNotificaciones, marcarNotificacionLeida, marcarTodasLeidas } from 'src/services/servicioNotificaciones';
import { obtenerMensajeError } from 'src/services/servicioApi';
const enrutador = useRouter();
const notificaciones = ref<Notificacion[]>([]); const noLeidas = ref(0); const cargando = ref(true); const error = ref('');
async function cargar(): Promise<void> { cargando.value = true; error.value = ''; try { const resultado = await listarNotificaciones(); notificaciones.value = resultado.notificaciones; noLeidas.value = resultado.no_leidas; } catch (e) { error.value = obtenerMensajeError(e); } finally { cargando.value = false; } }
async function abrir(item: Notificacion): Promise<void> { if (!item.leida) await marcarNotificacionLeida(item.id); if (item.ruta) await enrutador.push(item.ruta); else await cargar(); }
async function leerTodas(): Promise<void> { await marcarTodasLeidas(); await cargar(); }
function formatear(fecha: string): string { return new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(fecha)); }
onMounted(cargar);
</script>

<style scoped lang="scss">
.pagina-notificaciones { width: min(100%, 900px); margin: 0 auto; padding: clamp(20px, 4vw, 42px) clamp(14px, 3vw, 28px) 110px; }
.pagina-notificaciones header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.pagina-notificaciones header p, .pagina-notificaciones h1 { margin: 0; }
.pagina-notificaciones header p { color: var(--verde-principal); font-weight: 600; }
.pagina-notificaciones h1 { font-size: clamp(1.7rem, 4vw, 2.5rem); }
.lista-notificaciones { overflow: hidden; border: 1px solid var(--borde); border-radius: 18px; background: var(--fondo); }
.lista-notificaciones .q-item { min-height: 82px; }
.notificacion--nueva { background: var(--azul-suave); }
@media (max-width: 520px) { .pagina-notificaciones header { align-items: start; flex-direction: column; gap: 8px; } }
</style>
