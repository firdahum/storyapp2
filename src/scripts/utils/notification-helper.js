import CONFIG from '../config.js';
import { getStoredToken } from '../api/api.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const BASE_API = CONFIG.SERVICE_ORIGIN;

export const NotificationHelper = {
  async sendNotification(title, options) {
    if (!('Notification' in window)) {
      console.error('Browser tidak mendukung notifikasi');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Izin notifikasi tidak diberikan');
      return;
    }

    new Notification(title, {
      body: options?.body || 'Notifikasi dari My Story App',
      icon: options?.icon || '/icons/android-chrome-192x192.png',
      ...options,
    });
  },

  async subscribe() {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker tidak tersedia di browser ini');
    }
    if (!('PushManager' in window)) {
      throw new Error('Push Manager tidak tersedia di browser ini');
    }

    const token = getStoredToken();
    if (!token) {
      throw new Error('Token tidak tersedia. Silakan login.');
    }

    // Ensure service worker is registered and ready
    const registration = await navigator.serviceWorker.register('/sw.js');

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
    });

    // subscription.toJSON() contains endpoint and keys as base64 strings
    const payload = subscription.toJSON();

    // Build the payload expected by the API: endpoint + nested keys object
    const payloadToSend = {
      endpoint: payload.endpoint,
      keys: {
        p256dh: payload.keys?.p256dh,
        auth: payload.keys?.auth,
      },
    };

    console.debug('[NotificationHelper] subscribe payload:', payloadToSend);

    const res = await fetch(`${BASE_API}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payloadToSend),
    });

    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      const txt = await res.text();
      console.error('[NotificationHelper] subscribe response parse error', txt);
      throw new Error(`Subscribe failed: ${res.status} ${txt}`);
    }

    if (!res.ok || data.error) {
      // try to surface server error details
      console.error('[NotificationHelper] subscribe failed', res.status, data);
      const msg = data && data.message ? data.message : `Gagal subscribe notifikasi (status ${res.status})`;
      throw new Error(msg);
    }

    console.debug('[NotificationHelper] subscribe success', data);
    return data;
  },

  async unsubscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Fitur unsubscribe tidak didukung di browser ini');
    }

    const token = getStoredToken();
    if (!token) {
      throw new Error('Token tidak tersedia. Silakan login.');
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      return { error: false, message: 'Tidak ada subscription aktif' };
    }

    const endpoint = subscription.endpoint;

    const res = await fetch(`${BASE_API}/notifications/subscribe`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      const msg = data && data.message ? data.message : 'Gagal unsubscribe notifikasi';
      throw new Error(msg);
    }

    // Unsubscribe locally as well
    await subscription.unsubscribe();

    return data;
  },
};