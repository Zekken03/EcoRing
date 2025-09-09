const CACHE_NAME = 'ecoring-cache-v4';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalando...');
    
    // Forzar la activación del nuevo service worker inmediatamente
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Almacenando en caché los recursos principales');
                return cache.addAll(urlsToCache)
                    .then(() => {
                        console.log('Todos los recursos se han almacenado en caché');
                    })
                    .catch(error => {
                        console.error('Error al almacenar en caché:', error);
                        throw error;
                    });
            })
            .then(() => {
                console.log('Service Worker: Instalación completada');
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Activado');
    // Eliminar cachés antiguos
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Eliminando caché antigua:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
        .then(() => {
            // Tomar el control de todos los clientes
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', event => {
    // Excluir solicitudes de stream de la cámara
    if (event.request.url.includes('/stream')) {
        return fetch(event.request);
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Devuelve la respuesta en caché o realiza la petición
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('fetch', (event) => {
    // Excluye las solicitudes de stream de la cámara del caché
    if (event.request.url.includes('/stream')) {
        return fetch(event.request);
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
