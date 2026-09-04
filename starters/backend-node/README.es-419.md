# Base API TypeScript / Node.js

[US English](README.en-US.md) · [Contrato OpenAPI](contracts/task-api-v1.openapi.json) · [Arquitectura backend neutral](architecture.es-419.md)

Perfil ejecutable con matriz SQLite/PostgreSQL/MySQL y laboratorio operativo propio; no aprobado automáticamente para producción.

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

La matriz SQL, HTTPS, concurrencia compartida y recuperación nativa se ejecutan en el [laboratorio operativo](operations-lab.es-419.md). Python/FastAPI también es un starter ejecutable; .NET, Go y JVM siguen como alternativas documentadas.

Fuente de plataforma: [ciclo de versiones Node.js](https://nodejs.org/en/about/previous-releases) y [estado de node:sqlite](https://nodejs.org/api/sqlite.html).

Para PostgreSQL/MySQL configura `DATABASE_URL` mediante variables de entorno (ejemplos sintéticos en `.env.example`); no se carga `.env` automáticamente. Sin esa variable se conserva SQLite. Las dependencias `pg` y `mysql2` quedan confinadas al adaptador; el dominio no importa drivers. Consulta el laboratorio antes de adoptar las migraciones o respaldar datos.
