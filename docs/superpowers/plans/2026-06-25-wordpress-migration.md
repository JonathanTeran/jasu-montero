# Migración a WordPress — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar el sitio estático de Jasú Montero a un tema WordPress a medida con diseño idéntico, capa de edición gratis (CPTs + ACF gratis + Personalizador), blog/noticias, y desplegarlo en BanaHosting bajo `jasumontero.com` sin downtime.

**Architecture:** Tema clásico (PHP) que reutiliza tal cual `style.css`, `main.js` y `/assets` del sitio actual. La home (`front-page.php`) se ensambla con partes (`template-parts/`). Las secciones editables emiten **exactamente el mismo HTML** (clases/IDs/`data-*`) que `main.js` espera, alimentadas por el Personalizador (textos/redes) y CPTs nativos (`evento`, `foto`). El blog usa entradas nativas. Despliegue por cPanel en BanaHosting y cutover de DNS en DonDominio.

**Tech Stack:** WordPress 6.x · PHP 8.1+ · MySQL/MariaDB · ACF (gratis) · plugin de caché · cPanel/Softaculous (BanaHosting) · WP-CLI para desarrollo local.

**Fuente de verdad del diseño:** el repo estático actual en `/Users/jonathanteran/desarrollo/jasu_montero` (`index.html` 540 líneas, `style.css`, `main.js`, `assets/`). Cada port copia el markup correspondiente **verbatim** desde ahí.

## Global Constraints

- **Diseño EXACTO:** el HTML renderizado debe coincidir 1:1 con el actual — mismas clases, IDs y atributos `data-*` — o `main.js` se rompe. Verificación = paridad visual + efectos funcionando.
- **Stack 100% gratis:** solo ACF versión gratis y plugins gratuitos. Prohibido ACF Pro (repetidores/galería/options page de Pro). Usar CPTs nativos + Personalizador en su lugar.
- **Secciones estáticas (no editables en esta fase):** tornamesa/setlist, videos de TV, línea de tiempo y efectos interactivos. Quedan codificadas en el tema.
- **Idioma del contenido:** español (`es-EC`).
- **SEO conservado:** portar `<head>` actual (meta, canonical, Open Graph, Twitter, JSON-LD, favicons) a `header.php`; mantener `robots.txt`/`sitemap.xml`.
- **El tema vive en un proyecto nuevo** `~/desarrollo/jasu-montero-wp/` (repo aparte del sitio estático, que NO se publica en GitHub Pages).
- **Commits frecuentes**, uno por tarea como mínimo.

---

# FASE A — Tema WordPress en local

## Task 1: Entorno WordPress local

**Files:**
- Create: `~/desarrollo/jasu-montero-wp/` (proyecto WP local + repo git)

**Interfaces:**
- Produces: una instalación WordPress accesible en `http://localhost:8888` con WP-CLI funcional; ruta del tema `wp-content/themes/jasu-montero`.

- [ ] **Step 1: Verificar herramientas**

Run: `php -v && (wp --info || echo "WP-CLI faltante")`
Expected: PHP 8.1+; si falta WP-CLI, instalarlo (`curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && chmod +x wp-cli.phar && sudo mv wp-cli.phar /usr/local/bin/wp`).

- [ ] **Step 2: Crear proyecto y descargar WP**

```bash
mkdir -p ~/desarrollo/jasu-montero-wp && cd ~/desarrollo/jasu-montero-wp
git init
wp core download --locale=es_ES
```

- [ ] **Step 3: Configurar base de datos local (SQLite, sin MySQL)**

Usar el plugin oficial SQLite para evitar montar MySQL en local:
```bash
wp config create --dbname=wp --dbuser=root --dbpass="" --skip-check
mkdir -p wp-content/plugins
cd wp-content/plugins && curl -L -o sqlite.zip https://downloads.wordpress.org/plugin/sqlite-database-integration.zip && unzip -o sqlite.zip && rm sqlite.zip && cd ../../
cp wp-content/plugins/sqlite-database-integration/db.copy wp-content/db.php
# Editar wp-content/db.php según instrucciones del plugin (ruta DB), o usar el dropin automático
```
*(Alternativa si hay Docker: `npx @wordpress/env` con un `.wp-env.json` que monte el tema. Elegir UNA vía y documentarla en el commit.)*

- [ ] **Step 4: Instalar WP y levantar servidor**

