<template>
  <div class="selector-mapa">
    <div
      ref="contenedorMapa"
      class="selector-mapa__mapa"
      aria-label="Mapa para ajustar la ubicación"
    />
    <p><q-icon name="touch_app" /> Toca el mapa o arrastra el marcador para corregir el punto.</p>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import L, { type Map as MapaLeaflet, type Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const propiedades = defineProps<{ modelValue: string }>();
const emitir = defineEmits<{ 'update:modelValue': [valor: string] }>();
const contenedorMapa = ref<HTMLElement | null>(null);
let mapa: MapaLeaflet | null = null;
let marcador: Marker | null = null;

function coordenadasDesdeUrl(url: string): [number, number] | null {
  const coincidencia = url.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
  if (!coincidencia?.[1] || !coincidencia[2]) return null;
  const latitud = Number(coincidencia[1]);
  const longitud = Number(coincidencia[2]);
  return Number.isFinite(latitud) && Number.isFinite(longitud) ? [latitud, longitud] : null;
}

function guardar(latitud: number, longitud: number): void {
  emitir(
    'update:modelValue',
    `https://www.google.com/maps?q=${latitud.toFixed(7)},${longitud.toFixed(7)}`,
  );
}

function iniciarMapa(): void {
  const coordenadas = coordenadasDesdeUrl(propiedades.modelValue);
  if (!contenedorMapa.value || !coordenadas || mapa) return;

  mapa = L.map(contenedorMapa.value, { zoomControl: true }).setView(coordenadas, 17);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(mapa);

  const icono = L.divIcon({
    className: 'marcador-ubicacion',
    html: '<span class="material-icons">location_on</span>',
    iconSize: [40, 40],
    iconAnchor: [20, 38],
  });
  marcador = L.marker(coordenadas, { draggable: true, icon: icono }).addTo(mapa);
  marcador.on('dragend', () => {
    const posicion = marcador?.getLatLng();
    if (posicion) guardar(posicion.lat, posicion.lng);
  });
  mapa.on('click', ({ latlng }) => {
    marcador?.setLatLng(latlng);
    guardar(latlng.lat, latlng.lng);
  });
  window.setTimeout(() => mapa?.invalidateSize(), 100);
}

watch(
  () => propiedades.modelValue,
  async (url) => {
    const coordenadas = coordenadasDesdeUrl(url);
    if (!coordenadas) return;
    await nextTick();
    if (!mapa) iniciarMapa();
    else if (marcador) {
      marcador.setLatLng(coordenadas);
      mapa.setView(coordenadas, mapa.getZoom());
    }
  },
);

onMounted(() => void nextTick(iniciarMapa));
onBeforeUnmount(() => {
  mapa?.remove();
  mapa = null;
  marcador = null;
});
</script>

<style scoped lang="scss">
.selector-mapa {
  display: grid;
  gap: 8px;

  &__mapa {
    width: 100%;
    height: 250px;
    overflow: hidden;
    border: 1px solid var(--borde);
    border-radius: 14px;
    background: var(--fondo-suave);
    z-index: 0;
  }

  p {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    color: var(--texto-secundario);
    font-size: 0.78rem;
  }
}

:deep(.marcador-ubicacion) {
  color: var(--primario);
  font-size: 40px;
  filter: drop-shadow(0 2px 3px rgb(0 0 0 / 35%));
}

:deep(.leaflet-control-attribution) {
  font-size: 9px;
}

@media (max-width: 480px) {
  .selector-mapa__mapa {
    height: 220px;
  }
}
</style>
