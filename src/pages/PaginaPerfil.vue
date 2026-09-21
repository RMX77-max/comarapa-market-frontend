<template>
  <q-page class="contenedor-pagina">
    <div class="contenedor-formulario">
      <h1 class="titulo-pagina">Perfil</h1>

      <section v-if="usuario" class="perfil-resumen tarjeta-suave">
        <avatar-usuario :nombre="usuario.nombre" :url="usuario.url_foto_perfil" tamano="72px" />
        <div>
          <h2>{{ usuario.nombre }}</h2>
          <p><q-icon name="place" /> {{ usuario.ubicacion }}</p>
        </div>
        <q-btn
          color="primary"
          label="Editar perfil"
          outline
          no-caps
          :to="{ name: 'editar-perfil' }"
        />
      </section>

      <q-list class="opciones-perfil q-mt-lg" separator>
        <q-item clickable :to="{ name: 'mis-publicaciones' }">
          <q-item-section avatar><q-icon name="inventory_2" color="primary" /></q-item-section>
          <q-item-section>Mis publicaciones</q-item-section>
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
        <q-item clickable class="text-negative" @click="cerrarSesion">
          <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
          <q-item-section>Cerrar sesión</q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AvatarUsuario from 'components/AvatarUsuario.vue';
import { cerrarSesion as solicitarCierre } from 'src/services/servicioAutenticacion';
import { obtenerPerfil } from 'src/services/servicioPerfil';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';

const enrutador = useRouter();
const autenticacion = useTiendaAutenticacion();
const usuario = computed(() => autenticacion.usuario);

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
.perfil-resumen {
  display: grid;
  gap: 14px;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  margin-top: 22px;
  padding: 26px;
  text-align: left;

  .q-btn {
    grid-column: 1 / -1;
    width: 100%;
  }
}
.perfil-resumen h2 {
  margin: 0;
  font-size: 1.25rem;
}
.perfil-resumen p {
  margin: 4px 0 0;
  color: var(--texto-secundario);
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

@media (min-width: 600px) {
  .perfil-resumen {
    grid-template-columns: auto minmax(0, 1fr) auto;
    .q-btn {
      grid-column: auto;
      width: auto;
    }
  }
}
</style>
