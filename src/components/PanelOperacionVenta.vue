<template>
  <aside
    class="panel-operacion"
    :class="{ 'panel-operacion--comprador': !esAdministrador }"
  >
    <section v-if="esAdministrador" class="producto-operacion">
      <q-img
        v-if="conversacion.producto.url_imagen"
        :src="conversacion.producto.url_imagen"
        :alt="conversacion.producto.titulo"
        ratio="1.45"
      />
      <div>
        <span>PRODUCTO CONSULTADO</span>
        <h2>{{ conversacion.producto.titulo }}</h2>
        <strong>Bs {{ dinero(conversacion.producto.precio) }}</strong>
        <p><q-icon name="place" /> {{ conversacion.producto.ubicacion }}</p>
      </div>
    </section>

    <template v-if="esAdministrador">
      <section v-if="!operacion" class="crear-operacion">
        <h3>Iniciar operación de venta</h3>
        <p>Registra el precio acordado con el comprador. El pago debe ser completo.</p>
        <q-input v-model.number="precioFinal" outlined dense hide-bottom-space type="number" min="0.01" step="0.01" prefix="Bs" label="Precio final negociado" />
        <q-select v-model="metodoPago" outlined dense hide-bottom-space emit-value map-options :options="metodos" label="Método de pago" />
        <q-input v-model="notas" outlined dense hide-bottom-space type="textarea" rows="2" label="Notas internas (opcional)" />
        <q-btn color="primary" unelevated no-caps icon="point_of_sale" label="Crear operación" :loading="procesando" @click="crear" />
      </section>

      <section v-else class="detalle-operacion">
        <div class="detalle-operacion__cabecera">
          <div><span>OPERACIÓN</span><h3>{{ operacion.codigo }}</h3></div>
          <q-badge :color="colorEstado" :label="etiquetaEstado" />
        </div>
        <dl>
          <div><dt>Precio publicado</dt><dd>Bs {{ dinero(operacion.precio_publicado) }}</dd></div>
          <div><dt>Precio final</dt><dd>Bs {{ dinero(operacion.precio_final) }}</dd></div>
          <div><dt>Pago al vendedor (95 %)</dt><dd>Bs {{ dinero(operacion.pago_vendedor) }}</dd></div>
          <div><dt>Comisión base (5 %)</dt><dd>Bs {{ dinero(operacion.comision) }}</dd></div>
          <div><dt>Gastos</dt><dd>Bs {{ dinero(operacion.gastos) }}</dd></div>
          <div class="utilidad"><dt>Utilidad actual</dt><dd>Bs {{ dinero(operacion.utilidad) }}</dd></div>
        </dl>

        <div v-if="operacion.comprobante" class="comprobante-admin">
          <q-icon name="receipt_long" />
          <div><strong>Comprobante recibido</strong><span>{{ operacion.comprobante.nombre }}</span></div>
          <q-btn flat round icon="download" aria-label="Descargar comprobante" @click="descargarComprobante" />
        </div>

        <div class="acciones-operacion">
          <q-btn v-if="puedeHabilitarQr" color="primary" unelevated no-caps icon="qr_code_2" label="Habilitar QR" @click="accion('habilitar_qr')" />
          <q-btn v-if="operacion.comprobante && !operacion.pago_confirmado_en" color="positive" unelevated no-caps icon="verified" label="Confirmar pago" @click="confirmar('confirmar_pago', '¿Confirmas que recibimos el pago completo?')" />
          <q-btn v-if="operacion.comprobante && !operacion.pago_confirmado_en" outline color="negative" no-caps icon="block" label="Rechazar comprobante" @click="rechazarComprobante" />
          <q-btn v-if="operacion.pago_confirmado_en && !operacion.producto_recibido_en" outline color="primary" no-caps icon="inventory" label="Producto recibido" @click="confirmar('confirmar_recepcion', '¿Confirmas que Comarapa Market recibió el producto?')" />
          <q-btn v-if="operacion.pago_confirmado_en && !operacion.producto_entregado_en" outline color="primary" no-caps icon="local_shipping" label="Producto entregado" @click="confirmar('confirmar_entrega', '¿Confirmas la entrega al comprador?')" />
          <q-btn v-if="operacion.pago_confirmado_en && !operacion.vendedor_pagado_en" outline color="primary" no-caps icon="payments" label="Pagar al vendedor" @click="confirmar('registrar_pago_vendedor', `¿Registrar el pago de Bs ${dinero(operacion.pago_vendedor)} al vendedor?`)" />
          <q-btn v-if="!finalizada" flat color="primary" no-caps icon="receipt" label="Registrar gasto" @click="registrarGasto" />
          <q-btn v-if="!operacion.pago_confirmado_en && !finalizada" flat color="negative" no-caps icon="cancel" label="Cancelar operación" @click="cancelar" />
        </div>
      </section>
    </template>

    <section v-else-if="operacion" class="pago-resumen">
      <div>
        <h3>{{ etiquetaEstado }}</h3>
        <strong>Bs {{ dinero(operacion.precio_final) }}</strong>
      </div>
      <q-btn
        v-if="puedeAbrirPago"
        color="primary"
        unelevated
        no-caps
        icon="qr_code_2"
        label="Ver pago"
        @click="mostrarPago = true"
      />
      <q-icon v-else-if="operacion.pago_confirmado_en" name="check_circle" color="positive" />
      <q-icon v-else name="hourglass_top" color="primary" />
    </section>

    <q-dialog v-if="!esAdministrador" v-model="mostrarPago">
      <q-card class="modal-pago">
        <q-card-section class="modal-pago__cabecera">
          <div>
            <h3>{{ etiquetaEstado }}</h3>
            <strong>Bs {{ dinero(operacion?.precio_final ?? 0) }}</strong>
          </div>
          <q-btn v-close-popup flat round dense icon="close" aria-label="Cerrar pago" />
        </q-card-section>

        <q-card-section v-if="operacion?.qr_habilitado && operacion.qr" class="modal-pago__contenido">
          <div class="pago-comprador__qr">
            <img :src="operacion.qr.url_imagen" alt="QR para realizar el pago" />
          </div>
          <q-btn
            class="pago-comprador__descarga"
            outline
            color="primary"
            no-caps
            icon="download"
            label="Descargar QR"
            :loading="descargando"
            @click="descargarQr"
          />
          <div class="carga-comprobante">
            <q-file
              v-model="archivo"
              outlined
              clearable
              accept="image/jpeg,image/png,image/webp,application/pdf"
              label="Seleccionar comprobante"
              max-file-size="6291456"
            >
              <template #prepend><q-icon name="attach_file" /></template>
            </q-file>
            <q-btn
              color="primary"
              unelevated
              no-caps
              icon="upload"
              label="Subir comprobante"
              :disable="!archivo"
              :loading="procesando"
              @click="enviarComprobante"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { Conversacion } from 'src/models/Conversacion';
