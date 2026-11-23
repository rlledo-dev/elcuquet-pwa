# El Cuquet PWA 0.1.0

https://rlledo-dev.github.io/elcuquet-pwa/

Catálogo de pruebas en GitHub Pages. Sin pagos, carrito, pedidos ni escrituras a WooCommerce.

## Fuente y actualización

Solo `https://pruebas-app.elcuquet.net/wp-json/wc/store/v1/` mediante GET, sin secretos ni autenticación. La raíz de la API intermedia devuelve 403, pero sus rutas `/health` y `/v1/catalog` sí responden 200. Ni estas rutas ni la Store API devolvieron `Access-Control-Allow-Origin` al consultar con el origen de Pages; por ello GitHub Actions genera `catalog.json` automáticamente al desplegar y cada hora (sujeto a retrasos del planificador de GitHub). No es una conexión en tiempo real. La fecha de lectura aparece en pantalla. Si falla una actualización se conserva el despliegue anterior.

El script obtiene todas las páginas de productos, categorías y variaciones públicas. WooCommerce es la única fuente: no hay edición manual del catálogo. Imágenes referenciadas exclusivamente al dominio de pruebas. Logo original obtenido del encabezado de la tienda de pruebas; iconos derivados sin inventar marca.

## Desarrollo y despliegue

HTML, CSS y JavaScript sin dependencias de navegador. Python 3.12 + Pillow 11.3.0 para catálogo e iconos. `.github/workflows/pages.yml` prepara y publica `dist` usando GitHub Pages Actions. El contenido generado se aloja en Pages, no se incorpora al repositorio. `node --check app.js` y `node --check sw.js` verifican sintaxis.

Manifest con ámbito `/elcuquet-pwa/`; service worker limitado a ese ámbito, interfaz y último catálogo disponibles sin conexión después de la primera consulta. Las fotos remotas necesitan conexión. Los datos guardados mantienen fecha visible. Compartir en WhatsApp abre el compositor, nunca envía automáticamente.

## Pendientes

Prueba de instalación y navegación en Safari de un iPhone físico; compra y pagos fuera de alcance. Para datos en tiempo real habría que autorizar CORS del origen de Pages en el proxy de pruebas y verificar su origen WooCommerce antes de usarlo. No se ha modificado ninguna configuración de servidor, producto, stock ni tienda real. Los repositorios de iOS y Mi Refugio solo se consultan.

## Verificación del 23/11/2026

Despliegue GitHub Actions #2 completado correctamente. Página, JS, CSS, manifiesto, service worker, iconos y catálogo devuelven 200. Catálogo publicado: 192 productos, 42 categorías y 1.113 variaciones de los productos visibles. Origen comprobado: pruebas-app.elcuquet.net.

En Chrome, escritorio de 1080 px y vista móvil de 390 × 844: sin desbordamiento horizontal; logo e imágenes cargan; búsqueda «rosa vintage» devuelve un producto; búsqueda inexistente muestra estado vacío; categoría «Velas y bengalas» muestra 21 productos; ficha variable permite seleccionar números 1 y 2, muestra 0,00 € y 8,95 € respectivamente, de acuerdo con Store API. Enlace WhatsApp contiene la URL pública de la ficha y aviso de pruebas. No se envió ningún mensaje. Service worker listo, instrucciones de instalación visibles, sin errores/avisos de JavaScript en el recorrido. Revisión de patrones de secretos sin hallazgos; no se incorporaron credenciales.

Incidencia corregida: HTTP 429 en primera compilación por exceso de peticiones; variaciones agrupadas y consulta paginada con pausas y reintentos. La variante de pruebas a 0 € es un dato del origen, no un precio inventado ni un cambio aplicado a WooCommerce.

La instalación en Safari/iPhone físico y el modo avión en dispositivo no se han probado. La actualización horaria está programada, pero no se ha esperado a certificar una segunda ejecución por horario.
