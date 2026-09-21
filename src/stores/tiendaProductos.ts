import { defineStore } from 'pinia';
import type { Paginacion } from 'src/models/Api';
import type { Categoria } from 'src/models/Categoria';
import type { FiltrosProductos } from 'src/models/FormularioProducto';
import type { Producto } from 'src/models/Producto';
import {
  listarCategorias,
  listarMisPublicaciones,
  listarProductos,
  obtenerProducto,
} from 'src/services/servicioProductos';
import { obtenerMensajeError } from 'src/services/servicioApi';

export const useTiendaProductos = defineStore('productos', {
  state: () => ({
    categorias: [] as Categoria[],
    productos: [] as Producto[],
    misPublicaciones: [] as Producto[],
    productoActual: null as Producto | null,
    paginacion: null as Paginacion | null,
    cargando: false,
    error: '',
  }),
  actions: {
    async cargarCategorias() {
      if (this.categorias.length) return;
      this.categorias = await listarCategorias();
    },
    async cargarProductos(filtros: FiltrosProductos = {}) {
      this.cargando = true;
      this.error = '';
      try {
        const datos = await listarProductos(filtros);
        this.productos = datos.productos;
        this.paginacion = datos.paginacion;
      } catch (error) {
        this.error = obtenerMensajeError(error);
      } finally {
        this.cargando = false;
      }
    },
    async cargarProducto(id: number) {
      this.cargando = true;
      this.error = '';
      try {
        this.productoActual = await obtenerProducto(id);
      } catch (error) {
        this.productoActual = null;
        this.error = obtenerMensajeError(error);
      } finally {
        this.cargando = false;
      }
    },
    async cargarMisPublicaciones(page = 1) {
      this.cargando = true;
      this.error = '';
      try {
        const datos = await listarMisPublicaciones(page);
        this.misPublicaciones = datos.productos;
        this.paginacion = datos.paginacion;
      } catch (error) {
        this.error = obtenerMensajeError(error);
      } finally {
        this.cargando = false;
      }
    },
  },
});
