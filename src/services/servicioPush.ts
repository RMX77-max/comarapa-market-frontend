import { Capacitor } from '@capacitor/core';
import {
  PushNotifications,
  type ActionPerformed,
  type PushNotificationSchema,
  type Token,
} from '@capacitor/push-notifications';
import type { Router } from 'vue-router';
import { servicioApi } from 'src/services/servicioApi';

let inicializado = false;
let tokenActual = '';

function obtenerRuta(datos: Record<string, unknown> | undefined): string | null {
  const ruta = datos?.ruta;
  return typeof ruta === 'string' && ruta.startsWith('/') ? ruta : null;
}

async function guardarToken(token: Token): Promise<void> {
  tokenActual = token.value;
  await servicioApi.post('/dispositivos/push', {
    token: token.value,
    plataforma: Capacitor.getPlatform(),
  });
}

async function abrirDesdeNotificacion(accion: ActionPerformed, router: Router): Promise<void> {
  const ruta = obtenerRuta(accion.notification.data);
  if (ruta) await router.push(ruta);
}

export async function inicializarNotificacionesPush(router: Router): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  if (inicializado) {
    if (tokenActual) {
      await servicioApi.post('/dispositivos/push', {
        token: tokenActual,
        plataforma: Capacitor.getPlatform(),
      });
    } else {
      await PushNotifications.register();
    }
    return;
  }

  inicializado = true;

  await PushNotifications.addListener('registration', (token) => {
    void guardarToken(token).catch(() => undefined);
  });

  await PushNotifications.addListener('registrationError', (error) => {
    console.warn('No fue posible registrar las notificaciones push.', error);
  });

  await PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (accion: ActionPerformed) => {
      void abrirDesdeNotificacion(accion, router);
    },
  );

  await PushNotifications.addListener(
    'pushNotificationReceived',
    (_notificacion: PushNotificationSchema) => {
      void _notificacion;
      window.dispatchEvent(new CustomEvent('comarapa-market:notificacion-recibida'));
    },
  );

  await Promise.all([
    PushNotifications.createChannel({
      id: 'mensajes',
      name: 'Mensajes',
      description: 'Mensajes y consultas sobre productos.',
      importance: 4,
    }),
    PushNotifications.createChannel({
      id: 'operaciones',
      name: 'Compras y ventas',
      description: 'Actualizaciones de pagos, comprobantes y entregas.',
      importance: 4,
    }),
    PushNotifications.createChannel({
      id: 'avisos',
      name: 'Avisos de Comarapa Market',
      description: 'Moderación, soporte y novedades de la cuenta.',
      importance: 3,
    }),
  ]);

  const permisoActual = await PushNotifications.checkPermissions();
  const permiso =
    permisoActual.receive === 'prompt'
      ? await PushNotifications.requestPermissions()
      : permisoActual;

  if (permiso.receive === 'granted') await PushNotifications.register();
}

export async function desvincularDispositivoPush(): Promise<void> {
  if (!Capacitor.isNativePlatform() || !tokenActual) return;

  try {
    await servicioApi.delete('/dispositivos/push', { data: { token: tokenActual } });
  } catch (error) {
    console.warn('No fue posible eliminar el token push del servidor.', error);
  } finally {
    tokenActual = '';
  }
}
