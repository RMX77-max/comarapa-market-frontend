<template>
  <q-page class="pagina-autenticacion">
    <main class="tarjeta-autenticacion">
      <header class="encabezado-autenticacion">
        <marca-comarapa centrada />
        <h1 class="titulo-autenticacion">Crear cuenta</h1>
        <p class="subtitulo-autenticacion">Publica y encuentra productos cerca de ti</p>
      </header>

      <q-form class="column q-gutter-y-md" @submit="registrar">
        <q-banner v-if="error" class="bg-red-1 text-negative rounded-borders" role="alert">{{
          error
        }}</q-banner>
        <q-input
          v-model="nombre"
          class="campo-formulario"
          label="Nombre"
          autocomplete="name"
          outlined
          lazy-rules
          :disable="cargando"
          :rules="[(valor) => Boolean(valor.trim()) || 'El nombre es obligatorio.']"
        >
          <template #prepend><q-icon name="person_outline" size="20px" /></template>
        </q-input>

        <q-input
          v-model="telefono"
          class="campo-formulario"
          label="Celular"
          prefix="+591"
          inputmode="numeric"
          maxlength="8"
          autocomplete="tel"
          outlined
          lazy-rules
          :disable="cargando"
          :rules="[(valor) => /^\d{8}$/.test(valor) || 'Ingresa los 8 dígitos de tu celular.']"
        >
          <template #prepend><q-icon name="phone_android" size="20px" /></template>
        </q-input>

        <q-input
          v-model="email"
          class="campo-formulario"
          label="Correo electrónico (opcional)"
          type="email"
          autocomplete="email"
          outlined
          lazy-rules
          :disable="cargando"
          :rules="[(valor) => !valor || validarEmail(valor) || 'Ingresa un correo válido.']"
        >
          <template #prepend><q-icon name="mail_outline" size="20px" /></template>
        </q-input>

        <q-input
          v-model="contrasena"
          class="campo-formulario"
          label="Contraseña"
          :type="mostrarContrasena ? 'text' : 'password'"
          autocomplete="new-password"
          outlined
          lazy-rules
          :disable="cargando"
          :rules="[
            (valor) => Boolean(valor) || 'La contraseña es obligatoria.',
            (valor) => valor.length >= 8 || 'La contraseña debe tener al menos 8 caracteres.',
          ]"
        >
          <template #prepend><q-icon name="lock_outline" size="20px" /></template>
          <template #append>
            <q-btn
              :aria-label="mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              :icon="mostrarContrasena ? 'visibility_off' : 'visibility'"
              flat
              round
              dense
              @click="mostrarContrasena = !mostrarContrasena"
            />
          </template>
        </q-input>

        <q-input
          v-model="confirmacionContrasena"
          class="campo-formulario"
          label="Confirmar contraseña"
          :type="mostrarContrasena ? 'text' : 'password'"
          autocomplete="new-password"
          outlined
          lazy-rules
          :disable="cargando"
          :rules="[
            (valor) => Boolean(valor) || 'Debes confirmar la contraseña.',
            (valor) => valor === contrasena || 'Las contraseñas no coinciden.',
          ]"
        >
          <template #prepend><q-icon name="lock_outline" size="20px" /></template>
        </q-input>

        <q-btn
          class="boton-principal full-width"
          color="primary"
          label="Crear cuenta"
          type="submit"
          unelevated
          :loading="cargando"
        />
      </q-form>

      <q-dialog v-model="mostrarVerificacion" persistent>
        <q-card class="tarjeta-verificacion">
          <q-card-section
            ><h2>Verifica tu celular</h2>
            <p>
              Recibirás un código por WhatsApp cuando administración atienda tu solicitud.
            </p></q-card-section
          >
          <q-card-section
            ><q-input
              v-model.trim="codigoVerificacion"
              outlined
              inputmode="numeric"
              maxlength="6"
              autocomplete="one-time-code"
              label="Código de 6 dígitos"
          /></q-card-section>
          <q-card-actions vertical
            ><q-btn
              color="primary"
              no-caps
              label="Confirmar código"
              :disable="codigoVerificacion.length !== 6"
              :loading="cargando"
              unelevated
              @click="confirmarCodigoRegistro" /><q-btn
              flat
              color="primary"
              no-caps
              label="Continuar más tarde"
              @click="continuar"
          /></q-card-actions>
        </q-card>
      </q-dialog>

      <p class="enlace-sesion">
        ¿Ya tienes una cuenta?
        <router-link :to="{ name: 'iniciar-sesion' }">Iniciar sesión</router-link>
      </p>
    </main>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MarcaComarapa from 'components/MarcaComarapa.vue';
import {
  confirmarVerificacionTelefono,
  registrar as solicitarRegistro,
  solicitarVerificacionTelefono,
  type SolicitudVerificacionTelefono,
} from 'src/services/servicioAutenticacion';
import { obtenerMensajeError } from 'src/services/servicioApi';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';

const enrutador = useRouter();
const nombre = ref('');
const email = ref('');
const telefono = ref('');
const contrasena = ref('');
const confirmacionContrasena = ref('');
const mostrarContrasena = ref(false);
const cargando = ref(false);
const error = ref('');
const autenticacion = useTiendaAutenticacion();
const mostrarVerificacion = ref(false);
const solicitudVerificacion = ref<SolicitudVerificacionTelefono | null>(null);
const codigoVerificacion = ref('');

function validarEmail(valor: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

async function registrar(): Promise<void> {
  cargando.value = true;
  error.value = '';
  try {
    const sesion = await solicitarRegistro({
      nombre: nombre.value.trim(),
      telefono: `+591${telefono.value}`,
      ...(email.value.trim() ? { email: email.value.trim().toLowerCase() } : {}),
      contrasena: contrasena.value,
      confirmacion_contrasena: confirmacionContrasena.value,
    });
    autenticacion.establecerSesion(sesion.usuario, sesion.token);
    solicitudVerificacion.value = await solicitarVerificacionTelefono(`+591${telefono.value}`);
    mostrarVerificacion.value = true;
  } catch (causa) {
    error.value = obtenerMensajeError(causa);
  } finally {
    cargando.value = false;
  }
}
async function confirmarCodigoRegistro(): Promise<void> {
  if (!solicitudVerificacion.value) return;
  cargando.value = true;
  try {
    await confirmarVerificacionTelefono(
      solicitudVerificacion.value.solicitud_id,
      codigoVerificacion.value,
    );
    await continuar();
  } catch (causa) {
    error.value = obtenerMensajeError(causa);
  } finally {
    cargando.value = false;
  }
}
async function continuar(): Promise<void> {
  mostrarVerificacion.value = false;
  await enrutador.replace({ name: 'inicio' });
}
</script>

<style scoped lang="scss">
.enlace-sesion {
  margin: 24px 0 0;
  color: var(--texto-secundario);
  text-align: center;

  a {
    margin-left: 4px;
    font-weight: 600;
  }
}
.tarjeta-verificacion {
  width: min(92vw, 420px);
  padding: 12px;
  text-align: center;
}
.tarjeta-verificacion h2 {
  margin: 0 0 8px;
}
.tarjeta-verificacion strong {
  display: block;
  margin: 18px;
  font-size: 2rem;
  letter-spacing: 0.2em;
}
</style>
