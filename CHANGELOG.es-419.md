# Cambios de Project Base

[English (United States)](CHANGELOG.en-US.md) · [Inicio](README.es-419.md)

Este archivo registra cambios posteriores a la publicación técnica congelada `1.1.0`. No reescribe ni amplía la aprobación de esa publicación.

## 1.1.0-draft.2 — 2026-09-04

### Agregado

- Estándares de ingeniería MUST/SHOULD/NICE aplicables y un ratchet arquitectónico automatizado.
- Apariencia clara/oscura del sistema, regresiones y changelogs bilingües para todos los starters visuales.
- Un perfil bilingüe de capacidades del consumidor para identidad, SaaS/privacidad, pagos/licencias, móvil seguro, offline/sincronización, operación y distribución.
- Exportación automática del perfil de capacidades con inventario SHA-256 en el recibo de adopción.
- Correlación segura de solicitudes y registros estructurados de fallos operacionales en ambos starters backend ejecutables.

### Cambiado

- Los recibos de exportación identifican la revisión exacta de cada plantilla técnica seleccionada en vez de asignar una revisión a todas las plataformas.
- La definición del proyecto y la guía de adopción ahora exigen selección explícita de capacidades respaldada por implementación y evidencia.
- Las revisiones backend PHP y Node avanzan a `1.1.0-draft.2`; los recibos exportados informan esa revisión exacta.
