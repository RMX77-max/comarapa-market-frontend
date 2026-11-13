<template>
  <q-page class="servicios-admin"
    ><header>
      <div>
        <span>GESTIÓN</span>
        <h1>Servicios especiales</h1>
        <p>Revisa necesidades, inmuebles y solicitudes privadas.</p>
      </div>
      <q-btn flat round icon="refresh" :loading="cargando" @click="cargar" />
    </header>
    <nav class="navegacion-servicios" aria-label="Tipos de servicios especiales">
      <button v-for="opcion in opciones" :key="opcion.nombre" type="button" :class="{ activo: tab === opcion.nombre }" @click="seleccionarTab(opcion.nombre)">
        <q-icon :name="opcion.icono" size="26px" />
        <span><strong>{{ opcion.etiqueta }}</strong><small>{{ opcion.descripcion }}</small></span>
        <q-badge rounded color="primary" :label="opcion.total" />
      </button>
    </nav>
    <q-tab-panels v-model="tab" animated class="panel-servicios"
      ><q-tab-panel name="productos"
        ><lista-admin :items="productos" tipo="producto" @revisar="revisarProducto" /></q-tab-panel
      ><q-tab-panel name="inmuebles"
        ><lista-admin :items="inmuebles" tipo="inmueble" @revisar="revisarPropiedad" /></q-tab-panel
      ><q-tab-panel name="prestamos"
        ><lista-admin
          :items="prestamos"
          tipo="prestamo"
          @revisar="revisarCredito" /></q-tab-panel></q-tab-panels
  ></q-page>
</template>
<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import ImagenPrivada from 'src/components/ImagenPrivada.vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import {
  listarServiciosAdmin,
  revisarInmueble,
  revisarPrestamo,
  revisarSolicitudProducto,
  type Inmueble,
  type SolicitudPrestamo,
  type SolicitudProductoEspecial,
} from 'src/services/servicioServiciosEspeciales';
import { obtenerMensajeError } from 'src/services/servicioApi';
type RegistroAdmin = {
  id: number;
  ciudad: string;
  estado: string;
  titulo?: string;
  nombre?: string;
  descripcion?: string;
  objeto_garantia?: string;
  imagenes_garantia?: string[];
  usuario?: { name: string; email: string };
};
const ListaAdmin = defineComponent({
  props: { items: { type: Array, required: true }, tipo: { type: String, required: true } },
  emits: ['revisar'],
  setup(p, { emit }) {
    return () =>
      h(
        'div',
        { class: 'lista-admin' },
        p.items.length
          ? p.items.map((valor) => {
              const x = valor as RegistroAdmin;
              return h('article', { class: 'item-admin' }, [
                h('div', [
                  h('strong', x.titulo || x.nombre),
                  h('span', `${x.ciudad} · ${x.estado}`),
                  h('p', x.descripcion || x.objeto_garantia),
                  x.imagenes_garantia?.length
                    ? h(
                        'div',
                        { class: 'galeria-garantia' },
                        x.imagenes_garantia.map((imagen, indice) =>
                          h(ImagenPrivada, {
                            src: imagen,
                            alt: `Fotografía ${indice + 1} de la garantía`,
                          }),
                        ),
                      )
                    : null,
                  x.usuario ? h('small', `${x.usuario.name} · ${x.usuario.email}`) : null,
                ]),
                h(
                  'button',
                  {
                    class:
                      'q-btn q-btn-item non-selectable no-outline q-btn--standard q-btn--rectangle bg-primary text-white',
                    onClick: () => emit('revisar', x),
                  },
                  'Revisar',
                ),
              ]);
            })
          : h('p', { class: 'vacio' }, 'No existen registros.'),
      );
  },
});
type TabServicios = 'productos' | 'inmuebles' | 'prestamos';
const route = useRoute(),
  router = useRouter(),
  q = useQuasar(),
  tabs: TabServicios[] = ['productos', 'inmuebles', 'prestamos'],
  tab = ref<TabServicios>(tabs.includes(String(route.query.tab) as TabServicios) ? String(route.query.tab) as TabServicios : 'productos'),
  cargando = ref(false),
  productos = ref<SolicitudProductoEspecial[]>([]),
  inmuebles = ref<Inmueble[]>([]),
  prestamos = ref<SolicitudPrestamo[]>([]);
