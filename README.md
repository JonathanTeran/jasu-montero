# Jasú Montero — Sitio Oficial · «La Función»

Sitio web profesional para **Jasú Montero** (cantante, presentadora y actriz
ecuatoriana), presentado como una función de teatro interactiva.
HTML + CSS + JS puro, sin frameworks ni build: basta abrir `index.html` o
servirlo con cualquier servidor estático.

**En vivo:** https://jonathanteran.github.io/jasu-montero/

## La experiencia

- **Telón de apertura** con conteo 0→100 y cortinas de terciopelo
- **Hero** con su foto centrada sobre fondo difuminado y el nombre en cartel
- **Acto I** — la carrera 2000→hoy en tira horizontal fijada al scroll
- **Acto II** — tornamesa de vinilo **que suena**: 10 pistas de su Spotify con
  adelantos reales de 30 s, portada en la etiqueta, aguja y ecualizador
- **Acto III** — TV retro: cambiar de canal reproduce el video automáticamente
  (5 videoclips reales de su canal de YouTube), con estática de transición
- **Acto IV** — galería 3D arrastrable + mosaico de fotos, ambos con visor
- **Acto V** — boletos de entrada con código de barras (se puede convertir en
  venta real de entradas)
- **Gran final** — pase backstage (formulario de contrataciones) y créditos de cine

## Estructura

```
index.html       Página única
style.css        Estilos (tema teatral: Abril Fatface · Fraunces · Archivo)
main.js          Interacciones (telón, tornamesa, TV, galería, visor, form)
assets/img/      Fotos y portadas (ver nota)
assets/audio/    Adelantos de 30 s (ver nota)
v7/index.html    Redirección al sitio (enlaces antiguos compartidos)
v3/–v6/          Borradores locales de diseño, no publicados
```

## ⚠️ Material de ejemplo — reemplazar antes del lanzamiento

- **Fotos** (`assets/img/`): tomadas del canal público de YouTube de Jasú y de
  las portadas de Spotify, solo como maqueta. Reemplazar por las fotos
  oficiales que entregue la artista (los huecos están comentados con
  `REEMPLAZAR` en `index.html`).
- **Audio** (`assets/audio/preview-*.mp3`): clips públicos de 30 s de Spotify,
  solo para la demo. Para producción usar audio licenciado por ella o enlazar
  únicamente a Spotify.
- **Correos**: `contrataciones@jasumontero.com` es un marcador de posición.
- **Formulario**: hoy abre el correo del visitante (mailto). Para envío real
  sin servidor: crear formulario en formspree.io y poner su `action` en el
  `<form id="passForm">`.

## Pendientes / próximos pasos

- [ ] Fotos y textos oficiales aprobados por Jasú
- [ ] Correo real de contrataciones + Formspree
- [ ] Confirmar enlaces de Facebook y TikTok
- [ ] Si se aprueba: venta de boletos real (Eventbrite/PayPhone embebido en el Acto V)
- [ ] **Migración a WordPress** (tema a medida con los mismos diseños) para que
  el equipo de Jasú edite agenda, fotos y canciones sin tocar código
