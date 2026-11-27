<template>
  <q-page class="contenedor-pagina pagina-vendedor">
    <estado-contenido v-if="cargando" tipo="cargando" />
    <template v-else-if="vendedor">
      <section class="tarjeta-perfil-publico">
        <div
          class="portada-perfil"
          :class="{ 'portada-perfil--predeterminada': !vendedor.url_foto_portada }"
        >
          <img
            v-if="vendedor.url_foto_portada"
            :src="vendedor.url_foto_portada"
            alt="Portada del vendedor"
          />
          <div v-else class="paisaje-marca"><q-icon name="landscape" /><span>Comarapa</span></div>
        </div>

        <div class="contenido-perfil">
          <div class="bloque-identidad">
            <avatar-usuario
              class="avatar-superpuesto"
              :nombre="vendedor.nombre"
              :url="vendedor.url_foto_perfil"
              tamano="104px"
            />
            <div class="identidad-perfil">
              <div class="nombre-verificado">
                <h1>{{ vendedor.nombre }}</h1>
                <q-icon
                  v-if="vendedor.telefono_verificado"
                  name="verified"
                  class="insignia-verificada"
                  ><q-tooltip>Celular verificado</q-tooltip></q-icon
                >
              </div>
              <p><q-icon name="place" /> {{ vendedor.ubicacion || 'Ubicación no configurada' }}</p>
            </div>
          </div>
          <p class="biografia-perfil">
            {{ vendedor.biografia || 'Este vendedor todavía no agregó una descripción.' }}
          </p>
        </div>
      </section>

      <div class="encabezado-publicaciones">
        <div>
          <span>PUBLICACIONES</span>
          <h2>Productos disponibles</h2>
        </div>
        <q-badge rounded color="primary" :label="productos.length" />
      </div>

      <div class="cuadricula-productos">
        <tarjeta-producto
          v-for="producto in productos"
          :key="producto.id"
          :producto="producto"
          @abrir="abrir"
        />
      </div>
    </template>
    <estado-contenido v-else titulo="Vendedor no disponible" icono="person_off" />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EstadoContenido from 'components/EstadoContenido.vue';
import TarjetaProducto from 'components/TarjetaProducto.vue';
import AvatarUsuario from 'components/AvatarUsuario.vue';
import type { Producto } from 'src/models/Producto';
import type { ResumenUsuario } from 'src/models/Usuario';
import { obtenerPerfilPublico } from 'src/services/servicioPerfil';

const ruta = useRoute();
const enrutador = useRouter();
const vendedor = ref<ResumenUsuario | null>(null);
const productos = ref<Producto[]>([]);
const cargando = ref(true);

function abrir(producto: Producto): void {
  void enrutador.push({ name: 'detalle-producto', params: { id: producto.id } });
}

onMounted(async () => {
  const id = Number(ruta.params.id);
  try {
    const datos = await obtenerPerfilPublico(id);
    productos.value = datos.productos;
    vendedor.value = datos.usuario;
  } finally {
    cargando.value = false;
  }
});
</script>