const opciones = computed(() => [
  { nombre: 'productos' as const, etiqueta: 'Productos solicitados', descripcion: 'Necesidades de compradores', icono: 'manage_search', total: productos.value.length },
  { nombre: 'inmuebles' as const, etiqueta: 'Inmuebles', descripcion: 'Propiedades por revisar', icono: 'apartment', total: inmuebles.value.length },
  { nombre: 'prestamos' as const, etiqueta: 'Préstamos', descripcion: 'Evaluación privada', icono: 'request_quote', total: prestamos.value.length },
]);
function seleccionarTab(nombre: TabServicios): void {
  tab.value = nombre;
  void router.replace({ query: { ...route.query, tab: nombre } });
}
async function cargar() {
  cargando.value = true;
  try {
    const d = await listarServiciosAdmin();
    productos.value = d.productos;
    inmuebles.value = d.inmuebles;
    prestamos.value = d.prestamos;
  } catch (e) {
    q.notify({ type: 'negative', message: obtenerMensajeError(e) });
  } finally {
    cargando.value = false;
  }
}
async function revisarProducto(x: SolicitudProductoEspecial) {
  const respuesta = prompt('Respuesta para el usuario:')?.trim();
  if (!respuesta) return;
  const publicar = confirm(
    '¿Publicar esta necesidad en Inicio? Cancelar la marcará como rechazada.',
  );
  await revisarSolicitudProducto(x.id, {
    estado: publicar ? 'publicada' : 'rechazada',
    respuesta,
  });
  await cargar();
}
async function revisarCredito(x: SolicitudPrestamo) {
  const respuesta = prompt('Respuesta o motivo de la decisión:')?.trim();
  if (!respuesta) return;
  const aprobada = confirm('Aceptar esta solicitud? Cancelar la marcará como rechazada.');
  await revisarPrestamo(x.id, { estado: aprobada ? 'aprobada' : 'rechazada', respuesta });
  await cargar();
}
async function revisarPropiedad(x: Inmueble) {
  const valor = prompt('Precio público aprobado:', String(x.precio_solicitado));
  if (!valor) return;
  await revisarInmueble(x.id, { estado: 'aprobado', precio_publico: Number(valor) });
  await cargar();
}
onMounted(async () => {
  await router.replace({ query: { ...route.query, tab: tab.value } });
  await cargar();
});
</script>
<style scoped lang="scss">
.servicios-admin {
  width: min(100%, 1150px);
  margin: auto;
  padding: clamp(20px, 4vw, 42px);
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
header h1 {
  margin: 2px 0;
  color: var(--azul-marino);
  font-size: clamp(1.8rem, 4vw, 2.7rem);
  line-height: 1.1;
}
header span {
  color: var(--coral);
  font-size: 0.72rem;
  font-weight: 800;
}
header p { margin: 0; color: var(--texto-secundario); font-size: .92rem; }
.navegacion-servicios { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:22px 0; }
.navegacion-servicios button { display:flex; gap:12px; align-items:center; min-width:0; padding:16px; border:1px solid var(--borde); border-radius:16px; color:var(--texto-principal); background:var(--fondo); text-align:left; cursor:pointer; }
.navegacion-servicios button.activo { border-color:var(--coral); box-shadow:inset 0 -3px var(--coral),var(--sombra-suave); }
.navegacion-servicios button>span { display:grid; min-width:0; }
.navegacion-servicios strong { font-family:var(--fuente-titulos); }
.navegacion-servicios small { overflow:hidden; color:var(--texto-secundario); text-overflow:ellipsis; white-space:nowrap; }
.navegacion-servicios .q-badge { margin-left:auto; }
.panel-servicios { border:1px solid var(--borde); border-radius:20px; background:var(--fondo); }
.q-tab-panel {
  padding: 22px 0;
}
.lista-admin {
  display: grid;
  gap: 12px;
}
.item-admin {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px;
  border: 1px solid var(--borde);
  border-radius: 16px;
  background: var(--fondo);
}
.item-admin strong,
.item-admin span {
  display: block;
}
.item-admin span,
.item-admin small {
  color: var(--texto-secundario);
}
.item-admin p {
  margin: 8px 0;
}
.galeria-garantia {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  gap: 8px;
  width: min(100%, 540px);
  margin: 10px 0;
}
.galeria-garantia img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  object-fit: cover;
}
.vacio {
  padding: 45px;
  text-align: center;
}
@media (max-width: 600px) {
  .servicios-admin { padding-inline:14px; }
  header h1 { font-size:1.65rem; }
  header p { font-size:.82rem; }
  .navegacion-servicios { grid-template-columns:1fr; gap:8px; margin:16px 0; }
  .navegacion-servicios button { padding:12px; }
  .navegacion-servicios small { display:none; }
  .panel-servicios { border-radius:14px; }
  .q-tab-panel { padding:10px; }
  .item-admin {
    align-items: flex-start;
    flex-direction: column;
  }
  .item-admin button {
    width: 100%;
  }
}
</style>
