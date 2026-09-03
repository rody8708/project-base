# Integración ejecutable por API

**Estado actualizado:** se implementó el perfil de tokens, permisos y propiedad; consulta [seguridad y preparación para producción](security-production.es-419.md). También existe una [segunda base backend TypeScript/Node](../../starters/backend-node/README.es-419.md); las cifras de cinco exportaciones más abajo son evidencia histórica anterior a esa incorporación, no el catálogo actual.

Revisión técnica: `1.1.0-draft.1`. Evidencia local: `2026-09-03`. No aprobada para producción.

[US English](api-integration.en-US.md) · [Inicio](../../README.es-419.md) · [Límite API](api-boundary.es-419.md) · [Persistencia](persistence-boundary.es-419.md)

## Resultado

Las cuatro bases cliente tienen adaptadores HTTP seleccionables y un contrato OpenAPI compartido con el backend. Las plantillas siguen siendo independientes: no importan código del servidor ni acceden a SQL. El contrato describe datos y comportamientos sin exigir Laravel; una implementación propia debe cumplirlo y probarlo.

Guías exportables: [React](../../starters/web/api-integration.es-419.md), [HTML/CSS/JavaScript](../../starters/web-vanilla/api-integration.es-419.md), [Flutter](../../starters/flutter/api-integration.es-419.md), [Kotlin](../../starters/kotlin-android/api-integration.es-419.md) y [backend](../../starters/backend-php/api-integration.es-419.md).

El modo predeterminado del cliente sigue siendo memoria. Una URL explícita activa HTTP; no existe fallback silencioso. El backend continúa usando su puerto de repositorio y adaptador SQL para SQLite, PostgreSQL o MySQL.

## Decisiones del ejemplo

El [contrato neutral](../../starters/backend-php/contracts/task-api-v1.openapi.json) es OpenAPI 3.1.0, revisión `1.0.0-draft.1`. Se incluye una copia idéntica en cada starter y una prueba de mantenimiento detecta divergencias. Los títulos se unificaron en 80 puntos de código. Flutter y PHP antes usaban 120, no 80 en todos los clientes como indicaba erróneamente el documento inicial: se corrigieron código, pruebas y documentación. La reducción es incompatible con títulos existentes de más de 80; no se migran ni truncan datos de usuarios automáticamente.

El servidor crea el ID y controla la versión. Los adaptadores conservan versiones leídas, envían escrituras condicionales y no reintentan una escritura incierta. El título y la fecha local generados por los servicios en memoria no se convierten en autoridad remota: se envía únicamente el título al crear. La API no tiene fecha de creación; web/Kotlin representan ese dato como desconocido (`null`), no como una fecha inventada.

Se implementaron selección explícita de URL, límites de respuesta/paginación, timeouts, rechazo de redirects y validación de DTOs. Las interfaces presentan algunos errores remotos mediante el aviso genérico de operación no confirmada y permiten recargar. El cliente React conserva una escritura confirmada aunque falle la recarga posterior.

El cliente Android ejecuta red fuera del hilo principal. Las excepciones HTTP sin TLS se limitan a loopback/emulador en debug; para destinos remotos se exige HTTPS. La configuración CORS enumera orígenes exactos y no habilita credenciales; no sustituye autenticación.

## Repetir la integración aislada

Desde la raíz, con Node y PHP disponibles y las dependencias backend instaladas:

```text
node scripts/test-api-integration.mjs
node scripts/test-api-integration.mjs --serve
```

La primera forma verifica copias del contrato, creación/listado/actualización/eliminación, persistencia entre clientes, conflicto, IDs del servidor, fecha desconocida y CORS sobre HTTP real. Crea su SQLite temporal y un servidor loopback propio; ignora la conexión de `.env`. Al terminar elimina exclusivamente su fixture.

La segunda forma conserva ese fixture y muestra su URL para pruebas Flutter/Android/navegador. Escribir `stop` o enviar Ctrl+C realiza la limpieza; hay un límite de 30 minutos. Las guías de cada starter indican variables y comandos. El fixture permite los orígenes locales 5173 y 5180. No usar una base del consumidor como fixture.

## Evidencia de esta integración

| Control | Resultado observado |
| --- | --- |
| Backend | Sintaxis de 39 archivos PHP; matriz `5f43d98c0bcb7d2f`: 53 pruebas/199 aserciones en cada motor, sin advertencias. |
| Motores | SQLite 3.49.2, PostgreSQL 18.6 y MySQL 8.4.11; PHP 8.5.1 Windows y Docker 29.1.3 en WSL. |
| Web React | 44 pruebas, tipos y compilación; incluye adaptador y retención de escrituras confirmadas. También verificado en una copia exportada. |
| Web nativa | 83 pruebas, 19 módulos y 54 claves de idioma; incluye paginación, DTOs inválidos, conflicto, timeout y respuesta grande. También verificado en una copia exportada. |
| Flutter | Análisis limpio, 30 pruebas con fixture HTTP; Windows Release y Android debug compilados; un flujo de interfaz Windows contra HTTP real. |
| Kotlin | 21 pruebas JVM, lint y APK debug; cinco pruebas instrumentadas en emulador API 35, incluidas integración HTTP y UI remota. |
| Navegador | Edge, sesiones propias: tarea creada desde web nativa visible en React; modificación, creación desde React, conflicto de versión desde cliente desactualizado y recuperación/recarga conservando datos. |
| Mantenimiento | 46 pruebas; 88 documentos, 44 pares de idioma y 726 enlaces locales verificados. Paridad OpenAPI/transporte y exportación de las cinco plantillas. |

La matriz SQL repite pruebas de API mediante el cliente de pruebas de Laravel y acceso real al motor. Las pruebas de red y clientes conectados usaron el fixture SQLite; no se afirma una matriz de cada interfaz contra cada motor. El navegador registró el `409` provocado intencionalmente como error HTTP; no fue una excepción de JavaScript. Un comando de verificación inmediata de checkbox se adelantó a la actualización asíncrona; las instantáneas posteriores confirmaron el estado persistido. No se ocultaron esas diferencias.

Los registros anteriores a esta integración siguen siendo históricos: sus conteos, hashes de copias y límites no describen los nuevos archivos. No se modificó el núcleo aprobado `1.0.0`.

Las cinco exportaciones incluyen el mismo contrato SHA-256 `0d76d07f597ce100797176717b65d60617f320bad01e91fb2d204e6ae7eb08f1` y sus guías independientes. La exportación no equivale a compilar todas las plataformas: las comprobaciones de copias ejecutadas fueron React y web nativa; Flutter y Kotlin se probaron desde sus starters. Al cerrar la evaluación se detuvieron el navegador, emulador y servidores propios, y se eliminó el SQLite temporal. No se modificaron bases del usuario. Las copias exportadas se conservaron para inspección.

## Pendientes fuera de esta evaluación local

Autenticación/autorización, políticas de producción, TLS remoto, migración de datos entre motores, carga concurrente, recuperación de escrituras inciertas e idempotencia requieren decisiones adicionales del producto. macOS/iOS siguen pendientes de una Mac; Linux nativo y dispositivos físicos no se verificaron. No se ejecutó CI remota ni se desplegó una aplicación pública. Ninguna de esas limitaciones se presenta como resuelta por tener adaptadores.
