# Migración a WordPress — Sitio Jasú Montero

- **Fecha:** 2026-06-25
- **Estado:** Diseño aprobado (pendiente de revisión del documento)
- **Origen:** Sitio estático actual (HTML/CSS/JS) en GitHub Pages → `https://jasumontero.com`
- **Destino:** WordPress autoalojado en BanaHosting, mismo dominio

## Objetivo

Pasar el sitio a WordPress para que el equipo (Alexis/Jasú) pueda **editar contenido sin programador** y publicar un **blog/noticias**, **conservando el diseño actual idéntico** (telón, tornamesa con audio, TV retro, galería 3D, animaciones).

## Decisiones cerradas

| Tema | Decisión |
|------|----------|
| Plataforma | WordPress.org autoalojado |
| Diseño | **Exacto** — port 1:1 del sitio actual a un tema clásico a medida |
| Capa editable | **Gratis**: tipos de contenido nativos + ACF (gratis) + Personalizador. Sin ACF Pro, sin costos recurrentes |
| Profundidad de edición | "Lo esencial": blog, agenda/Experiencia VIP, galería, redes, textos principales |
| No editable (queda en el tema) | Tornamesa, videos de TV, línea de tiempo, efectos interactivos |
| Hosting | **BanaHosting** (cPanel) |
| Dominio/DNS | `jasumontero.com` en DonDominio → se repunta a BanaHosting |

## Arquitectura del tema

Tema **clásico** a medida (PHP), no de bloques, para control total del port.

```
jasu-montero-theme/
  style.css            (cabecera de tema + estilos actuales)
  functions.php        (enqueue de assets, registro de CPTs y campos, ajustes del Personalizador)
  front-page.php       (landing de una página, ensamblada por partes)
  header.php
  footer.php
  index.php
  archive.php          (índice de Noticias)
  single.php           (nota individual de Noticias)
  404.php
  template-parts/
    section-hero.php
    section-actos.php       (línea de tiempo — estático)
    section-musica.php      (tornamesa — estático)
    section-tv.php          (TV retro — estático)
    section-galeria.php     (galería — desde CPT Foto)
    section-experiencia.php (Experiencia VIP / Eventos — desde CPT Evento)
    section-redes.php        (desde Personalizador)
    section-contrato.php     (desde Personalizador)
    section-noticias.php     (teaser de últimas entradas)
  assets/              (img, audio actuales)
  js/main.js           (idéntico, encolado)
```

El `main.js` y `/assets` se cargan igual, por lo que **todos los efectos interactivos funcionan idénticos**. Cada parte que vuelve editable **emite exactamente el mismo HTML** (mismas clases/IDs/`data-*`) que `main.js` espera.

## Modelo de contenido editable (implementación gratis)

| Área | Mecanismo (gratis) |
|------|--------------------|
| **Textos principales** (kickers, títulos, bio, email de contrato) | **Personalizador de WP** (Customizer API, nativo) |
| **Redes** (IG, TikTok, YouTube, Facebook, Spotify) | **Personalizador de WP** |
| **Experiencia VIP / Agenda / Concursos** | **CPT `evento`** + campos ACF (gratis): etiqueta, lugar, fecha, texto, link/CTA |
| **Galería** | **CPT `foto`** (imagen destacada + orden) |
| **Blog / Noticias** | **Entradas nativas** de WP |

Notas de implementación:
- Los grupos de campos ACF se registran **por código** (`acf_add_local_field_group` en `functions.php`) para que viajen con el tema; no se configuran a mano en el admin.
- ACF Pro **no** es necesario: se evitan repetidores/galería/opciones de Pro usando CPTs nativos + Personalizador.
- La sección "Experiencia VIP" usa el CPT `evento`, lo que cubre la visión futura de **concursos/serenatas** (cada concurso = un "evento" con su título, premio/bases, fecha y botón).

## Blog / Noticias

- Entradas nativas en `jasumontero.com/noticias/` (índice `archive.php`) y notas individuales (`single.php`), **estilizadas al look de gala**, no al diseño genérico de WP.
- Enlace **"Noticias"** en el menú principal.
- Teaser de **últimas 3 entradas** en la home (`section-noticias.php`).