<style scoped lang="scss">
.tarjeta-perfil-publico {
  position: relative;
  margin-bottom: 24px;
  padding-bottom: 1px;
  border-radius: 26px;
  background: transparent;
}
.portada-perfil {
  height: clamp(150px, 31vw, 230px);
  overflow: hidden;
  border-radius: 26px 26px 18px 18px;
  background: #edf3eb;
  box-shadow: 0 8px 24px rgba(0, 70, 40, 0.09);
}
.portada-perfil img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.portada-perfil--predeterminada {
  background: linear-gradient(135deg, #edf3eb 0%, #9bdf9d 55%, #409951 100%);
}
.paisaje-marca {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #004628;
  font-size: clamp(1.4rem, 5vw, 2.2rem);
  font-weight: 800;
}
.paisaje-marca .q-icon {
  font-size: clamp(48px, 12vw, 86px);
}
.contenido-perfil {
  position: relative;
  z-index: 1;
  margin: -28px 14px 0;
  padding: 18px clamp(18px, 4vw, 28px) 22px;
  border: 1px solid var(--borde);
  border-radius: 24px;
  background: var(--fondo);
  box-shadow: 0 12px 30px rgba(0, 70, 40, 0.12);
}
.bloque-identidad {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
  gap: clamp(12px, 3vw, 18px);
  align-items: center;
  min-width: 0;
}
.avatar-superpuesto {
  overflow: hidden;
  align-self: start;
  margin-top: -58px;
  box-sizing: border-box;
  border: 5px solid #fff;
  border-radius: 50%;
  box-shadow: 0 6px 18px rgba(23, 43, 77, 0.18);
}
.avatar-superpuesto :deep(.q-avatar__content),
.avatar-superpuesto :deep(.q-img),
.avatar-superpuesto :deep(.q-img__container),
.avatar-superpuesto :deep(img) {
  width: 100%;
  height: 100%;
}
.avatar-superpuesto :deep(img) {
  display: block;
  object-fit: cover;
}
.nombre-verificado {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}
.nombre-verificado h1 {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--texto-principal);
  font-size: clamp(1.55rem, 5vw, 2rem);
  line-height: 1.1;
}
.insignia-verificada {
  flex: none;
  color: #07843d;
  font-size: 29px;
}
.identidad-perfil > p {
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  align-items: center;
  gap: 4px;
  margin: 8px 0 0;
  padding: 5px 10px 5px 7px;
  border-radius: 999px;
  color: var(--texto-secundario);
  background: var(--verde-suave, #e9f6ed);
  font-size: 0.86rem;
  line-height: 1.2;
}
.identidad-perfil > p .q-icon {
  color: #07843d;
  font-size: 20px;
}
.biografia-perfil {
  margin: 12px 0 0;
  color: var(--texto-principal);
  font-size: 0.98rem;
  line-height: 1.55;
  white-space: pre-line;
}
.encabezado-publicaciones {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin: 4px 2px 16px;
}
.encabezado-publicaciones span {
  color: var(--primary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}
.encabezado-publicaciones h2 {
  margin: 3px 0 0;
  color: var(--texto-principal);
  font-size: clamp(1.25rem, 4vw, 1.65rem);
  line-height: 1.15;
}
.encabezado-publicaciones .q-badge {
  min-width: 30px;
  min-height: 30px;
  justify-content: center;
  font-weight: 800;
}

@media (max-width: 480px) {
  .pagina-vendedor {
    width: 100%;
    padding-top: 0;
    padding-right: 0;
    padding-left: 0;
  }
  .tarjeta-perfil-publico {
    width: 100%;
    margin: 0 0 22px;
    border-radius: 0 0 20px 20px;
  }
  .pagina-vendedor > .cuadricula-productos,
  .encabezado-publicaciones {
    margin-right: 16px;
    margin-left: 16px;
  }
  .portada-perfil {
    height: 168px;
    border-radius: 0 0 18px 18px;
  }
  .portada-perfil img {
    object-position: center top;
  }
  .contenido-perfil {
    margin: -22px 12px 0;
    padding: 16px 16px 18px;
    border-radius: 21px;
  }
  .bloque-identidad {
    grid-template-columns: 92px minmax(0, 1fr);
    gap: 12px;
  }
  .avatar-superpuesto {
    width: 92px !important;
    height: 92px !important;
    margin-top: -48px;
    border-width: 4px;
    font-size: 92px !important;
  }
  .nombre-verificado {
    gap: 5px;
  }
  .nombre-verificado h1 {
    font-size: clamp(1.25rem, 5.8vw, 1.55rem);
  }
  .insignia-verificada {
    font-size: 24px;
  }
  .identidad-perfil > p {
    margin-top: 6px;
    padding-block: 4px;
    font-size: 0.78rem;
  }
  .biografia-perfil {
    margin-top: 8px;
    font-size: 0.92rem;
  }
}
</style>
