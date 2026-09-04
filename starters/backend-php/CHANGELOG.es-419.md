# Cambios del backend PHP

[English (United States)](CHANGELOG.en-US.md) · [Inicio](README.es-419.md)

## 1.1.0-draft.2 — 2026-09-04

### Agregado

- Correlación mediante `X-Request-Id` validado en respuestas correctas y de error.
- Registro estructurado de fallos del servidor con contexto limitado y sin cuerpos, tokens, mensajes de excepción ni trazas.
- Regresiones para identificadores del llamador aceptados y rechazados y para la correlación segura de errores.
