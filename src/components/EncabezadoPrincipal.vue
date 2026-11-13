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
          v-if="ruta.name !== 'inicio'"
          class="encabezado-principal__buscar"
          flat
          round
          icon="search"
          aria-label="Buscar"
          @click="irABuscar"
        />
        <boton-notificaciones
          class="encabezado-principal__notificaciones"
          ruta-todas="/notificaciones"
        />
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import MarcaComarapa from './MarcaComarapa.vue';
import { useRoute, useRouter } from 'vue-router';
import BotonNotificaciones from './BotonNotificaciones.vue';

const ruta = useRoute();
const enrutador = useRouter();
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
  border-bottom: 0;
  background: #004628;
  color: #fff;
  box-shadow: 0 8px 28px rgb(0 70 40 / 18%);
  backdrop-filter: blur(10px);
  transition: box-shadow 180ms ease;

  &__contenido {
    width: min(100%, 1200px);
    min-height: 72px;
    margin: 0 auto;
    padding: 4px 16px;
    transition: min-height 180ms ease;
  }

  :deep(.marca-comarapa__logo) {
    width: 205px;
    height: 48px;
  }

  &--compacto {
    box-shadow: 0 6px 22px rgb(0 70 40 / 10%);

    .encabezado-principal__contenido {
      min-height: 62px;
    }
    .encabezado-principal__buscar {
      opacity: 1;
      width: 40px;
      pointer-events: auto;
    }
    :deep(.marca-comarapa__logo) {
      width: 184px;
      height: 42px;
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
    color: #fff;
  }
  &__notificaciones {
    margin-left: 3px;
    color: #fff;
    background: transparent;
  }

  :deep(.encabezado-principal__notificaciones.q-btn) {
    color: #fff !important;
  }
}

.navegacion-escritorio {
  display: none;
  gap: 4px;

  &__activa {
    color: var(--coral);
    background: var(--coral-suave);
  }
}

@media (min-width: 900px) {
  .encabezado-principal {
    border: 0;
    border-radius: 0 0 14px 14px;
    &__contenido {
      width: min(100%, 1480px);
      min-height: 74px;
      padding-inline: 32px;
    }

    :deep(.marca-comarapa__logo) {
      width: 218px;
      height: 50px;
    }

    &__notificaciones {
      margin-left: 18px;
      padding-left: 18px;
      border-left: 1px solid rgb(255 255 255 / 30%);
      border-radius: 0;
      color: #fff;
    }
  }

  .navegacion-escritorio {
    display: flex;
    gap: 14px;

    .q-btn {
      min-height: 48px;
      padding-inline: 16px;
      border-radius: 12px;
      color: #fff;
    }

    &__activa {
      position: relative;
      background: rgb(255 255 255 / 10%);

      &::after {
        position: absolute;
        right: 14px;
        bottom: 0;
        left: 14px;
        height: 4px;
        border-radius: 4px 4px 0 0;
      background: var(--primario-claro);
        content: '';
      }
    }
  }
  .encabezado-principal__buscar {
    display: none;
  }
}
</style>
