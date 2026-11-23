# El Cuquet PWA 0.1.0

https://rlledo-dev.github.io/elcuquet-pwa/

Catálogo de pruebas en GitHub Pages. Sin pagos, carrito, pedidos ni escrituras a WooCommerce.

## Fuente y actualización

Solo `https://pruebas-app.elcuquet.net/wp-json/wc/store/v1/` mediante GET, sin secretos ni autenticación. La API intermedia devuelve 403 en su raíz y la Store API no devuelve cabeceras CORS para Pages; por ello GitHub Actions genera `catalog.json` automáticamente al desplegar y cada hora (sujeto a retrasos del planificador de GitHub). No es una conexión en tiempo real. La fecha de lectura aparece en pantalla. Si falla una actualización se conserva el despliegue anterior.

El script obtiene todas las páginas de productos, categorías y variaciones públicas. WooCommerce es la única fuente: no hay edición manual del catálogo. Imágenes referenciadas exclusivamente al dominio de pruebas. Logo original obtenido del encabezado de la tienda de pruebas; iconos derivados sin inventar marca.

## Desarrollo y despliegue

HTML, CSS y JavaScript sin dependencias de navegador. Python 3.12 + Pillow 11.3.0 para catálogo e iconos. `.github/workflows/pages.yml` prepara y publica `dist` usando GitHub Pages Actions. El contenido generado se aloja en Pages, no se incorpora al repositorio. `node --check app.js` y `node --check sw.js` verifican sintaxis.

Manifest con ámbito `/elcuquet-pwa/`; service worker limitado a ese ámbito, interfaz y último catálogo disponibles sin conexión después de la primera consulta. Las fotos remotas necesitan conexión. Los datos guardados mantienen fecha visible. Compartir en WhatsApp abre el compositor, nunca envía automáticamente.

## Pendientes

Prueba de instalación y navegación en Safari de un iPhone físico; compra y pagos fuera de alcance. Para datos en tiempo real habría que autorizar CORS del origen de Pages en el proxy de pruebas y verificar su origen WooCommerce antes de usarlo. No se ha modificado ninguna configuración de servidor, producto, stock ni tienda real. Los repositorios de iOS y Mi Refugio solo se consultan.
