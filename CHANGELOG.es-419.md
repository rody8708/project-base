# Cambios de Project Base

[English (United States)](CHANGELOG.en-US.md) · [Inicio](README.es-419.md)

Este archivo registra cambios posteriores a la publicación técnica congelada `1.1.0`. No reescribe ni amplía la aprobación de esa publicación.

## 1.2.0 — 2026-09-04

- Publicación estable aprobada explícitamente por el propietario; [recibo e identidad exacta](releases/approval-1.2.0.es-419.md).
- Paquete candidato conservado sin cambios; su estado interno previo a aprobación se interpreta junto con el recibo externo.
- Verificación automática del SHA-256 aprobado con prueba de rechazo de alteraciones. No cambia el código de las aplicaciones ni sus contratos.

## 1.2.0-rc.1 — 2026-09-04

### Agregado

- Python/FastAPI con matriz SQL, HTTPS, concurrencia y recuperación nativa; correcciones reproducidas de bloqueo SQLite y del servidor.
- Adaptadores PostgreSQL/MySQL de Node, limitación atómica compartida, respaldo/restauración nativos y laboratorio HTTPS con fallos de certificados.
- Pruebas de aplicación Node en memoria y migración inicial identificada; adopción de SQLite previo sin pérdida de datos.

### Cambiado

- Catálogo de siete plantillas y estado actual unificados en ambos idiomas; registros históricos identificados.
- Helpers de aplicación Node asíncronos: los consumidores directos deben usar await. El contrato HTTP no cambia.
- Preparación de la publicación 1.2.0, sin modificar 1.1.0 ni conceder aprobación automática.

## 1.1.0-draft.2 — 2026-09-04

### Agregado

- Estándares de ingeniería MUST/SHOULD/NICE aplicables y un ratchet arquitectónico automatizado.
- Apariencia clara/oscura del sistema, regresiones y changelogs bilingües para todos los starters visuales.
- Un perfil bilingüe de capacidades del consumidor para identidad, SaaS/privacidad, pagos/licencias, móvil seguro, offline/sincronización, operación y distribución.
- Exportación automática del perfil de capacidades con inventario SHA-256 en el recibo de adopción.
- Correlación segura de solicitudes y registros estructurados de fallos operacionales en ambos starters backend ejecutables.
- Un asistente bilingüe `npm run create-app` que genera soluciones completas con `app/`, `api/` y una guía `START-HERE` específica.
- Comandos de raíz `doctor`, `setup`, `check` y `start` en cada solución generada para coordinar sus componentes sin memorizar instrucciones por tecnología.
- Instrucciones `AGENTS.md` y un servidor MCP local basado en el SDK oficial 2.0, con recursos bilingües y herramientas limitadas para catálogo, diagnóstico y creación.

### Cambiado

- Los recibos de exportación identifican la revisión exacta de cada plantilla técnica seleccionada en vez de asignar una revisión a todas las plataformas.
- La definición del proyecto y la guía de adopción ahora exigen selección explícita de capacidades respaldada por implementación y evidencia.
- Las revisiones backend PHP y Node avanzan a `1.1.0-draft.2`; los recibos exportados informan esa revisión exacta.
