# Dansk Dictionary

Aplicación Android de diccionario danés para adultos hispanohablantes, construida con React Native, Expo SDK 57 y TypeScript estricto. Busca desde danés, conserva formas flexionadas como entradas propias y presenta traducciones al español e inglés sin sustituir el original.

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

- Node.js 22.13 o superior. La implementación se verificó con Node 24.18.0 y npm 11.16.0.
- npm, incluido con Node.js.
- Para ejecutarla en un teléfono: un cliente compatible con Expo SDK 57 y el teléfono y el ordenador conectados a la misma red.
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

La integración continua y la validación local parten del lockfile y ejecutan el mismo recorrido:

```powershell
npm ci
npm run ci:check
```

`ci:check` ejecuta typecheck, lint, tests offline, formato, Expo Doctor y la exportación Android. El workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) invoca ese mismo script en cada push y pull request contra `main`, además de permitir una ejecución manual. Usa Node 22.13.1, permisos de solo lectura y la caché de npm derivada de `package-lock.json`; no recibe secretos. Metro y el bundle Android se verificaron en este entorno; el escaneo en un teléfono físico no puede verificarse desde aquí.

La auditoría de dependencias se ejecuta por separado porque las alertas transitivas requieren evaluación bajo la restricción de SDK 57:

```powershell
npm audit --omit=dev
```

La revisión del 13 de septiembre de 2026 informa tres avisos moderados y ninguno alto o crítico. Los tres corresponden a una sola cadena: `expo-router 57.0.21 → query-string 7.1.3 → decode-uri-component 0.2.2`. No existe todavía un reemplazo automático compatible con SDK 57; la app limita y valida los deep links nativos antes de entregarlos al router. Consulta la [evaluación, mitigación y criterio de reevaluación](docs/dependency-security.md).

No ejecutes `npm audit fix --force`: npm propone una versión de Expo Router perteneciente a otra matriz y no demuestra compatibilidad con SDK 57. La alerta residual se mantiene separada del control de calidad del workflow.

## Dependencias principales

| Dependencia                            | Uso                                     | Compatibilidad                                   |
| -------------------------------------- | --------------------------------------- | ------------------------------------------------ |
| `expo ~57.0.22`                        | runtime y herramientas                  | SDK fijado por requisito                         |
| `react-native 0.86.3` / `react 19.2.3` | interfaz nativa                         | matriz oficial de SDK 57                         |
| `expo-router ~57.0.21`                 | navegación por archivos                 | versión instalada para SDK 57                    |
| `@tanstack/react-query ^5.101.4`       | estado remoto, cancelación y reintentos | librería TypeScript sin módulo nativo            |
| `zod ^4.4.3`                           | contratos externos                      | librería TypeScript sin módulo nativo            |
| `expo-sqlite ~57.0.3`                  | caché, historial y favoritos            | versión instalada por `expo install` para SDK 57 |
| `expo-speech ~57.0.3`                  | TTS danés identificado                  | versión instalada por `expo install` para SDK 57 |
| `expo-network ~57.0.2`                 | estado online/offline                   | versión instalada por `expo install` para SDK 57 |
| `jest-expo ~57.0.5`                    | runtime de tests                        | preset específico del SDK                        |
| `@testing-library/react-native 13.3.3` | pruebas de comportamiento RN            | versión estable validada con la suite actual     |
| `react-test-renderer ^19.2.3`          | renderizado para tests                  | misma línea de React que el SDK                  |

No se ha añadido backend: el proveedor actual no requiere claves y el procesamiento cabe de forma segura en el cliente. Tampoco se ha elegido licencia para el código del proyecto.

El lockfile aplica overrides de seguridad a `postcss 8.5.25` y `uuid 11.1.1`. Son dependencias transitivas de las herramientas Expo 57; se validan con Expo Doctor y un bundle Android. La alerta residual de `decode-uri-component` queda documentada y mitigada sin forzar una actualización incompatible con SDK 57.

## Documentación

- [Arquitectura](docs/architecture.md)
- [Fuentes de datos](docs/data-sources.md)
- [IPA y pronunciación](docs/ipa.md)
- [Aspectos legales y licencias](docs/legal-and-licenses.md)
- [Validación de SQLite en Android](docs/android-storage-validation.md)
- [Auditoría de seguridad de dependencias](docs/dependency-security.md)
- [Contribución](CONTRIBUTING.md)
- [Decisión vigente sobre Expo SDK 57](docs/decisions/0003-upgrade-expo-sdk-57.md)
