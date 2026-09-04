# Base API TypeScript / Node.js

[US English](README.en-US.md) · [Contrato OpenAPI](contracts/task-api-v1.openapi.json) · [Arquitectura backend neutral](architecture.es-419.md)

Revisión técnica: `1.1.0-draft.2`. Candidata ejecutable sin framework de aplicación; no aprobada para producción.

Esta segunda implementación demuestra que la arquitectura no depende de PHP ni Laravel. Usa Node.js 24 LTS, TypeScript y módulos estándar de Node. Conserva puertos para tareas y tokens, composición explícita y un adaptador SQLite reemplazable. `node:sqlite` sigue en estado release candidate: este perfil es evaluación local, no selección automática de base productiva.

El código original se distribuye bajo [MPL-2.0](LICENSE). Node.js, TypeScript y otras dependencias conservan sus propias licencias.

## Ejecutar

```powershell
npm ci --ignore-scripts
npm run check
npm run build
npm run token -- operador tasks:read,tasks:write 24
npm start
```

El token impreso es un secreto y solo se muestra una vez. El servidor local escucha en `127.0.0.1:8081`; `APP_ENV=production` rechaza este lanzador HTTP. No copiarlo como despliegue público: producción requiere TLS/proxy revisado, almacenamiento servidor probado, secretos, monitoreo, respaldo y controles de carga.

## Alcance comprobado

Las pruebas de red verifican salud, autenticación, token opaco de 256 bits almacenado por hash SHA-256, CRUD, concurrencia optimista, revocación, permisos, aislamiento por propietario, localización `es-419`/`en-US`, límite persistente local, límites del cuerpo y validación. La API usa JSON, `no-store`, errores estables y no devuelve trazas. Cada respuesta incluye un `X-Request-Id` validado; los fallos del servidor emiten un registro operacional estructurado e inyectable sin cuerpos, tokens, mensajes de excepción ni trazas. Los productos consumidores aún deben definir retención y acceso. Los registros operacionales no son una bitácora de auditoría de negocio.

Todavía no alcanza la cobertura de la referencia PHP: faltan un limitador distribuido para múltiples instancias, PostgreSQL/MySQL ejecutados, recuperación nativa, HTTPS aislado y la matriz negativa completa. Hasta cerrar esos puntos ambas implementaciones no son equivalentes. Python, .NET, Go y JVM siguen siendo perfiles posibles, no starters ejecutables.

Fuente de plataforma: [ciclo de versiones Node.js](https://nodejs.org/en/about/previous-releases) y [estado de node:sqlite](https://nodejs.org/api/sqlite.html).
