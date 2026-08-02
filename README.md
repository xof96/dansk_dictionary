# Dansk Dictionary

Aplicación Android de diccionario danés para adultos hispanohablantes, construida con React Native, Expo SDK 54 y TypeScript estricto. Busca desde danés, conserva formas flexionadas como entradas propias y presenta traducciones al español e inglés sin sustituir el original.

## Estado funcional

- Búsqueda exacta contra la API oficial de Wiktionary mediante MediaWiki Action API.
- Validación Zod antes de normalizar cualquier respuesta externa.
- Entradas de lema y forma flexionada diferenciadas; `hedder` permanece en `/entry/hedder` y enlaza a `hedde`.
- Género, flexiones, acepciones e IPA cuando el proveedor las ofrece.
- Ejemplos pedagógicos editoriales identificados, con español, inglés y TTS danés normal/lento.
- Historial, favoritos y caché de entradas en SQLite, con versión, procedencia y expiración.
- Recuperación offline y aviso cuando la caché está obsoleta.
- Tema claro/oscuro, etiquetas accesibles y áreas táctiles de al menos 48 px.

## Requisitos

- Node.js 20.19 o superior. La implementación se verificó con Node 24.18.0 y npm 11.16.0.
- npm, incluido con Node.js.
- Para ejecutarla en un teléfono: Expo Go compatible con SDK 54 y el teléfono y el ordenador conectados a la misma red.
- Para ejecutarla en un emulador: Android Studio con un dispositivo virtual iniciado.

## Arranque local

1. Desde la raíz del repositorio, instala las dependencias:

   ```powershell
   npm install
   ```

2. Inicia el servidor de desarrollo de Expo:

   ```powershell
   npm start
   ```

   La configuración adicional no es obligatoria: la app usa por defecto la API pública de Wiktionary. Si necesitas cambiar esa URL, copia `.env.example` a `.env` antes de arrancar y modifica únicamente `EXPO_PUBLIC_WIKTIONARY_API_URL`:

   ```powershell
   Copy-Item .env.example .env
   ```

   No guardes secretos en variables `EXPO_PUBLIC_*`, porque Expo las incluye en el cliente.

3. Abre la app desde la terminal de Expo:

   - Teléfono Android: abre Expo Go y escanea el código QR.
   - Emulador Android: pulsa `a` con el dispositivo virtual ya iniciado. También puedes arrancar Metro y abrir Android directamente con `npm run android`.
   - Navegador: pulsa `w` o ejecuta `npm run web`.

La primera consulta de una palabra necesita conexión a internet porque usa una API externa; las entradas guardadas en caché pueden recuperarse sin conexión. Para detener el servidor, pulsa `Ctrl+C`.

## Validación del proyecto

```powershell
npm run typecheck
npm run lint
npm test
npm run format:check
npx expo-doctor
npx expo export --platform android --output-dir dist
npm audit --omit=dev
```

Metro y el bundle Android se verificaron en este entorno; el escaneo en un teléfono físico no puede verificarse desde aquí.

## Dependencias principales

| Dependencia                            | Uso                                     | Compatibilidad                                       |
| -------------------------------------- | --------------------------------------- | ---------------------------------------------------- |
| `expo ~54.0.35`                        | runtime y herramientas                  | SDK fijado por requisito                             |
| `react-native 0.81.5` / `react 19.1.0` | interfaz nativa                         | matriz oficial de SDK 54                             |
| `expo-router ~6.0.24`                  | navegación por archivos                 | versión recomendada para SDK 54                      |
| `@tanstack/react-query ^5.101.4`       | estado remoto, cancelación y reintentos | librería JS compatible con RN 0.81                   |
| `zod ^4.4.3`                           | contratos externos                      | librería TypeScript sin módulo nativo                |
| `expo-sqlite ~16.0.10`                 | caché, historial y favoritos            | versión recomendada para SDK 54, incluida en Expo Go |
| `expo-speech ~14.0.8`                  | TTS danés identificado                  | versión instalada por `expo install` para SDK 54     |
| `expo-network ~8.0.8`                  | estado online/offline                   | versión instalada por `expo install` para SDK 54     |
| `jest-expo ~54.0.17`                   | runtime de tests                        | preset específico del SDK                            |
| `@testing-library/react-native 13.3.3` | pruebas de comportamiento RN            | fijada en v13 estable; v14 beta requiere React 19.2  |
| `react-test-renderer 19.1.0`           | par de RNTL 13                          | fijada a la misma versión de React del SDK           |

No se ha añadido backend: el proveedor actual no requiere claves y el procesamiento cabe de forma segura en el cliente. Tampoco se ha elegido licencia para el código del proyecto.

El lockfile aplica overrides de seguridad a `postcss 8.5.25` y `uuid 11.1.1`. Son dependencias transitivas de las herramientas Expo 54; se validaron con Expo Doctor y un bundle Android. `npm audit --omit=dev` devuelve 0 vulnerabilidades sin ejecutar la actualización incompatible a SDK 57.

## Documentación

- [Arquitectura](docs/architecture.md)
- [Fuentes de datos](docs/data-sources.md)
- [IPA y pronunciación](docs/ipa.md)
- [Aspectos legales y licencias](docs/legal-and-licenses.md)
- [Contribución](CONTRIBUTING.md)
