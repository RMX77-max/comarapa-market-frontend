<template>
  <q-form class="formulario-producto" @submit="guardar">
    <button
      v-if="vistasPrevias.length === 0"
      class="selector-imagen"
      type="button"
      @click="entradaImagen?.click()"
    >
      <span class="selector-imagen__vacio">
        <q-icon name="camera_alt" size="38px" />
        <strong>Agregar fotos</strong>
        <small>De 1 a 8 imágenes · JPG, PNG o WEBP</small>
      </span>
    </button>
    <div v-else class="galeria-imagenes">
      <q-img :src="vistasPrevias[0]" fit="cover" class="galeria-imagenes__principal" />
      <div class="galeria-imagenes__miniaturas">
        <q-img
          v-for="(vista, indice) in vistasPrevias.slice(1)"
          :key="`${vista}-${indice}`"
          :src="vista"
          fit="cover"
        />
        <button type="button" aria-label="Cambiar imágenes" @click="entradaImagen?.click()">
          <q-icon name="add_a_photo" size="26px" /><span>Cambiar</span>
        </button>
      </div>
    </div>
    <input
      ref="entradaImagen"
      class="entrada-oculta"
      type="file"
      multiple
      accept="image/jpeg,image/png,image/webp"
      @change="seleccionarImagen"
    />
    <p v-if="errorImagen" class="error-imagen">{{ errorImagen }}</p>

    <q-input
      v-model="titulo"
      class="campo-formulario"
      label="Título"
      outlined
      maxlength="150"
      lazy-rules
      :rules="[(v) => Boolean(v.trim()) || 'El título es obligatorio.']"
    />
    <q-input
      v-model.number="precio"
      class="campo-formulario"
      label="Precio (Bs)"
      type="number"
      min="0.01"
      step="0.01"
      outlined
      lazy-rules
      :rules="[(v) => Number(v) > 0 || 'El precio debe ser mayor que cero.']"
    />
    <selector-categoria v-model="categoriaId" :opciones="categorias" />
    <q-input
      v-model="descripcion"
      class="campo-formulario"
      label="Descripción"
      type="textarea"
      autogrow
      outlined
      maxlength="5000"
      lazy-rules
      :rules="[(v) => Boolean(v.trim()) || 'La descripción es obligatoria.']"
    />
    <q-input
      v-model="ubicacion"
      class="campo-formulario"
      label="Ubicación"
      outlined
      maxlength="150"
      lazy-rules
      :rules="[(v) => Boolean(v.trim()) || 'La ubicación es obligatoria.']"
    />

    <q-btn
      class="boton-principal full-width"
      color="primary"
      :label="etiquetaBoton"
      type="submit"
      unelevated
      :loading="guardando"
    />
  </q-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SelectorCategoria from './SelectorCategoria.vue';
import type { Categoria } from 'src/models/Categoria';
import type { Producto } from 'src/models/Producto';
import type { DatosFormularioProducto } from 'src/models/FormularioProducto';

const propiedades = withDefaults(
  defineProps<{
    categorias: Categoria[];
    producto?: Producto | null;
    etiquetaBoton?: string;
    guardando?: boolean;
  }>(),
  {
    producto: null,
    etiquetaBoton: 'Publicar',
    guardando: false,
  },
);
const emitir = defineEmits<{ guardar: [datos: DatosFormularioProducto] }>();

const titulo = ref(propiedades.producto?.titulo ?? '');
const precio = ref<number | null>(propiedades.producto?.precio ?? null);
const categoriaId = ref<number | null>(propiedades.producto?.categoria.id ?? null);
const descripcion = ref(propiedades.producto?.descripcion ?? '');
const ubicacion = ref(propiedades.producto?.ubicacion ?? 'Comarapa');
const vistasPrevias = ref<string[]>(
  propiedades.producto?.imagenes?.length
    ? propiedades.producto.imagenes
    : propiedades.producto?.url_imagen
      ? [propiedades.producto.url_imagen]
      : [],
);
const entradaImagen = ref<HTMLInputElement | null>(null);
const errorImagen = ref('');
const imagenes = ref<File[]>([]);

function seleccionarImagen(evento: Event): void {
  const archivos = Array.from((evento.target as HTMLInputElement).files ?? []);
  if (archivos.length === 0) return;

  if (archivos.length > 8) {
    errorImagen.value = 'Puedes agregar como máximo 8 imágenes.';
    return;
  }
  if (archivos.some((archivo) => archivo.size > 5 * 1024 * 1024)) {
    errorImagen.value = 'Cada imagen puede pesar como máximo 5 MB.';
    return;
  }

  imagenes.value = archivos;
  void Promise.all(
    archivos.map(
      (archivo) =>
        new Promise<string>((resolver) => {
          const lector = new FileReader();
          lector.addEventListener('load', () =>
            resolver(typeof lector.result === 'string' ? lector.result : ''),
          );
          lector.readAsDataURL(archivo);
        }),
    ),
  ).then((vistas) => {
    vistasPrevias.value = vistas.filter(Boolean);
    errorImagen.value = '';
  });
}

function guardar(): void {
  if (!precio.value || !categoriaId.value) return;
  if (!propiedades.producto && imagenes.value.length === 0) {
    errorImagen.value = 'Debes agregar al menos una imagen del producto.';
    return;
  }

  emitir('guardar', {
    titulo: titulo.value.trim(),
    precio: precio.value,
    categoria_id: categoriaId.value,
    descripcion: descripcion.value.trim(),
    ubicacion: ubicacion.value.trim(),
    ...(imagenes.value.length ? { imagenes: imagenes.value } : {}),
  });
}
</script>

<style scoped lang="scss">
.formulario-producto {
  display: grid;
  gap: 18px;
}

.galeria-imagenes {
  display: grid;
  gap: 10px;

  &__principal {
    height: 250px;
    border-radius: var(--radio-medio);
  }
  &__miniaturas {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  &__miniaturas .q-img,
  &__miniaturas button {
    height: 68px;
    border-radius: 12px;
  }
  &__miniaturas button {
    display: grid;
    border: 1px dashed var(--verde-secundario);
    background: var(--verde-claro);
    color: var(--verde-principal);
    cursor: pointer;
    place-items: center;
    align-content: center;
    font-size: 0.7rem;
  }
}

.selector-imagen {
  width: 100%;
  min-height: 240px;
  overflow: hidden;
  border: 1px dashed var(--verde-secundario);
  border-radius: var(--radio-medio);
  background: var(--verde-claro);
  color: var(--verde-principal);
  cursor: pointer;

  &__foto {
    height: 240px;
  }

  &__vacio {
    display: grid;
    gap: 6px;
    place-items: center;

    small {
      color: var(--texto-secundario);
      font-weight: 400;
    }
  }
}

@media (min-width: 720px) {
  .selector-imagen {
    min-height: 320px;
  }
  .selector-imagen__foto {
    height: 320px;
  }
  .galeria-imagenes__principal {
    height: 360px;
  }
}

.entrada-oculta {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.error-imagen {
  margin: -10px 0 0;
  color: var(--peligro);
  font-size: 0.75rem;
}
</style>
