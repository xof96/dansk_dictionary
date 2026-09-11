# ADR 0001: mantener Expo SDK 54

- Estado: reemplazada por [ADR 0003](0003-upgrade-expo-sdk-57.md) el 2026-09-11.
- Fecha: 2026-08-02.

## Contexto

El teléfono del propietario tiene Expo Go compatible con SDK 54. La matriz oficial fija React Native 0.81, React 19.1 y Node mínimo 20.19.x.

## Decisión

Usar `expo ~54`, Router 6 y todas las dependencias nativas instaladas con `expo install`. No migrar a otro SDK sin autorización expresa. Fijar RNTL 13.3.3 y `react-test-renderer 19.1.0` porque RNTL 14 beta requiere React 19.2.

Aplicar overrides transitivos `postcss 8.5.25` y `uuid 11.1.1`: corrigen los avisos de seguridad del árbol Expo 54 sin cambiar el SDK. Mantenerlos solo mientras Expo Doctor, tests y bundle Android continúen pasando.

## Consecuencias

Las versiones más nuevas no se adoptan automáticamente. Cada nueva dependencia nativa debe pasar Expo Doctor y un bundle Android. Esta restricción favorece Expo Go del dispositivo actual frente a novedades del SDK más reciente.
