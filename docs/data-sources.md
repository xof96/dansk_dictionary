# Fuentes de datos

## Wiktionary mediante MediaWiki Action API

Estado: integrado como proveedor léxico principal.

- Endpoint: `https://en.wiktionary.org/w/api.php`.
- Métodos: `action=parse` para coincidencia exacta y `action=opensearch` para sugerencias.
- Datos usados: sección danesa del wikitext, pageid, revid, categorías gramaticales, plantillas de flexión, acepciones e IPA.
- Autenticación: no requiere clave.
- Disponibilidad: comprobada el 2 de agosto de 2026 con `hus`, `dag`, `lytter`, `arbejde`, `forstå`, `hedde`, `hedder`, `huset` y `husene`.
- CORS: se usa `origin=*`, mecanismo admitido por MediaWiki Action API.
- Licencia del texto original: CC BY-SA 4.0 y GFDL. El producto reutiliza mediante CC BY-SA 4.0,
  enlaza la revisión exacta con `oldid` y muestra crédito, licencia, fecha y aviso de normalización.
- Almacenamiento: se conserva el dominio normalizado con atribución. La caché expira a efectos de frescura en siete días; no se elimina la atribución.
- Límites: no se asume un cupo contractual. El cliente incluye identificador, timeout, cancelación y un solo reintento; HTTP 429 se trata como rate limit.
- Riesgos: wikitext comunitario y plantillas cambiantes. Por eso el DTO se valida, el parser admite un subconjunto explícito y los datos desconocidos quedan ausentes.

Fixtures incluidas:

| Palabra   |  pageid | revid de la respuesta comprobada |
| --------- | ------: | -------------------------------: |
| `hus`     |   40446 |                         91092711 |
| `hedde`   | 1495763 |                         89688730 |
| `hedder`  | 1495764 |                         85864123 |
| `arbejde` |  461019 |                         90354000 |

Las consultas manuales adicionales verificaron `dag` revid 91688804, `forstå` revid 91486524, `lytter` revid 91569054, `huset` revid 79149845 y `husene` revid 79149844. No todas se guardan como fixture porque los tests ya cubren sus patrones y se evita duplicar contenido innecesario.

## Contenido editorial de Dansk Dictionary

Estado: integrado para traducciones y ejemplos pedagógicos del primer corte.

- Datos: traducciones ES/EN y ejemplos breves para palabras obligatorias.
- Método: contenido estático revisable en el repositorio; no se genera con IA en producción.
- Presentación: cada ejemplo se marca “pedagógico propio” y conserva el danés separado de las traducciones.
- Licencia: no se ha asignado todavía una licencia al código ni al contenido propio. No redistribuir hasta tomar una decisión explícita.

## TTS del dispositivo

Estado: integrado mediante `expo-speech`.

- Locale solicitado: `da-DK`.
- Naturaleza: voz sintética del motor instalado por el usuario.
- No se descarga ni almacena audio.
- No se afirma que la voz sea humana o nativa.
- La disponibilidad/calidad depende del dispositivo Android y sus voces instaladas.

## DBnary

Estado: evaluado, no integrado todavía.

- Ofrece datos de Wiktionary en RDF/OntoLex, acceso Linked Data/SPARQL y descargas periódicas.
- El modelo DBnary declara CC BY-SA 4.0; sigue siendo obligatorio conservar atribución de los datos extraídos.
- Puede aportar un proveedor estructurado o de respaldo, pero su endpoint público es limitado y los datos online pueden ir por detrás de las descargas.
- Antes de integrarlo se debe validar CORS, latencia, cobertura morfológica danesa real y política de disponibilidad para cliente móvil.

## Wikimedia Commons y audio abierto

Estado: pendiente.

La licencia del texto de Wiktionary no implica que todos los archivos de audio tengan la misma licencia. Una integración futura debe consultar la página de archivo/metadata de Commons, validar autor, licencia y URL, y guardar esos datos en `AudioSource`/`DataAttribution`. Hasta entonces se usa TTS identificado.

## Kaikki / Wiktextract

Estado: candidato para una fase posterior.

Los dumps estructurados reducirían complejidad del parser, pero no son un API móvil de baja latencia por sí mismos. Integrarlos probablemente justificaría un backend o un artefacto preprocesado, además de una revisión de atribución, actualización y tamaño.

## Proveedores de traducción

Estado: no integrados.

No se usa ningún servicio de pago ni API key. Si se incorpora uno, una clave privada obligará a añadir backend. Las traducciones automáticas deberán identificarse como tales y no podrán sustituir el contenido danés.

## Den Danske Ordbog

Estado: referencia funcional exclusivamente.

Se usa para comprender la calidad y jerarquía deseadas. Está prohibido hacer scraping o copiar definiciones, ejemplos, audios, base de datos o diseño. Una futura integración requeriría licencia o autorización explícita y documentada.