## Preservación del front-end interactivo

- Se porta el `<head>` SEO actual (meta, Open Graph, JSON-LD, favicons) a `header.php`, con WordPress generando `<title>`/canónica donde aplique.
- El telón/loader, tornamesa (jingle de apertura + audio real), TV retro, galería 3D y cursor reflector se mantienen tal cual (mismo `main.js`).
- Riesgo controlado: las secciones que pasan a editables (galería, eventos) deben renderizar el **mismo markup** que hoy para no romper `main.js`. Las secciones que dependen fuerte de JS (tornamesa, TV) se mantienen **estáticas** en esta fase.

## Hosting y despliegue (BanaHosting)

1. Crear base de datos MySQL y usuario en cPanel.
2. Instalar WordPress (Softaculous o manual) en el hosting.
3. Subir el tema a medida (`wp-content/themes/jasu-montero-theme/`) vía Administrador de archivos/SFTP y activarlo.
4. Cargar el contenido inicial: textos en el Personalizador, fotos en CPT `foto`, eventos en CPT `evento`, primeras noticias.
5. Instalar plugins mínimos: **ACF (gratis)** y un plugin de **caché** (p. ej. LiteSpeed Cache si el servidor es LiteSpeed, o WP Super Cache) para mantener el rendimiento.
6. Activar **SSL (AutoSSL/Let's Encrypt)** desde cPanel.

## Cutover de DNS (DonDominio → BanaHosting)

- Construcción y revisión en una **URL de prueba** (subdominio temporal o IP/host de BanaHosting) — el sitio en GitHub Pages sigue vivo mientras tanto.
- Al aprobar:
  - En **DonDominio → Zona DNS**, cambiar el registro **A** de `@` (y `www`) de las IPs de GitHub a la **IP del servidor de BanaHosting** (visible en cPanel). *(Alternativa: cambiar los nameservers a los de BanaHosting; se decide en el plan según preferencia.)*
  - **Quitar el `CNAME` del repo de GitHub** para que no reclame el dominio.
  - Confirmar **HTTPS** en BanaHosting tras propagar el DNS.
- **GitHub Pages queda como respaldo** (sin el dominio apuntando) por si hace falta revertir.

## Continuidad SEO

- Conservar **misma URL principal** y estructura.
- Regenerar `robots.txt` + `sitemap.xml` (un plugin SEO o el tema) y **reenviar el sitemap** en Google Search Console.
- Mantener Open Graph/JSON-LD/favicons ya creados.
- Redirección `/noticias` correcta; evitar páginas huérfanas (como ya se limpió `/v7/`).

## Fuera de alcance (YAGNI)

- Tienda / venta de entradas (WooCommerce) — no en esta fase.
- Edición de tornamesa, TV y línea de tiempo desde WP — quedan en el tema.
- Multi-idioma.
- Rediseño visual — el diseño es exacto al actual.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| WP es más pesado que un sitio estático | Plugin de caché + imágenes ya optimizadas |
| Mantenimiento (actualizaciones/seguridad) | Actualizaciones automáticas menores + respaldos de BanaHosting |
| Romper `main.js` al volver editable una sección | Renderizar el mismo markup; mantener tornamesa/TV estáticas |
| Downtime en el cambio de DNS | Construir y revisar en URL de prueba; cutover solo tras aprobar; GitHub como respaldo |

## Criterios de aceptación

1. La home en WordPress es **visualmente idéntica** a la actual y todos los efectos funcionan (telón, jingle, tornamesa, TV, galería 3D).
2. El equipo puede editar **textos, redes, galería, eventos/Experiencia VIP y publicar noticias** sin tocar código.
3. El blog `/noticias` funciona con índice y notas individuales estilizadas.
4. `jasumontero.com` sirve el sitio WordPress por **HTTPS** tras el cutover, sin downtime perceptible.
5. SEO conservado (meta, OG, JSON-LD, sitemap reenviado).
