<template>
  <q-page class="pagina-autenticacion">
    <main class="tarjeta-autenticacion tarjeta-restablecimiento">
      <header class="encabezado-autenticacion">
        <div class="icono-autenticacion" aria-hidden="true"><q-icon name="password" /></div>
        <h1 class="titulo-autenticacion">Crea una nueva contraseña</h1>
        <p class="subtitulo-autenticacion">Debe tener al menos 8 caracteres.</p>
      </header>

      <q-banner v-if="!enlaceCompleto" class="bg-red-1 text-negative rounded-borders" role="alert">
        El enlace de recuperación está incompleto. Solicita uno nuevo para continuar.
      </q-banner>

      <q-form v-else class="formulario-restablecimiento" @submit="guardar">
        <q-input
          v-model="clave"
          class="campo-formulario"
          :type="mostrarClave ? 'text' : 'password'"
          outlined
          label="Contraseña nueva"
          autocomplete="new-password"
          lazy-rules
          :disable="cargando"
          :rules="[
            (valor) => Boolean(valor) || 'Ingresa una contraseña.',
            (valor) => valor.length >= 8 || 'Debe tener al menos 8 caracteres.',
          ]"
        >
          <template #prepend><q-icon name="lock_outline" /></template>
          <template #append>
            <q-btn
              flat
              round
              dense
              :icon="mostrarClave ? 'visibility_off' : 'visibility'"
              :aria-label="mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="mostrarClave = !mostrarClave"
            />
          </template>
        </q-input>

        <q-input
          v-model="confirmacion"
          class="campo-formulario"
          :type="mostrarClave ? 'text' : 'password'"
          outlined
          label="Confirmar contraseña"
          autocomplete="new-password"
          lazy-rules
          :disable="cargando"
          :rules="[
            (valor) => Boolean(valor) || 'Confirma la contraseña.',
            (valor) => valor === clave || 'Las contraseñas no coinciden.',
          ]"
        >
          <template #prepend><q-icon name="lock_outline" /></template>
        </q-input>

        <q-btn
          class="boton-principal full-width"
          type="submit"
          color="primary"
          unelevated
          no-caps
          label="Guardar nueva contraseña"
          :loading="cargando"
        />
      </q-form>

      <q-btn
        class="volver-autenticacion full-width"
        flat
        no-caps
        icon="arrow_back"
        label="Volver a iniciar sesión"
        :to="{ name: 'iniciar-sesion' }"
      />
    </main>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { restablecerContrasena } from 'src/services/servicioOperaciones';
import { obtenerMensajeError } from 'src/services/servicioApi';

const clave = ref('');
const confirmacion = ref('');
const cargando = ref(false);
const mostrarClave = ref(false);
const q = useQuasar();
const ruta = useRoute();
const router = useRouter();
const enlaceCompleto = computed(() => Boolean(ruta.query.email && ruta.query.token));

async function guardar(): Promise<void> {
  cargando.value = true;
  try {
    await restablecerContrasena({
      email: String(ruta.query.email || ''),
      token: String(ruta.query.token || ''),
      contrasena: clave.value,
      contrasena_confirmation: confirmacion.value,
    });
    q.notify({ type: 'positive', message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
    await router.replace({ name: 'iniciar-sesion' });
  } catch (error) {
    q.notify({ type: 'negative', message: obtenerMensajeError(error) });
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped lang="scss">
.tarjeta-restablecimiento { max-width: 480px; }
.icono-autenticacion {
  display: grid;
  width: 64px;
  height: 64px;
  margin: 0 auto 18px;
  border-radius: 20px;
  color: var(--coral);
  background: var(--coral-suave);
  font-size: 34px;
  place-items: center;
}
.formulario-restablecimiento { display: grid; gap: 16px; }
.volver-autenticacion { margin-top: 12px; color: var(--texto-secundario); }
@media (max-width: 480px) {
  .tarjeta-restablecimiento { padding: 24px 20px; }
  .icono-autenticacion { width: 56px; height: 56px; margin-bottom: 14px; font-size: 30px; }
  .titulo-autenticacion { margin-top: 0; font-size: clamp(1.55rem, 7.5vw, 1.95rem); overflow-wrap: anywhere; }
}
</style>
