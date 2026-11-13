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
    path: '/recuperar-contrasena',
    component: () => import('layouts/DisenoAutenticacion.vue'),
    meta: { soloInvitados: true },
    children: [
      {
        path: '',
        name: 'recuperar-contrasena',
        component: () => import('pages/PaginaRecuperarContrasena.vue'),
      },
    ],
  },
  {
    path: '/restablecer-contrasena',
    component: () => import('layouts/DisenoAutenticacion.vue'),
    meta: { soloInvitados: true },
    children: [
      {
        path: '',
        name: 'restablecer-contrasena',
        component: () => import('pages/PaginaRestablecerContrasena.vue'),
      },
    ],
  },
  {
    path: '/administracion',
    component: () => import('layouts/DisenoAdministracion.vue'),
    meta: { requiereAutenticacion: true, requiereAdministrador: true },
    children: [
      {
        path: '',
        name: 'administracion',
        component: () => import('pages/administracion/PaginaPanelAdministrativo.vue'),
        meta: { titulo: 'Panel administrativo' },
      },
      {
        path: 'notificaciones',
        name: 'administracion-notificaciones',
        component: () => import('pages/PaginaNotificaciones.vue'),
        meta: { titulo: 'Notificaciones' },
      },
      {
        path: 'publicaciones',
        name: 'administracion-publicaciones',
        component: () => import('pages/administracion/PaginaModeracionPublicaciones.vue'),
        meta: { titulo: 'Moderación de publicaciones' },
      },
      {
        path: 'usuarios',
        name: 'administracion-usuarios',
        component: () => import('pages/administracion/PaginaUsuariosAdministracion.vue'),
        meta: { titulo: 'Usuarios' },
      },
      {
        path: 'operaciones',
        name: 'administracion-operaciones',
        component: () => import('pages/administracion/PaginaOperacionesAdministrativas.vue'),
        meta: { titulo: 'Centro de operaciones' },
      },
      {
        path: 'mensajes',
        name: 'administracion-mensajes',
        component: () => import('pages/PaginaMensajes.vue'),
        meta: { titulo: 'Mensajes' },
      },
      {
        path: 'mensajes/:id',
        name: 'administracion-mensajes-conversacion',
        component: () => import('pages/PaginaConversacion.vue'),
        meta: { titulo: 'Mensaje' },
      },
      {
        path: 'servicios',
        name: 'administracion-servicios',
        component: () => import('pages/administracion/PaginaServiciosEspecialesAdministracion.vue'),
        meta: { titulo: 'Servicios especiales' },
      },
      {
        path: 'soporte',
        redirect: { name: 'administracion-operaciones', query: { tab: 'soporte' } },
      },
      {
        path: 'reportes',
        redirect: { name: 'administracion-operaciones', query: { tab: 'reportes' } },
      },
      {
        path: 'auditoria',
        name: 'auditoria-administrativa',
        component: () => import('pages/administracion/PaginaAuditoriaAdministrativa.vue'),
        meta: { titulo: 'Auditoría', requiereAdministrador: true },
      },
    ],
  },
  {
    path: '/',
    component: () => import('layouts/DisenoPrincipal.vue'),
    meta: { requiereAutenticacion: true },
    children: [
      {
        path: '',
        redirect: '/iniciar-sesion',
      },
      {
        path: 'notificaciones',
        name: 'notificaciones',
        component: () => import('pages/PaginaNotificaciones.vue'),
        meta: { titulo: 'Notificaciones' },
      },
      { path: 'soporte', name: 'soporte', component: () => import('pages/PaginaSoporte.vue') },
      { path: 'ordenes', name: 'ordenes', component: () => import('pages/PaginaOrdenes.vue') },
      {
        path: 'solicitar-producto',
        name: 'solicitar-producto',
        component: () => import('pages/PaginaSolicitarProducto.vue'),
      },
      {
        path: 'solicitar-prestamo',
        name: 'solicitar-prestamo',
        component: () => import('pages/PaginaPrestamosRedisenada.vue'),
      },
      {
        path: 'inmuebles',
        name: 'inmuebles',
        component: () => import('pages/PaginaInmueblesRedisenada.vue'),
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
        path: 'vendedores/:id',
        name: 'perfil-vendedor',
        component: () => import('pages/PaginaPerfilVendedor.vue'),
        meta: { titulo: 'Perfil del vendedor' },
      },
      {
        path: 'guardados',
        name: 'guardados',
        component: () => import('pages/PaginaGuardados.vue'),
        meta: { titulo: 'Guardados' },
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
        path: 'ajustes',
        name: 'ajustes',
        component: () => import('pages/PaginaAjustes.vue'),
        meta: { requiereAutenticacion: true, titulo: 'Apariencia' },
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
