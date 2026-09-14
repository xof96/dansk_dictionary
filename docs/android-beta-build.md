# Beta Android con EAS Build

Este proyecto usa EAS Build para producir un APK de prueba independiente de Expo Go. El perfil `preview` genera el APK instalable y el perfil `production` queda reservado para generar un AAB cuando se decida publicar en Google Play.

## Configuración fijada

- Proyecto EAS: `@danskdictionary/dansk-dictionary`.
- Identificador Android: `com.danskdictionary.app`.
- Versión visible: `1.0.0`.
- `versionCode` inicial: `1`; debe incrementarse antes de cada nueva publicación en Google Play.
- EAS CLI: `24.4.0`.
- Node.js remoto: `22.13.1`.
- SDK de Expo: 57, sin migración de Expo, React ni React Native.
- Versionado controlado por `app.json` mediante `appVersionSource: local`.

Los iconos y la pantalla de inicio se toman de las rutas declaradas en `app.json`. No se configura EAS Update ni `expo-updates`: cada actualización de esta beta requiere generar e instalar un APK nuevo.

## Construcción reproducible

Desde un checkout limpio de la revisión que se quiera probar:

```powershell
npm ci
npm run ci:check
npx --yes eas-cli@24.4.0 login
npm run config:android:preview
npm run build:android:preview
```

Si la sesión ya está iniciada, `npx --yes eas-cli@24.4.0 whoami` permite comprobar la cuenta y no es necesario ejecutar `login` otra vez.

En la primera construcción Android, EAS puede pedir crear un keystore. Se debe elegir la credencial administrada por EAS. El archivo de firma no se descarga ni se guarda en el repositorio, y nunca debe añadirse un `.jks`, contraseña o token a Git.

Al finalizar, EAS muestra una URL desde la que se puede descargar el APK. El historial del proyecto conserva también la revisión de Git y los registros de cada construcción.

## Instalación

En un teléfono Android se puede abrir la URL del artefacto y aceptar la instalación desde esa fuente. Con un dispositivo o emulador conectado por ADB:

```powershell
adb devices
adb install -r .\ruta\al\dansk-dictionary.apk
```

El parámetro `-r` conserva los datos locales cuando la firma y el identificador de la aplicación coinciden.

## Prueba mínima de la beta

1. Abrir la aplicación sin Metro, Expo Go ni el ordenador.
2. Con conexión, buscar `hedde` y comprobar que se muestra la entrada.
3. Marcar la entrada como favorita y cerrar la aplicación.
4. Desactivar la conexión y volver a abrir `hedde` desde historial o favoritos; debe recuperarse desde SQLite.
5. Volver a activar la conexión y reproducir una pronunciación normal y otra lenta; no deben superponerse.
6. Cerrar y abrir la aplicación; historial y favoritos deben persistir.

Registrar el dispositivo, la versión de Android, la URL o ID del build y el resultado en DD-5.

## Primer artefacto de DD-5

El 15 de septiembre de 2026 se completó el primer build del perfil `preview`:

- Build EAS: [`509d2c81-d332-4f18-8c44-4614912cbf30`](https://expo.dev/accounts/danskdictionary/projects/dansk-dictionary/builds/509d2c81-d332-4f18-8c44-4614912cbf30).
- Resultado: `FINISHED`, APK firmado mediante la credencial Android administrada por EAS.
- Tamaño: `105411278` bytes.
- SHA-256 del APK: `885BE688A8611CD297D553863D9693C252C0F62B4BA4B4C73F0B7687E44647AF`.
- SHA-256 del certificado de firma: `DAE26142464201725316B868489237F6CBAAFAA0664238768BBAFA130680CB06`.
- Manifiesto inspeccionado: `com.danskdictionary.app`, versión `1.0.0 (1)`, `minSdkVersion 24`, `targetSdkVersion 36` y arquitecturas ARM64, ARMv7, x86 y x86_64.
- Validación previa: typecheck, lint, 83 tests offline, formato, Expo Doctor 21/21 y exportación Android correctos.

La instalación y la prueba mínima en un dispositivo físico permanecen pendientes hasta completar la lista anterior.

## Retroceso

Conservar la URL o el APK de cada beta aprobada. Para volver a un artefacto anterior con el mismo `versionCode` y la misma firma, probar primero `adb install -r`. Android puede impedir una reducción de `versionCode`; en ese caso es necesario desinstalar la aplicación antes de instalar el APK anterior, lo que elimina historial, favoritos y caché local.

No regenerar el keystore: todas las betas y futuras publicaciones con `com.danskdictionary.app` deben usar la misma firma. Proteger la cuenta de Expo y mantener acceso a las credenciales administradas por EAS.

## AAB para Google Play

El perfil está preparado, pero no forma parte de la beta interna ni publica automáticamente:

```powershell
npm run build:android:production
```

Antes de ejecutarlo para una entrega real hay que incrementar `expo.android.versionCode`, validar la ficha de Play Console y decidir explícitamente la publicación. EAS Submit no está configurado.
