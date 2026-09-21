<template>
  <q-header class="encabezado-principal" :class="{ 'encabezado-principal--compacto': compacto }">
    <q-toolbar class="encabezado-principal__contenido">
      <marca-comarapa :mostrar-ubicacion="false" />
      <q-space />
      <nav class="navegacion-escritorio" aria-label="Navegación principal">
        <q-btn
          v-for="opcion in opciones"
          :key="opcion.nombre"
          :icon="opcion.icono"
          :label="opcion.etiqueta"
          :to="{ name: opcion.nombre }"
          :class="{ 'navegacion-escritorio__activa': ruta.name === opcion.nombre }"
          flat
          no-caps
        />
      </nav>
      <div class="encabezado-principal__acciones">
        <q-btn
          class="encabezado-principal__buscar"
          flat
          round
          icon="search"
          aria-label="Buscar"
          @click="irABuscar"
        />
        <q-btn
          class="encabezado-principal__notificaciones"
          flat
          round
          icon="notifications_none"
          aria-label="Notificaciones"
          @click="mostrarAvisoNotificaciones"
        />
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import MarcaComarapa from './MarcaComarapa.vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const ruta = useRoute();
const enrutador = useRouter();
const q = useQuasar();
const compacto = ref(false);
const rutasConEncabezadoDinamico = new Set(['inicio', 'buscar']);
const opciones = [
  { nombre: 'inicio', etiqueta: 'Inicio', icono: 'home' },
  { nombre: 'buscar', etiqueta: 'Buscar', icono: 'search' },
  { nombre: 'publicar', etiqueta: 'Vender', icono: 'add_circle' },
  { nombre: 'mensajes', etiqueta: 'Mensajes', icono: 'chat_bubble_outline' },
  { nombre: 'perfil', etiqueta: 'Perfil', icono: 'person_outline' },
] as const;

function actualizarEncabezado(): void {
  compacto.value =
    typeof ruta.name === 'string' &&
    rutasConEncabezadoDinamico.has(ruta.name) &&
    window.scrollY > 54;
}
function mostrarAvisoNotificaciones(): void {
  q.notify({
    message: 'Las notificaciones estarán disponibles próximamente.',
    icon: 'notifications_none',
    color: 'primary',
  });
}
function irABuscar(): void {
  if (ruta.name === 'buscar') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  void enrutador.push({ name: 'buscar' });
}
onMounted(() => {
  actualizarEncabezado();
  window.addEventListener('scroll', actualizarEncabezado, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener('scroll', actualizarEncabezado));
watch(() => ruta.name, actualizarEncabezado);
</script>

<style scoped lang="scss">
.encabezado-principal {
  border-bottom: 1px solid var(--borde);
  background: rgb(255 255 255 / 96%);
  color: var(--texto-principal);
  backdrop-filter: blur(10px);
  transition: box-shadow 180ms ease;

  &__contenido {
    width: min(100%, 1200px);
    min-height: 104px;
    margin: 0 auto;
    padding: 8px 16px;
    transition: min-height 180ms ease;
  }

  &--compacto {
    box-shadow: 0 6px 22px rgb(20 50 34 / 10%);

    .encabezado-principal__contenido {
      min-height: 62px;
    }
    .encabezado-principal__buscar {
      opacity: 1;
      width: 40px;
      pointer-events: auto;
    }
    :deep(.marca-comarapa__simbolo) {
      width: 48px;
      height: 42px;
    }
    :deep(.marca-comarapa__lema) {
      display: none;
    }
  }

  &__acciones {
    display: flex;
    align-items: center;
    gap: 2px;
  }
  &__buscar {
    width: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
    transition: all 180ms ease;
  }
  &__notificaciones {
    margin-left: 3px;
    color: var(--verde-principal);
    background: transparent;
  }
}

.navegacion-escritorio {
  display: none;
  gap: 4px;

  &__activa {
    color: var(--verde-principal);
    background: var(--verde-claro);
  }
}

@media (min-width: 900px) {
  .navegacion-escritorio {
    display: flex;
  }
  .encabezado-principal__buscar {
    display: none;
  }
}
</style>
