/* ============================================================
   ICONE FINANZAS — Service Worker
   Copyright © 2026 Jorge Hugo Pérez Gaona — ICONE ialabs.
   Todos los derechos reservados. Ver LICENSE.

   El manifest declaraba display:standalone pero no había service worker:
   la app se instalaba como aplicación y no abría sin internet. Encima,
   Chart.js y supabase-js vienen de CDN externo, así que sin señal ni
   siquiera pintaban las gráficas.

   Tres estrategias, según lo que se pide:

   HTML          red primero, caché de respaldo. Así una versión nueva se
                 ve apenas se publica, y sin señal abre la última buena.
                 (Lo contrario —caché primero— es lo que hacía creer que un
                 cambio no se había publicado cuando sí.)
   Estáticos     caché primero. Iconos, fondos, manifest y las librerías de
                 CDN: cambian solo cuando cambia la versión, y el nombre de
                 la caché lleva la versión dentro.
   Supabase      nunca se cachea. Son datos vivos y respuestas autenticadas;
                 guardarlas sería servir saldos viejos, o los de otra sesión.
   ============================================================ */

const VERSION = 'v0.29';
const CACHE = 'icone-finanzas-' + VERSION;

const ESENCIALES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './img/icono.svg',
  './img/icono-32.png',
  './img/icono-180.png',
  './img/icono-192.png',
  './img/icono-512.png',
  './img/fondo-dashboard.webp',
  './img/fondo-saldos.webp',
  './img/fondo-ingresos.webp',
  './img/fondo-egresos.webp',
  './img/fondo-recibos.webp',
  './img/fondo-config.webp',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // Una por una: si un CDN falla, no se cae la instalación entera.
    await Promise.all(ESENCIALES.map(u => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const viejas = (await caches.keys()).filter(k => k.startsWith('icone-finanzas-') && k !== CACHE);
    await Promise.all(viejas.map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

const esSupabase = url => url.hostname.endsWith('.supabase.co');

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (esSupabase(url)) return;              // datos vivos: siempre a la red

  // El documento: red primero.
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith((async () => {
      try {
        const fresca = await fetch(req);
        const c = await caches.open(CACHE);
        c.put('./index.html', fresca.clone());
        return fresca;
      } catch (_) {
        return (await caches.match('./index.html')) ||
               new Response('<h1>Sin conexión</h1><p>Abre la app una vez con internet para poder usarla sin señal.</p>',
                            { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
    return;
  }

  // Todo lo demás: caché primero, y si no está, red (guardando copia).
  e.respondWith((async () => {
    const guardada = await caches.match(req);
    if (guardada) return guardada;
    try {
      const r = await fetch(req);
      if (r && (r.ok || r.type === 'opaque')) {
        const c = await caches.open(CACHE);
        c.put(req, r.clone());
      }
      return r;
    } catch (_) {
      return Response.error();
    }
  })());
});
