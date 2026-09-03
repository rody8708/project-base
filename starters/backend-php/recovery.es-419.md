# Respaldo y recuperación verificados

[US English](recovery.en-US.md) · [Inicio](README.es-419.md) · [Laboratorio Docker](docker-local.es-419.md) · [Seguridad](security-production.es-419.md)

Revisión técnica: `1.1.0-draft.1`. Evidencia local: `2026-09-03`. Perfil ejecutable SQLite; no es una aprobación de recuperación productiva.

## Contrato independiente de tecnología

Un respaldo debe tener un punto de recuperación identificable, consistencia, verificación de integridad y una restauración ensayada. La restauración genera un destino nuevo; no reemplaza automáticamente datos en uso. Solo después de verificar datos, permisos, credenciales y comportamiento de la aplicación se puede aprobar un cambio controlado de destino.

El concepto no depende de PHP, Laravel o SQLite. Esta implementación usa `SqliteRecovery`, sin dependencias de Laravel, y un comando CLI. Sus reglas de invalidación de credenciales corresponden al esquema de esta plantilla. PostgreSQL y MySQL tienen un [ensayo nativo separado](server-recovery.es-419.md): no usar el comando SQLite con esos motores.

## Comandos

Desde esta plantilla, con dependencias instaladas y una base de evaluación:

```text
php scripts/sqlite-recovery.php snapshot RUTA_BASE_SQLITE NUEVO_DIRECTORIO_PRIVADO
php scripts/sqlite-recovery.php verify DIRECTORIO_RESPALDO
php scripts/sqlite-recovery.php restore DIRECTORIO_RESPALDO NUEVA_BASE_SQLITE
node scripts/docker-local.mjs verify
```

Usar rutas explícitas fuera de public, código exportado y repositorios. El directorio padre debe existir y ser privado. snapshot exige un directorio nuevo; restore exige un archivo nuevo. No se sobrescriben destinos existentes ni se activan restauraciones. El comando imprime metadatos y resultados, nunca filas, tokens ni claves.

En Windows, configurar ACL privadas en el directorio padre: chmod no sustituye ACL. En Linux se crean el directorio con 0700 y los archivos de datos con 0600. Mantener espacio suficiente, permisos exclusivos y un destino controlado; no ejecutar contra rutas manipulables por usuarios no confiables.

## Qué hace el adaptador

snapshot usa VACUUM INTO, no una copia directa de una base activa. Incluye datos confirmados que estén en WAL. Escribe database.sqlite y, después de verificar integridad y vaciar buffers, manifest.json con SHA-256, tamaño, fecha UTC y duración. Un fallo puede dejar una salida parcial: debe aislarse y no utilizarse como respaldo.

verify valida formato, tamaño, checksum, PRAGMA integrity_check y PRAGMA foreign_key_check. El manifest no permite elegir otro archivo. El checksum detecta alteración accidental; no autentica a quien creó el respaldo. Un atacante con permiso para reemplazar archivo y manifest puede sustituir ambos: proteger el almacenamiento y añadir firma/autenticación en el perfil productivo.

restore verifica el respaldo, reserva un archivo nuevo, copia y verifica el contenido, e invalida TODOS los tokens de la base restaurada antes de devolver RESTORED_NOT_ACTIVATED. Limpia cachés y bloqueos transitorios. Deben provisionarse credenciales nuevas; no se reactivan tokens revocados después de crear el respaldo. El hash de la base restaurada cambia deliberadamente por esa invalidación. La fuente y el respaldo permanecen intactos.

Si restore falla después de reservar el archivo, ese archivo se considera incompleto y no debe activarse. La salida exitosa tampoco sustituye la aprobación de cambio de base, ni comprueba que otros procesos hayan cerrado sus conexiones.

## Ensayo automático

El verificador Docker crea OTRO contenedor desechable; no toca el laboratorio ya abierto ni sus certificados:

1. Crea y actualiza una tarea mediante HTTPS.
2. Crea un respaldo consistente.
3. Agrega una tarea posterior al respaldo, elimina la original y revoca el token.
4. Restaura en una base distinta y verifica que el estado anterior se recupere.
5. Arranca una instancia de la aplicación contra esa base, dentro del mismo proceso de prueba: el kernel HTTP rechaza el token antiguo (401) y acepta uno nuevo (200).
6. Comprueba por HTTPS que la base del servidor original no cambió y elimina exclusivamente el contenedor de prueba.

La lectura de la copia restaurada usa el kernel HTTP en proceso; no se afirma un cambio de tráfico real ni un failover entre servidores. El servidor original sí se verifica por HTTPS real desde Windows.

## Evidencia y límites

Ensayo Linux PHP 8.5.10: respaldo de 53,248 bytes en 4.728 ms; restauración en 3.861 ms; datos esperados recuperados; token anterior 401 y nuevo 200. Son mediciones de una base mínima, no objetivos RTO/RPO ni estimaciones para grandes volúmenes. El contenedor de ese ensayo fue eliminado.

Pruebas unitarias cubren WAL confirmado/no confirmado, integridad referencial, archivo alterado, manifest inválido, respaldo incompleto y rechazo de destinos existentes o reservados. El núcleo documental aprobado no cambia.

Los tres motores ya tienen ensayos locales y existe un [contenedor cifrado](backup-operations.es-419.md). Falta definir y verificar para producción: almacenamiento fuera del servidor, KMS y custodia de claves, retención, programación, alertas por respaldo fallido, acceso mínimo, restauración con volúmenes realistas, simulación de pérdida del host y cambio/reversión controlados de tráfico. El certificado TLS y la clave de aplicación no forman parte del snapshot de datos; requieren recuperación separada. Los respaldos dentro del contenedor se pierden al eliminarlo: el laboratorio demuestra el mecanismo, no ofrece almacenamiento durable.

Fundamento: [SQLite VACUUM INTO](https://www.sqlite.org/lang_vacuum.html) y [comprobaciones de integridad SQLite](https://www.sqlite.org/pragma.html).
