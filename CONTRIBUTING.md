# Contribuir

## Preparación

1. Usa Node.js 20.19 o superior.
2. Ejecuta `npm install`.
3. Copia `.env.example` a `.env` solo si necesitas cambiar una URL pública. Nunca guardes claves.
4. Ejecuta `npm start` y abre el QR con Expo Go SDK 54.

## Antes de proponer un cambio

```powershell
npm run typecheck
npm run lint
npm test
npm run format:check
npx expo-doctor
```

Los cambios lingüísticos deben aportar fuente, revisión, licencia y método de obtención. Si añades una fixture, recorta solo la sección necesaria de una respuesta real y anota pageid/revid; el test debe seguir funcionando sin internet.

## Límites legales

No copies DDO. Revisa por separado la licencia de texto y medios; una página CC BY-SA no convierte automáticamente sus audios en CC BY-SA. El repositorio no incluye todavía una licencia para nuestro código: consulta `docs/legal-and-licenses.md` antes de distribuirlo.

## Definición de terminado

El cambio mantiene SDK 54, no altera silenciosamente forma/lema, valida respuestas externas, presenta atribución, funciona con datos parciales, añade pruebas de comportamiento relevantes y actualiza la documentación afectada.
