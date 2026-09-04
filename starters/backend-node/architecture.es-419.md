# Arquitectura backend neutral

[US English](architecture.en-US.md) · [Inicio](README.es-419.md) · [Contrato](contracts/task-api-v1.openapi.json)

Esta plantilla separa dominio y reglas, casos de uso, puertos `TaskRepository`/`TokenRepository`, adaptadores SQLite/PostgreSQL/MySQL y transporte HTTP. Las dependencias apuntan a contratos internos; cambiar framework o motor no debe cambiar el dominio ni el contrato público.

Una implementación propia es válida si conserva autenticación, permisos, propiedad dentro de consultas, validación estricta, concurrencia, transacciones y errores estables. Cambiar de base de datos exige otro adaptador y pruebas reales. Compartir OpenAPI no demuestra por sí solo equivalencia: se requiere la misma suite HTTP positiva y negativa.

El servidor estándar de Node es un adaptador, no la arquitectura. Puede sustituirse por Fastify, Nest u otro marco durante la composición, sin importarlo desde el dominio. Las limitaciones pendientes están en el [README](README.es-419.md).
