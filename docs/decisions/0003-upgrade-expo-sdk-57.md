# ADR 0003: adoptar Expo SDK 57

- Estado: aceptada.
- Fecha: 2026-09-11.
- Reemplaza: [ADR 0001](0001-expo-sdk-54.md).

## Contexto

El propietario aprobó explícitamente la migración realizada en DD-10. La versión instalada es `expo ~57.0.22`, que usa React Native 0.86.3 y React 19.2.3. Expo SDK 57 requiere Node.js 22.13.x o superior.

La evidencia de DD-2 sigue siendo histórica y válida: esa prueba se ejecutó realmente con Expo Go 54.0.8 antes de adoptar esta decisión.

## Decisión

Adoptar Expo SDK 57 como base oficial del proyecto, junto con React 19.2.3, React Native 0.86.x y Node.js 22.13.x o superior. Instalar y actualizar módulos nativos mediante `expo install`, y consultar la documentación versionada de SDK 57.

No migrar a otro SDK ni cambiar la matriz de React o React Native sin una nueva aprobación expresa. El workflow de CI usa Node.js 22.13.1 y debe seguir ejecutando `npm ci` y `npm run ci:check`.

## Consecuencias

Las validaciones nuevas, incluida DD-3, se realizan sobre SDK 57 y registran la versión concreta del cliente Android. Las referencias históricas a SDK 54 se conservan cuando describen pruebas realmente ejecutadas o la decisión reemplazada.

Cada cambio de dependencia nativa debe mantener Expo Doctor, tests y exportación Android en verde. Para una beta distribuible se evaluará un development build; Expo Go sigue siendo útil para las pruebas físicas tempranas.
