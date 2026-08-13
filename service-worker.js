const CACHE_NAME = "catalogo-agrofield-v3";

const ARCHIVOS = [
    "./",
    "./index.html",
    "./css/styles.css",
    "./js/app.js",
    "./productos.json",
    "./manifest.json"
];


// ========================================
// INSTALACIÓN
// ========================================

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(async cache => {

                // ========================================
                // ARCHIVOS PRINCIPALES
                // ========================================

                await cache.addAll(ARCHIVOS);

                // ========================================
                // LEER PRODUCTOS
                // ========================================

                const respuesta =
                    await fetch("./productos.json");

                const productos =
                    await respuesta.json();

                // ========================================
                // OBTENER IMÁGENES
                // ========================================

                const imagenes = [];

                productos.forEach(producto => {

                    // Imagen principal
                    if (producto.IMAGEN) {

                        imagenes.push(
                            "./img/" +
                            producto.IMAGEN
                        );

                    }

                    // Galería
                    if (
                        Array.isArray(
                            producto.IMAGENES
                        )
                    ) {

                        producto.IMAGENES.forEach(
                            imagen => {

                                if (
                                    imagen &&
                                    imagen.ARCHIVO
                                ) {

                                    imagenes.push(
                                        "./img/" +
                                        imagen.ARCHIVO
                                    );

                                }

                            }
                        );

                    }

                });

                // ========================================
                // ELIMINAR DUPLICADOS
                // ========================================

                const imagenesUnicas =
                    [...new Set(imagenes)];

                console.log(
                    "Imágenes encontradas:",
                    imagenesUnicas.length
                );

                // ========================================
                // GUARDAR IMÁGENES
                // ========================================

                await cache.addAll(
                    imagenesUnicas
                );

                console.log(
                    "Catálogo completo guardado offline."
                );

            })

    );

    // Activar inmediatamente
    self.skipWaiting();

});


// ========================================
// ACTIVACIÓN
// ========================================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys
                        .filter(
                            key =>
                                key !== CACHE_NAME
                        )
                        .map(
                            key =>
                                caches.delete(key)
                        )

                );

            })

            .then(() => {

                return self.clients.claim();

            })

    );

});


// ========================================
// FETCH
// ========================================

self.addEventListener("fetch", event => {

    // Solo manejar solicitudes GET
    if (
        event.request.method !== "GET"
    ) {

        return;

    }

    event.respondWith(

        fetch(event.request)

            .then(response => {

                // ========================================
                // GUARDAR NUEVA VERSIÓN
                // ========================================

                const respuestaClonada =
                    response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {

                        cache.put(
                            event.request,
                            respuestaClonada
                        );

                    });

                return response;

            })

            .catch(() => {

                // ========================================
                // SIN INTERNET
                // → USAR CACHÉ
                // ========================================

                return caches.match(
                    event.request
                );

            })

    );

});