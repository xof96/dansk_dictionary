# Auditoría de seguridad de dependencias

- Última revisión: 2026-09-13.
- Alcance: dependencias de producción instaladas desde `package-lock.json`.
- Entorno de la revisión: Node.js 24.18.0 y npm 11.16.0.
- Matriz protegida: Expo SDK 57, React 19.2.3 y React Native 0.86.x.

## Reproducción

Desde un checkout limpio:

```powershell
npm ci
npm audit --omit=dev
npm ls expo-router query-string decode-uri-component --all
```

La auditoría se mantiene fuera de `ci:check` mientras exista una alerta residual
aceptada: el CI debe seguir detectando regresiones del producto y esta revisión
de seguridad conserva su propio criterio de reevaluación.

## Resultado vigente

`npm audit --omit=dev` informa tres vulnerabilidades moderadas, sin alertas altas
ni críticas. Las tres filas representan una sola cadena transitiva:

```text
expo-router 57.0.21
└── query-string 7.1.3
    └── decode-uri-component 0.2.2
```

La causa raíz es
[GHSA-vcc3-ghjq-m6fr / CVE-2026-45822](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr):
una entrada URI malformada puede provocar consumo excesivo de CPU durante la
decodificación. El impacto conocido es de disponibilidad; el aviso no describe
ejecución de código, corrupción de memoria ni divulgación de datos.

## Evaluación del parche

- La versión corregida del decoder es `decode-uri-component 0.5.0`.
- `query-string 7.1.3` declara `decode-uri-component ^0.2.2` y lo carga mediante
  CommonJS. La versión 0.5.0 publicada en npm es ESM, por lo que forzarla con un
  override cambia el contrato de módulos y queda fuera del rango admitido.
- `expo-router 57.0.21` es la versión publicada para SDK 57 y declara
  `query-string ^7.1.3`.
- `npm audit fix --omit=dev --dry-run` no modifica paquetes y conserva las tres
  alertas. El único cambio que npm marca como disponible es `expo-router 5.1.11`
  con cambio SemVer mayor; esa versión corresponde a otra matriz de Expo.

Por estas razones no se aplicó un override transitivo ni se ejecutó
`npm audit fix --force`. Cualquiera de esas opciones rompería los rangos
publicados o la matriz aprobada sin demostrar compatibilidad.

## Exposición y mitigación

Expo Router analiza parámetros de consulta con `query-string` y habilita deep
links para las pantallas. La app declara el esquema `danskdictionary`, por lo que
una URL externa puede alcanzar esa ruta de análisis en Android.

La mitigación compatible está en [`app/+native-intent.ts`](../app/+native-intent.ts):

1. Rechaza rutas del sistema de más de 2048 caracteres.
2. Valida toda la codificación con `decodeURIComponent` antes de entregar la
   cadena original a Expo Router.
3. Redirige a `/` cuando encuentra una secuencia `%` incompleta, UTF-8 inválido o
   una ruta sobredimensionada.

La validación evita que el decoder vulnerable reciba la entrada malformada que
activa su ruta lenta. Los deep links válidos permanecen intactos. Esta decisión
sigue el workaround del aviso —limitar la entrada— y añade el rechazo explícito
de codificación inválida.

## Riesgo residual

- `npm audit` seguirá mostrando tres avisos moderados hasta que la línea de
  Expo Router para SDK 57 adopte una cadena corregida.
- La mitigación cubre intents nativos de Android, el objetivo de la beta. El
  export web no es un objetivo de distribución y conserva la dependencia
  transitiva vulnerable.
- Un cambio futuro de Router podría introducir otra ruta hacia el decoder; por
  eso el override no se considera una solución definitiva.
- Los overrides existentes de `postcss 8.5.25` y `uuid 11.1.1` no aparecen en el
  informe vigente y se conservan mientras Expo Doctor y el bundle Android pasen.

## Criterio de reevaluación

Repetir esta auditoría:

- antes de generar la beta Android;
- al publicarse cualquier parche `57.x` de `expo-router`;
- si cambia la severidad o el rango de la alerta;
- si la app empieza a distribuir la versión web o añade nuevas fuentes de deep
  links;
- y, en ausencia de esos eventos, al menos una vez al mes.

Un parche solo puede adoptarse si mantiene Expo SDK 57, React 19.2.3 y React
Native 0.86.x, queda reflejado en el lockfile y supera tests, Expo Doctor y export
Android.

## Fuentes

- [Aviso revisado de GitHub](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr).
- [Paquete corregido `decode-uri-component 0.5.0`](https://www.npmjs.com/package/decode-uri-component).
- [Expo Router en la documentación versionada de SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/).
- [Deep links de Expo Router](https://docs.expo.dev/router/basics/navigation/#deep-links).
- [Personalización de intents nativos](https://docs.expo.dev/router/advanced/native-intent/).
