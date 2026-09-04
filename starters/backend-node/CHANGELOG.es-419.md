# Cambios del backend Node

[English (United States)](CHANGELOG.en-US.md) · [Inicio](README.es-419.md)

## 1.1.0-draft.2 — 2026-09-04

### Agregado

- Correlación mediante `X-Request-Id` validado, incluido su permiso y exposición por CORS.
- Un registrador estructurado inyectable para fallos del servidor, con rutas limitadas y sin mensajes sensibles de error.
- Regresiones de red para correlación, contenido del registro, identificadores inválidos y preflight.
