# Aspectos legales y licencias

Este documento es una guía técnica, no asesoramiento jurídico.

## Estado del código propio

No se ha elegido ni añadido una licencia al código de Dansk Dictionary. Por defecto no debe asumirse permiso de redistribución. La decisión requiere aprobación del propietario.

Opciones habituales para decidir más adelante:

- MIT: muy permisiva y breve; permite uso propietario conservando aviso.
- Apache-2.0: permisiva, con concesión explícita de patentes y avisos más extensos.
- GPL-3.0: copyleft fuerte para derivados distribuidos.
- AGPL-3.0: añade obligaciones para software ofrecido como servicio; probablemente excesiva para el cliente móvil actual.

Elegir una licencia para el código no cambia las obligaciones de los datos CC BY-SA ni las licencias individuales de medios.

## Wiktionary/Wikimedia

El texto se reutiliza bajo las condiciones indicadas por Wikimedia, normalmente CC BY-SA 4.0 y/o GFDL. La app conserva:

- enlace a la página;
- número de revisión;
- atribución a contribuidores;
- nombre y enlace de licencia;
- fecha de consulta;
- indicación de normalización/modificación.

La reutilización comercial es compatible con CC BY-SA si se cumplen sus condiciones. Antes de comercializar se debe revisar cómo ofrecer el texto de licencia, el aviso de modificaciones y el material derivado sujeto a compartir-igual.

## Contenido editorial

Las traducciones y ejemplos propios están separados por atribución. Como todavía no tienen licencia elegida, no deben mezclarse documentalmente con una afirmación de que todo el producto es CC BY-SA.

## Audio y TTS

No se almacenan grabaciones. El TTS lo produce el motor del dispositivo; sus condiciones pueden depender del proveedor del sistema. La aplicación solo solicita reproducción local y la identifica como sintética.

Cada audio humano futuro requiere revisar la licencia del archivo concreto, autor, atribución, modificaciones permitidas, uso comercial y almacenamiento offline. Commons puede alojar medios con licencias distintas.

## DDO

Den Danske Ordbog no es una fuente de datos del producto. No se ejecuta scraping y no se copian definiciones, ejemplos, audios, diseño ni base de datos. Cualquier cambio exige autorización o licencia explícita.

## Privacidad

La aplicación no usa cuenta, anuncios ni analítica. Las consultas se envían a Wikimedia; el dispositivo guarda historial, favoritos y caché en SQLite. Una política pública futura debería explicar dirección del proveedor, datos técnicos que Wikimedia pueda registrar, retención local y cómo borrar datos.

## Checklist antes de publicar o comercializar

1. Elegir licencia del código y del contenido editorial.
2. Revisar cumplimiento CC BY-SA/GFDL con un profesional si procede.
3. Publicar avisos de atribución y modificaciones accesibles.
4. Redactar política de privacidad.
5. Verificar términos/API y rate limits vigentes.
6. Auditar cada medio y dependencia.
7. Probar borrado de datos y experiencia offline en Android físico.
