# Jasú Montero — Sitio oficial

Sitio web profesional para **Jasú Montero** (cantante, presentadora y actriz ecuatoriana).
HTML + CSS + JS puro, sin frameworks ni build. Basta abrir `index.html` o servirlo
con cualquier servidor estático.

## Dos versiones de diseño

| Versión | URL | Estilo |
|---------|-----|--------|
| **V1 Clásica** | `/` | Glam editorial (Bodoni, dorado) con 3 temas: noche / claro / blanco |
| **V2 Neón** | `/v2/` | Neón-noir de club: duotono, slider de hero, collage rasgado, agenda de shows. Acento conmutable rosa / cian |

Cada versión enlaza a la otra desde el pie de página.

## Estructura

```
index.html              V1 — página única con todas las secciones
assets/css/style.css    V1 — estilos y los 3 temas de color
assets/js/main.js       V1 — temas, menú, animaciones, videos, formulario
v2/index.html           V2 — versión neón (usa las mismas imágenes)
v2/style.css            V2 — estilos neón + acentos rosa/cian
v2/main.js              V2 — slider, acento, video destacado, booking
assets/img/             Imágenes compartidas (ver nota abajo)
```

## Temas de color

Tres modos conmutables desde la barra superior (se recuerda la elección):

| Tema     | Descripción                                              |
|----------|----------------------------------------------------------|
| `noche`  | Oscuro (por defecto) — la foto en clave alta "salta"     |
| `claro`  | Champán cálido                                           |
| `blanco` | Blanco galería, minimalista                              |

Los colores viven en `assets/css/style.css` bajo `html[data-theme="..."]`.

## ⚠️ Imágenes — SOLO DE EJEMPLO

Las fotos actuales se descargaron del canal público de YouTube de Jasú
(avatar, banner y miniaturas de sus videos) **únicamente como maqueta**.
Antes de publicar, reemplazarlas por las fotos oficiales que entregue ella:

- `assets/img/jasu-retrato.jpg` — retrato del hero (ideal vertical o cuadrado, rostro arriba)
- `assets/img/video-*.jpg` — miniaturas de videos y portadas del blog

## Videos

Los videos son reales, de su canal oficial `@JasuMonteroOficial`, con carga
diferida (el iframe de YouTube solo se crea al hacer clic). Para cambiar un
video basta editar el atributo `data-video="ID"` en `index.html`.

## Formulario de contacto

Sin backend: hoy abre el correo del visitante (mailto a la dirección del
atributo `data-mailto` del `<form>`). Para envío real sin servidor:

1. Crear un formulario en [formspree.io](https://formspree.io) (gratis).
2. En el `<form id="contactForm">` poner `action="https://formspree.io/f/TU_ID"`
   y `method="POST"`, y eliminar `data-mailto`.
3. Quitar el manejador `submit` del formulario en `assets/js/main.js`.

## Pendientes antes de publicar

- [ ] Reemplazar fotos por las oficiales
- [ ] Confirmar correos reales (hoy: `contrataciones@` / `prensa@jasumontero.com`)
- [ ] Confirmar enlaces de Facebook y TikTok
- [ ] Redactar las entradas reales del blog (hoy son de ejemplo)
- [ ] Conectar el formulario (Formspree o backend propio)