import { obtenerMensajeError } from 'src/services/servicioApi';
import { actualizarOperacion, crearOperacionDesdeConversacion, descargarArchivoOperacion, subirComprobante } from 'src/services/servicioOperaciones';

const props = defineProps<{ conversacion: Conversacion; esAdministrador: boolean }>();
const emitir = defineEmits<{ actualizada: [] }>();
const q = useQuasar();
const operacion = computed(() => props.conversacion.operacion);
const precioFinal = ref(props.conversacion.producto.precio);
const metodoPago = ref<'qr' | 'efectivo' | 'transferencia'>('qr');
const notas = ref('');
const archivo = ref<File | null>(null);
const procesando = ref(false);
const descargando = ref(false);
const mostrarPago = ref(false);
const metodos = [
  { label: 'QR', value: 'qr' }, { label: 'Efectivo', value: 'efectivo' },
  { label: 'Transferencia', value: 'transferencia' },
];
const etiquetas: Record<string, string> = {
  precio_acordado: 'Precio acordado', esperando_pago: 'Esperando pago',
  comprobante_enviado: 'Comprobante enviado', comprobante_rechazado: 'Comprobante rechazado',
  pago_confirmado: 'Pago confirmado', producto_recibido: 'Producto recibido',
  producto_entregado: 'Producto entregado', vendedor_pagado: 'Vendedor pagado',
  completada: 'Completada', cancelada: 'Cancelada',
};
const etiquetaEstado = computed(() => etiquetas[operacion.value?.estado ?? ''] ?? operacion.value?.estado ?? 'Sin operación');
const colorEstado = computed(() => operacion.value?.estado === 'cancelada' ? 'negative' : operacion.value?.estado === 'completada' ? 'positive' : 'primary');
const finalizada = computed(() => ['completada', 'cancelada'].includes(operacion.value?.estado ?? ''));
const puedeHabilitarQr = computed(() => operacion.value?.metodo_pago === 'qr' && !operacion.value.qr_habilitado && !operacion.value.pago_confirmado_en && !finalizada.value);
const puedeAbrirPago = computed(() => Boolean(
  operacion.value?.qr_habilitado
  && operacion.value.qr
  && !operacion.value.pago_confirmado_en
  && (!operacion.value.comprobante || operacion.value.estado === 'comprobante_rechazado'),
));