```bash
wp core install --url="http://localhost:8888" --title="Jasú Montero" --admin_user=admin --admin_password=admin --admin_email=jteran@fef.ec --skip-email
wp server --host=localhost --port=8888 &
```

- [ ] **Step 5: Verificar**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8888`
Expected: `200`. Abrir `http://localhost:8888/wp-admin` (admin/admin) y confirmar el escritorio de WP.

- [ ] **Step 6: Commit**

```bash
printf "wp-content/db.php\nwp-content/database/\nwp-content/uploads/\nwp-config.php\n*.log\n" > .gitignore
git add .gitignore && git commit -m "chore: entorno WordPress local (SQLite)"
```

---

## Task 2: Esqueleto del tema + assets

**Files:**
- Create: `wp-content/themes/jasu-montero/style.css`
- Create: `wp-content/themes/jasu-montero/functions.php`
- Create: `wp-content/themes/jasu-montero/index.php`
- Create: `wp-content/themes/jasu-montero/assets/` (copia de `assets/` del sitio estático)
- Create: `wp-content/themes/jasu-montero/js/main.js` (copia)
- Create: `wp-content/themes/jasu-montero/css/style.css` (copia de estilos actuales)

**Interfaces:**
- Produces: tema "Jasú Montero" activable; helper `jm_asset($path)` para URLs de assets; estilos y `main.js` encolados.

- [ ] **Step 1: Copiar activos del sitio estático**

```bash
SRC=~/desarrollo/jasu_montero
DST=~/desarrollo/jasu-montero-wp/wp-content/themes/jasu-montero
mkdir -p "$DST/js" "$DST/css"
cp -R "$SRC/assets" "$DST/assets"
cp "$SRC/main.js" "$DST/js/main.js"
cp "$SRC/style.css" "$DST/css/style.css"
```

- [ ] **Step 2: Cabecera del tema (`style.css`)**

```css
/*
Theme Name: Jasú Montero
Theme URI: https://jasumontero.com
Author: Jonathan Teran
Description: Tema a medida — La Función. Port exacto del sitio estático.
Version: 1.0.0
Requires at least: 6.0
Requires PHP: 8.1
Text Domain: jasu-montero
*/
/* Los estilos reales viven en css/style.css (encolado en functions.php). */
```

- [ ] **Step 3: `functions.php` (soportes + encolado de assets)**

```php
<?php
if (!defined('ABSPATH')) exit;

function jm_asset($path) {
    return get_stylesheet_directory_uri() . '/' . ltrim($path, '/');
}

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['style', 'script']);
    register_nav_menus(['principal' => 'Menú principal']);
});

add_action('wp_enqueue_scripts', function () {
    $ver = '1.0.0';
    wp_enqueue_style('jm-fonts', 'https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Archivo:wght@300;400;500;600;700&display=swap', [], null);
    wp_enqueue_style('jm-main', jm_asset('css/style.css'), ['jm-fonts'], $ver);
    wp_enqueue_script('jm-tiktok', 'https://www.tiktok.com/embed.js', [], null, true);
    wp_enqueue_script('jm-main', jm_asset('js/main.js'), [], $ver, true);
});
```

- [ ] **Step 4: `index.php` mínimo**

```php
<?php get_header(); ?>
<main><p style="padding:4rem;text-align:center">Plantilla base.</p></main>
<?php get_footer(); ?>
```

- [ ] **Step 5: Activar el tema y verificar assets**

```bash
cd ~/desarrollo/jasu-montero-wp
wp theme activate jasu-montero
curl -s "http://localhost:8888/wp-content/themes/jasu-montero/css/style.css" -o /dev/null -w "css %{http_code}\n"
curl -s "http://localhost:8888/wp-content/themes/jasu-montero/js/main.js" -o /dev/null -w "js %{http_code}\n"
```
Expected: `css 200`, `js 200`.

- [ ] **Step 6: Commit**

```bash
git add wp-content/themes/jasu-montero && git commit -m "feat(theme): esqueleto del tema + assets encolados"
```

---

## Task 3: Port exacto de la home (estático)

Porta `header.php`, `footer.php`, `front-page.php` y las partes de sección copiando el markup **verbatim** desde `~/desarrollo/jasu_montero/index.html`.

**Files:**
- Create: `header.php`, `footer.php`, `front-page.php`
- Create: `template-parts/section-{hero,actos,musica,tv,galeria,experiencia,redes,contrato}.php`

