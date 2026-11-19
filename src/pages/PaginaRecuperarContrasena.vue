<template>
  <q-page class="pagina-autenticacion">
    <main class="tarjeta-autenticacion tarjeta-recuperacion">
      <header class="encabezado-autenticacion">
        <div class="icono-autenticacion" aria-hidden="true"><q-icon name="lock_reset" /></div>
        <h1 class="titulo-autenticacion">Recuperar contraseña</h1>
        <p class="subtitulo-autenticacion">
          Escribe tu celular para recibir un código por WhatsApp.
        </p>
      </header>

      <q-banner v-if="solicitud" class="aviso-recuperacion" rounded>
        <template #avatar><q-icon name="sms" /></template>
        Si el celular está registrado, recibirás un código por WhatsApp.
      </q-banner>

      <q-form v-if="!solicitud" class="formulario-recuperacion" @submit="enviar">
        <q-input
          v-model.trim="telefono"
          class="campo-formulario"
          label="Celular"
          prefix="+591"
          autocomplete="tel"
          inputmode="numeric"
          maxlength="8"
          outlined
          lazy-rules
          :disable="cargando"
          :rules="[(valor) => /^\d{8}$/.test(valor) || 'Ingresa los 8 dígitos de tu celular.']"
        >
          <template #prepend><q-icon name="phone_android" /></template>
        </q-input>

        <q-btn
          class="boton-principal full-width"
          type="submit"
          color="primary"
          unelevated
          no-caps
          label="Solicitar código"
          :loading="cargando"
        />
      </q-form>

      <div v-if="solicitud" class="acciones-recuperacion">
        <q-input
          v-model.trim="codigo"
          outlined
          inputmode="numeric"
          maxlength="6"
          label="Código de 6 dígitos"
          autocomplete="one-time-code"
        >
          <template #prepend><q-icon name="password" /></template>
        </q-input>
        <q-btn
          color="primary"
          unelevated
          no-caps
          label="Verificar código"
          :disable="codigo.length !== 6"
          :loading="cargando"
          @click="comprobar"
        />
        <q-btn flat no-caps color="primary" label="Usar otro número" @click="solicitud = null" />
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
import {
  solicitarRecuperacion,
  verificarCodigoRecuperacion,
  type RecuperacionManual,
} from 'src/services/servicioOperaciones';
import { obtenerMensajeError } from 'src/services/servicioApi';

const telefono = ref('');
const cargando = ref(false);
const solicitud = ref<RecuperacionManual | null>(null);
const codigo = ref('');
const q = useQuasar();

async function enviar(): Promise<void> {
  cargando.value = true;
  try {
    solicitud.value = await solicitarRecuperacion(`+591${telefono.value}`);
  } catch (error) {
    q.notify({ type: 'negative', message: obtenerMensajeError(error) });
  } finally {
    cargando.value = false;
  }
}
async function comprobar(): Promise<void> {
  if (!solicitud.value || codigo.value.length !== 6) return;
  cargando.value = true;
  try {
    await verificarCodigoRecuperacion(
      solicitud.value.solicitud_id,
      solicitud.value.secreto,
      codigo.value,
    );
    window.location.hash = `#/restablecer-contrasena?solicitud=${solicitud.value.solicitud_id}&secreto=${encodeURIComponent(solicitud.value.secreto)}`;
  } catch (e) {
    q.notify({ type: 'negative', message: obtenerMensajeError(e) });
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped lang="scss">
.tarjeta-recuperacion {
  max-width: 480px;
}
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
.acciones-recuperacion {
  display: grid;
  gap: 16px;
}
.aviso-recuperacion {
  margin-bottom: 18px;
  border: 1px solid var(--borde);
  color: var(--texto-principal);
  background: var(--fondo-secundario);
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.aviso-recuperacion :deep(.q-banner__avatar) {
  color: var(--coral);
}
.volver-autenticacion {
  margin-top: 12px;
  color: var(--texto-secundario);
}
@media (max-width: 480px) {
  .tarjeta-recuperacion {
    padding: 24px 20px;
  }
  .icono-autenticacion {
    width: 56px;
    height: 56px;
    margin-bottom: 14px;
    font-size: 30px;
  }
  .titulo-autenticacion {
    margin-top: 0;
    font-size: clamp(1.6rem, 8vw, 2rem);
    overflow-wrap: anywhere;
  }
  .subtitulo-autenticacion {
    font-size: 0.92rem;
    line-height: 1.5;
  }
}
</style>
