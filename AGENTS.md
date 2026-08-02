# Guía para agentes y colaboradores

## Restricciones cerradas

- Mantener Expo SDK 54. No actualizar `expo`, React ni React Native a otra matriz sin autorización expresa.
- Leer la documentación versionada: https://docs.expo.dev/versions/v54.0.0/.
- `hedder` y cualquier forma flexionada son entradas navegables propias. No redirigir silenciosamente al lema.
- No inventar IPA, audio humano, definiciones ni rasgos gramaticales.
- No extraer ni copiar contenido de Den Danske Ordbog.
- No elegir una licencia para el código del proyecto sin aprobación.
- No añadir secretos al cliente; mantener `.env.example` sin valores privados.

## Flujo obligatorio para datos

`API externa → esquema Zod → normalizador → dominio → SQLite/Query → UI`.

La presentación nunca importa tipos de respuesta de proveedores. Cada dato conserva atribución, revisión y licencia. Los ejemplos propios deben permanecer marcados como pedagógicos; el TTS siempre como voz sintética.

## Comandos verificados

```powershell
npm install
npm run typecheck
npm run lint
npm test
npm run format:check
npx expo-doctor
npx expo export --platform android --output-dir dist
npm start
```

Antes de entregar cambios, ejecutar al menos `typecheck`, `lint`, `test` y `expo-doctor`. Los tests no deben consultar internet: añadir fixtures con pageid, revid, fecha y proveedor.

## Convenciones

- TypeScript strict, sin `any`; preferir `unknown` más validación.
- Componentes accesibles y pequeños; lógica lingüística fuera de las pantallas.
- Consultas SQL siempre parametrizadas cuando incorporen datos del usuario.
- Una migración nueva incrementa `DATABASE_VERSION` y `PRAGMA user_version`.
- Errores externos tipados; distinguir ausencia, red, rate limit, timeout, formato inválido y almacenamiento.
- No hacer commits ni publicar la app salvo petición expresa.
