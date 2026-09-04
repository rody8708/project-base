# Estado actual de Project Base

[US English](stability-status.en-US.md) · [Inicio](../../README.es-419.md)

## Publicación y árbol de trabajo

La publicación aprobada `1.1.0` conserva sus bytes y recibos originales. El árbol actual incorpora el asistente guiado, MCP local, Python y la ampliación SQL/operativa de Node. Estas mejoras no aparecen automáticamente en el ZIP histórico. La publicación estable actual es `1.2.0`, aprobada por el propietario y vinculada al paquete exacto mediante su [recibo](../../releases/approval-1.2.0.es-419.md).

## Catálogo actual

Siete plantillas exportables: web React/TypeScript, web HTML/CSS/JavaScript, Flutter, Android Kotlin, PHP/Laravel, TypeScript/Node y Python/FastAPI. Ninguna obliga a usar un lenguaje o framework; las aplicaciones consumidoras se crean fuera de este repositorio.

PHP, Node y Python tienen implementaciones ejecutables. Node y Python disponen de ensayos propios con SQLite, PostgreSQL y MySQL, HTTPS, concurrencia acotada y respaldo/restauración nativos. Consultar sus laboratorios: [Node](../../starters/backend-node/operations-lab.es-419.md) y [Python](../../starters/backend-python/operations-lab.es-419.md). No se afirma equivalencia exhaustiva entre implementaciones ni aprobación de producción.

## Pendientes y límites

| Elemento | Estado |
| --- | --- |
| macOS/iOS | No verificados; aplazados por falta de Mac, no bloquean los destinos comprobados. |
| Linux de escritorio y dispositivos físicos | Sin verificación nativa completa. |
| Licencia | MPL-2.0 adoptada; no pendiente. |
| GitHub | Repositorio publicado y rama principal protegida; las PR ejecutan CI. |
| Nueva publicación | 1.2.0 aprobada; identidad, recuperación y aprobación conservadas fuera del ZIP. |
| Cuentas humanas | Tokens provisionados; no incluye login con contraseña, recuperación ni MFA. |
| Operación de cada aplicación | Dominio/TLS real, secretos, monitoreo, capacidad, respaldo externo y aprobación corresponden al consumidor. |

Los registros de 1.1.0 y de las investigaciones anteriores son históricos. Sus frases de trabajo pendiente no sustituyen este estado actual. .NET, Go y backend JVM continúan como alternativas documentadas, no starters ejecutables.