**Interfaces:**
- Consumes: `jm_asset()` (Task 2).
- Produces: home renderizada **idéntica** al sitio estático.

- [ ] **Step 1: `header.php` — portar `<head>` SEO + apertura del body**

Copiar de `index.html` líneas 1–52 (desde `<!DOCTYPE html>` hasta el cierre del `<header class="nav">`), con estos cambios mínimos:
- Sustituir `<head>` por incluir `<?php wp_head(); ?>` justo antes de `</head>`.
- Mantener TODAS las meta (description, canonical, OG, Twitter, JSON-LD, favicons) tal cual.
- Cambiar `<html lang="es">` por `<html <?php language_attributes(); ?>>` y `<body data-loading>` por `<body <?php body_class('is-loading'); ?> data-loading>`.
- En los `href`/`src` de assets locales (`assets/...`), anteponer `<?php echo jm_asset('...'); ?>` o usar rutas absolutas del tema.
- Sustituir los enlaces de menú por el markup existente (se mantienen anclas `#seccion`).

- [ ] **Step 2: `footer.php` — portar créditos + scripts**

Copiar de `index.html` el `<footer class="credits">` hasta el final, sustituyendo el cierre por `<?php wp_footer(); ?></body></html>` y quitando los `<script src>` (ya se encolan en `functions.php`).

- [ ] **Step 3: `front-page.php` — ensamblar secciones**

```php
<?php get_header(); ?>
<main>
  <?php
  get_template_part('template-parts/section', 'hero');
  get_template_part('template-parts/section', 'actos');
  get_template_part('template-parts/section', 'musica');
  get_template_part('template-parts/section', 'tv');
  get_template_part('template-parts/section', 'galeria');
  get_template_part('template-parts/section', 'experiencia');
  get_template_part('template-parts/section', 'redes');
  get_template_part('template-parts/section', 'contrato');
  ?>
</main>
<?php get_footer(); ?>
```

- [ ] **Step 4: Crear cada `template-parts/section-*.php`**

Para cada parte, copiar **verbatim** el `<section>` correspondiente desde `index.html`, anteponiendo `jm_asset()` a las rutas de imágenes locales. Mapa de secciones → markup fuente:
- `section-hero.php` → `<section class="hero" id="inicio">` (incluye logo `hero__logo`, botón `#showStart`).
- `section-actos.php` → `<section class="acts" id="actos">` (línea de tiempo, estática).
- `section-musica.php` → `<section class="deck" id="musica">` (tornamesa, estática, con su `setlist`).
- `section-tv.php` → `<section ... id="tv">` (TV retro, estática).
- `section-galeria.php` → `<section ... id="galeria">` (de momento estática; se hará editable en Task 6).
- `section-experiencia.php` → `<section class="tickets" id="boletos">` (de momento estática; editable en Task 5).
- `section-redes.php` → `<section class="social" id="redes">` (TikTok embed + tarjeta IG).
- `section-contrato.php` → `<section class="backstage" id="backstage">`.

- [ ] **Step 5: Verificar paridad visual y efectos**

```bash
curl -s "http://localhost:8888/" | grep -c 'class="hero__logo"\|id="redes"\|tiktok-embed\|setlist__row'
```
Expected: coincidencias > 0 para cada patrón. Luego abrir `http://localhost:8888/` en el navegador y confirmar: telón abre + jingle, hero con logo, tornamesa reproduce la 1ª canción, TV cambia de canal, galería 3D gira, sección redes con TikTok, sin errores en consola. Comparar lado a lado con `https://jasumontero.com`.

- [ ] **Step 6: Commit**

```bash
git add wp-content/themes/jasu-montero && git commit -m "feat(theme): port exacto de la home (estático)"
```

---

## Task 4: Capa editable — textos y redes (Personalizador)

**Files:**
- Create: `inc/customizer.php`
- Modify: `functions.php` (incluir `inc/customizer.php`)
- Modify: `template-parts/section-hero.php`, `section-redes.php`, `section-contrato.php`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: helper `jm_opt($key, $default)` que devuelve un theme_mod con fallback al texto actual.

- [ ] **Step 1: Registrar ajustes del Personalizador (`inc/customizer.php`)**

