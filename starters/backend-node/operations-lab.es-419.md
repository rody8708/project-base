# Laboratorio operativo Node

[US English](operations-lab.en-US.md) · [Inicio](README.es-419.md)

## Ejecutar

Requisitos: Node 24.16.0, npm, OpenSSL (en Windows, Git for Windows en su ruta estándar) y Docker para PostgreSQL/MySQL. El ensayo no carga archivos `.env` ni acepta URLs de bases existentes.

```powershell
npm ci --ignore-scripts
npm run check
npm run check:operations
$env:NODE_LAB_ENGINE='postgresql'
$env:NODE_LAB_WSL='Ubuntu-24.04'
npm run check:operations
$env:NODE_LAB_ENGINE='mysql'
npm run check:operations
```

En Linux usa variables del shell y omite NODE_LAB_WSL. Las nueve pruebas rápidas no necesitan OpenSSL ni Docker. El ensayo operativo es una prueba integral por motor con múltiples aserciones, no cientos de pruebas independientes. CI ejecuta las tres variantes.

## Alcance comprobado

- HTTPS verifica confianza y nombre; rechaza certificados no confiables, nombre incorrecto y certificado vencido. No modifica almacenes de confianza ni desactiva TLS.
- Autenticación, expiración, permisos, propietario sensible a mayúsculas, Unicode, parámetros duplicados, forma JSON, tamaño, tipos de contenido y versiones obsoletas.
- 24 creaciones simultáneas y 12 actualizaciones de una versión: una gana y once reciben 409.
- Dos conexiones/pools comparten un presupuesto de cinco con 24 operaciones. Dos servidores HTTP comparten un presupuesto real de 120: 144 solicitudes producen 120 éxitos y 24 respuestas 429. La prueba fija la ventana para evitar cruzar el minuto.
- SQLite usa `node:sqlite.backup`; PostgreSQL `pg_dump/psql`; MySQL `mysqldump/mysql`. Se restaura en otro destino vacío, verifica versión de esquema y datos Unicode, invalida todos los tokens restaurados antes de servir y prueba lectura, actualización, conflicto y eliminación por HTTPS. La fuente conserva sus datos y tokens.
- Datos creados después del respaldo no aparecen en el destino.

Verificado localmente en Windows, Node 24.16.0 (SQLite 3.53.0), PostgreSQL 18.6 y MySQL 8.4.11 en Docker/WSL. Los recursos son sintéticos y propios: contenedores con etiqueta `project-base=node-test`, puertos loopback, almacenamiento temporal sin montajes del usuario y directorios nuevos. Se retiran servidores, contenedores, archivos DB, certificados y volcados; imágenes y dependencias en caché permanecen. Los volcados viven en memoria y no se imprimen.

## Adopción y migración

`DATABASE_URL` selecciona PostgreSQL/MySQL; sin esa variable se usa `DB_DATABASE` para SQLite. Los repositorios aceptan resultados asíncronos; quien invoque directamente helpers de aplicación debe usar `await`. El contrato HTTP no cambia. No copiar bases SQLite a otro motor: migrar datos exige una operación propia del producto.

La migración inicial crea tablas de forma idempotente y registra `schema_migrations=1`. Adopta el esquema SQLite anterior sin eliminar filas. PostgreSQL/MySQL son instalaciones nuevas; iniciar una sola instancia para migrar antes de escalar. La migración inicial no tiene reversión destructiva automática: respaldar antes y restaurar el respaldo para volver al estado anterior. No se promete migración arbitraria de esquemas externos.

SQLite rechaza versiones anteriores a 3.51.3 para archivos, conserva WAL y ahora exige sincronización FULL; usar disco local y la API de respaldo, no copiar solo el archivo principal abierto. Su driver es síncrono y puede bloquear el proceso durante I/O: el ensayo acotado no acredita capacidad sostenida. PostgreSQL/MySQL usan pools asíncronos y limitación atómica compartida; detrás de un proxy se debe definir y validar la identidad del cliente, no confiar automáticamente en encabezados reenviados.

## Límites

No hay login humano, recuperación de contraseña ni MFA. No se certifica igualdad exhaustiva con PHP, capacidad sostenida, disponibilidad, RPO/RTO, despliegue público ni producción. Permanecen decisiones del consumidor: proveedor TLS, secretos, mínimos privilegios, respaldo cifrado externo, retención, monitoreo, alertas, pruebas de volumen y revisión de seguridad. El lanzador HTTP sigue rechazando ambientes distintos de local/testing.

Fuentes de implementación: [consultas parametrizadas pg](https://node-postgres.com/features/queries), [transacciones pg](https://node-postgres.com/features/transactions), [documentación mysql2](https://sidorares.github.io/node-mysql2/docs/documentation). Los drivers y dialectos permanecen en infraestructura.
