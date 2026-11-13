<template>
  <q-page class="pagina-panel">
    <header class="panel-cabecera">
      <div>
        <span class="sobrelinea">CENTRO DE CONTROL</span>
        <h1>Hola, {{ autenticacion.usuario?.nombre }}</h1>
        <p>Supervisa la actividad y atiende lo importante desde un solo lugar.</p>
      </div>
      <div class="panel-cabecera__acciones">
        <q-btn outline no-caps icon="storefront" label="Ver marketplace" :to="{ name: 'inicio' }" />
        <q-btn
          color="primary"
          no-caps
          icon="refresh"
          label="Actualizar"
          :loading="cargando"
          unelevated
          @click="cargarResumen"
        />
      </div>
    </header>

    <estado-contenido v-if="cargando && !resumen" tipo="cargando" />
    <estado-contenido
      v-else-if="error && !resumen"
      tipo="error"
      titulo="No pudimos cargar el resumen"
      :mensaje="error"
      etiqueta-accion="Reintentar"
      @accion="cargarResumen"
    />
    <template v-else-if="resumen">
      <section class="metricas" aria-label="Indicadores principales">
        <router-link
          v-for="metrica in metricas"
          :key="metrica.etiqueta"
          class="metrica"
          :to="metrica.ruta"
        >
          <span class="metrica__icono" :class="metrica.clase"
            ><q-icon :name="metrica.icono"
          /></span>
          <div>
            <small>{{ metrica.etiqueta }}</small
            ><strong>{{ metrica.valor }}</strong
            ><em>{{ metrica.detalle }}</em>
          </div>
          <q-icon name="north_east" class="metrica__enlace" />
        </router-link>
      </section>

      <div class="panel-rejilla">
        <section class="tarjeta-panel bandeja">
          <div class="titulo-seccion">
            <div>
              <span>PRIORIDADES</span>
              <h2>Bandeja de trabajo</h2>
            </div>
            <q-badge color="negative" rounded :label="totalPendientes" />
          </div>
          <div class="lista-prioridades">
            <router-link
              v-for="prioridad in prioridades"
              :key="prioridad.etiqueta"
              :to="prioridad.ruta"
            >
              <span class="prioridad__icono" :class="prioridad.clase"
                ><q-icon :name="prioridad.icono"
              /></span>
              <div>
                <strong>{{ prioridad.etiqueta }}</strong
                ><small>{{ prioridad.descripcion }}</small>
              </div>
              <b>{{ prioridad.valor }}</b
              ><q-icon name="chevron_right" />
            </router-link>
          </div>
        </section>

        <section class="tarjeta-panel estado-marketplace">
          <div class="titulo-seccion">
            <div>
              <span>MARKETPLACE</span>
              <h2>Estado de publicaciones</h2>
            </div>
          </div>
          <div class="grafico-resumen">
            <div class="grafico-resumen__valor">
              <strong>{{ porcentajeDisponibles }}%</strong><span>disponibles</span>
            </div>
            <q-linear-progress
              rounded
              size="12px"
              :value="porcentajeDisponibles / 100"
              color="primary"
              track-color="blue-1"
            />
          </div>
          <dl>
            <div>
              <dt><i class="punto punto--activo" />Disponibles</dt>
              <dd>{{ resumen.publicaciones.disponibles }}</dd>
            </div>
            <div>
              <dt><i class="punto punto--vendido" />Vendidas</dt>
              <dd>{{ resumen.publicaciones.vendidas }}</dd>
            </div>
            <div>
              <dt><i class="punto punto--revision" />En revisión</dt>
              <dd>{{ resumen.publicaciones.pendientes_revision }}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section class="tarjeta-panel resumen-comercial">
        <div class="titulo-seccion">
          <div>
            <span>VENTAS Y CAJA</span>
            <h2>Actividad comercial del mes</h2>
          </div>
          <q-btn
            flat
            no-caps
            color="primary"
            icon-right="arrow_forward"
            label="Ver operaciones"
            :to="{ name: 'administracion-operaciones', query: { tab: 'ordenes' } }"
          />
        </div>
        <div class="resumen-comercial__rejilla">
          <div>
            <q-icon name="sync_alt" />
            <span>En curso</span>
            <strong>{{ resumen.operaciones.en_curso }}</strong>
          </div>
          <div>
            <q-icon name="payments" />
            <span>Ingresos</span>
            <strong>{{ moneda(resumen.caja_mes.ingresos) }}</strong>
          </div>
          <div>
            <q-icon name="outbound" />
            <span>Egresos</span>
            <strong>{{ moneda(resumen.caja_mes.egresos) }}</strong>
          </div>
          <div class="resumen-comercial__saldo">
            <q-icon name="account_balance_wallet" />
            <span>Saldo del mes</span>
            <strong>{{ moneda(resumen.caja_mes.saldo) }}</strong>
          </div>
        </div>
      </section>

      <section class="accesos">
        <div class="titulo-seccion">
          <div>
            <span>ACCESOS RÁPIDOS</span>
            <h2>Administrar Comarapa Market</h2>
          </div>
        </div>
        <div class="accesos__rejilla">
          <router-link v-for="acceso in accesos" :key="acceso.etiqueta" :to="acceso.ruta">
            <q-icon :name="acceso.icono" />
            <div>
              <strong>{{ acceso.etiqueta }}</strong
              ><span>{{ acceso.descripcion }}</span>
            </div>
            <q-icon name="arrow_forward" />
          </router-link>
        </div>
      </section>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import EstadoContenido from 'components/EstadoContenido.vue';
