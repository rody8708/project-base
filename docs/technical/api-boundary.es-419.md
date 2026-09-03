# Límite API entre clientes y backend

**Estado actualizado:** se implementó el perfil de tokens, permisos y propiedad; consulta [seguridad y preparación para producción](security-production.es-419.md). Las pruebas y limitaciones anteriores a esta revisión son históricas: la API ya no admite acceso anónimo. La aprobación de producción sigue pendiente.

Revisión técnica: `1.1.0-draft.1`  
Estado: decisión adoptada; integración HTTP local implementada, no aprobada para producción.  
Idioma: español latinoamericano (`es-419`)  
[US English](api-boundary.en-US.md) · [Inicio](../../README.es-419.md) · [Implementación](implementation.es-419.md) · [Verificación](verification.es-419.md)

## Decisión

Cuando un proyecto tenga un backend remoto, cualquier cliente autorizado —web, móvil, escritorio u otro— se comunicará con él exclusivamente mediante una API pública para esos clientes, versionada y verificable. El cliente no accederá directamente a la base de datos, código PHP, clases de Laravel, archivos del servidor ni modelos internos de persistencia.

La API será el único límite de comunicación entre ambas partes. Esto no significa ausencia total de acoplamiento: cliente y backend estarán acoplados deliberadamente al contrato de la API, pero no a sus implementaciones internas. Así podrán construirse, desplegarse, probarse y reemplazarse de forma independiente mientras conserven un contrato compatible.

La regla abarca HTTP/JSON en la base actual. Si un producto incorpora WebSocket, eventos, streaming u otro transporte, también deberá definirlo como contrato externo; no se convierte en una vía de acceso directo a la persistencia.

## Dirección de dependencias

```text
cliente web / Flutter / Kotlin / otro cliente
    -> puerto de aplicación del cliente
        -> adaptador HTTP
            -> contrato versionado de API
                -> adaptador HTTP del backend
                    -> aplicación y dominio del backend
                        -> puerto de repositorio
                            -> adaptador de persistencia
                                -> motor seleccionado
```

El backend no conocerá pantallas ni frameworks de cliente. El cliente no conocerá Laravel, PHP, SQL ni el esquema físico. Los objetos de transferencia de la API se mapearán de forma explícita: no se expondrán filas, entidades del ORM ni detalles internos como si fueran el contrato público.

La [decisión de persistencia](persistence-boundary.es-419.md) define este segundo límite sin depender de lenguaje o framework. Laravel es una referencia ejecutable, no el concepto obligatorio.

## Responsabilidades del contrato

Antes de conectar una aplicación, el contrato deberá fijar y probar, según corresponda:

| Área | Decisión exigida |
| --- | --- |
| Operaciones | Rutas, métodos, estados HTTP y comportamiento observable. |
| Datos | Solicitudes, respuestas, campos obligatorios, nulabilidad, identificadores, Unicode, números y tiempo. |
| Fallos | Formato estable y códigos legibles por máquinas; la interfaz traduce los mensajes para la persona. |
| Seguridad | Autenticación, autorización por operación, transporte cifrado y tratamiento de credenciales. |
| Colecciones | Paginación, filtros, orden y límites de tamaño. |
| Escrituras | Validación, concurrencia, versiones, idempotencia y conflictos cuando apliquen. |
| Evolución | Compatibilidad, versión, deprecación y procedimiento de cambio. |

El backend conserva la autoridad sobre seguridad e invariantes de negocio. La validación en el cliente mejora la experiencia, pero no sustituye la validación del servidor ni vuelve confiable al cliente.

## Estado real de esta base

Los clientes React, HTML/CSS/JavaScript, Flutter y Kotlin permiten seleccionar memoria o HTTP detrás de sus puertos. El backend de referencia expone `/api/v1`, persiste mediante un adaptador SQL y funciona de manera independiente.

El [registro de integración](api-integration.es-419.md) describe el contrato OpenAPI, adaptadores y pruebas locales. Se unificaron títulos en 80 puntos de código y se definieron versiones, paginación, IDs y fecha desconocida. El límite anterior de Flutter era 120, igual que PHP; la afirmación inicial de 80 para todos los clientes era incorrecta.

## Puerta para implementar la conexión

La integración local cubre contrato, adaptadores y pruebas. Para adoptar una conexión en un producto se debe comprobar también su seguridad y operación:

1. Definir un contrato neutral y versionado; OpenAPI es la opción inicial para HTTP, no una obligación para otros transportes.
2. Unificar semántica, validación, errores, concurrencia y compatibilidad del ejemplo elegido.
3. Implementar un adaptador HTTP por cliente seleccionado detrás de su puerto de repositorio, conservando el adaptador en memoria para pruebas aisladas.
4. Configurar URL y credenciales por entorno sin incluir secretos de servidor en aplicaciones distribuidas.
5. Verificar conformidad del backend, consumidores contra dobles del contrato y al menos un flujo de extremo a extremo con backend y motor reales.
6. Registrar límites, fallos, migración y estrategia de cambios incompatibles.

El contrato debe describir capacidades del dominio y no obligar a que todos los proyectos futuros adopten el ejemplo de tareas. El exportador podrá incluir una integración solamente cuando sea pertinente para la plantilla elegida; no debe fusionar todos los starters en un producto único.

## Alcance y referencias

Esta decisión aplica cuando el producto elige un backend remoto. Una página estática o una aplicación completamente local no necesita inventar una API. Tampoco implica duplicar lógica de negocio en cada interfaz, confiar en el cliente, compartir lenguaje entre capas ni considerar resueltos autenticación, TLS, despliegue o recuperación.

La [especificación OpenAPI](https://spec.openapis.org/oas/latest.html) permite describir una API HTTP sin depender del lenguaje de implementación. [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) define la interfaz uniforme de HTTP y explica su papel en la evolución independiente de implementaciones. Son fundamentos del límite; la evidencia de esta base seguirá dependiendo de contratos y pruebas propios.