```php
<?php
if (!defined('ABSPATH')) exit;

function jm_opt($key, $default = '') {
    return get_theme_mod($key, $default);
}

add_action('customize_register', function ($wp) {
    $wp->add_section('jm_global', ['title' => 'Jasú — Textos y Redes', 'priority' => 30]);

    $fields = [
        'jm_hero_kicker'   => ['Hero · kicker', 'Función única · Guayaquil · Ecuador'],
        'jm_hero_roles'    => ['Hero · roles', 'Cantante ✦ Presentadora ✦ Actriz'],
        'jm_contrato_email'=> ['Contrato · email', 'contrataciones@jasumontero.com'],
        'jm_ig'            => ['Instagram URL', 'https://www.instagram.com/jasumontero_/'],
        'jm_tiktok'        => ['TikTok URL', 'https://www.tiktok.com/@jasumonterop'],
        'jm_youtube'       => ['YouTube URL', 'https://www.youtube.com/@JasuMonteroOficial'],
        'jm_facebook'      => ['Facebook URL', 'https://www.facebook.com/jasumontero'],
        'jm_spotify'       => ['Spotify URL', 'https://open.spotify.com/artist/5JsuwL8y8HYp6xwAgBlFYM'],
    ];
    foreach ($fields as $id => [$label, $default]) {
        $wp->add_setting($id, ['default' => $default, 'sanitize_callback' => 'wp_kses_post']);
        $wp->add_control($id, ['label' => $label, 'section' => 'jm_global', 'type' => 'text']);
    }
});
```

- [ ] **Step 2: Incluir en `functions.php`**

Añadir al final: `require get_stylesheet_directory() . '/inc/customizer.php';`

- [ ] **Step 3: Cablear las partes**

En `section-hero.php`, sustituir el texto del kicker por `<?php echo esc_html(jm_opt('jm_hero_kicker', 'Función única · Guayaquil · Ecuador')); ?>` (igual para roles). En `section-redes.php` y `section-contrato.php`, sustituir los `href`/handles por `esc_url(jm_opt('jm_tiktok', ...))`, etc. **Mantener el mismo markup**.

- [ ] **Step 4: Verificar**

En `http://localhost:8888/wp-admin/customize.php` → sección "Jasú — Textos y Redes", cambiar el kicker del hero, Guardar, recargar la home y confirmar el cambio. Confirmar que con los campos vacíos se muestran los defaults.

- [ ] **Step 5: Commit**

```bash
git add wp-content/themes/jasu-montero && git commit -m "feat(theme): textos y redes editables vía Personalizador"
```

---

## Task 5: Capa editable — Experiencia VIP / Eventos (CPT + ACF gratis)

**Files:**
- Create: `inc/cpt-evento.php`
- Modify: `functions.php`
- Modify: `template-parts/section-experiencia.php`

**Interfaces:**
- Produces: CPT `evento` con campos `etiqueta`, `lugar`, `cuando`, `cta_texto`, `cta_url`.

- [ ] **Step 1: Registrar CPT + campos ACF por código (`inc/cpt-evento.php`)**

```php
<?php
if (!defined('ABSPATH')) exit;

add_action('init', function () {
    register_post_type('evento', [
        'label' => 'Eventos / VIP',
        'public' => true, 'has_archive' => false,
        'menu_icon' => 'dashicons-tickets-alt',
        'supports' => ['title', 'page-attributes', 'thumbnail'],
        'rewrite' => ['slug' => 'evento'],
    ]);
});

add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) return;
    acf_add_local_field_group([
        'key' => 'group_evento',
        'title' => 'Detalles del evento',
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'evento']]],
        'fields' => [
            ['key' => 'f_etiqueta', 'label' => 'Etiqueta', 'name' => 'etiqueta', 'type' => 'text'],
            ['key' => 'f_lugar', 'label' => 'Lugar', 'name' => 'lugar', 'type' => 'text'],
            ['key' => 'f_cuando', 'label' => 'Cuándo', 'name' => 'cuando', 'type' => 'text'],
            ['key' => 'f_cta_txt', 'label' => 'Botón (texto)', 'name' => 'cta_texto', 'type' => 'text'],
            ['key' => 'f_cta_url', 'label' => 'Botón (URL)', 'name' => 'cta_url', 'type' => 'url'],
        ],
    ]);
});
```

- [ ] **Step 2: Instalar ACF gratis e incluir el archivo**

