<template>
  <q-page class="contenedor-pagina pagina-compras">
    <boton-volver-perfil />
    <q-skeleton v-if="cargando" class="q-mt-lg" type="rect" height="160px" />
    <q-banner v-else-if="error" class="bg-red-1 text-negative rounded-borders q-mt-lg">
      {{ error }}
      <template #action><q-btn flat no-caps label="Reintentar" @click="cargar" /></template>
    </q-banner>
    <div v-else-if="!ordenes.length" class="compras-vacias">
      <q-icon name="shopping_bag" />
      <strong>Aún no tienes compras en proceso</strong>
      <span>Cuando acuerdes una compra con Comarapa Market podrás seguir aquí su pago y entrega.</span>
      <q-btn color="primary" no-caps unelevated label="Explorar productos" :to="{ name: 'buscar' }" />
    </div>
    <div v-else class="lista-compras">
      <article v-for="orden in ordenes" :key="orden.id" class="compra">
        <q-img v-if="orden.producto?.url_imagen" class="compra__imagen" :src="orden.producto.url_imagen" ratio="1" fit="cover" />
        <div v-else class="compra__imagen compra__imagen--vacia"><q-icon name="inventory_2" /></div>
        <div class="compra__contenido">
          <div class="compra__cabecera">
            <div><small>{{ orden.codigo }}</small><h2>{{ orden.producto?.titulo || 'Producto' }}</h2></div>
            <q-badge rounded :color="colorEstado(orden.estado)" :label="etiquetaEstado(orden.estado)" />
          </div>
          <strong class="compra__precio">{{ moneda(orden.precio_final) }}</strong>
          <p>{{ descripcionEstado(orden.estado) }}</p>
          <div class="compra__acciones">
            <q-btn outline color="primary" no-caps icon="chat_bubble_outline" label="Ver mensajes" :to="{ name: 'conversacion', params: { id: orden.conversacion_id } }" />
            <q-btn v-if="orden.qr" color="primary" no-caps unelevated icon="download" label="Descargar QR" @click="descargarQr(orden)" />
          </div>
        </div>
      </article>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import BotonVolverPerfil from 'components/BotonVolverPerfil.vue';
import type { EstadoOperacion } from 'src/models/OperacionVenta';
import { descargarArchivoOperacion, listarOrdenes, type Orden } from 'src/services/servicioOperaciones';
import { obtenerMensajeError } from 'src/services/servicioApi';

const ordenes = ref<Orden[]>([]);
const cargando = ref(false);
const error = ref('');
const etiquetas: Record<EstadoOperacion, string> = {
  precio_acordado: 'Precio acordado', esperando_pago: 'Esperando pago', comprobante_enviado: 'Comprobante enviado',
  comprobante_rechazado: 'Requiere corrección', pago_confirmado: 'Pago confirmado', producto_recibido: 'Producto recibido',
  producto_entregado: 'Producto entregado', vendedor_pagado: 'Procesando cierre', completada: 'Completada', cancelada: 'Cancelada',
};
const descripciones: Record<EstadoOperacion, string> = {
  precio_acordado: 'El equipo confirmó el precio final de la compra.',
  esperando_pago: 'El QR está disponible en la conversación para realizar el pago completo.',
  comprobante_enviado: 'Estamos validando el comprobante que enviaste.',
  comprobante_rechazado: 'Revisa la conversación y envía un comprobante válido.',
  pago_confirmado: 'El pago fue validado. Coordinaremos la entrega contigo.',
  producto_recibido: 'El producto ya está bajo custodia de Comarapa Market.',
  producto_entregado: 'La entrega fue registrada correctamente.',
  vendedor_pagado: 'La operación está en proceso de cierre administrativo.',
  completada: 'La compra y todos sus movimientos fueron completados.',
  cancelada: 'Esta operación fue cancelada.',
};
const moneda = (valor: number): string => `Bs ${Number(valor).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const etiquetaEstado = (estado: EstadoOperacion): string => etiquetas[estado] ?? estado;
const descripcionEstado = (estado: EstadoOperacion): string => descripciones[estado] ?? '';
const colorEstado = (estado: EstadoOperacion): string => estado === 'completada' ? 'positive' : estado === 'cancelada' || estado === 'comprobante_rechazado' ? 'negative' : estado === 'pago_confirmado' || estado === 'producto_recibido' || estado === 'producto_entregado' ? 'secondary' : 'primary';
async function cargar(): Promise<void> {
  cargando.value = true; error.value = '';
  try { ordenes.value = await listarOrdenes(); } catch (e) { error.value = obtenerMensajeError(e); } finally { cargando.value = false; }
}
async function descargarQr(orden: Orden): Promise<void> {
  try { await descargarArchivoOperacion(orden.id, 'qr', `qr-${orden.codigo}.png`); } catch (e) { error.value = obtenerMensajeError(e); }
}
onMounted(() => void cargar());
</script>

<style scoped lang="scss">
.pagina-compras { width: min(100%, 940px); padding-bottom: 100px; }
.lista-compras { display: grid; gap: 14px; margin-top: 18px; }
.compra { display: grid; grid-template-columns: 132px minmax(0, 1fr); gap: 18px; padding: 16px; border: 1px solid var(--borde); border-radius: 20px; background: var(--fondo); box-shadow: 0 8px 24px rgb(0 70 40 / 6%); }
.compra__imagen { width: 132px; overflow: hidden; border-radius: 15px; }
.compra__imagen--vacia { display: grid; background: var(--fondo-pagina); color: var(--texto-secundario); font-size: 34px; place-items: center; }
.compra__cabecera { display: flex; gap: 12px; align-items: flex-start; justify-content: space-between; }
.compra small { color: var(--texto-secundario); font-size: .7rem; font-weight: 700; }
.compra h2 { margin: 2px 0 5px; color: var(--azul-marino); font-size: 1.08rem; }
.compra__precio { color: var(--coral); font-size: 1.08rem; }
.compra p { margin: 7px 0 12px; color: var(--texto-secundario); font-size: .82rem; }
.compra__acciones { display: flex; flex-wrap: wrap; gap: 8px; }
.compras-vacias { display: grid; gap: 9px; margin-top: 20px; padding: 42px 22px; border: 1px dashed var(--borde); border-radius: 20px; color: var(--texto-secundario); text-align: center; place-items: center; }
.compras-vacias > .q-icon { color: var(--coral); font-size: 52px; }
.compras-vacias strong { color: var(--azul-marino); font-family: var(--fuente-titulos); font-size: 1.1rem; }
.compras-vacias span { max-width: 460px; }
@media (max-width: 600px) {
  .pagina-compras { padding-inline: 14px; }
  .compra { grid-template-columns: 82px minmax(0, 1fr); gap: 12px; padding: 12px; }
  .compra__imagen { width: 82px; height: 82px; }
  .compra__cabecera { align-items: flex-start; flex-direction: column-reverse; gap: 5px; }
  .compra__contenido { min-width: 0; }
  .compra h2 { font-size: .95rem; overflow-wrap: anywhere; }
  .compra__acciones .q-btn { flex: 1; font-size: .75rem; }
}
</style>
