# ADR 0002: Wikimedia directo, dominio normalizado y SQLite

- Estado: aceptada para el MVP.
- Fecha: 2026-08-02.

## Contexto

Se necesita dato real, atribuido y offline sin pagar servicios ni exponer claves. Las respuestas de Wiktionary no deben acoplar la interfaz y el wikitext puede cambiar.

## Decisión

Consultar MediaWiki Action API desde el móvil, validar con Zod, normalizar a `DictionaryEntry` y persistir ese dominio en SQLite. TanStack Query controla estado remoto en memoria; SQLite conserva caché, historial y favoritos. No añadir backend mientras no haya clave, agregación costosa o control central de límites.

## Consecuencias

El cliente incluye un parser acotado y debe evolucionar con fixtures reales. Offline funciona después de una primera consulta. Un segundo proveedor necesitará agregación explícita, prioridades por campo y registro de conflictos.