import type { ResumenAdministrativo } from 'src/models/Administracion';
import { obtenerResumenAdministrativo } from 'src/services/servicioAdministracion';
import { listarServiciosAdmin } from 'src/services/servicioServiciosEspeciales';
import { obtenerMensajeError } from 'src/services/servicioApi';
import { useTiendaAutenticacion } from 'src/stores/tiendaAutenticacion';

const autenticacion = useTiendaAutenticacion();
const resumen = ref<ResumenAdministrativo | null>(null);
const pendientesEspeciales = ref({ productos: 0, inmuebles: 0, prestamos: 0 });
const cargando = ref(true),
  error = ref('');
const totalPendientes = computed(
  () =>
    (resumen.value?.publicaciones.pendientes_revision ?? 0) +
    pendientesEspeciales.value.productos +
    pendientesEspeciales.value.inmuebles +
    pendientesEspeciales.value.prestamos,
);
const porcentajeDisponibles = computed(() =>
  resumen.value?.publicaciones.total
    ? Math.round(
        (resumen.value.publicaciones.disponibles / resumen.value.publicaciones.total) * 100,
      )
    : 0,
);
const metricas = computed(() =>
  resumen.value
    ? [
        {
          etiqueta: 'Usuarios registrados',
          valor: resumen.value.usuarios.total,
          detalle: `+${resumen.value.usuarios.nuevos_hoy} hoy`,
          icono: 'group',
          clase: 'azul',
          ruta: { name: 'administracion-usuarios' },
        },
        {
          etiqueta: 'Publicaciones',
          valor: resumen.value.publicaciones.total,
          detalle: `${resumen.value.publicaciones.disponibles} disponibles`,
          icono: 'inventory_2',
          clase: 'coral',
          ruta: { name: 'administracion-publicaciones' },
        },
        {
          etiqueta: 'Pendientes de revisión',
          valor: resumen.value.publicaciones.pendientes_revision,
          detalle: 'Requieren atención',
          icono: 'pending_actions',
          clase: 'amarillo',
          ruta: { name: 'administracion-publicaciones' },
        },
        {
          etiqueta: 'Ventas en curso',
          valor: resumen.value.operaciones.en_curso,
          detalle: `${resumen.value.operaciones.pagadas} pagadas`,
          icono: 'point_of_sale',
          clase: 'verde',
          ruta: { name: 'administracion-operaciones', query: { tab: 'ordenes' } },
        },
      ]
    : [],
);
const moneda = (valor: number): string =>
  `Bs ${Number(valor).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const prioridades = computed(() => [
  {
    etiqueta: 'Publicaciones por moderar',
    descripcion: 'Productos que esperan aprobación',
    valor: resumen.value?.publicaciones.pendientes_revision ?? 0,
    icono: 'fact_check',
    clase: 'coral',
    ruta: { name: 'administracion-publicaciones' },
  },
  {
    etiqueta: 'Productos solicitados',
    descripcion: 'Necesidades enviadas por usuarios',
    valor: pendientesEspeciales.value.productos,
    icono: 'manage_search',
    clase: 'azul',
    ruta: { name: 'administracion-servicios', query: { tab: 'productos' } },
  },
  {
    etiqueta: 'Inmuebles pendientes',
    descripcion: 'Propiedades que requieren revisión',
    valor: pendientesEspeciales.value.inmuebles,
    icono: 'holiday_village',
    clase: 'verde',
    ruta: { name: 'administracion-servicios', query: { tab: 'inmuebles' } },
  },
  {
    etiqueta: 'Préstamos pendientes',
    descripcion: 'Solicitudes privadas por evaluar',
    valor: pendientesEspeciales.value.prestamos,
    icono: 'request_quote',
    clase: 'amarillo',
    ruta: { name: 'administracion-servicios', query: { tab: 'prestamos' } },
  },
]);
const accesos = [
  {
    etiqueta: 'Publicaciones',
    descripcion: 'Moderar contenido y gestionar precios',
    icono: 'inventory_2',
    ruta: { name: 'administracion-publicaciones' },
  },
  {
    etiqueta: 'Usuarios',
    descripcion: 'Roles, estados y cuentas',
    icono: 'manage_accounts',
    ruta: { name: 'administracion-usuarios' },
  },
  {
    etiqueta: 'Mensajes',
    descripcion: 'Atender conversaciones de compradores',
    icono: 'chat_bubble_outline',
    ruta: { name: 'administracion-mensajes' },
  },
  {
    etiqueta: 'Operaciones',
    descripcion: 'Soporte, reportes, compras y pagos',
    icono: 'monitoring',
    ruta: { name: 'administracion-operaciones' },
  },
  {
    etiqueta: 'Servicios especiales',
    descripcion: 'Solicitudes, inmuebles y préstamos',
    icono: 'business_center',
    ruta: { name: 'administracion-servicios' },
  },
];
async function cargarResumen(): Promise<void> {
  cargando.value = true;
  error.value = '';
  const [resultadoResumen, resultadoServicios] = await Promise.allSettled([
    obtenerResumenAdministrativo(),
    listarServiciosAdmin(),
  ]);
  if (resultadoResumen.status === 'fulfilled') resumen.value = resultadoResumen.value;
  else error.value = obtenerMensajeError(resultadoResumen.reason);
  if (resultadoServicios.status === 'fulfilled') {
    const pendientes = new Set(['pendiente', 'en_revision', 'requiere_informacion']);
    pendientesEspeciales.value = {
      productos: resultadoServicios.value.productos.filter((x) => pendientes.has(x.estado)).length,
      inmuebles: resultadoServicios.value.inmuebles.filter((x) => pendientes.has(x.estado)).length,
      prestamos: resultadoServicios.value.prestamos.filter((x) => pendientes.has(x.estado)).length,
    };
  }
  cargando.value = false;
}
onMounted(cargarResumen);
</script>

<style scoped lang="scss">
.pagina-panel {
  width: min(100%, 1440px);
  margin: auto;
  padding: clamp(18px, 3vw, 36px);
  color: var(--texto-oscuro);
}
.panel-cabecera {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 26px;
}
.sobrelinea,
.titulo-seccion span {
  color: var(--coral);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}
.panel-cabecera h1 {
  margin: 4px 0;
  color: var(--azul-marino);
  font-size: clamp(1.7rem, 4vw, 2.5rem);
}
.panel-cabecera p {
  margin: 0;
  color: var(--texto-secundario);
}
.panel-cabecera__acciones {
  display: flex;
  gap: 10px;
}
.metricas {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
.metrica {
  position: relative;
  display: flex;
  gap: 13px;
  align-items: center;
  min-width: 0;
  padding: 18px;
  border: 1px solid var(--borde);
  border-radius: 18px;
  background: var(--fondo);
  color: inherit;
  text-decoration: none;
  box-shadow: 0 8px 24px rgb(19 43 91 / 6%);
  transition:
    transform 0.18s,
    box-shadow 0.18s;
}
.metrica:hover {
  box-shadow: 0 14px 32px rgb(19 43 91 / 12%);
  transform: translateY(-2px);
}
.metrica__icono {
  display: grid;
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  font-size: 24px;
  place-items: center;
}
.metrica small,
.metrica strong,
.metrica em {
  display: block;
}
.metrica small {
  color: var(--texto-secundario);
  font-size: 0.78rem;
}
.metrica strong {
  color: var(--azul-marino);
  font-size: 1.6rem;
  line-height: 1.1;
}
.metrica em {
  color: var(--texto-secundario);
  font-size: 0.7rem;
  font-style: normal;
}
.metrica__enlace {
  position: absolute;
  top: 12px;
  right: 12px;
  color: #9ba8bc;
  font-size: 15px;
}
.azul {
  color: #245fc5;
  background: #e8f0ff;
}
.coral {
  color: #db4d27;
  background: var(--coral-suave);
}
.amarillo {
  color: #a86d00;
  background: var(--coral-suave);
}
.verde {
  color: #16815b;
  background: var(--azul-suave);
}
.panel-rejilla {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.65fr);
  gap: 18px;
  margin-top: 18px;
}
.tarjeta-panel,
.accesos {
  padding: 22px;
  border: 1px solid var(--borde);
  border-radius: 20px;
  background: var(--fondo);
  box-shadow: 0 8px 24px rgb(19 43 91 / 5%);
}
.titulo-seccion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.titulo-seccion h2 {
  margin: 2px 0 0;
  color: var(--azul-marino);
  font-size: 1.15rem;
}
.lista-prioridades {
  display: grid;
}
.lista-prioridades a {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  gap: 12px;
  align-items: center;
  padding: 12px 4px;
  border-top: 1px solid var(--borde);
  color: inherit;
  text-decoration: none;
}
.lista-prioridades a:first-child {
  border-top: 0;
}
.prioridad__icono {
  display: grid;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  place-items: center;
}
.lista-prioridades strong,
.lista-prioridades small {
  display: block;
}
.lista-prioridades small {
  color: var(--texto-secundario);
  font-size: 0.76rem;
}
.lista-prioridades b {
  min-width: 28px;
  color: var(--azul-marino);
  text-align: right;
}
.grafico-resumen__valor {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}
.grafico-resumen__valor strong {
  color: var(--azul-marino);
  font-size: 2rem;
}
.grafico-resumen__valor span {
  color: var(--texto-secundario);
}
.estado-marketplace dl {
  display: grid;
  gap: 12px;
  margin: 22px 0 0;
}
.estado-marketplace dl div {
  display: flex;
  justify-content: space-between;
}
.estado-marketplace dt {
  display: flex;
  gap: 8px;
  align-items: center;
  color: var(--texto-secundario);
}
.estado-marketplace dd {
  margin: 0;
  color: var(--azul-marino);
  font-weight: 700;
}
.punto {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.punto--activo {
  background: #16815b;
}
.punto--vendido {
  background: #245fc5;
}
.punto--revision {
  background: var(--coral);
}
.accesos {
  margin-top: 18px;
}
.resumen-comercial {
  margin-top: 18px;
}
.resumen-comercial__rejilla {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.resumen-comercial__rejilla > div {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 3px 10px;
  align-items: center;
  padding: 16px;
  border: 1px solid var(--borde);
  border-radius: 15px;
  background: var(--fondo-pagina);
}
.resumen-comercial__rejilla .q-icon {
  grid-row: 1 / 3;
  color: var(--coral);
  font-size: 25px;
}
.resumen-comercial__rejilla span {
  color: var(--texto-secundario);
  font-size: 0.75rem;
}
.resumen-comercial__rejilla strong {
  color: var(--azul-marino);
  font-size: 1.05rem;
}
.resumen-comercial__saldo {
  border-color: color-mix(in srgb, var(--coral) 35%, var(--borde)) !important;
}
.accesos__rejilla {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}
.accesos__rejilla a {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 14px;
  border: 1px solid var(--borde);
  border-radius: 14px;
  color: var(--azul-marino);
  text-decoration: none;
}
.accesos__rejilla a > .q-icon:first-child {
  color: var(--coral);
  font-size: 23px;
}
.accesos__rejilla strong,
.accesos__rejilla span {
  display: block;
}
.accesos__rejilla span {
  margin-top: 2px;
  color: var(--texto-secundario);
  font-size: 0.7rem;
  line-height: 1.25;
}
@media (max-width: 1100px) {
  .metricas {
    grid-template-columns: repeat(2, 1fr);
  }
  .accesos__rejilla {
    grid-template-columns: repeat(2, 1fr);
  }
  .resumen-comercial__rejilla {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 700px) {
  .panel-cabecera {
    align-items: stretch;
    flex-direction: column;
  }
  .panel-cabecera__acciones .q-btn {
    flex: 1;
  }
  .panel-rejilla {
    grid-template-columns: 1fr;
  }
  .metricas {
    grid-template-columns: 1fr 1fr;
  }
  .metrica {
    padding: 14px;
  }
  .metrica__icono {
    width: 42px;
    height: 42px;
  }
  .accesos__rejilla {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 420px) {
  .metricas {
    grid-template-columns: 1fr;
  }
  .panel-cabecera__acciones {
    flex-direction: column;
  }
  .resumen-comercial__rejilla {
    grid-template-columns: 1fr;
  }
}
</style>
