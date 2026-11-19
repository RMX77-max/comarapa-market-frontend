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
      accept="image/*"
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
    <div class="fila-precios">
      <q-input
        v-model.number="precio"
        class="campo-formulario"
        label="Precio publicado (Bs)"
        type="number"
        min="0.01"
        step="0.01"
        outlined
        lazy-rules
        :rules="[(v) => Number(v) > 0 || 'Ingresa un precio válido.']"
      />
      <q-input
        v-model.number="precioMinimo"
        class="campo-formulario"
        label="Precio mínimo (Bs)"
        hint="Solo lo verá nuestro equipo."
        type="number"
        min="0.01"
        step="0.01"
        outlined
        lazy-rules
        :rules="[
          (v) => Number(v) > 0 || 'Ingresa un precio válido.',
          (v) => Number(v) <= Number(precio) || 'No puede superar el precio publicado.',
        ]"
      />
    </div>
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
      label="Ciudad o localidad"
      outlined
      maxlength="150"
      lazy-rules
      :rules="[(v) => Boolean(v.trim()) || 'La ubicación es obligatoria.']"
    />
    <q-input
      v-model="direccionRecoleccion"
      class="campo-formulario"
      label="Referencias para el recojo"
      hint="Ej.: casa blanca con reja negra, frente a la plaza. Solo la verá nuestro equipo."
      type="textarea"
      autogrow
      outlined
      maxlength="255"
      lazy-rules
      :rules="[(v) => Boolean(v.trim()) || 'La dirección de recojo es obligatoria.']"
    />
    <div class="captura-ubicacion" :class="{ 'captura-ubicacion--lista': ubicacionRecoleccionUrl }">
      <div class="captura-ubicacion__informacion">
        <q-icon :name="ubicacionRecoleccionUrl ? 'location_on' : 'my_location'" />
        <div>
          <strong>Ubicación exacta del recojo</strong>
          <span>{{ textoUbicacion }}</span>
        </div>
      </div>
      <q-btn
        color="primary"
        unelevated
        no-caps
        :icon="ubicacionRecoleccionUrl ? 'refresh' : 'my_location'"
        :label="ubicacionRecoleccionUrl ? 'Actualizar' : 'Obtener mi ubicación'"
        :loading="obteniendoUbicacion"
        type="button"
        @click="obtenerUbicacion"
      />
      <selector-ubicacion-mapa v-if="ubicacionRecoleccionUrl" v-model="ubicacionRecoleccionUrl" />
      <p v-if="errorUbicacion" class="captura-ubicacion__error">{{ errorUbicacion }}</p>
    </div>

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
import { computed, ref } from 'vue';
import SelectorCategoria from './SelectorCategoria.vue';
import SelectorUbicacionMapa from './SelectorUbicacionMapa.vue';
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
const precioMinimo = ref<number | null>(propiedades.producto?.precio_minimo ?? null);
const categoriaId = ref<number | null>(propiedades.producto?.categoria.id ?? null);
const descripcion = ref(propiedades.producto?.descripcion ?? '');
const ubicacion = ref(propiedades.producto?.ubicacion ?? 'Comarapa');
const direccionRecoleccion = ref(propiedades.producto?.direccion_recoleccion ?? '');
const ubicacionRecoleccionUrl = ref(propiedades.producto?.ubicacion_recoleccion_url ?? '');
const obteniendoUbicacion = ref(false);
const errorUbicacion = ref('');
const textoUbicacion = computed(() =>
  ubicacionRecoleccionUrl.value
    ? 'Ubicación guardada correctamente.'
    : 'Presiona el botón desde el lugar donde recogeremos el producto.',
);
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

function obtenerUbicacion(): void {
  errorUbicacion.value = '';
  if (!navigator.geolocation) {
    errorUbicacion.value = 'Este dispositivo no permite obtener la ubicación.';
    return;
  }

  obteniendoUbicacion.value = true;
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const latitud = coords.latitude.toFixed(7);
      const longitud = coords.longitude.toFixed(7);
      ubicacionRecoleccionUrl.value = `https://www.google.com/maps?q=${latitud},${longitud}`;
      obteniendoUbicacion.value = false;
    },
    (error) => {
      const mensajes: Record<number, string> = {
        1: 'Debes permitir el acceso a tu ubicación para continuar.',
        2: 'No pudimos determinar tu ubicación. Activa el GPS e inténtalo nuevamente.',
        3: 'La ubicación tardó demasiado. Inténtalo nuevamente en un lugar con mejor señal.',
      };
      errorUbicacion.value = mensajes[error.code] ?? 'No fue posible obtener tu ubicación.';
      obteniendoUbicacion.value = false;
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
  );
}

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
  if (!precio.value || !precioMinimo.value || !categoriaId.value) return;
  if (!propiedades.producto && imagenes.value.length === 0) {
    errorImagen.value = 'Debes agregar al menos una imagen del producto.';
    return;
  }
  if (!ubicacionRecoleccionUrl.value) {
    errorUbicacion.value = 'Obtén la ubicación exacta del recojo antes de publicar.';
    return;
  }

  emitir('guardar', {
    titulo: titulo.value.trim(),
    precio: precio.value,
    precio_minimo: precioMinimo.value,
    categoria_id: categoriaId.value,
    descripcion: descripcion.value.trim(),
    ubicacion: ubicacion.value.trim(),
    direccion_recoleccion: direccionRecoleccion.value.trim(),
    ubicacion_recoleccion_url: ubicacionRecoleccionUrl.value.trim(),
    ...(imagenes.value.length ? { imagenes: imagenes.value } : {}),
  });
}
</script>

<style scoped lang="scss">
.formulario-producto {
  display: grid;
  gap: 18px;
}

.fila-precios {
  display: grid;
  gap: 18px;
}

@media (min-width: 600px) {
  .fila-precios {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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

.captura-ubicacion {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--borde);
  border-radius: var(--radio-medio);
  background: var(--fondo);

  &--lista {
    border-color: color-mix(in srgb, var(--primario) 55%, var(--borde));
    background: color-mix(in srgb, var(--primario) 6%, var(--fondo));
  }

  &__informacion {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__informacion > .q-icon {
    color: var(--primario);
    font-size: 30px;
  }

  &__informacion > div {
    display: grid;
    gap: 3px;
  }

  &__informacion strong {
    color: var(--texto-principal);
  }

  &__informacion span {
    color: var(--texto-secundario);
    font-size: 0.82rem;
    line-height: 1.35;
  }

  &__error {
    margin: 0;
    color: var(--peligro);
    font-size: 0.78rem;
  }
}
</style>