function dinero(valor: number): string { return Number(valor || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
async function ejecutar(tarea: () => Promise<unknown>): Promise<boolean> {
  procesando.value = true;
  try { await tarea(); emitir('actualizada'); return true; }
  catch (error) { q.notify({ type: 'negative', message: obtenerMensajeError(error) }); return false; }
  finally { procesando.value = false; }
}
async function crear(): Promise<void> {
  if (!precioFinal.value || precioFinal.value <= 0) return;
  await ejecutar(() => crearOperacionDesdeConversacion(props.conversacion.id, {
    precio_final: precioFinal.value,
    metodo_pago: metodoPago.value,
    ...(notas.value ? { notas: notas.value } : {}),
  }));
}
async function accion(nombre: string, extras: Record<string, unknown> = {}): Promise<void> {
  if (!operacion.value) return;
  await ejecutar(() => actualizarOperacion(operacion.value!.id, { accion: nombre, ...extras }));
}
function confirmar(nombre: string, mensaje: string): void {
  q.dialog({ title: 'Confirmar acción', message: mensaje, cancel: true, persistent: true }).onOk(() => void accion(nombre));
}
function rechazarComprobante(): void {
  q.dialog({ title: 'Rechazar comprobante', message: 'Indica el motivo para el comprador.', prompt: { model: '', type: 'textarea' }, cancel: true }).onOk((motivo: string) => void accion('rechazar_comprobante', { motivo }));
}
function registrarGasto(): void {
  q.dialog({ title: 'Registrar gasto', message: 'Monto del gasto en bolivianos', prompt: { model: '', type: 'number' }, cancel: true }).onOk((monto: string) => void accion('registrar_gasto', { monto: Number(monto) }));
}
function cancelar(): void {
  q.dialog({ title: 'Cancelar operación', message: 'Indica el motivo de cancelación.', prompt: { model: '', type: 'textarea' }, cancel: true }).onOk((motivo: string) => void accion('cancelar', { motivo }));
}
async function enviarComprobante(): Promise<void> {
  if (!operacion.value || !archivo.value) return;
  const enviado = await ejecutar(() => subirComprobante(operacion.value!.id, archivo.value!));
  if (enviado) {
    archivo.value = null;
    mostrarPago.value = false;
    q.notify({ type: 'positive', message: 'Comprobante enviado para revisión.' });
  }
}
async function descargarQr(): Promise<void> {
  if (!operacion.value) return;
  descargando.value = true;
  try {
    await descargarArchivoOperacion(operacion.value.id, 'qr', `qr-${operacion.value.codigo}.png`);
    q.notify({ type: 'positive', message: 'QR descargado correctamente.' });
  } catch (error) {
    q.notify({ type: 'negative', message: obtenerMensajeError(error) });
  } finally {
    descargando.value = false;
  }
}
async function descargarComprobante(): Promise<void> { if (operacion.value) await descargarArchivoOperacion(operacion.value.id, 'comprobante', operacion.value.comprobante?.nombre ?? 'comprobante'); }
watch(() => props.conversacion.producto.precio, (valor) => { if (!operacion.value) precioFinal.value = valor; });
watch(puedeAbrirPago, (disponible, anterior) => {
  if (disponible && anterior !== true) mostrarPago.value = true;
}, { immediate: true });
</script>

<style scoped lang="scss">
.panel-operacion{display:flex;flex-direction:column;gap:10px;min-width:0;min-height:0;height:100%;padding:10px;overflow-y:auto;overscroll-behavior:contain;background:var(--fondo-secundario)}
.producto-operacion,.crear-operacion,.detalle-operacion,.pago-comprador{overflow:hidden;border:1px solid var(--borde);border-radius:18px;background:var(--fondo);box-shadow:var(--sombra-suave)}
.producto-operacion{display:grid;grid-template-columns:92px minmax(0,1fr);flex:0 0 auto;min-height:92px}.producto-operacion>.q-img{width:92px;height:100%}.producto-operacion>div,.crear-operacion,.detalle-operacion,.pago-comprador{padding:12px}.producto-operacion span,.detalle-operacion__cabecera span{color:var(--primario);font-size:.61rem;font-weight:800;letter-spacing:.08em}.producto-operacion h2{margin:2px 0;font-size:.92rem;line-height:1.2}.producto-operacion strong{color:var(--primario-oscuro);font-size:.98rem}.producto-operacion p{margin:3px 0 0;color:var(--texto-secundario);font-size:.72rem}
.crear-operacion{display:grid;gap:8px;flex:0 0 auto}.crear-operacion h3,.crear-operacion p{margin:0}.crear-operacion h3{font-size:1.25rem;line-height:1.12}.crear-operacion p{color:var(--texto-secundario);font-size:.74rem;line-height:1.35}.crear-operacion :deep(.q-field__control){min-height:42px}.crear-operacion :deep(textarea){min-height:40px!important}
.detalle-operacion__cabecera{display:flex;align-items:center;justify-content:space-between;gap:10px}.detalle-operacion__cabecera h3{margin:2px 0;font-size:1.05rem}.detalle-operacion dl{display:grid;gap:7px;margin:16px 0}.detalle-operacion dl div{display:flex;justify-content:space-between;gap:10px;font-size:.82rem}.detalle-operacion dt{color:var(--texto-secundario)}.detalle-operacion dd{margin:0;font-weight:700}.detalle-operacion .utilidad{padding-top:8px;border-top:1px solid var(--borde);color:var(--primario-oscuro)}
.acciones-operacion{display:grid;gap:8px}.comprobante-admin,.estado-comprobante{display:flex;gap:10px;align-items:center;margin:12px 0;padding:11px;border-radius:12px;background:var(--coral-suave)}.comprobante-admin>div{display:grid;min-width:0}.comprobante-admin span{overflow:hidden;color:var(--texto-secundario);font-size:.72rem;text-overflow:ellipsis;white-space:nowrap}.comprobante-admin .q-btn{margin-left:auto}
.panel-operacion--comprador{height:auto;padding:0;overflow:visible;background:transparent}.pago-resumen{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border:1px solid var(--borde);border-radius:16px;background:var(--fondo);box-shadow:var(--sombra-suave)}.pago-resumen>div{display:grid;gap:2px}.pago-resumen h3{margin:0;color:var(--texto-oscuro);font-size:.9rem}.pago-resumen strong{color:var(--primario-oscuro);font-size:.86rem}.pago-resumen>.q-icon{font-size:28px}.modal-pago{width:min(92vw,430px);max-height:90dvh;overflow:auto;border-radius:22px;background:var(--fondo)}.modal-pago__cabecera{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid var(--borde)}.modal-pago__cabecera>div{display:flex;align-items:baseline;justify-content:space-between;gap:18px;min-width:0;flex:1}.modal-pago__cabecera h3{margin:0;color:var(--texto-oscuro);font-size:1.05rem}.modal-pago__cabecera strong{color:var(--primario-oscuro);font-size:1rem;white-space:nowrap}.modal-pago__contenido{display:grid;gap:14px;padding:16px}.pago-comprador__qr{display:grid;width:min(100%,260px);margin:auto;padding:10px;border:1px solid var(--borde);border-radius:16px;background:#fff;place-items:center}.pago-comprador__qr img{display:block;width:100%;height:auto;object-fit:contain}.pago-comprador__descarga{width:min(100%,260px);margin:auto}.carga-comprobante{display:grid;gap:10px;padding:12px;border:2px solid color-mix(in srgb,var(--primario) 32%,var(--borde));border-radius:14px;background:color-mix(in srgb,var(--primario) 7%,var(--fondo))}.carga-comprobante :deep(.q-field__control){background:var(--fondo)}.estado-comprobante--correcto{color:var(--primario-oscuro);background:var(--coral-suave)}
@media(max-width:760px){.panel-operacion{padding:10px}.panel-operacion--comprador{padding:0}.producto-operacion{display:grid;grid-template-columns:100px 1fr}.producto-operacion .q-img{height:100%}.producto-operacion>div{padding:12px}}
</style>
