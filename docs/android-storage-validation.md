# Validación de SQLite en Android

Este protocolo cubre DD-6 sin modificar `dansk-dictionary.db`. El diagnóstico crea bases temporales
con nombres `dd6-*.db`, ejecuta cada escenario sobre SQLite nativo y las elimina al terminar.

## Comprobaciones automatizadas

Desde la raíz del repositorio:

```powershell
npm test -- __tests__/storage-policy.test.ts __tests__/load-dictionary-entry.test.ts
```

Estas pruebas no usan internet. Cubren las decisiones de migración, validación de caché, claves
exactas, SQL parametrizado y selección entre red y copia local.

## Diagnóstico con SQLite nativo

1. Inicia un AVD compatible con Expo SDK 57 y confirma que `adb devices` lo muestra como `device`.
2. Detén cualquier Metro que esté sirviendo este proyecto para que la variable se incorpore al
   bundle de desarrollo.
3. Inicia Expo desde PowerShell:

   ```powershell
   $env:EXPO_PUBLIC_DD6_STORAGE_DIAGNOSTICS='1'
   $env:EXPO_NO_TELEMETRY='1'
   npm start
   ```

4. Pulsa `a` en la terminal de Expo para abrir el proyecto en el emulador.
5. Espera en la terminal una línea que comience con:

   ```text
   [DD-6][SQLite] PASS
   ```

   El informe JSON debe contener cuatro comprobaciones exitosas:

   - instalación limpia y reapertura;
   - caché, historial, favoritos y borrado por clave;
   - migración v1→v2 con filas reconocibles;
   - respaldo de una tabla incompatible.

6. Detén Metro con `Ctrl+C` y limpia la variable de la sesión:

   ```powershell
   Remove-Item Env:EXPO_PUBLIC_DD6_STORAGE_DIAGNOSTICS
   ```

El diagnóstico solo se ejecuta cuando `__DEV__` es verdadero y la variable vale `1`. No debe
guardarse en `.env` ni habilitarse para una beta.

## Flujo manual online y offline

El diagnóstico nativo comprueba SQLite de forma aislada. El flujo completo de la aplicación se
valida además así:

1. Con red, busca `hedde` y `hedder` y añade ambas entradas a favoritos.
2. Comprueba que aparecen como dos filas independientes en historial y favoritos.
3. Cierra completamente Expo Go, vuelve a abrir el proyecto y comprueba que ambas listas persisten.
4. Activa el modo avión y abre de nuevo `hedde` y `hedder` desde las listas.
5. Confirma que se muestra una copia local —vigente u obsoleta— y que no se superponen las claves.
6. Elimina solo `hedde` del historial y de favoritos; `hedder` debe permanecer y las dos entradas
   deben seguir disponibles desde la caché.
7. Busca una palabra nunca consultada mientras continúa el modo avión. Debe aparecer el error
   accionable de ausencia de conexión y el botón **Reintentar**, sin realizar una consulta remota.
8. Restaura la red y pulsa **Reintentar** para confirmar la recuperación.

Registra en Jira el AVD, nivel de API, versión de Expo Go, resultado del diagnóstico y resultado de
cada paso manual.
