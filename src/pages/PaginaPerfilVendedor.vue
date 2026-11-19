<template>
  <q-page class="contenedor-pagina pagina-vendedor">
    <estado-contenido v-if="cargando" tipo="cargando" />
    <template v-else-if="vendedor">
      <section class="cabecera-vendedor">
        <div class="portada-vendedor" :class="{ predeterminada: !vendedor.url_foto_portada }">
          <img
            v-if="vendedor.url_foto_portada"
            :src="vendedor.url_foto_portada"
            alt="Portada del vendedor"
          />
          <q-icon v-else name="landscape" />
        </div>
        <div class="datos-vendedor">
          <avatar-usuario
            class="avatar-vendedor"
            :nombre="vendedor.nombre"
            :url="vendedor.url_foto_perfil"
            tamano="96px"
          />
          <div class="nombre-vendedor">
            <h1>{{ vendedor.nombre }}</h1>
            <q-icon v-if="vendedor.telefono_verificado" name="verified"
              ><q-tooltip>Celular verificado</q-tooltip></q-icon
            >
          </div>
          <p><q-icon name="place" /> {{ vendedor.ubicacion || 'Ubicación no configurada' }}</p>
          <p class="biografia">
            {{ vendedor.biografia || 'Este vendedor todavía no agregó una descripción.' }}
          </p>
          <small>{{ productos.length }} publicaciones disponibles</small>
        </div>
      </section>
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
.cabecera-vendedor {
  overflow: hidden;
  margin-bottom: 24px;
  border: 1px solid var(--borde);
  border-radius: var(--radio-grande);
  background: var(--fondo);
  box-shadow: 0 10px 28px rgba(0, 70, 40, 0.08);
}
.portada-vendedor {
  height: clamp(150px, 28vw, 230px);
  background: #edf3eb;
}
.portada-vendedor img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.portada-vendedor.predeterminada {
  display: grid;
  color: #004628;
  background: linear-gradient(135deg, #edf3eb, #9bdf9d, #409951);
  font-size: 72px;
  place-items: center;
}
.datos-vendedor {
  position: relative;
  padding: 58px 24px 24px;
}
.avatar-vendedor {
  position: absolute;
  top: -50px;
  left: 24px;
  border: 5px solid #fff;
  border-radius: 50%;
  box-shadow: 0 5px 16px rgba(23, 43, 77, 0.17);
}
.nombre-vendedor {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nombre-vendedor > .q-icon {
  color: #07843d;
  font-size: 28px;
}
.cabecera-vendedor h1 {
  margin: 0;
  color: var(--texto-principal);
  font-size: clamp(1.45rem, 5vw, 1.9rem);
}
.datos-vendedor > p:not(.biografia),
.cabecera-vendedor small {
  margin: 4px 0 0;
  color: var(--texto-secundario);
}
.datos-vendedor > p .q-icon {
  color: #07843d;
}
.biografia {
  margin: 18px 0;
  color: var(--texto-principal);
  line-height: 1.5;
  white-space: pre-line;
}
@media (max-width: 480px) {
  .pagina-vendedor {
    width: 100%;
    padding-top: 0;
    padding-right: 0;
    padding-left: 0;
  }
  .cabecera-vendedor {
    width: 100%;
    margin-top: 0;
    margin-inline: 0;
    border-top: 0;
    border-inline: 0;
    border-radius: 0 0 20px 20px;
  }
  .pagina-vendedor > .cuadricula-productos {
    margin-right: 16px;
    margin-left: 16px;
  }
  .portada-vendedor {
    height: 180px;
  }
}
</style>
