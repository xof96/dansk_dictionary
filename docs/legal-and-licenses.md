# Aspectos legales y licencias

Este documento es una guía técnica, no asesoramiento jurídico.

## Estado del código propio

El 13 de septiembre de 2026, el propietario aprobó mantener el código y el contenido editorial
propio sin licencia pública durante la beta. No se añade un archivo `LICENSE`: todos los derechos
sobre ese material permanecen reservados y no debe asumirse permiso para copiarlo, modificarlo o
redistribuirlo.

Esta decisión es temporal y puede revisarse antes de una publicación abierta. Opciones habituales:

- MIT: muy permisiva y breve; permite uso propietario conservando aviso.
- Apache-2.0: permisiva, con concesión explícita de patentes y avisos más extensos.
- GPL-3.0: copyleft fuerte para derivados distribuidos.
- AGPL-3.0: añade obligaciones para software ofrecido como servicio; probablemente excesiva para el cliente móvil actual.

Elegir una licencia para el código no cambia las obligaciones de los datos CC BY-SA ni las licencias individuales de medios.

## Wiktionary/Wikimedia

El texto original de las entradas de Wiktionary en inglés se ofrece bajo
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.es) y
[GFDL](https://www.gnu.org/licenses/fdl-1.3.html). Dansk Dictionary usa CC BY-SA 4.0 como vía de
reutilización del texto extraído. Esto no asigna esa licencia al código ni al contenido editorial
propio.

La app conserva y muestra:

- enlace a la página;
- número de revisión;
- atribución a contribuidores;
- nombre y enlace de licencia;
- fecha de consulta;
- indicación de normalización/modificación.

La URL guardada apunta a la revisión exacta mediante `oldid`. El aviso de cambios explica que se
extrae la sección danesa, se elimina sintaxis wiki y se normaliza el contenido al dominio de la
aplicación. Las traducciones y ejemplos pedagógicos propios aparecen con atribución separada.

La pantalla **Información** enlaza los [derechos de
Wiktionary](https://en.wiktionary.org/wiki/Wiktionary:Copyrights), CC BY-SA, GFDL y la política de
privacidad de Wikimedia. También aclara que Wikimedia no desarrolla, patrocina ni respalda Dansk
Dictionary.

## Contenido editorial

Las traducciones y ejemplos propios están separados por atribución. Como todavía no tienen licencia elegida, no deben mezclarse documentalmente con una afirmación de que todo el producto es CC BY-SA.

## Audio y TTS

No se almacenan grabaciones. El TTS lo produce el motor del dispositivo; sus condiciones pueden depender del proveedor del sistema. La aplicación solo solicita reproducción local y la identifica como sintética.

Cada audio humano futuro requiere revisar la licencia del archivo concreto, autor, atribución, modificaciones permitidas, uso comercial y almacenamiento offline. Commons puede alojar medios con licencias distintas.

## DDO

Den Danske Ordbog no es una fuente de datos del producto. No se ejecuta scraping y no se copian definiciones, ejemplos, audios, diseño ni base de datos. Cualquier cambio exige autorización o licencia explícita.

## Privacidad

La aplicación no usa cuenta, anuncios, analítica ni backend propio. Las consultas se envían a
Wikimedia; el dispositivo guarda historial, favoritos y caché en SQLite. La pantalla **Información**
explica qué sale del dispositivo, qué datos técnicos puede recibir Wikimedia, qué permanece en
local y cómo borrar cada categoría o todos los datos.

El texto completo está en la [Política de privacidad](privacy-policy.md). El propietario planea una
publicación pública y gratuita en Google Play y creó
`danskdictionary.support@gmail.com` como canal dedicado. El nombre público previsto del
desarrollador es **Dansk Dictionary**. Antes del envío solo falta activar GitHub Pages y comprobar
que la URL pública coincide con la declarada en la app y la ficha de la tienda. Que la app sea
gratuita no elimina los requisitos de la tienda.

## Dependencias y medios

El [inventario de dependencias y medios](third-party-inventory.md) registra las dependencias directas,
resume el árbol transitivo y separa fuentes, iconos, TTS y activos del repositorio. No se incluye
audio humano ni medios de Wiktionary, Commons o DDO.

## Checklist antes de publicar o comercializar

1. Reconsiderar la licencia del código y del contenido editorial antes de abrir su reutilización.
2. Sustituir los recursos 0BSD de la plantilla de Expo por la identidad visual definitiva.
3. Activar GitHub Pages, verificar la URL pública de privacidad y añadirla a la ficha de Google Play.
4. Generar avisos de terceros a partir del AAB/APK final.
5. Revisar cumplimiento CC BY-SA/GFDL con un profesional si procede.
6. Verificar términos/API y rate limits vigentes.
7. Probar en Android el borrado separado y completo, además de la experiencia offline.

Los puntos 2 a 4 son puertas explícitas para una beta pública. Una beta interna puede usar este
borrador, pero no debe presentarlo como política definitiva ni afirmar derechos no documentados.
