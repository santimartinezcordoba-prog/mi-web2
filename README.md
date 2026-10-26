SANTI MARTÍNEZ CÓRDOBA · 1.º DAM
================================

DISCOGRAFÍA — Mi vida, álbum a álbum.

Esta página web es un proyecto personal que reúne una discografía interactiva, proyectos de desarrollo y distintas funciones creadas para experimentar con el diseño web.

CONTENIDO
--------

- Discografía: sección para explorar álbumes y consultar sus fichas.
- Mis proyectos: acceso a diferentes proyectos personales, incluido un temporizador Pomodoro y PokeMultiPastel.
- Contacto: formulario para enviar mensajes y datos de contacto.
- Reproductor musical: interfaz para reproducir y consultar pistas.
- Juego Snake: minijuego integrado con controles de teclado.
- IA Simarro Rec: asistente interactivo con preguntas rápidas sobre la web.

TECNOLOGÍAS
-----------

La página está desarrollada con HTML, CSS y JavaScript.

OBJETIVO
--------

Practicar el desarrollo web y crear una página personal con una interfaz visual, interactiva y con varias funcionalidades.

## Decisiones técnicas

### 1. Modularización con ES Modules nativos

Se ha dividido el antiguo `script.js` en varios módulos dentro de `js/` usando `import/export` y cargando el proyecto mediante `<script type="module" src="js/main.js"></script>`.

La decisión principal fue usar **ES Modules nativos del navegador** en lugar de un bundler como Webpack, Vite o Rollup, porque el proyecto es estático, no necesita transpilación para navegadores modernos y permite mantener una arquitectura más simple y comprensible.

Ventajas:

- Cada archivo tiene una responsabilidad clara: audio, álbumes, modal, snake, contacto, IA, clima, etc.
- Las dependencias son explícitas gracias a `import`.
- Se evita tener un único archivo monolítico.
- No se añade un build obligatorio, lo que simplifica el despliegue en GitHub Pages.

Limitaciones:

- Los módulos ES requieren servirse por HTTP/HTTPS.
- No se recomienda abrir el proyecto directamente con `file://`.

### 2. Eliminación de manejadores inline y uso de event delegation

En el código original, las portadas usaban atributos inline como `onload` y `onerror`, y además se exponía una función global `window.__tryNext`.

En la versión modularizada se han eliminado esos atributos inline y se ha sustituido por `initCoverHandlers()`, que escucha eventos `load` y `error` desde `document` usando event delegation.

Ventajas:

- El HTML generado por JS queda más limpio.
- No se contaminan las variables globales.
- El comportamiento de carga/error de imágenes está centralizado en un módulo.
- Facilita mantener una Content Security Policy más estricta, porque se evita JS inline.
- Permite cambiar el sistema de portadas sin modificar el HTML.

WEB
---

https://santimartinezcordoba-prog.github.io/mi-web2/

AUTOR
-----

Santi Martínez Córdoba · 1.º DAM
