# Comarapa Market – paquete de logo para Quasar, Web, PWA, Android e iOS

Logo basado en la imagen de referencia aportada, con los textos adaptados para navbar verde #004628. Conserva el paisaje original del símbolo de ubicación y el nombre en dos líneas.

## Instalación rápida

1. Copia el contenido de `07_quasar_public_icons` a `<tu-proyecto-quasar>/public/icons/`.
2. Para la barra verde, utiliza `/icons/logo-header.png` como `src` de la imagen del encabezado. El PNG es transparente y conserva el texto visible sobre verde oscuro.
3. Para el favicon, usa `/icons/favicon.ico` en tu configuración Quasar/HTML. Los favicons son **solo el símbolo**, sin letras.
4. Si trabajas con PWA, ajusta o fusiona `manifest.webmanifest` con el manifiesto generado por Quasar; en modo PWA, Quasar puede gestionar el manifiesto desde su configuración. Evita tener dos manifiestos en conflicto.
5. Para Google Play usa `04_android_con_letras/google-play-512x512.png`; para iOS usa `05_ios_con_letras/ios-app-icon-1024x1024.png`; para Apple Touch usa el PNG 180x180.
6. Para Android adaptable incluye `android-adaptive-foreground-432x432.png` y `android-adaptive-background-432x432.png`. El primer archivo deja márgenes seguros.

## Formatos y advertencias

- PNG con transparencia: logo de marca, logo horizontal y símbolo web.
- PNG con fondo verde sólido: iconos de PWA, Google Play y Apple Touch.
- ICO con varias resoluciones internas para navegador.
- SVG: contenedores que **incrustan PNG**, no vectores redibujados. No son logos vectoriales editables.
- PDF: imagen sobre página verde para revisión/impresión, no vectores editables.
- El logo maestro de 2048px es una ampliación de una ilustración raster original. No es arte nativo vectorial.
- Cuando un icono con letras se muestra muy pequeño, usa la carpeta de iconos opcionales sin letras para mejor legibilidad.

Colores: navbar `#004628`, texto principal `#FEFAEF`, texto secundario `#9BDF9D` y acento amarillo `#FFC107`.
