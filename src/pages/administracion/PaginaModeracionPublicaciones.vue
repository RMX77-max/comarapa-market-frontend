<template>
  <q-page class="pagina-moderacion">
    <header class="cabecera-moderacion">
      <div><p>Control de contenido</p><h1>Publicaciones</h1><span>Revisa lo que se muestra en Comarapa Market.</span></div>
      <q-icon name="fact_check" />
    </header>

    <section class="filtros-moderacion">
      <q-input v-model="buscar" outlined dense clearable debounce="400" placeholder="Producto, vendedor o correo" @update:model-value="reiniciarYCargar">
        <template #prepend><q-icon name="search" /></template>
      </q-input>
      <q-select v-model="estado" outlined dense emit-value map-options :options="opcionesEstado" label="Estado" @update:model-value="reiniciarYCargar" />
    </section>

    <estado-contenido v-if="cargando" tipo="cargando" />
    <estado-contenido v-else-if="error" tipo="error" :mensaje="error" etiqueta-accion="Reintentar" @accion="cargar" />
    <estado-contenido v-else-if="!productos.length" tipo="vacio" titulo="No hay publicaciones" mensaje="No existen publicaciones para este filtro." />

    <section v-else class="lista-moderacion">
      <article v-for="producto in productos" :key="producto.id" class="publicacion-moderacion">
        <q-img class="publicacion-moderacion__imagen" :src="producto.url_imagen || ''" :ratio="4/3" />
        <div class="publicacion-moderacion__datos">
          <div class="publicacion-moderacion__encabezado">
            <div><h2>{{ producto.titulo }}</h2><strong>{{ formatearPrecio(producto.precio) }}</strong></div>
            <q-badge :color="colorEstado(producto.estado_moderacion)" :label="etiquetaEstado(producto.estado_moderacion)" />
          </div>
          <p>{{ producto.descripcion }}</p>
          <div class="publicacion-moderacion__meta">
            <span><q-icon name="person" /> {{ producto.vendedor.nombre }}</span>
            <span><q-icon name="category" /> {{ producto.categoria.nombre }}</span>
            <span><q-icon name="place" /> {{ producto.ubicacion }}</span>
          </div>
          <q-banner v-if="producto.motivo_moderacion" dense class="motivo-actual">
            <b>Motivo actual:</b> {{ producto.motivo_moderacion }}
          </q-banner>
          <div class="acciones-moderacion">
            <q-btn outline no-caps color="primary" icon="payments" label="Gestionar precios" @click="abrirPrecios(producto)" />
            <q-btn unelevated no-caps color="primary" icon="check_circle" label="Aprobar" @click="confirmar(producto, 'aprobada')" />
            <q-btn outline no-caps color="blue-8" icon="edit_note" label="Pedir cambios" @click="abrirMotivo(producto, 'correccion')" />
            <q-btn outline no-caps color="negative" icon="cancel" label="Rechazar" @click="abrirMotivo(producto, 'rechazada')" />
            <q-btn v-if="producto.estado_moderacion === 'aprobada'" flat no-caps color="negative" icon="visibility_off" label="Ocultar" @click="abrirMotivo(producto, 'oculta')" />
          </div>
        </div>
      </article>
    </section>

    <q-pagination v-if="paginacion.ultima_pagina > 1" v-model="pagina" class="paginacion" color="primary" :max="paginacion.ultima_pagina" @update:model-value="cargar" />

    <q-dialog v-model="dialogoMotivo">
      <q-card class="dialogo-moderacion">
        <q-card-section><h3>{{ tituloDialogo }}</h3><p>Explica claramente el motivo para mantener un historial útil.</p></q-card-section>
        <q-card-section><q-input v-model="motivo" outlined autogrow maxlength="1000" counter label="Motivo" autofocus /></q-card-section>
        <q-card-actions align="right"><q-btn flat no-caps label="Cancelar" v-close-popup /><q-btn unelevated no-caps color="primary" label="Guardar decisión" :disable="!motivo.trim()" :loading="guardando" @click="guardarConMotivo" /></q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="dialogoPrecios"><q-card class="dialogo-moderacion"><q-card-section><h3>Gestión de precios</h3><p>La propuesta del vendedor es Bs {{productoSeleccionado?.precio_solicitado ?? productoSeleccionado?.precio}}.</p></q-card-section><q-card-section class="column q-gutter-md"><q-input v-model.number="precioPublico" outlined type="number" prefix="Bs" label="Precio público"/><q-input v-model.number="precioMinimo" outlined type="number" prefix="Bs" label="Precio mínimo autorizado (interno)"/><q-input v-model.number="comision" outlined type="number" prefix="Bs" label="Comisión o margen (interno)"/><q-input v-model.number="precioFinal" outlined type="number" prefix="Bs" label="Precio final acordado (opcional)"/></q-card-section><q-card-actions align="right"><q-btn flat label="Cancelar" v-close-popup/><q-btn color="primary" label="Guardar precios" unelevated :loading="guardando" @click="guardarPrecios"/></q-card-actions></q-card></q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import EstadoContenido from 'components/EstadoContenido.vue';
