import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/iniciar-sesion',
    component: () => import('layouts/DisenoAutenticacion.vue'),
    meta: { soloInvitados: true },
    children: [
      {
        path: '',
        name: 'iniciar-sesion',
        component: () => import('pages/PaginaInicioSesion.vue'),
      },
    ],
  },
  {
    path: '/registro',
    component: () => import('layouts/DisenoAutenticacion.vue'),
    meta: { soloInvitados: true },
    children: [
      {
        path: '',
        name: 'registro',
        component: () => import('pages/PaginaRegistro.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('layouts/DisenoPrincipal.vue'),
    children: [
      {
        path: '',
        redirect: '/iniciar-sesion',
      },
      {
        path: 'inicio',
        name: 'inicio',
        component: () => import('pages/PaginaInicio.vue'),
      },
      {
        path: 'buscar',
        name: 'buscar',
        component: () => import('pages/PaginaBuscar.vue'),
        meta: { titulo: 'Buscar' },
      },
      {
        path: 'productos/:id',
        name: 'detalle-producto',
        component: () => import('pages/PaginaDetalleProducto.vue'),
        meta: { titulo: 'Detalle del producto' },
      },
      {
        path: 'publicar',
        name: 'publicar',
        component: () => import('pages/PaginaNuevaPublicacion.vue'),
        meta: { requiereAutenticacion: true, titulo: 'Nueva publicación' },
      },
      {
        path: 'mensajes',
        name: 'mensajes',
        component: () => import('pages/PaginaMensajes.vue'),
        meta: { requiereAutenticacion: true, titulo: 'Mensajes' },
      },
      {
        path: 'mensajes/:id',
        name: 'conversacion',
        component: () => import('pages/PaginaConversacion.vue'),
        meta: { requiereAutenticacion: true, titulo: 'Conversación', ocultarNavegacion: true },
      },
      {
        path: 'perfil',
        name: 'perfil',
        component: () => import('pages/PaginaPerfil.vue'),
        meta: { requiereAutenticacion: true, titulo: 'Perfil' },
      },
      {
        path: 'perfil/editar',
        name: 'editar-perfil',
        component: () => import('pages/PaginaEditarPerfil.vue'),
        meta: { requiereAutenticacion: true, titulo: 'Editar perfil' },
      },
      {
        path: 'mis-publicaciones',
        name: 'mis-publicaciones',
        component: () => import('pages/PaginaMisPublicaciones.vue'),
        meta: { requiereAutenticacion: true, titulo: 'Mis publicaciones' },
      },
      {
        path: 'publicaciones/:id/editar',
        name: 'editar-publicacion',
        component: () => import('pages/PaginaEditarPublicacion.vue'),
        meta: { requiereAutenticacion: true, titulo: 'Editar publicación' },
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    name: 'no-encontrada',
    component: () => import('pages/PaginaNoEncontrada.vue'),
  },
];

export default routes;
