import { NotificationHelper } from './notification-helper.js';
import CONFIG from '../config.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const PushHelper = {
  async subscribeUser(reg) {
    // Delegate actual subscription and server registration to NotificationHelper
    const res = await NotificationHelper.subscribe();

    // Show a local confirmation notification
    await NotificationHelper.sendNotification(
      'Notifikasi Aktif!',
      {
        body: 'Kamu akan menerima pemberitahuan terbaru dari My Story App.',
        icon: '/icons/android-chrome-192x192.png',
      }
    );

    return res;
  },

  async unsubscribeUser(reg) {
    // Delegate server-side removal and local unsubscribe to NotificationHelper
    const res = await NotificationHelper.unsubscribe();
    return res;
  },
};