# Arquitectura backend neutral

[US English](backend-architecture.en-US.md) · [Opciones tecnológicas](technology-choices.es-419.md) · [Límite API](api-boundary.es-419.md)

Revisión técnica: `1.1.0-draft.1`. Esta arquitectura es obligatoria para los starters de referencia, no obliga a usar un lenguaje o framework.

Un backend compatible se divide por responsabilidades: dominio con invariantes; aplicación con casos de uso y permisos; puertos que describen identidad, persistencia, reloj y efectos; adaptadores HTTP, SQL y proveedores externos; composición que elige implementaciones. Las dependencias apuntan hacia los contratos internos. Un framework puede alojar adaptadores y composición, pero no se convierte en el dominio.

La API pública OpenAPI es el límite con clientes. Los puertos internos no se comparten como código entre lenguajes: comparten comportamiento observable. Una implementación propia desde cero es válida cuando conserva validación, códigos de error, concurrencia, autorización, transacciones y controles operativos, y pasa la misma suite contractual.

## Criterio mínimo de conformidad

- Misma copia exacta del contrato OpenAPI y rutas versionadas.
- Tokens aleatorios, vencimiento, revocación, hash almacenado y permisos explícitos.
- Propiedad de datos aplicada dentro de cada consulta; recurso ajeno responde 404.
- Entrada JSON acotada y estricta; IDs y versiones controlados por servidor.
- Escrituras sin reintentos implícitos, concurrencia optimista y errores sin secretos.
- Adaptador de persistencia reemplazable; cambiar motor exige migraciones y pruebas reales, no solo cambiar configuración.
- Salud, registro, límites, TLS, recuperación y producción con estados honestos y verificables.

Una suite común debe ejecutar ejemplos positivos y negativos contra un proceso HTTP real. Las pruebas internas del lenguaje complementan esa suite; no la sustituyen. Una referencia con menos controles se conserva como candidata y no se declara equivalente.

Actualmente PHP/Laravel es la referencia de cobertura amplia. TypeScript/Node demuestra una arquitectura sin framework de aplicación, pero conserva pendientes enumerados en su README. Los perfiles Python, .NET, Go y JVM se seleccionarán cuando un consumidor los requiera; documentar una posibilidad no equivale a mantener cinco implementaciones completas.