```bash
cd ~/desarrollo/jasu-montero-wp && wp plugin install advanced-custom-fields --activate
```
Añadir a `functions.php`: `require get_stylesheet_directory() . '/inc/cpt-evento.php';`

- [ ] **Step 3: Render dinámico en `section-experiencia.php`**

Sustituir las tarjetas estáticas por un loop que **emita el mismo markup `.ticket`**:

```php
<?php
$q = new WP_Query(['post_type' => 'evento', 'posts_per_page' => 6, 'orderby' => 'menu_order', 'order' => 'ASC']);
while ($q->have_posts()) : $q->the_post();
  $tag = get_field('etiqueta'); $lugar = get_field('lugar');
  $cuando = get_field('cuando'); $cta_t = get_field('cta_texto'); $cta_u = get_field('cta_url');
?>
  <article class="ticket" data-tilt>
    <div class="ticket__main">
      <?php if ($tag): ?><p class="ticket__tag"><?php echo esc_html($tag); ?></p><?php endif; ?>
      <h3><?php the_title(); ?></h3>
      <?php if ($lugar): ?><p class="ticket__where"><?php echo esc_html($lugar); ?></p><?php endif; ?>
      <?php if ($cuando): ?><p class="ticket__when"><?php echo esc_html($cuando); ?></p><?php endif; ?>
      <?php if ($cta_u): ?><a class="ticket__btn" href="<?php echo esc_url($cta_u); ?>" data-magnet><?php echo esc_html($cta_t ?: 'Ver'); ?></a><?php endif; ?>
    </div>
    <div class="ticket__stub"><span class="ticket__barcode" aria-hidden="true"></span><span class="ticket__seat"><?php the_title(); ?></span></div>
  </article>
<?php endwhile; wp_reset_postdata(); ?>
```
Mantener el `<header class="sec-head">` y el contenedor `.tickets__row` tal cual.

- [ ] **Step 4: Sembrar los eventos actuales**

```bash
wp post create --post_type=evento --post_status=publish --post_title="Noche de Rockola" --menu_order=1
wp post create --post_type=evento --post_status=publish --post_title="IG Live con fans" --menu_order=2
```
Editar cada uno en el admin para completar etiqueta/lugar/cuándo/botón con los valores actuales del sitio.

- [ ] **Step 5: Verificar**

Recargar la home → la sección "Tu experiencia VIP" muestra los eventos desde WP, con el mismo diseño de tarjeta. Crear un evento nuevo de prueba y confirmar que aparece.

- [ ] **Step 6: Commit**

```bash
git add wp-content/themes/jasu-montero && git commit -m "feat(theme): Experiencia VIP/Eventos editables (CPT + ACF gratis)"
```

---

## Task 6: Capa editable — Galería (CPT foto)

**Files:**
- Create: `inc/cpt-foto.php`
- Modify: `functions.php`, `template-parts/section-galeria.php`

**Interfaces:**
- Produces: CPT `foto` (imagen destacada + orden).

- [ ] **Step 1: Registrar CPT `foto` (`inc/cpt-foto.php`)**

```php
<?php
if (!defined('ABSPATH')) exit;
add_action('init', function () {
    register_post_type('foto', [
        'label' => 'Galería',
        'public' => true, 'has_archive' => false,
        'menu_icon' => 'dashicons-format-gallery',
        'supports' => ['title', 'thumbnail', 'page-attributes'],
    ]);
});
```
Incluir en `functions.php`: `require get_stylesheet_directory() . '/inc/cpt-foto.php';`

- [ ] **Step 2: Render dinámico en `section-galeria.php`**

Reemplazar las `<img>` estáticas por un loop que **emita el mismo markup** que `main.js` espera para la galería 3D (revisar en `index.html` la estructura exacta de los ítems — clases tipo `ring__item` u `<img>` con `loading="lazy"`), iterando `WP_Query(['post_type'=>'foto','orderby'=>'menu_order'])` y usando `the_post_thumbnail()`/`get_the_post_thumbnail_url()` dentro del mismo contenedor.

- [ ] **Step 3: Sembrar fotos**

Importar a la mediateca las fotos actuales y crear un `foto` por cada una con su imagen destacada:
```bash
for f in ~/desarrollo/jasu_montero/assets/img/jasu-look-*.jpg; do
  id=$(wp media import "$f" --porcelain)
  pid=$(wp post create --post_type=foto --post_status=publish --post_title="$(basename "$f" .jpg)" --porcelain)
  wp post meta update "$pid" _thumbnail_id "$id"
done
```

