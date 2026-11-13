<template>
  <q-btn flat round icon="notifications_none" aria-label="Notificaciones" color="primary">
    <q-badge v-if="noLeidas" color="negative" floating rounded>{{ noLeidas > 99 ? '99+' : noLeidas }}</q-badge>
    <q-menu class="menu-notificaciones" anchor="bottom right" self="top right" @show="cargar">
      <div class="menu-notificaciones__cabecera">
        <strong>Notificaciones</strong>
        <q-btn v-if="noLeidas" flat dense no-caps color="primary" label="Marcar leídas" @click="leerTodas" />
      </div>
      <q-separator />
      <q-list v-if="notificaciones.length" separator>
        <q-item v-for="notificacion in notificaciones.slice(0, 6)" :key="notificacion.id" clickable @click="abrir(notificacion)">
          <q-item-section avatar><q-icon :name="icono(notificacion.tipo)" :color="notificacion.leida ? 'grey-6' : 'primary'" /></q-item-section>
          <q-item-section>
            <q-item-label :class="{ 'text-weight-bold': !notificacion.leida }">{{ notificacion.titulo }}</q-item-label>
            <q-item-label caption lines="2">{{ notificacion.mensaje }}</q-item-label>
          </q-item-section>
          <q-item-section v-if="!notificacion.leida" side><span class="punto-no-leido" /></q-item-section>
        </q-item>
      </q-list>
      <div v-else class="menu-notificaciones__vacio">No tienes notificaciones nuevas.</div>
      <q-separator />
      <q-btn class="full-width" flat no-caps color="primary" label="Ver todas" :to="rutaTodas" />
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Notificacion } from 'src/models/Notificacion';
import { listarNotificaciones, marcarNotificacionLeida, marcarTodasLeidas } from 'src/services/servicioNotificaciones';

defineProps<{ rutaTodas: string }>();
const enrutador = useRouter();
const notificaciones = ref<Notificacion[]>([]);
const noLeidas = ref(0);
let temporizador: ReturnType<typeof setInterval> | undefined;

async function cargar(): Promise<void> {
  try {
    const resultado = await listarNotificaciones();
    notificaciones.value = resultado.notificaciones;
    noLeidas.value = resultado.no_leidas;
  } catch { /* La campana no debe interrumpir la navegación. */ }
}
async function abrir(notificacion: Notificacion): Promise<void> {
  if (!notificacion.leida) await marcarNotificacionLeida(notificacion.id);
  await cargar();
  if (notificacion.ruta) await enrutador.push(notificacion.ruta);
}
async function leerTodas(): Promise<void> { await marcarTodasLeidas(); await cargar(); }
function icono(tipo: string): string { return tipo === 'publicacion_pendiente' ? 'pending_actions' : 'campaign'; }

onMounted(() => { void cargar(); temporizador = setInterval(() => void cargar(), 30000); });
onBeforeUnmount(() => { if (temporizador) clearInterval(temporizador); });
</script>

<style scoped lang="scss">
.menu-notificaciones { width: min(92vw, 390px); max-height: min(70vh, 520px); }
.menu-notificaciones__cabecera { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; }
.menu-notificaciones__vacio { padding: 28px 18px; color: var(--texto-secundario); text-align: center; }
.punto-no-leido { width: 8px; height: 8px; border-radius: 50%; background: var(--verde-principal); }
</style>
