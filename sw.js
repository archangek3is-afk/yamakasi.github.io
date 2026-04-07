const BUILD = '1775566008';
const CACHE = 'okapi-dashboard-' + BUILD;
const BASE = '/yamakasi.github.io/';
const ASSETS = [
  BASE,
  BASE + 'dashboard.html',
  BASE + 'manifest.json',
  BASE + 'icon.svg',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js'
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
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

// Hosts that must NEVER be intercepted (Firebase realtime channels,
// long-polling, auth tokens). Returning early lets the browser handle
// them natively — caching them breaks Firestore sync.
const FIREBASE_BYPASS = [
  'googleapis.com',       // covers firestore/gmail/oauth2/identitytoolkit/...
  'firebaseio.com',
  'firebaseapp.com',
  'accounts.google.com',  // OAuth popup / GIS
  'apis.google.com',      // gapi loader
  'oauth2.googleapis.com'
];

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  let url;
  try { url = new URL(e.request.url); } catch (_) { return; }

  // Bypass Firebase entirely — never cache, never intercept
  if (FIREBASE_BYPASS.some(h => url.hostname === h || url.hostname.endsWith('.' + h))) {
    return; // let the browser handle it natively
  }

  // Network-first for the gstatic Firebase SDK (so we always get fresh
  // versions when we bump them), with cache fallback for offline.
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

  // Default: stale-while-revalidate for app shell
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached || caches.match(BASE + 'dashboard.html'));
      return cached || fetchPromise;
    })
  );
});