- [ ] **Step 4: Verificar**

Recargar la home → la galería 3D muestra las fotos desde WP y **sigue girando** (efecto intacto). Añadir una foto nueva en el admin y confirmar que aparece.

- [ ] **Step 5: Commit**

```bash
git add wp-content/themes/jasu-montero && git commit -m "feat(theme): galería editable (CPT foto)"
```

---

## Task 7: Blog / Noticias

**Files:**
- Create: `archive.php`, `single.php`
- Create: `template-parts/section-noticias.php`
- Modify: `front-page.php` (insertar teaser), `header.php` (enlace "Noticias" en el menú)

**Interfaces:**
- Consumes: `get_header`/`get_footer`.

- [ ] **Step 1: `single.php` — nota individual estilizada**

```php
<?php get_header(); ?>
<main class="post-single" style="max-width:760px;margin:0 auto;padding:8rem 1.4rem 4rem">
  <?php while (have_posts()) : the_post(); ?>
    <p class="kicker">Noticias</p>
    <h1 class="title-xl"><?php the_title(); ?></h1>
    <p style="color:var(--oro-suave)"><?php echo get_the_date(); ?></p>
    <?php if (has_post_thumbnail()) the_post_thumbnail('large'); ?>
    <div class="post-body"><?php the_content(); ?></div>
  <?php endwhile; ?>
</main>
<?php get_footer(); ?>
```

- [ ] **Step 2: `archive.php` — índice de noticias**

```php
<?php get_header(); ?>
<main class="news" style="max-width:1080px;margin:0 auto;padding:8rem 1.4rem 4rem">
  <header class="sec-head"><p class="kicker">Acto VII</p><h2 class="title-xl"><em>Noticias</em></h2></header>
  <div class="news__grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem">
    <?php while (have_posts()) : the_post(); ?>
      <a class="news__card" href="<?php the_permalink(); ?>" style="text-decoration:none;border:1px solid var(--line);border-radius:18px;overflow:hidden">
        <?php if (has_post_thumbnail()) the_post_thumbnail('medium'); ?>
        <div style="padding:1.1rem"><h3><?php the_title(); ?></h3><p style="color:var(--oro-suave)"><?php echo get_the_date(); ?></p></div>
      </a>
    <?php endwhile; ?>
  </div>
</main>
<?php get_footer(); ?>
```

- [ ] **Step 3: Teaser en la home (`section-noticias.php`) + insertar en `front-page.php`**

```php
<section class="news-teaser" id="noticias" style="padding:clamp(3rem,8vw,7rem) clamp(1.2rem,6vw,5rem)">
  <header class="sec-head"><p class="kicker">Acto VII · Al día</p><h2 class="title-xl">Últimas <em>noticias</em></h2></header>
  <div class="news__grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;max-width:1080px;margin:2rem auto 0">
    <?php $n = new WP_Query(['posts_per_page' => 3]); while ($n->have_posts()) : $n->the_post(); ?>
      <a class="news__card" href="<?php the_permalink(); ?>" style="text-decoration:none;border:1px solid var(--line);border-radius:18px;overflow:hidden">
        <?php if (has_post_thumbnail()) the_post_thumbnail('medium'); ?>
        <div style="padding:1.1rem"><h3><?php the_title(); ?></h3></div>
      </a>
    <?php endwhile; wp_reset_postdata(); ?>
  </div>
</section>
```
Insertar `get_template_part('template-parts/section', 'noticias');` en `front-page.php` antes de la sección de contrato. Añadir `<a href="<?php echo esc_url(home_url('/noticias')); ?>">Noticias</a>` al menú en `header.php`.

- [ ] **Step 4: Permalinks + post de prueba**

```bash
wp rewrite structure '/%postname%/' && wp rewrite flush
wp post create --post_status=publish --post_title="Bienvenidos al nuevo sitio" --post_content="Primera nota de prueba."
```

- [ ] **Step 5: Verificar**

Abrir `http://localhost:8888/noticias/` (índice estilizado), abrir la nota (estilo gala), y confirmar el teaser de últimas noticias en la home.

- [ ] **Step 6: Commit**

```bash
git add wp-content/themes/jasu-montero && git commit -m "feat(theme): blog/noticias estilizado + teaser en home"
```

