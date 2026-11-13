<template>
  <q-page class="pagina-ajustes contenedor-pagina">
    <section class="ajustes-cabecera">
      <span>PERSONALIZACIÓN</span>
      <h1>Apariencia</h1>
      <p>Elige cómo quieres ver Comarapa Market en este dispositivo.</p>
    </section>

    <section class="selector-tema" aria-label="Seleccionar tema">
      <button
        v-for="opcion in opciones"
        :key="opcion.valor"
        type="button"
        class="selector-tema__opcion"
        :class="{ 'selector-tema__opcion--activa': preferencia === opcion.valor }"
        :aria-pressed="preferencia === opcion.valor"
        @click="establecerTema(opcion.valor)"
      >
        <span class="selector-tema__vista" :class="`selector-tema__vista--${opcion.valor}`" aria-hidden="true">
          <span class="selector-tema__barra"></span>
          <span class="selector-tema__panel"></span>
          <span class="selector-tema__panel selector-tema__panel--corto"></span>
        </span>
        <span class="selector-tema__detalle">
          <q-icon :name="opcion.icono" size="24px" />
          <span>
            <strong>{{ opcion.titulo }}</strong>
            <small>{{ opcion.descripcion }}</small>
          </span>
        </span>
        <q-icon
          class="selector-tema__marca"
          :name="preferencia === opcion.valor ? 'check_circle' : 'radio_button_unchecked'"
        />
      </button>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { useTema, type PreferenciaTema } from 'src/composables/useTema';

const { preferencia, establecerTema } = useTema();
const opciones: Array<{
  valor: PreferenciaTema;
  titulo: string;
  descripcion: string;
  icono: string;
}> = [
  { valor: 'claro', titulo: 'Claro', descripcion: 'Fondos luminosos y alto contraste.', icono: 'light_mode' },
  { valor: 'oscuro', titulo: 'Oscuro', descripcion: 'Más cómodo en ambientes con poca luz.', icono: 'dark_mode' },
  { valor: 'sistema', titulo: 'Automático', descripcion: 'Sigue la configuración del dispositivo.', icono: 'brightness_auto' },
];
</script>

<style scoped lang="scss">
.pagina-ajustes { max-width: 980px; }
.ajustes-cabecera span { color: var(--coral); font-size: .75rem; font-weight: 800; letter-spacing: .1em; }
.ajustes-cabecera h1 { margin: 4px 0; color: var(--azul-marino); font-size: clamp(1.8rem, 5vw, 2.7rem); }
.ajustes-cabecera p { margin: 0; color: var(--texto-secundario); }
.selector-tema { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 28px; }
.selector-tema__opcion {
  position: relative;
  display: grid;
  gap: 14px;
  padding: 12px;
  overflow: hidden;
  border: 1px solid var(--borde);
  border-radius: 20px;
  color: var(--texto-principal);
  background: var(--fondo);
  text-align: left;
  cursor: pointer;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}
.selector-tema__opcion:hover { border-color: var(--coral); box-shadow: var(--sombra-suave); transform: translateY(-2px); }
.selector-tema__opcion--activa { border-color: var(--coral); box-shadow: 0 0 0 2px rgb(64 153 81 / 18%), var(--sombra-suave); }
.selector-tema__vista {
  position: relative;
  display: block;
  height: 98px;
  overflow: hidden;
  border: 1px solid rgb(110 122 144 / 22%);
  border-radius: 13px;
  background: #fefaef;
}
.selector-tema__barra { display: block; height: 24px; background: #004628; }
.selector-tema__panel { position: absolute; top: 38px; left: 12px; width: 68%; height: 18px; border-radius: 6px; background: #fff; box-shadow: 0 4px 10px rgb(0 70 40 / 12%); }
.selector-tema__panel--corto { top: 66px; width: 43%; }
.selector-tema__vista--oscuro { background: #0b1812; }
.selector-tema__vista--oscuro .selector-tema__panel { background: #10241b; }
.selector-tema__vista--sistema { background: linear-gradient(90deg, #fefaef 0 50%, #0b1812 50%); }
.selector-tema__vista--sistema .selector-tema__panel { background: linear-gradient(90deg, #fff 0 56%, #10241b 56%); }
.selector-tema__detalle { display: flex; gap: 11px; align-items: center; padding: 0 5px 4px; }
.selector-tema__detalle > .q-icon { flex: 0 0 36px; width: 36px; height: 36px; border-radius: 11px; background: var(--coral-suave); color: var(--coral); }
.selector-tema__detalle > span { display: grid; min-width: 0; gap: 1px; }
.selector-tema__opcion strong { color: var(--texto-principal); font: 700 1rem var(--fuente-titulos); }
.selector-tema__opcion small { color: var(--texto-secundario); font-size: .78rem; line-height: 1.35; }
.selector-tema__marca { position: absolute; top: 20px; right: 20px; padding: 2px; border-radius: 50%; color: var(--coral); background: white; font-size: 22px; }
@media (max-width: 650px) {
  .selector-tema { grid-template-columns: 1fr; gap: 12px; margin-top: 22px; }
  .selector-tema__opcion { grid-template-columns: 112px minmax(0, 1fr); gap: 12px; align-items: center; }
  .selector-tema__vista { height: 76px; }
  .selector-tema__barra { height: 19px; }
  .selector-tema__panel { top: 30px; left: 9px; height: 14px; }
  .selector-tema__panel--corto { top: 53px; }
  .selector-tema__detalle { padding: 0; }
  .selector-tema__marca { top: 8px; right: 8px; }
}
</style>
