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
          v-model="email"
          class="campo-formulario"
          label="Correo electrónico"
          type="email"
          autocomplete="email"
          outlined
          lazy-rules
          :disable="cargando"
          :rules="[
            (valor) => Boolean(valor) || 'El correo electrónico es obligatorio.',
            (valor) => validarEmail(valor) || 'Ingresa un correo electrónico válido.',
          ]"
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
import { registrar as solicitarRegistro } from 'src/services/servicioAutenticacion';
import { obtenerMensajeError } from 'src/services/servicioApi';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';

const enrutador = useRouter();
const nombre = ref('');
const email = ref('');
const contrasena = ref('');
const confirmacionContrasena = ref('');
const mostrarContrasena = ref(false);
const cargando = ref(false);
const error = ref('');
const autenticacion = useTiendaAutenticacion();

function validarEmail(valor: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

async function registrar(): Promise<void> {
  cargando.value = true;
  error.value = '';
  try {
    const sesion = await solicitarRegistro({
      nombre: nombre.value.trim(),
      email: email.value.trim().toLowerCase(),
      contrasena: contrasena.value,
      confirmacion_contrasena: confirmacionContrasena.value,
    });
    autenticacion.establecerSesion(sesion.usuario, sesion.token);
    await enrutador.replace({ name: 'inicio' });
  } catch (causa) {
    error.value = obtenerMensajeError(causa);
  } finally {
    cargando.value = false;
  }
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
</style>
