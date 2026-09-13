# Validación de accesibilidad y estados en Android

Registro reproducible de DD-8. La revisión combina comprobaciones automáticas con una pasada manual
en Android porque Jest no puede demostrar el comportamiento real de TalkBack, el foco nativo ni el
reflujo final con la escala de fuente del sistema.

## Referencias y umbrales

- Los controles interactivos mantienen un área mínima de 48 × 48 px.
- El texto normal usa una relación de contraste mínima de 4.5:1.
- La interfaz debe conservar contenido y acciones con una escala de texto del 200 %.
- Los roles, nombres, estados y avisos dinámicos se exponen mediante las APIs de accesibilidad de
  React Native.

Referencias: [accesibilidad en React Native](https://reactnative.dev/docs/accessibility) y
[WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## Evidencia automática

Ejecutar desde un checkout limpio:

```powershell
npm ci
npm run typecheck
npm run lint
npm test
npm run format:check
npx expo-doctor
npx expo export --platform android --output-dir dist
```

La suite `__tests__/ui-accessibility.test.tsx` verifica:

- área mínima y estado deshabilitado de los botones compartidos;
- área mínima de las sugerencias;
- semántica de encabezados y ausencia de un límite propio al escalado del texto;
- anuncio de errores y disponibilidad de reintento;
- contraste AA de las combinaciones de texto usadas por los temas claro y oscuro.

La revisión estática adicional confirma que Atrás, buscar y favoritos tienen 48 × 48 px; las filas
guardadas tienen 68 px y sus acciones de borrado 48 × 48 px; las pestañas tienen al menos 54 px.

Resultado del 2026-09-13: `typecheck`, `lint`, `format:check`, las 10 suites con 74 tests,
`expo-doctor` (21/21 comprobaciones) y el export Android terminaron correctamente.

## Entorno de la pasada asistida

| Campo             | Valor                                                    |
| ----------------- | -------------------------------------------------------- |
| Dispositivo o AVD | Android Studio AVD `Dansk_API_36`                        |
| Versión Android   | Android 16 / API 36                                      |
| Build/Expo Go     | Expo Go 57.0.9                                           |
| TalkBack          | Instalado y activado; recorrido audible manual pendiente |
| Fecha             | 2026-09-13                                               |

La inspección asistida con ADB confirmó que los controles principales exponen nombre, rol, estado
seleccionado o deshabilitado y áreas táctiles de al menos 48 dp. También se revisaron Buscar,
Favoritos, Historial, Información y el detalle de `hedder` con escala de fuente al 200 %, en tema
claro y oscuro: el contenido conservó el reflujo, el desplazamiento y las acciones. TalkBack mostró
foco sobre contenido de la entrada, pero los gestos inyectados por ADB no avanzaron ese foco; por
eso el orden y el anuncio audible siguen siendo una comprobación manual.

## Entorno de la pasada manual

Completar al ejecutar la prueba final en un dispositivo o emulador visible:

| Campo             | Valor     |
| ----------------- | --------- |
| Dispositivo o AVD | Pendiente |
| Versión Android   | Pendiente |
| Build/Expo Go     | Pendiente |
| TalkBack          | Pendiente |
| Fecha             | Pendiente |

Probar primero con tema claro y luego oscuro. Repetir las pantallas con el tamaño de fuente del
sistema al 200 % o en el nivel grande más cercano disponible en el dispositivo.

## Checklist por pantalla

Marcar `OK` o registrar un defecto DD independiente. Adjuntar captura cuando el problema sea visual
y anotar literalmente lo que anuncia TalkBack cuando el problema sea semántico.

### Navegación inferior

- [ ] TalkBack anuncia Buscar, Favoritos, Historial e Información como pestañas.
- [ ] Anuncia cuál está seleccionada y el orden coincide con el visual.
- [ ] Cada destino sigue visible y accionable con texto al 200 %, sin recortes.
- [ ] El foco no se detiene por separado en los iconos decorativos.

### Buscar

- [ ] El foco recorre título, bandera, campo, Buscar, nota, sugerencias, Recientes y filas en orden.
- [ ] Campo y botón tienen nombre; el botón anuncia que está deshabilitado si el campo está vacío.
- [ ] `hus`, `hedde` y `hedder` siguen abriendo entradas exactas.
- [ ] Se distinguen carga, historial vacío, error con Reintentar y lista de recientes.
- [ ] El teclado, el texto al 200 % y ambos temas no ocultan el campo ni las acciones.

### Detalle

- [ ] Atrás y Favorito son los primeros controles y sus nombres describen la acción actual.
- [ ] Favorito anuncia estado seleccionado, ocupado o deshabilitado según corresponda.
- [ ] Los títulos de sección se anuncian como encabezados.
- [ ] Lema, flexiones y fuente se anuncian como enlaces con un destino comprensible.
- [ ] Escuchar, Escuchar lento y Detener voz sintética anuncian correctamente su cambio de estado.
- [ ] La forma exacta, IPA, acepciones, traducciones y ejemplos no se recortan al 200 %.
- [ ] La copia obsoleta incluye texto explícito: no depende solo del borde de advertencia.

### Estados de consulta

- [ ] Con red: una entrada válida carga y permite reintentar si el proveedor falla.
- [ ] Sin red y sin caché: el mensaje explica la causa y ofrece Reintentar.
- [ ] Sin red y con caché vigente: la entrada indica que está disponible sin conexión.
- [ ] Sin red y con caché obsoleta: se anuncia “Copia guardada sin conexión”.
- [ ] Ausencia exacta con sugerencias: no redirige y cada sugerencia abre una ruta nueva.
- [ ] Ausencia exacta sin sugerencias: el estado se explica con texto.
- [ ] Atrás devuelve de una forma al lema y luego a la pantalla de origen sin perder la ruta exacta.

### Favoritos

- [ ] Se distinguen carga, vacío, error con Reintentar y lista poblada.
- [ ] Cada fila separa “Abrir término” de “Eliminar término”.
- [ ] Eliminar actualiza la lista o muestra un error accionable.
- [ ] Texto al 200 % y ambos temas conservan términos, tipo, fecha y acción.

### Historial

- [ ] Se distinguen carga, vacío, error con Reintentar y lista poblada.
- [ ] “Borrar todo” abre una confirmación con Cancelar y Borrar.
- [ ] Cada fila separa apertura y borrado; los errores permiten reintentar.
- [ ] Texto al 200 % y ambos temas conservan términos, tipo, fecha y acciones.

### Información

- [ ] TalkBack recorre el título y las cinco secciones en orden.
- [ ] Los títulos se anuncian como encabezados y los iconos decorativos no reciben foco.
- [ ] Fuente, privacidad, género, IPA y TTS permanecen completos al 200 % en ambos temas.

## Resultado

La tarea no se considera terminada hasta completar la tabla de entorno y todas las casillas manuales.
Los defectos encontrados se corrigen en DD-8 si son acotados; si requieren trabajo independiente,
se registran como incidencias enlazadas antes de mover DD-8 a Finalizada.
