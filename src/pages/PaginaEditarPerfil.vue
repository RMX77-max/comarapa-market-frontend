<template>
  <q-page class="contenedor-pagina">
    <div v-if="usuario" class="contenedor-formulario">
      <div class="row items-center q-gutter-sm q-mb-lg">
        <q-btn flat round icon="arrow_back" aria-label="Volver" @click="enrutador.back()" />
        <h1 class="titulo-pagina">Editar perfil</h1>
      </div>

      <q-form class="formulario-perfil" @submit="guardarPerfil">
        <button
          class="foto-perfil"
          type="button"
          aria-label="Cambiar foto"
          @click="entradaFoto?.click()"
        >
          <avatar-usuario :nombre="nombre || usuario.nombre" :url="vistaPrevia" tamano="92px" />
          <span><q-icon name="photo_camera" /> Cambiar foto</span>
        </button>
        <input
          ref="entradaFoto"
          class="entrada-foto"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          @change="seleccionarFoto"
        />
        <q-input
          v-model="nombre"
          class="campo-formulario"
          label="Nombre"
          outlined
          lazy-rules
          :rules="[(v) => Boolean(v.trim()) || 'El nombre es obligatorio.']"
        />
        <q-input
          v-model="ubicacion"
          class="campo-formulario"
          label="Ubicación"
          outlined
          lazy-rules
          :rules="[(v) => Boolean(v.trim()) || 'La ubicación es obligatoria.']"
        />
        <q-btn
          class="boton-principal"
          color="primary"
          label="Guardar cambios"
          type="submit"
          unelevated
          :loading="guardando"
        />
      </q-form>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import AvatarUsuario from 'components/AvatarUsuario.vue';
import { actualizarPerfil } from 'src/services/servicioPerfil';
import { obtenerMensajeError } from 'src/services/servicioApi';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';
import { useQuasar } from 'quasar';

const enrutador = useRouter();
const autenticacion = useTiendaAutenticacion();
const usuario = computed(() => autenticacion.usuario);
const nombre = ref(usuario.value?.nombre ?? '');
const ubicacion = ref(usuario.value?.ubicacion ?? 'Comarapa');
const vistaPrevia = ref<string | null>(usuario.value?.url_foto_perfil ?? null);
const entradaFoto = ref<HTMLInputElement | null>(null);
const guardando = ref(false);
const foto = ref<File>();
const q = useQuasar();

function seleccionarFoto(evento: Event): void {
  const archivo = (evento.target as HTMLInputElement).files?.[0];
  if (!archivo) return;
  if (archivo.size > 5 * 1024 * 1024) return;
  foto.value = archivo;

  const lector = new FileReader();
  lector.addEventListener('load', () => {
    vistaPrevia.value = typeof lector.result === 'string' ? lector.result : null;
  });
  lector.readAsDataURL(archivo);
}

async function guardarPerfil(): Promise<void> {
  if (!usuario.value) return;
  guardando.value = true;
  try {
    const actualizado = await actualizarPerfil({
      nombre: nombre.value.trim(),
      ubicacion: ubicacion.value.trim(),
      ...(foto.value ? { foto: foto.value } : {}),
    });
    autenticacion.actualizarUsuario(actualizado);
    await enrutador.replace({ name: 'perfil' });
  } catch (error) {
    q.notify({ type: 'negative', message: obtenerMensajeError(error) });
  } finally {
    guardando.value = false;
  }
}
</script>

<style scoped lang="scss">
.formulario-perfil {
  display: grid;
  gap: 18px;
}
.foto-perfil {
  display: grid;
  gap: 10px;
  justify-self: center;
  padding: 8px;
  border: 0;
  background: transparent;
  color: var(--verde-principal);
  cursor: pointer;
  place-items: center;
}
.foto-perfil span {
  font-size: 0.82rem;
  font-weight: 500;
}
.entrada-foto {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
