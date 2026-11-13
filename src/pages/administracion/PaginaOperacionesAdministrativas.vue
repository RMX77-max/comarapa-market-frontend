<template>
  <q-page class="ops">
    <header class="encabezado-ops">
      <div><span>ADMINISTRACIÓN</span><h1>Centro de operaciones</h1><p>Soporte, ventas, caja y configuración de cobros.</p></div>
      <q-btn flat round icon="refresh" aria-label="Actualizar" :loading="cargando" @click="cargar" />
    </header>

    <nav class="navegacion-modulos" aria-label="Secciones de operaciones">
      <button v-for="opcion in opciones" :key="opcion.nombre" type="button" :class="{ activo: tab === opcion.nombre }" @click="seleccionarTab(opcion.nombre)">
        <q-icon :name="opcion.icono" size="25px" />
        <span><strong>{{ opcion.etiqueta }}</strong><small>{{ opcion.descripcion }}</small></span>
        <q-badge v-if="opcion.total !== undefined" rounded color="primary" :label="opcion.total" />
      </button>
    </nav>

    <q-banner v-if="error" class="bg-red-1 text-negative q-mb-md rounded-borders">{{ error }}<template #action><q-btn flat label="Reintentar" @click="cargar" /></template></q-banner>

    <q-tab-panels v-model="tab" animated class="panel-operaciones">
      <q-tab-panel name="soporte">
        <div v-if="!soporte.length && !cargando" class="vacio">No hay solicitudes de soporte.</div>
        <q-list v-else bordered separator>
          <q-item v-for="solicitud in soporte" :key="solicitud.id">
            <q-item-section avatar><q-avatar color="blue-1" text-color="secondary" icon="support_agent" /></q-item-section>
            <q-item-section><q-item-label class="text-weight-bold">{{ solicitud.asunto }}</q-item-label><q-item-label caption>{{ solicitud.usuario?.name }} · {{ solicitud.usuario?.email }}</q-item-label><q-item-label v-if="solicitud.producto" class="producto-vinculado"><q-icon name="inventory_2" /> {{ solicitud.producto.titulo }}</q-item-label><q-item-label class="q-mt-xs">{{ solicitud.mensaje }}</q-item-label><q-item-label v-if="solicitud.respuesta" caption class="respuesta-admin">Respuesta: {{ solicitud.respuesta }}</q-item-label></q-item-section>
            <q-item-section side><q-badge color="primary" :label="solicitud.estado" /><q-btn class="q-mt-sm" unelevated color="primary" icon="reply" label="Responder" @click="responderSoporte(solicitud)" /></q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>

      <q-tab-panel name="reportes">
        <div v-if="!reportes.length && !cargando" class="vacio">No hay reportes pendientes.</div>
        <q-list v-else bordered separator><q-item v-for="reporte in reportes" :key="reporte.id"><q-item-section avatar><q-avatar color="red-1" text-color="negative" icon="flag" /></q-item-section><q-item-section><q-item-label class="text-weight-bold">{{ reporte.categoria }} — {{ reporte.reportante?.name }}</q-item-label><q-item-label caption>{{ reporte.descripcion }}</q-item-label></q-item-section><q-item-section side><q-btn flat color="primary" label="Resolver" @click="resolver(reporte)" /></q-item-section></q-item></q-list>
      </q-tab-panel>

      <q-tab-panel name="ordenes">
        <div v-if="!ordenes.length && !cargando" class="vacio">No hay operaciones registradas.</div>
        <q-list v-else bordered separator>
          <q-item v-for="orden in ordenes" :key="orden.id">
            <q-item-section avatar><q-avatar color="orange-1" text-color="primary" icon="shopping_bag" /></q-item-section>
            <q-item-section><q-item-label class="text-weight-bold">{{ orden.codigo }} — {{ orden.producto?.titulo }}</q-item-label><q-item-label caption>{{ etiquetaEstado(orden.estado) }} · {{ orden.comprador?.nombre }} · Bs {{ dinero(orden.precio_final) }}</q-item-label><q-item-label caption>Vendedor: Bs {{ dinero(orden.pago_vendedor) }} · Utilidad: Bs {{ dinero(orden.utilidad) }}</q-item-label></q-item-section>
            <q-item-section side><q-btn flat color="primary" icon="forum" label="Abrir chat" :to="{ name: 'administracion-mensajes-conversacion', params: { id: orden.conversacion_id } }" /></q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>

      <q-tab-panel name="caja">
        <div class="resumen-caja">
          <article><q-icon name="sell" /><span>Productos vendidos</span><strong>{{ resumenCaja?.productos_vendidos ?? 0 }}</strong></article>
          <article><q-icon name="south_west" /><span>Ingresos</span><strong>Bs {{ dinero(resumenCaja?.ingresos ?? 0) }}</strong></article>
          <article><q-icon name="north_east" /><span>Egresos</span><strong>Bs {{ dinero(resumenCaja?.egresos ?? 0) }}</strong></article>
          <article><q-icon name="account_balance_wallet" /><span>Saldo</span><strong>Bs {{ dinero(resumenCaja?.saldo ?? 0) }}</strong></article>
        </div>
        <q-list v-if="movimientosCaja.length" class="q-mt-md" bordered separator>
          <q-item v-for="movimiento in movimientosCaja" :key="movimiento.id">
            <q-item-section avatar><q-avatar :color="movimiento.tipo === 'ingreso' ? 'green-1' : 'red-1'" :text-color="movimiento.tipo === 'ingreso' ? 'positive' : 'negative'" :icon="movimiento.tipo === 'ingreso' ? 'add' : 'remove'" /></q-item-section>
            <q-item-section><q-item-label class="text-weight-bold">{{ movimiento.producto }} · {{ movimiento.codigo }}</q-item-label><q-item-label caption>{{ etiquetaEstado(movimiento.concepto) }} · {{ new Date(movimiento.registrado_en).toLocaleString('es-BO') }}</q-item-label></q-item-section>
            <q-item-section side><strong :class="movimiento.tipo === 'ingreso' ? 'text-positive' : 'text-negative'">{{ movimiento.tipo === 'ingreso' ? '+' : '-' }} Bs {{ dinero(movimiento.monto) }}</strong></q-item-section>
          </q-item>
        </q-list>
        <div v-else class="vacio">Todavía no hay movimientos de caja.</div>
      </q-tab-panel>

      <q-tab-panel name="qr">
        <div class="configuracion-qr"><div v-if="config" class="qr-actual"><q-img :src="config.url_imagen" width="190px" /><p>{{ config.banco }} · {{ config.titular }}</p></div><q-form class="form-qr" @submit="guardarQr"><q-input v-model="banco" outlined label="Banco" /><q-input v-model="titular" outlined label="Titular" /><q-file v-model="archivo" outlined accept="image/*" label="Imagen QR" /><q-btn type="submit" color="primary" unelevated label="Guardar QR" /></q-form></div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { obtenerMensajeError } from 'src/services/servicioApi';