---

## Task 8: QA local completa

**Files:** ninguno (verificación).

- [ ] **Step 1: Paridad visual y efectos** — comparar `http://localhost:8888/` vs `https://jasumontero.com` en desktop y móvil: telón+jingle, hero/logo, tornamesa (1ª canción suena), TV, galería 3D, redes/TikTok. Sin errores en consola.
- [ ] **Step 2: Flujos de edición** — editar un texto en el Personalizador, crear un evento, subir una foto, publicar una noticia; confirmar que todo se refleja sin tocar código.
- [ ] **Step 3: Rendimiento** — instalar plugin de caché (`wp plugin install wp-super-cache --activate` o LiteSpeed si aplica en BanaHosting) y activar.
- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: QA local + plugin de caché"
```

---

# FASE B — Despliegue en BanaHosting + cutover de DNS

> **Requiere acceso del usuario:** credenciales de cPanel de BanaHosting y panel de DonDominio. Coordinar antes de empezar. El sitio en GitHub Pages sigue vivo hasta el Step de cutover.

## Task 9: Provisionar BanaHosting

- [ ] **Step 1:** En cPanel, agregar el dominio `jasumontero.com` (Addon/Primary) y anotar la **IP del servidor** (cPanel → barra lateral → "IP compartida").
- [ ] **Step 2:** Crear base de datos MySQL + usuario (cPanel → MySQL Databases) y anotar credenciales.
- [ ] **Step 3:** Instalar WordPress (Softaculous → WordPress) en el dominio, idioma español.
- [ ] **Step 4:** Verificar acceso a `/wp-admin` por la URL temporal de BanaHosting o por IP.

## Task 10: Desplegar tema, plugins y contenido (staging)

- [ ] **Step 1:** Subir el tema `jasu-montero` a `wp-content/themes/` (SFTP o Administrador de archivos) y activarlo.
- [ ] **Step 2:** Instalar y activar plugins: **ACF (gratis)** y el de **caché**.
- [ ] **Step 3:** Migrar contenido local → producción. Opción WP-CLI: exportar local (`wp export`) e importar (`wp import`), + copiar `wp-content/uploads/`. Confirmar CPTs `evento`/`foto`, textos del Personalizador y noticias.
- [ ] **Step 4:** Revisar en la URL temporal: paridad visual + efectos + edición. Verificación = home idéntica a local.

## Task 11: Cutover de DNS (DonDominio → BanaHosting)

- [ ] **Step 1:** En **DonDominio → Zona DNS**, cambiar el registro **A** de `@` (y `www` si es A) de las IPs de GitHub a la **IP de BanaHosting** (Task 9). *(Recomendado mantener el DNS en DonDominio; alternativa: cambiar nameservers a los de BanaHosting.)*
- [ ] **Step 2:** En el repo del sitio estático (`~/desarrollo/jasu_montero`), **eliminar el archivo `CNAME`** y, en GitHub → Settings → Pages, quitar el dominio personalizado, para que GitHub no reclame `jasumontero.com`.
- [ ] **Step 3:** Tras propagar el DNS, activar **SSL (AutoSSL/Let's Encrypt)** en cPanel y forzar HTTPS.
- [ ] **Step 4:** Verificar: `curl -sI https://jasumontero.com` → `200`, servidor distinto de GitHub; la home WordPress carga con HTTPS.

## Task 12: SEO post-cutover

- [ ] **Step 1:** Generar `robots.txt` + `sitemap.xml` (plugin SEO como Rank Math/Yoast gratis, o el del tema) y confirmar que responden 200.
- [ ] **Step 2:** En Google Search Console, **reenviar el sitemap** y solicitar reindexación de la home.
- [ ] **Step 3:** Confirmar que no quedan rutas huérfanas (`/v7/` ya eliminada) y que `/noticias` resuelve.
- [ ] **Step 4:** Verificación final contra los **criterios de aceptación** del diseño.

---

## Notas de ejecución

- Tareas 1–8 las puede ejecutar un agente/dev en local de forma autónoma.
- Tareas 9–12 **requieren credenciales y acciones del usuario** (BanaHosting, DonDominio, Google) — coordinar en su momento.
- El diseño de referencia (criterios de aceptación) está en `docs/superpowers/specs/2026-06-25-wordpress-migration-design.md`.
