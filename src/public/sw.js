const CACHE_NAME = 'storyapp-shell-v1';
const DATA_CACHE = 'storyapp-data-v1';
const OUTBOX_STORE = 'outbox-requests-v1';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/scripts/index.js',
];

// IndexedDB
function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('storyapp-outbox', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        db.createObjectStore(OUTBOX_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function addOutbox(item) {
  const db = await openIDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    tx.objectStore(OUTBOX_STORE).add(item);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function getAllOutbox() {
  const db = await openIDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(OUTBOX_STORE, 'readonly');
    const req = tx.objectStore(OUTBOX_STORE).getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror = () => rej(req.error);
  });
}
async function deleteOutbox(id) {
  const db = await openIDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    tx.objectStore(OUTBOX_STORE).delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

// INSTALL
self.addEventListener('install', (evt) => {
  console.log('Service Worker installed');
  evt.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(FILES_TO_CACHE)).then(() => self.skipWaiting())
  );
});

// ACTIVATE
self.addEventListener('activate', (evt) => {
  console.log('Service Worker activated');
  evt.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE_NAME && k !== DATA_CACHE).map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// FETCH: cache-first for shell, network-first for API
self.addEventListener('fetch', (evt) => {
  const url = new URL(evt.request.url);

  // network-first for API (dicoding)
  if (url.origin === 'https://story-api.dicoding.dev') {
    evt.respondWith(
      caches.open(DATA_CACHE).then(async cache => {
        try {
          const resp = await fetch(evt.request);
          if (evt.request.method === 'GET' && resp && resp.ok) cache.put(evt.request, resp.clone());
          return resp;
        } catch (err) {
          const cached = await cache.match(evt.request);
          return cached || new Response(JSON.stringify({ error: true, message: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      })
    );
    return;
  }

  // navigation & assets => cache first then network
  evt.respondWith(
    caches.match(evt.request).then(cached => cached || fetch(evt.request).catch(async () => {
      if (evt.request.mode === 'navigate' || (evt.request.headers.get('accept')?.includes('text/html'))) {
        return caches.match('/offline.html');
      }
      return new Response('', { status: 404 });
    }))
  );
});

// PUSH: support JSON payload or plain text
self.addEventListener('push', (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { body: event.data.text() };
    }
  }

  const title = payload.title || 'Story App';
  const options = {
    body: payload.body || 'Ada pembaruan cerita baru.',
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/icon-192x192.png',
    data: payload.url || '/#/',
    actions: payload.actions || [{ action: 'open', title: 'Lihat' }],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// notificationclick: membuka tab yang sesuai
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(target) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(target);
      return null;
    })
  );
});

// message: menerima perintah dari page (QUEUE_OFFLINE_STORY)
self.addEventListener('message', (evt) => {
  const { type, payload } = evt.data || {};
  if (type === 'QUEUE_OFFLINE_STORY') {
    addOutbox(payload).catch(e => console.error('addOutbox failed', e));
  }
  if (type === 'SYNC_OUTBOX') {
    evt.waitUntil(syncOutbox());
  }
});

// mencoba sync outbox
async function syncOutbox() {
  const items = await getAllOutbox();
  for (const it of items) {
    try {
      // recreate FormData
      const fd = new FormData();
      if (it.description) fd.append('description', it.description);
      if (it.lat) fd.append('lat', it.lat);
      if (it.lon) fd.append('lon', it.lon);
      if (it.photoBlob && it.photoBlob.dataUrl) {
        // convert dataUrl back to blob
        const resp = await fetch(it.photoBlob.dataUrl);
        const blob = await resp.blob();
        fd.append('photo', new File([blob], it.photoBlob.name || 'photo.png', { type: it.photoBlob.type || blob.type }));
      }

      // send to API (no auth header here — server must accept or you must include token in item)
      await fetch('https://story-api.dicoding.dev/v1/stories', { method: 'POST', body: fd });
      await deleteOutbox(it.id);
    } catch (err) {
      console.warn('syncOutbox item failed, will retry later', err);
    }
  }
}

// background sync (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'story-sync') event.waitUntil(syncOutbox());
});