# Inventario de dependencias y medios

Foto reproducible del árbol instalado el 13 de septiembre de 2026 a partir de `package-lock.json`.
No sustituye la revisión de los artefactos finales ni los avisos exigidos por cada licencia.

## Dependencias directas de producción

| Paquete                          | Versión resuelta | Licencia declarada |
| -------------------------------- | ---------------- | ------------------ |
| `@expo-google-fonts/inter`       | 0.4.2            | MIT AND OFL-1.1    |
| `@expo/vector-icons`             | 15.1.1           | MIT                |
| `@tanstack/react-query`          | 5.101.4          | MIT                |
| `expo`                           | 57.0.22          | MIT                |
| `expo-constants`                 | 57.0.18          | MIT                |
| `expo-font`                      | 57.0.4           | MIT                |
| `expo-linear-gradient`           | 57.0.2           | MIT                |
| `expo-linking`                   | 57.0.10          | MIT                |
| `expo-network`                   | 57.0.2           | MIT                |
| `expo-router`                    | 57.0.21          | MIT                |
| `expo-speech`                    | 57.0.3           | MIT                |
| `expo-splash-screen`             | 57.0.9           | MIT                |
| `expo-sqlite`                    | 57.0.3           | MIT                |
| `expo-status-bar`                | 57.0.1           | MIT                |
| `expo-system-ui`                 | 57.0.4           | MIT                |
| `react`                          | 19.2.3           | MIT                |
| `react-dom`                      | 19.2.3           | MIT                |
| `react-native`                   | 0.86.3           | MIT                |
| `react-native-gesture-handler`   | 2.32.0           | MIT                |
| `react-native-reanimated`        | 4.5.1            | MIT                |
| `react-native-safe-area-context` | 5.7.0            | MIT                |
| `react-native-screens`           | 4.26.2           | MIT                |
| `react-native-web`               | 0.21.2           | MIT                |
| `react-native-worklets`          | 0.10.1           | MIT                |
| `zod`                            | 4.6.2            | MIT                |

Las dependencias directas de desarrollo declaran MIT salvo TypeScript 6.0.3, que declara
Apache-2.0. Sus versiones exactas permanecen en `package-lock.json`.

## Árbol transitivo

El lockfile contiene 808 registros clasificados como producción. Su metadato de licencia se agrupa
así: 687 MIT —incluido `exit`, cuyo manifiesto antiguo usa el campo plural—, 51 ISC, 21 BSD-3-Clause,
13 Apache-2.0, 12 MPL-2.0, 7 BlueOak-1.0.0, 5 BSD-2-Clause, 2 Unlicense, 2 MIT OR CC0-1.0, 2 0BSD y
un registro de cada una de estas expresiones: Python-2.0, CC-BY-4.0, MIT AND Apache-2.0, MIT AND
OFL-1.1, MIT OR Apache-2.0 y BSD-3-Clause OR GPL-2.0.

Los registros MPL-2.0 corresponden a `lightningcss` y sus binarios opcionales de plataforma;
`caniuse-lite` declara CC-BY-4.0. Esta clasificación no demuestra qué archivos terminan dentro del
AAB/APK. Antes de publicar debe generarse el inventario del artefacto final, conservar los textos de
licencia y revisar las obligaciones de distribución aplicables.

## Fuentes, iconos y audio

El export Android de validación contiene siete archivos TTF. Se cotejaron los hashes MD5 publicados
en `dist/metadata.json` con el árbol instalado para identificar sus archivos de origen:

- cinco variantes de Inter: 400, 500, 600, 700 y 800;
- Material Symbols 400 Regular;
- Ionicons.

| Elemento                              | Uso                               | Procedencia/licencia                               | Estado beta                          |
| ------------------------------------- | --------------------------------- | -------------------------------------------------- | ------------------------------------ |
| Inter, cinco variantes                | Tipografía incluida en el bundle  | Inter Project Authors; SIL OFL 1.1                 | Inventariado; conservar aviso OFL    |
| Ionicons                              | Iconos de interfaz usados         | incluido mediante `@expo/vector-icons`             | Uso identificado                     |
| Material Symbols 400 Regular          | No se usa directamente            | paquete MIT; fuente bajo Apache-2.0                | Inventariado; conservar ambos avisos |
| Motor TTS instalado en el dispositivo | Voz sintética solicitada en local | no se incluye ni almacena una grabación            | Identificado en la interfaz          |
| Bandera danesa                        | Cabeceras                         | dibujada con vistas y colores, sin archivo externo | Sin medio de terceros                |

Los imports usan la ruta específica de Ionicons. El export anterior, que importaba desde la raíz de
`@expo/vector-icons`, arrastraba 14 familias no utilizadas; tras el cambio dejaron de aparecer en el
artefacto. La licencia MIT declarada por el paquete cubre su capa de compatibilidad y el aviso de la
fuente upstream debe verificarse y conservarse en la entrega final.

No se distribuye audio humano ni una imagen obtenida de Wiktionary, Wikimedia Commons o Den Danske
Ordbog.

## Imágenes del repositorio

Los diez archivos fueron añadidos sin cambios posteriores por el commit inicial
`e218a8f49c3ede9cdcd8bf2bcdee0dcac1394274`, cuyo propio mensaje registra que el proyecto fue
generado por Create Expo App 4.0.0. Los nombres, rutas y configuración coinciden con la plantilla
oficial predeterminada de Expo SDK 54. Esa plantilla declara licencia 0BSD; Create Expo App elimina
del `package.json` generado precisamente el campo de licencia 0BSD de sus plantillas.

| Archivos                                                                                    | Uso                      | Procedencia/licencia                             |
| ------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------ |
| `icon.png`, `favicon.png`, `splash-icon.png`                                                | icono, web y splash      | plantilla oficial de Expo; 0BSD                  |
| `android-icon-background.png`, `android-icon-foreground.png`, `android-icon-monochrome.png` | icono adaptativo Android | plantilla oficial de Expo SDK 54; 0BSD           |
| `react-logo.png`, `react-logo@2x.png`, `react-logo@3x.png`, `partial-react-logo.png`        | ninguno                  | activos de ejemplo de la plantilla de Expo; 0BSD |

La procedencia queda resuelta. Los recursos no usados pueden retirarse como limpieza y los activos
visibles deberán sustituirse por la identidad propia de Dansk Dictionary antes de una publicación
comercial, pero ya no constituyen una incertidumbre de licencia.

## Puertas antes de publicar

1. Sustituir los activos visuales de la plantilla por la identidad propia antes de una publicación
   comercial.
2. Retirar los cuatro activos de ejemplo no utilizados como limpieza del repositorio.
3. Generar avisos de terceros desde el AAB/APK final y adjuntarlos a la entrega.
4. Repetir el inventario después de cualquier cambio de `package-lock.json` o de `assets/`.
5. Mantener separados los materiales de terceros del código y contenido editorial propio, cuyos
   derechos permanecen reservados durante la beta.
