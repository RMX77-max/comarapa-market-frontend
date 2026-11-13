<template>
  <q-page class="pagina-autenticacion">
    <main class="tarjeta-autenticacion">
      <header class="encabezado-autenticacion">
        <marca-comarapa centrada />
        <h1 class="titulo-autenticacion">Bienvenido</h1>
        <p class="subtitulo-autenticacion">Inicia sesión para continuar</p>
      </header>

      <q-form class="column q-gutter-y-md" @submit="iniciarSesion">
        <q-banner v-if="error" class="bg-red-1 text-negative rounded-borders" role="alert">{{
          error
        }}</q-banner>
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
          <template #prepend>
            <q-icon name="mail_outline" size="20px" />
          </template>
        </q-input>

        <q-input
          v-model="contrasena"
          class="campo-formulario"
          label="Contraseña"
          :type="mostrarContrasena ? 'text' : 'password'"
          autocomplete="current-password"
          outlined
          lazy-rules
          :disable="cargando"
          :rules="[
            (valor) => Boolean(valor) || 'La contraseña es obligatoria.',
            (valor) => valor.length >= 8 || 'La contraseña debe tener al menos 8 caracteres.',
          ]"
        >
          <template #prepend>
            <q-icon name="lock_outline" size="20px" />
          </template>
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

        <q-btn
          class="boton-principal full-width"
          color="primary"
          label="Iniciar sesión"
          type="submit"
          unelevated
          :loading="cargando"
        />
        <q-btn
          class="boton-secundario full-width"
          color="primary"
          label="Crear cuenta"
          :to="{ name: 'registro' }"
          outline
          :disable="cargando"
        />
      </q-form>

    </main>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MarcaComarapa from 'components/MarcaComarapa.vue';
import { iniciarSesion as solicitarInicioSesion } from 'src/services/servicioAutenticacion';
import { obtenerMensajeError } from 'src/services/servicioApi';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';

const ruta = useRoute();
const enrutador = useRouter();
const email = ref('');
const contrasena = ref('');
const mostrarContrasena = ref(false);
const cargando = ref(false);
const error = ref('');
const autenticacion = useTiendaAutenticacion();

function validarEmail(valor: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

async function iniciarSesion(): Promise<void> {
  cargando.value = true;
  error.value = '';
  try {
    const sesion = await solicitarInicioSesion(email.value.trim().toLowerCase(), contrasena.value);
    autenticacion.establecerSesion(sesion.usuario, sesion.token);
    const redireccion = ruta.query.redireccion;
    const destino =
      typeof redireccion === 'string' && redireccion.startsWith('/') ? redireccion : '/inicio';
    await enrutador.replace(destino);
  } catch (causa) {
    error.value = obtenerMensajeError(causa);
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped lang="scss">
.texto-simulacion {
  margin: 22px 0 0;
  color: var(--texto-secundario);
  font-size: 0.75rem;
  line-height: 1.5;
  text-align: center;
}
</style>
