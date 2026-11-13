<template>
  <q-page class="pagina-autenticacion">
    <main class="tarjeta-autenticacion tarjeta-recuperacion">
      <header class="encabezado-autenticacion">
        <div class="icono-autenticacion" aria-hidden="true"><q-icon name="lock_reset" /></div>
        <h1 class="titulo-autenticacion">Recuperar contraseña</h1>
        <p class="subtitulo-autenticacion">
          Escribe el correo de tu cuenta y te enviaremos un enlace seguro para crear una nueva
          contraseña.
        </p>
      </header>

      <q-banner v-if="enviado" class="aviso-recuperacion" rounded>
        <template #avatar><q-icon name="mark_email_read" /></template>
        Si existe una cuenta con <strong>{{ correoEnviado }}</strong>, recibirás el enlace. Revisa
        también la carpeta de correo no deseado.
      </q-banner>

      <q-form v-else class="formulario-recuperacion" @submit="enviar">
        <q-input
          v-model.trim="email"
          class="campo-formulario"
          type="email"
          label="Correo electrónico"
          autocomplete="email"
          inputmode="email"
          outlined
          lazy-rules
          :disable="cargando"
          :rules="[
            (valor) => Boolean(valor) || 'Ingresa tu correo electrónico.',
            (valor) => validarEmail(valor) || 'Ingresa un correo electrónico válido.',
          ]"
        >
          <template #prepend><q-icon name="mail_outline" /></template>
        </q-input>

        <q-btn
          class="boton-principal full-width"
          type="submit"
          color="primary"
          unelevated
          no-caps
          label="Enviar enlace de recuperación"
          :loading="cargando"
        />
      </q-form>

      <div v-if="enviado" class="acciones-recuperacion">
        <q-btn
          class="boton-secundario full-width"
          outline
          no-caps
          color="primary"
          label="Usar otro correo"
          @click="enviado = false"
        />
      </div>

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
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { solicitarRecuperacion } from 'src/services/servicioOperaciones';
import { obtenerMensajeError } from 'src/services/servicioApi';

const email = ref('');
const correoEnviado = ref('');
const cargando = ref(false);
const enviado = ref(false);
const q = useQuasar();

function validarEmail(valor: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

async function enviar(): Promise<void> {
  cargando.value = true;
  try {
    correoEnviado.value = email.value.trim().toLowerCase();
    await solicitarRecuperacion(correoEnviado.value);
    enviado.value = true;
  } catch (error) {
    q.notify({ type: 'negative', message: obtenerMensajeError(error) });
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped lang="scss">
.tarjeta-recuperacion { max-width: 480px; }
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
.formulario-recuperacion,
.acciones-recuperacion { display: grid; gap: 16px; }
.aviso-recuperacion {
  margin-bottom: 18px;
  border: 1px solid var(--borde);
  color: var(--texto-principal);
  background: var(--fondo-secundario);
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.aviso-recuperacion :deep(.q-banner__avatar) { color: var(--coral); }
.volver-autenticacion { margin-top: 12px; color: var(--texto-secundario); }
@media (max-width: 480px) {
  .tarjeta-recuperacion { padding: 24px 20px; }
  .icono-autenticacion { width: 56px; height: 56px; margin-bottom: 14px; font-size: 30px; }
  .titulo-autenticacion { margin-top: 0; font-size: clamp(1.6rem, 8vw, 2rem); overflow-wrap: anywhere; }
  .subtitulo-autenticacion { font-size: .92rem; line-height: 1.5; }
}
</style>