import type { Paginacion } from 'src/models/Api';
import type { EstadoModeracion, Producto } from 'src/models/Producto';
import { actualizarPreciosPublicacion, listarPublicacionesModeracion, moderarPublicacion } from 'src/services/servicioAdministracion';
import { obtenerMensajeError } from 'src/services/servicioApi';
import { formatearPrecio } from 'src/utils/formatearPrecio';

type Decision = Exclude<EstadoModeracion, 'pendiente'>;
const q = useQuasar();
const productos = ref<Producto[]>([]);
const cargando = ref(true);
const guardando = ref(false);
const error = ref('');
const buscar = ref('');
const estado = ref<EstadoModeracion | ''>('pendiente');
const pagina = ref(1);
const paginacion = ref<Paginacion>({ pagina_actual: 1, ultima_pagina: 1, por_pagina: 12, total: 0 });
const dialogoMotivo = ref(false);
const motivo = ref('');
const productoSeleccionado = ref<Producto | null>(null);
const decision = ref<Decision>('rechazada');
const dialogoPrecios=ref(false),precioPublico=ref<number|null>(null),precioMinimo=ref<number|null>(null),comision=ref<number|null>(null),precioFinal=ref<number|null>(null);
const opcionesEstado = [
  { label: 'Todas', value: '' }, { label: 'Pendientes', value: 'pendiente' },
  { label: 'Aprobadas', value: 'aprobada' }, { label: 'Rechazadas', value: 'rechazada' },
  { label: 'Requieren cambios', value: 'correccion' }, { label: 'Ocultas', value: 'oculta' },
];
let temporizador: ReturnType<typeof setInterval> | undefined;
const tituloDialogo = computed(() => ({ rechazada: 'Rechazar publicación', correccion: 'Solicitar cambios', oculta: 'Ocultar publicación', aprobada: 'Aprobar publicación' }[decision.value]));

