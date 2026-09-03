# Recuperación nativa PostgreSQL y MySQL

[US English](server-recovery.en-US.md) · [Inicio](README.es-419.md) · [Recuperación SQLite](recovery.es-419.md) · [Operación cifrada](backup-operations.es-419.md)

Revisión técnica: `1.1.0-draft.1`. Ensayo local aprobado el `2026-09-03`; producción no aprobada.

## Contrato y ejecución

La regla común es respaldar consistentemente, verificar integridad, restaurar en un destino nuevo y comprobar datos y autorización antes de cualquier activación. No depende de Laravel: cada motor implementa esa regla con herramientas propias. Este perfil ejecuta las migraciones y la API de la plantilla PHP para comprobar su integración; no es un servicio general de respaldos para bases existentes.

Desde esta plantilla, con Composer instalado, PHP 8.5 y drivers PDO SQLite, PostgreSQL y MySQL, Windows y Docker local en WSL `Ubuntu-24.04`:

```powershell
php -d extension=pdo_pgsql scripts/verify-server-recovery.php --wsl-docker
```

Omitir `-d extension=pdo_pgsql` si la extensión ya está cargada. No instala ni reemplaza servicios. Descarga imágenes oficiales fijadas por digest y crea origen y destino desechables por motor, con puertos dinámicos solo en loopback, datos en tmpfs, raíz de solo lectura y límites de recursos. Las contraseñas son aleatorias y privadas; no aparecen en argumentos ni reportes. MySQL recibe una configuración temporal privada dentro del contenedor. Proteger con ACL el directorio local `.validation` en Windows.

## Recorrido verificado

1. Crear las tablas reales y datos de dos identidades mediante el kernel HTTP.
2. Generar un respaldo nativo, escribirlo y verificar tamaño y SHA-256 desde disco.
3. Cambiar el origen después del respaldo: eliminar la tarea inicial, agregar otra y revocar el token.
4. Comprobar que el destino esté vacío e importar en otro contenedor del mismo motor y versión.
5. Comparar datos de tareas, tokens y migraciones, además del número de tablas; no es una comparación exhaustiva de todo el DDL.
6. Revocar todos los tokens restaurados y limpiar cachés. Comprobar token antiguo 401, nuevo 200, aislamiento entre propietarios y ausencia de la escritura posterior al respaldo.
7. Verificar que restaurar no modificó el origen y que se rechaza un destino con tablas. El resultado es `RESTORED_NOT_ACTIVATED`; no cambia tráfico ni conexiones de una aplicación en uso.

La API restaurada se prueba con su kernel HTTP en proceso, no por una nueva conexión HTTPS. El laboratorio HTTPS existente y los servicios del usuario no se modifican. La limpieza valida nombre, etiquetas y ID exactos antes de eliminar únicamente los contenedores propios. Los dumps temporales se eliminan; quedan manifiestos y un reporte sin filas ni secretos en `.validation/recovery-<scope>`. Las imágenes permanecen en caché.

## Condiciones por motor

PostgreSQL usa `pg_dump --format=custom --no-owner --no-acl` y `pg_restore --single-transaction --exit-on-error --no-owner --no-acl`. Se respalda una base, no roles globales, permisos originales ni un clúster completo. No se prueba recuperación a un instante mediante WAL ni migración entre versiones.

MySQL usa `mysqldump --single-transaction --quick --skip-lock-tables --no-tablespaces --set-gtid-purged=OFF` e importación con `mysql`, sin `--force`. El perfil exige tablas InnoDB y rechaza rutinas, eventos o triggers personalizados. No permitir cambios DDL concurrentes durante el respaldo. No se demuestra consistencia para motores no transaccionales, recuperación mediante binlog ni conservación de usuarios y permisos del servidor.

Un fallo deja el destino sin aprobar: aislarlo y nunca activarlo. En particular, el DDL de MySQL puede dejar una importación parcial; no reintentar sobre ese destino. La comprobación de destino vacío es adecuada para estos contenedores exclusivos, no sustituye el bloqueo de acceso de otros operadores en producción. SHA-256 detecta corrupción, pero no autentica un respaldo si alguien puede sustituir también su manifiesto.

## Evidencia y pendientes

PostgreSQL 18.6 y MySQL 8.4.11 pasaron el recorrido completo. Ensayo `1cc463fffbb866d6`: PostgreSQL, 7,689 bytes, respaldo 217.267 ms y restauración 248.085 ms; MySQL, 6,056 bytes, 219.043 ms y 249.477 ms. Los cuatro contenedores se eliminaron. Son datos mínimos, no compromisos RTO/RPO; los dumps se procesan en memoria y este verificador no está diseñado para respaldos grandes.

La plantilla ya ofrece un [contenedor cifrado y autenticado](backup-operations.es-419.md) verificable. Cada proyecto debe conectarlo a almacenamiento durable fuera del host y completar KMS/custodia de claves, política de retención, programación, alertas, acceso mínimo, TLS de la conexión remota a la base, restauraciones con volumen realista y cambio/reversión de tráfico. Este ensayo no provee esos servicios ni cubre login humano, recuperación de cuentas o MFA. La clave de aplicación y los certificados requieren recuperación separada.

Fuentes: [PostgreSQL pg_dump](https://www.postgresql.org/docs/18/app-pgdump.html), [PostgreSQL pg_restore](https://www.postgresql.org/docs/18/app-pgrestore.html) y [MySQL mysqldump](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html).
