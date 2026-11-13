<template>
  <q-item
    clickable
    :to="{ name: rutaConversacion, params: { id: conversacion.id } }"
    class="elemento-conversacion"
  >
    <q-item-section avatar>
      <avatar-usuario
        :nombre="conversacion.otra_persona.nombre"
        :url="conversacion.otra_persona.url_foto_perfil"
      />
    </q-item-section>
    <q-item-section>
      <q-item-label class="text-weight-medium">{{ conversacion.otra_persona.nombre }}</q-item-label>
      <q-item-label class="elemento-conversacion__producto" lines="1">{{ conversacion.producto.titulo }}</q-item-label>
      <q-item-label caption lines="1">{{
        conversacion.ultimo_mensaje?.mensaje || 'Conversación iniciada'
      }}</q-item-label>
    </q-item-section>
    <q-item-section side top>
      <div class="elemento-conversacion__lateral">
        <q-img
          v-if="conversacion.producto.url_imagen"
          :src="conversacion.producto.url_imagen"
          :alt="conversacion.producto.titulo"
        />
        <span class="elemento-conversacion__fecha">{{
          formatearFechaCorta(conversacion.fecha_ultima_actividad)
        }}</span>
        <q-icon name="chevron_right" />
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AvatarUsuario from './AvatarUsuario.vue';
import type { Conversacion } from 'src/models/Conversacion';
import { formatearFechaCorta } from 'src/utils/formatearFecha';

defineProps<{ conversacion: Conversacion }>();
const ruta = useRoute();
const rutaConversacion = computed(() =>
  ruta.path.startsWith('/administracion/') ? 'administracion-mensajes-conversacion' : 'conversacion',
);
</script>

<style scoped lang="scss">
.elemento-conversacion {
  min-height: 92px;
  padding: 14px 6px;
  border-bottom: 1px solid var(--borde);

  &__fecha {
    color: var(--texto-secundario);
    font-size: 0.72rem;
  }
  &__producto { margin-top:2px; color:var(--azul-marino); font-size:.75rem; font-weight:600; }

  &__lateral {
    display: flex;
    gap: 8px;
    align-items: center;

    .q-img {
      width: 50px;
      height: 50px;
      border-radius: 10px;
    }
  }
}
</style>