import { actualizarSoporte, guardarConfiguracionPago, listarOrdenesAdmin, listarReportesAdmin, listarSoporteAdmin, obtenerConfiguracionPago, obtenerResumenCaja, resolverReporte, type ConfiguracionQr, type MovimientoCajaAdmin, type Orden, type ReporteAdmin, type ResumenCaja, type SolicitudSoporte } from 'src/services/servicioOperaciones';

type TabOperaciones = 'soporte' | 'reportes' | 'ordenes' | 'caja' | 'qr';
const route = useRoute(), router = useRouter();
const tabs: TabOperaciones[] = ['soporte', 'reportes', 'ordenes', 'caja', 'qr'];
const inicial = tabs.includes(String(route.query.tab) as TabOperaciones) ? String(route.query.tab) as TabOperaciones : 'soporte';
const tab = ref<TabOperaciones>(inicial), soporte = ref<SolicitudSoporte[]>([]), reportes = ref<ReporteAdmin[]>([]), ordenes = ref<Orden[]>([]), resumenCaja = ref<ResumenCaja | null>(null), movimientosCaja = ref<MovimientoCajaAdmin[]>([]), config = ref<ConfiguracionQr | null>(null), banco = ref(''), titular = ref(''), archivo = ref<File | null>(null), cargando = ref(false), error = ref('');
const opciones = computed(() => [
  { nombre: 'soporte' as const, etiqueta: 'Soporte', descripcion: 'Consultas y asistencia', icono: 'support_agent', total: soporte.value.length },
  { nombre: 'reportes' as const, etiqueta: 'Reportes', descripcion: 'Contenido denunciado', icono: 'flag', total: reportes.value.length },
  { nombre: 'ordenes' as const, etiqueta: 'Ventas', descripcion: 'Operaciones administradas', icono: 'shopping_bag', total: ordenes.value.length },
  { nombre: 'caja' as const, etiqueta: 'Caja', descripcion: 'Ingresos, egresos y saldo', icono: 'account_balance_wallet' },
  { nombre: 'qr' as const, etiqueta: 'QR de pago', descripcion: 'Cuenta de cobro', icono: 'qr_code_2' },
]);
function seleccionarTab(nombre: TabOperaciones) { tab.value = nombre; void router.replace({ query: { ...route.query, tab: nombre } }); }
async function cargar() {
  cargando.value = true; error.value = '';
  const resultados = await Promise.allSettled([listarSoporteAdmin(), listarReportesAdmin(), listarOrdenesAdmin(), obtenerResumenCaja(), obtenerConfiguracionPago()]);
  if (resultados[0].status === 'fulfilled') soporte.value = resultados[0].value;
  if (resultados[1].status === 'fulfilled') reportes.value = resultados[1].value;
  if (resultados[2].status === 'fulfilled') ordenes.value = resultados[2].value;
  if (resultados[3].status === 'fulfilled') { resumenCaja.value = resultados[3].value.resumen; movimientosCaja.value = resultados[3].value.movimientos; }
  if (resultados[4].status === 'fulfilled') config.value = resultados[4].value;
  const fallo = resultados.find((resultado) => resultado.status === 'rejected');
  if (fallo?.status === 'rejected') error.value = obtenerMensajeError(fallo.reason);
  cargando.value = false;
}
async function responderSoporte(solicitud: SolicitudSoporte) { const respuesta = prompt('Respuesta al usuario:')?.trim(); if (!respuesta) return; await actualizarSoporte(solicitud.id, { estado: 'resuelta', respuesta }); await cargar(); }
async function resolver(reporte: ReporteAdmin) { const resolucion = prompt('Resolución del reporte:')?.trim(); if (!resolucion) return; await resolverReporte(reporte.id, { estado: 'resuelto', resolucion }); await cargar(); }
async function guardarQr() { if (!archivo.value) return; const datos = new FormData(); datos.append('banco', banco.value); datos.append('titular', titular.value); datos.append('moneda', 'BOB'); datos.append('imagen_qr', archivo.value); await guardarConfiguracionPago(datos); await cargar(); }
function dinero(valor: number) { return Number(valor || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function etiquetaEstado(estado: string) { return estado.replaceAll('_', ' '); }
onMounted(async () => { await router.replace({ query: { ...route.query, tab: tab.value } }); await cargar(); });
</script>

<style scoped lang="scss">
.ops{width:min(100%,1200px);margin:auto;padding:clamp(18px,4vw,42px)}
.encabezado-ops{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:22px}.encabezado-ops h1{margin:2px 0;color:var(--azul-marino);font-size:clamp(1.8rem,4vw,2.7rem);line-height:1.1}.encabezado-ops span{color:var(--coral);font-size:.72rem;font-weight:800;letter-spacing:.09em}.encabezado-ops p{margin:0;color:var(--texto-secundario);font-size:.92rem}
.navegacion-modulos{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:22px}.navegacion-modulos button{display:flex;gap:12px;align-items:center;min-width:0;padding:16px;border:1px solid var(--borde);border-radius:16px;color:var(--texto-principal);background:var(--fondo);text-align:left;cursor:pointer}.navegacion-modulos button.activo{border-color:var(--coral);box-shadow:inset 0 -3px var(--coral),var(--sombra-suave)}.navegacion-modulos button>span{display:grid;min-width:0}.navegacion-modulos strong{font-family:var(--fuente-titulos)}.navegacion-modulos small{overflow:hidden;color:var(--texto-secundario);text-overflow:ellipsis;white-space:nowrap}.navegacion-modulos .q-badge{margin-left:auto}
.panel-operaciones{border:1px solid var(--borde);border-radius:20px;background:var(--fondo)}.q-tab-panel{padding:20px}.q-list{overflow:hidden;border-radius:14px;background:var(--fondo)}.producto-vinculado{margin-top:7px;color:var(--azul-marino);font-weight:600}.respuesta-admin{margin-top:8px;padding:8px;border-radius:8px;background:var(--azul-suave)}.vacio{padding:42px;text-align:center;color:var(--texto-secundario)}.configuracion-qr{display:grid;grid-template-columns:280px 1fr;gap:30px;align-items:center}.qr-actual{text-align:center}.form-qr{display:grid;gap:12px;max-width:520px}
.resumen-caja{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.resumen-caja article{display:grid;gap:4px;padding:16px;border:1px solid var(--borde);border-radius:15px;background:var(--fondo-secundario)}.resumen-caja article>.q-icon{color:var(--primario);font-size:24px}.resumen-caja span{color:var(--texto-secundario);font-size:.78rem}.resumen-caja strong{font-size:1.15rem}
@media(max-width:900px){.navegacion-modulos{grid-template-columns:repeat(2,1fr)}.configuracion-qr{grid-template-columns:1fr}.resumen-caja{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.ops{padding-inline:14px}.encabezado-ops h1{font-size:1.65rem}.encabezado-ops p{font-size:.82rem}.navegacion-modulos{gap:8px}.navegacion-modulos button{gap:8px;padding:12px}.navegacion-modulos small{display:none}.panel-operaciones{border-radius:14px}.q-tab-panel{padding:10px}.q-item{align-items:flex-start;flex-wrap:wrap}.q-item__section--side{width:100%;align-items:flex-start;padding:10px 0 0 56px}.resumen-caja{grid-template-columns:1fr 1fr}.resumen-caja article{padding:12px}}
</style>
