const BUILD = '1775533114';
const CACHE = 'owm-hub-' + BUILD;
const BASE = '/';
const ASSETS = [
  BASE,
  BASE + 'hub.html',
  BASE + 'manifest_hub.json',
  BASE + 'icon_hub.svg',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js'
];

const FIREBASE_BYPASS = [
  'googleapis.com',
  'firebaseio.com',
  'firebaseapp.com',
  'accounts.google.com',
  'apis.google.com',
  'oauth2.googleapis.com'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.all(
      ASSETS.map(u => c.add(u).catch(() => null))
    ))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE && k.startsWith('owm-hub-')).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  let url;
  try { url = new URL(e.request.url); } catch (_) { return; }

  if (FIREBASE_BYPASS.some(h => url.hostname === h || url.hostname.endsWith('.' + h))) return;

  if (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/')) {
    e.respondWith(
      fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached || caches.match(BASE + 'hub.html'));
      return cached || fetchPromise;
    })
  );
});