function etiquetaEstado(valor: EstadoModeracion): string { return opcionesEstado.find((item) => item.value === valor)?.label || valor; }
function colorEstado(valor: EstadoModeracion): string { return ({ pendiente: 'orange-8', aprobada: 'positive', rechazada: 'negative', correccion: 'blue-8', oculta: 'grey-8' }[valor]); }
async function cargar(): Promise<void> {
  cargando.value = true; error.value = '';
  try {
    const resultado = await listarPublicacionesModeracion({ pagina: pagina.value, estado: estado.value, ...(buscar.value?.trim() && { buscar: buscar.value.trim() }) });
    productos.value = resultado.productos; paginacion.value = resultado.paginacion;
  } catch (excepcion) { error.value = obtenerMensajeError(excepcion); }
  finally { cargando.value = false; }
}
function reiniciarYCargar(): void { pagina.value = 1; void cargar(); }
function abrirMotivo(producto: Producto, nuevaDecision: Decision): void { productoSeleccionado.value = producto; decision.value = nuevaDecision; motivo.value = ''; dialogoMotivo.value = true; }
function abrirPrecios(producto:Producto):void{productoSeleccionado.value=producto;precioPublico.value=producto.precio;precioMinimo.value=producto.precio_minimo??null;comision.value=producto.comision??null;precioFinal.value=producto.precio_final??null;dialogoPrecios.value=true;}
async function guardarPrecios():Promise<void>{if(!productoSeleccionado.value||!precioPublico.value)return;guardando.value=true;try{await actualizarPreciosPublicacion(productoSeleccionado.value.id,{precio_publico:precioPublico.value,precio_minimo:precioMinimo.value,comision:comision.value,precio_final:precioFinal.value});dialogoPrecios.value=false;q.notify({type:'positive',message:'Precios actualizados.'});await cargar()}catch(e){q.notify({type:'negative',message:obtenerMensajeError(e)})}finally{guardando.value=false}}
async function confirmar(producto: Producto, nuevaDecision: Decision): Promise<void> { await ejecutarModeracion(producto, nuevaDecision); }
async function guardarConMotivo(): Promise<void> { if (productoSeleccionado.value && motivo.value.trim()) await ejecutarModeracion(productoSeleccionado.value, decision.value, motivo.value.trim()); }
async function ejecutarModeracion(producto: Producto, nuevaDecision: Decision, nuevoMotivo?: string): Promise<void> {
  guardando.value = true;
  try { await moderarPublicacion(producto.id, nuevaDecision, nuevoMotivo); dialogoMotivo.value = false; q.notify({ type: 'positive', message: 'Decisión guardada correctamente.' }); await cargar(); }
  catch (excepcion) { q.notify({ type: 'negative', message: obtenerMensajeError(excepcion) }); }
  finally { guardando.value = false; }
}
onMounted(() => { void cargar(); temporizador = setInterval(() => void cargar(), 20000); });
onBeforeUnmount(() => { if (temporizador) clearInterval(temporizador); });
</script>

<style scoped lang="scss">
.pagina-moderacion { width: min(100%, 1180px); margin: 0 auto; padding: clamp(20px, 4vw, 42px); }
.cabecera-moderacion { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.cabecera-moderacion p, .cabecera-moderacion h1, .cabecera-moderacion span { margin: 0; }
.cabecera-moderacion p { color: var(--verde-principal); font-weight: 600; }
.cabecera-moderacion h1 { margin: 3px 0; font-size: clamp(1.7rem, 4vw, 2.5rem); }
.cabecera-moderacion > .q-icon { color: var(--verde-principal); font-size: 4.5rem; opacity: .14; }
.filtros-moderacion { display: grid; grid-template-columns: minmax(0, 1fr) minmax(190px, 280px); gap: 12px; margin-bottom: 20px; }
.lista-moderacion { display: grid; gap: 15px; }
.publicacion-moderacion { display: grid; grid-template-columns: 190px minmax(0, 1fr); overflow: hidden; border: 1px solid var(--borde); border-radius: 18px; background: var(--fondo); box-shadow: var(--sombra-suave); }
.publicacion-moderacion__imagen { height: 100%; min-height: 210px; }
.publicacion-moderacion__datos { min-width: 0; padding: 18px; }
.publicacion-moderacion__encabezado { display: flex; gap: 12px; align-items: start; justify-content: space-between; }
.publicacion-moderacion h2 { margin: 0; font-size: 1.15rem; }
.publicacion-moderacion strong { color: var(--verde-principal); }
.publicacion-moderacion p { display: -webkit-box; margin: 10px 0; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.publicacion-moderacion__meta { display: flex; flex-wrap: wrap; gap: 8px 16px; color: var(--texto-secundario); font-size: .8rem; }
.motivo-actual { margin-top: 12px; border-radius: 10px; background: var(--coral-suave); }
.acciones-moderacion { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.paginacion { margin-top: 24px; justify-content: center; }
.dialogo-moderacion { width: min(92vw, 540px); border-radius: 18px; }
.dialogo-moderacion h3, .dialogo-moderacion p { margin: 0; }
.dialogo-moderacion p { margin-top: 5px; color: var(--texto-secundario); }
@media (max-width: 650px) {
  .filtros-moderacion { grid-template-columns: 1fr; }
  .cabecera-moderacion > .q-icon { display: none; }
  .publicacion-moderacion { grid-template-columns: 105px minmax(0, 1fr); }
  .publicacion-moderacion__imagen { min-height: 100%; }
  .publicacion-moderacion__datos { padding: 13px; }
  .acciones-moderacion .q-btn { flex: 1 1 145px; }
}
</style>
