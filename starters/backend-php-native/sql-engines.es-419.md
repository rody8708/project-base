# Perfiles SQL de PHP propio

[English (United States)](sql-engines.en-US.md) · [Inicio](README.es-419.md)

SQLite sigue siendo la opción predeterminada sin servicios externos. PostgreSQL y MySQL son **perfiles de servidor local** adicionales, seleccionados explícitamente mediante variables del proceso. No requieren framework. Aplicación/Dominio y la API versionada del cliente no cambian. SQL preparado compartido implementa los puertos de repositorio/tokens; los esquemas por motor y el limitador transaccional con bloqueo de fila permanecen en Infraestructura. Una configuración fallida nunca cambia silenciosamente a SQLite.

## Configurar una solución independiente

Crea una base dedicada vacía y una cuenta con privilegios mínimos para tu aplicación. No ejecutes las migraciones iniciales contra bases ajenas. Usa PHP 8.5 con `pdo_pgsql` para PostgreSQL o `pdo_mysql` para MySQL; las pruebas predeterminadas aisladas siguen necesitando `pdo_sqlite`, mbstring y openssl. `npm run doctor` comprueba el controlador seleccionado, no la validez de credenciales ni la disponibilidad del servidor.

En una terminal PowerShell privada, desde la raíz de la solución generada:

```powershell
$env:NATIVE_PHP_ENGINE = 'pgsql'
$env:NATIVE_PHP_DB_HOST = '127.0.0.1'
$env:NATIVE_PHP_DB_PORT = '5432'
$env:NATIVE_PHP_DB_NAME = 'my_application'
$env:NATIVE_PHP_DB_USER = 'my_application'
$env:NATIVE_PHP_DB_PASSWORD = Read-Host 'Contraseña de la base' -MaskInput
npm run doctor
npm run setup
npm run check
npm start
```

Para MySQL usa `mysql` y el puerto configurado (normalmente `3306`). La contraseña no es un literal en el ejemplo intencionalmente: nunca la registres en historial de comandos, Git o logs. El entorno del proceso contiene valores sensibles; usa una cuenta/sesión aislada y limpia después la contraseña. No se carga ningún archivo `.env`. Se rechazan hosts diferentes de `127.0.0.1`: TLS/verificación de identidad para bases remotas queda fuera de este perfil local. No expongas públicamente el transporte local de base sin cifrar.

Setup llama a `php scripts/database.php server-up` dentro del componente API. Aplica migraciones con hashes a la base configurada explícitamente, nunca crea usuarios o bases ni copia datos existentes de SQLite. Start conserva el motor seleccionado. Check siempre usa datos SQLite sintéticos aislados, independientemente de la configuración de servidor; ejecuta el laboratorio SQL adicional descrito abajo para probar ambos adaptadores de servidor.

Desde el componente API, emite un token con `php scripts/token.php issue configured demo-user read-write 3600 --show-token`; revoca con `php scripts/token.php revoke configured HASH_ID`. El comando lee la misma configuración de servidor. Protege su salida secreta como indica la guía principal.

## Límites de migración y recuperación

PostgreSQL aplica el esquema con transacción y bloqueo consultivo. El DDL de MySQL confirma implícitamente: un bloqueo consultivo serializa migraciones y las sentencias iniciales son idempotentes ante una inicialización interrumpida. No se debe describir la reversión de esquema MySQL como transaccional. Se rechazan cambios en hashes de migraciones registradas. La reversión inicial es destructiva y requiere respaldo verificado y decisión del operador; no hay eliminación ni reversión automática.

El comando existente `recovery.php` es **solo para SQLite**. Los respaldos PostgreSQL/MySQL requieren su propio procedimiento nativo verificado de respaldo/restauración; este cambio no agrega esos comandos ni transfiere datos entre motores. Cambiar variables selecciona otro almacenamiento, no migra datos. Ensaya transferencia, conciliación, respaldo, cambio de servicio y reversión por separado antes de cambiar una aplicación con datos.

## Verificación aislada de motores

Desde este componente, con Node.js 24, Docker y tar:

```powershell
$env:TEST_DOCKER_WSL = 'Ubuntu-24.04'
node tests/server-check.mjs
```

Omite `TEST_DOCKER_WSL` si Docker está disponible directamente. La prueba construye un entorno PHP desde la base fijada, sin Composer/framework de aplicación. Un archivo de código fuente seleccionado explícitamente excluye archivos de entorno, datos de ejecución y dependencias. Los contenedores PostgreSQL 18.6 y MySQL 8.4.11 usan nombres propios aleatorios, credenciales sintéticas, puertos locales y almacenamiento temporal de base en memoria. El laboratorio nunca se conecta a bases existentes. Solo elimina sus propios contenedores/volúmenes; conserva cachés de imágenes/compilación.

El 2026-09-05 pasaron ambos flujos con Node 24.16.0 en Windows y Docker en Ubuntu-24.04 WSL: repetición de migraciones/rechazo de hashes; CRUD HTTP real, Unicode, paginación, aislamiento por propietario, permisos, vencimiento/revocación de tokens; 24 creaciones simultáneas; un ganador y 11 conflictos entre 12 actualizaciones de la misma versión; y 12 conexiones independientes al limitador admitiendo cinco, rechazando siete y conservando un contador acotado. El arnés falló inicialmente al comprobar disponibilidad porque se perdieron comillas del PHP en línea al invocarlo mediante WSL; usar un script dedicado corrigió el arnés sin cambiar tiempos de espera de base ni políticas de aplicación.

Es aceptación local acotada de adaptadores, no garantía de rendimiento ni aprobación de producción. La evidencia HTTPS/recuperación previa de SQLite permanece separada; este laboratorio no afirma verificación de respaldo/restauración de servidores SQL ni TLS de SQL remoto. La validación macOS/iOS no cambia y sigue pendiente.
